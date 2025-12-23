/**
 * ItemExpression - Extract a single item from a collection by index
 *
 * Syntax:
 *   item(collection, index)           // For text/shape collections
 *   item(table, rowIndex)             // Get table row
 *   item(table, rowIndex, colIndex)   // Get table cell
 *
 * Works with:
 *   - TextItemCollection (from select, selectexcept, writeonly, writewithout)
 *   - ShapeCollection (from 2D multi-shape translate, rotate, scale)
 *   - Shape3DCollection (from 3D multi-shape translate3d, rotate3d, scale3d)
 *   - TableItemCollection (from table) - supports row and cell access
 *
 * For shape collections: provides full shape accessor interface for chaining.
 * For text collections: defers to ItemCommand at command time.
 * For table collections: returns TableRow (2 args) or TableCell (3 args).
 *
 * Examples:
 *   S = select(M, "pattern")
 *   T = item(S, 0)             // Get first text item
 *   write(T)                   // Animate it
 *
 *   S = translate(G, P1, P2, 5, 5)
 *   T = item(S, 0)             // Get first translated point
 *   U = translate(G, T, 10, 10) // Chain with another translate
 *
 *   A = table()
 *   R = item(A, 0)             // Get row 0 (TableRow)
 *   C = item(A, 0, 1)          // Get cell at row 0, col 1 (TableCell)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { ItemCommand } from '../../commands/ItemCommand.js';
import { GEOMETRY_TYPES } from './IntersectExpression.js';

export class ItemExpression extends AbstractNonArithmeticExpression {
    static NAME = 'item';

    // Valid collection source expression names
    static TEXT_SOURCES = ['select', 'selectexcept', 'writeonly', 'writewithout'];
    static SHAPE_2D_SOURCES = ['translate', 'rotate', 'scale'];
    static SHAPE_3D_SOURCES = ['translate3d', 'rotate3d', 'scale3d'];
    static TABLE_SOURCES = ['table'];

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Common
        this.collectionType = null;  // 'text', 'shape2d', 'shape3d'
        this.index = 0;
        this.sourceExpression = null;
        this.collectionVariableName = null;

        // For text collections (deferred to command)
        this.textItem = null;

        // For 2D shape collections (extracted at resolve)
        this.extractedShapeType = null;
        this.extractedShapeName = null;
        this.extractedData = null;
        this.graphExpression = null;

        // For 3D shape collections (extracted at resolve)
        this.handler = null;
        this.extractedPoints = [];
        this.coordinates = [];

        // For table collections
        this.isTableRowAccess = false;
        this.isTableCellAccess = false;
        this.rowIndex = 0;
        this.colIndex = 0;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('item() requires 2 arguments: item(collection, index)');
        }

        // First arg: collection variable reference
        const collectionExpr = this.subExpressions[0];
        collectionExpr.resolve(context);

        // Must be a variable reference
        if (!collectionExpr.variableName) {
            this.dispatchError('item() first argument must be a variable reference');
        }

        this.collectionVariableName = collectionExpr.variableName;

        // Get resolved expression (dereference variables)
        this.sourceExpression = this._getResolvedExpression(context, collectionExpr);
        if (!this.sourceExpression) {
            this.dispatchError(`item(): Variable "${this.collectionVariableName}" not found`);
        }

        const exprName = this.sourceExpression.getName?.() || '';

        // Detect collection type
        if (ItemExpression.TEXT_SOURCES.includes(exprName)) {
            this.collectionType = 'text';
        } else if (ItemExpression.SHAPE_2D_SOURCES.includes(exprName)) {
            if (!this.sourceExpression.isMultiShape) {
                this.dispatchError(`item(): ${exprName}() is not a collection (single shape mode). Use multi-shape mode like ${exprName}(G, s1, s2, ...)`);
            }
            this.collectionType = 'shape2d';
            this.graphExpression = this.sourceExpression.graphExpression;
        } else if (ItemExpression.SHAPE_3D_SOURCES.includes(exprName)) {
            if (!this.sourceExpression.isMultiShape) {
                this.dispatchError(`item(): ${exprName}() is not a collection (single shape mode). Use multi-shape mode like ${exprName}(s1, s2, ...)`);
            }
            this.collectionType = 'shape3d';
            this.graphExpression = this.sourceExpression.graphExpression;
        } else if (ItemExpression.TABLE_SOURCES.includes(exprName)) {
            this.collectionType = 'table';
            // Table supports 2 args (row) or 3 args (cell)
            // Will handle index extraction below
        } else {
            const validSources = [...ItemExpression.TEXT_SOURCES, ...ItemExpression.SHAPE_2D_SOURCES, ...ItemExpression.SHAPE_3D_SOURCES, ...ItemExpression.TABLE_SOURCES];
            this.dispatchError(`item(): First argument must be a collection from ${validSources.join(', ')}`);
        }

        // Second arg: row index (for tables) or item index (for other collections)
        this.subExpressions[1].resolve(context);
        const indexExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const indexValues = indexExpr.getVariableAtomicValues();
        if (indexValues.length !== 1) {
            this.dispatchError('item() second argument must be a number (index)');
        }
        this.index = Math.floor(indexValues[0]);

        // Handle table collections specially (2 args = row, 3 args = cell)
        if (this.collectionType === 'table') {
            this.rowIndex = this.index;

            // Check for third argument (column index for cell access)
            if (this.subExpressions.length >= 3) {
                this.subExpressions[2].resolve(context);
                const colExpr = this._getResolvedExpression(context, this.subExpressions[2]);
                const colValues = colExpr.getVariableAtomicValues();
                if (colValues.length !== 1) {
                    this.dispatchError('item() third argument must be a number (column index)');
                }
                this.colIndex = Math.floor(colValues[0]);
                this.isTableCellAccess = true;
            } else {
                this.isTableRowAccess = true;
            }
            // Table validation happens at command time when collection is available
            return;
        }

        // Validate index and extract data for shape collections
        if (this.collectionType !== 'text') {
            this._validateAndExtractShapeData();
        }
    }

    /**
     * Validate index and extract shape data (for 2D and 3D collections)
     */
    _validateAndExtractShapeData() {
        const collectionSize = this.sourceExpression.getCollectionSize?.() ||
                               this.sourceExpression.shapeDataArray?.length || 0;

        if (this.index < 0 || this.index >= collectionSize) {
            this.dispatchError(`item(): Index ${this.index} out of bounds (collection has ${collectionSize} items)`);
        }

        const shapeData = this.sourceExpression.getShapeDataAt?.(this.index) ||
                          this.sourceExpression.shapeDataArray?.[this.index];

        if (!shapeData) {
            this.dispatchError(`item(): Could not get data at index ${this.index}`);
        }

        if (this.collectionType === 'shape2d') {
            this._extractShape2DData(shapeData);
        } else if (this.collectionType === 'shape3d') {
            this._extractShape3DData(shapeData);
        }
    }

    /**
     * Extract data from 2D shape collection item
     */
    _extractShape2DData(shapeData) {
        this.extractedShapeType = shapeData.originalShapeType;
        this.extractedShapeName = shapeData.originalShapeName;

        // Data key varies by source expression type
        this.extractedData = shapeData.translatedData ||
                             shapeData.rotatedData ||
                             shapeData.scaledData;
    }

    /**
     * Extract data from 3D shape collection item
     */
    _extractShape3DData(shapeData) {
        this.handler = shapeData.handler;
        this.extractedPoints = shapeData.translatedPoints ||
                               shapeData.rotatedPoints ||
                               shapeData.scaledPoints || [];

        // Build coordinates array
        this.coordinates = [];
        for (const point of this.extractedPoints) {
            this.coordinates.push(point.x, point.y, point.z);
        }
    }

    getName() {
        return ItemExpression.NAME;
    }

    // ===== Shape Accessor Interface (for chaining) =====

    getGeometryType() {
        if (this.collectionType === 'shape2d') {
            return this.extractedShapeType;
        }
        if (this.collectionType === 'shape3d' && this.handler) {
            return this.handler.getGeometryType();
        }
        return null;
    }

    getPoint() {
        if (this.collectionType === 'shape2d' &&
            this.extractedShapeType === GEOMETRY_TYPES.POINT) {
            return this.extractedData.point;
        }
        if (this.collectionType === 'shape3d' && this.extractedPoints.length > 0) {
            return this.extractedPoints[0];
        }
        return null;
    }

    getLinePoints() {
        if (this.collectionType === 'shape2d' &&
            this.extractedShapeType === GEOMETRY_TYPES.LINE) {
            return [this.extractedData.start, this.extractedData.end];
        }
        if (this.collectionType === 'shape3d' && this.extractedPoints.length >= 2) {
            return [this.extractedPoints[0], this.extractedPoints[1]];
        }
        return null;
    }

    getVectorPoints() {
        return this.getLinePoints();
    }

    getCenter() {
        if (this.collectionType === 'shape2d' &&
            this.extractedShapeType === GEOMETRY_TYPES.CIRCLE) {
            return this.extractedData.center;
        }
        return null;
    }

    getRadius() {
        if (this.collectionType === 'shape2d' &&
            this.extractedShapeType === GEOMETRY_TYPES.CIRCLE) {
            return this.extractedData.radius;
        }
        return null;
    }

    getVertices() {
        if (this.collectionType === 'shape2d' &&
            this.extractedShapeType === GEOMETRY_TYPES.POLYGON) {
            return this.extractedData.vertices;
        }
        return null;
    }

    getVariableAtomicValues() {
        if (this.collectionType === 'shape2d') {
            switch (this.extractedShapeType) {
                case GEOMETRY_TYPES.POINT:
                    return [this.extractedData.point.x, this.extractedData.point.y];
                case GEOMETRY_TYPES.LINE:
                    return [
                        this.extractedData.start.x, this.extractedData.start.y,
                        this.extractedData.end.x, this.extractedData.end.y
                    ];
                case GEOMETRY_TYPES.CIRCLE:
                    return [
                        this.extractedData.center.x, this.extractedData.center.y,
                        this.extractedData.radius
                    ];
                case GEOMETRY_TYPES.POLYGON:
                    return this.extractedData.vertices.flatMap(v => [v.x, v.y]);
            }
        }
        if (this.collectionType === 'shape3d') {
            return this.coordinates.slice();
        }
        return [];
    }

    // 3D specific accessors
    getVector() {
        if (this.collectionType === 'shape3d' && this.extractedPoints.length >= 2) {
            return { start: this.extractedPoints[0], end: this.extractedPoints[1] };
        }
        return null;
    }

    getStartValue() {
        if (this.collectionType === 'shape2d') {
            switch (this.extractedShapeType) {
                case GEOMETRY_TYPES.POINT:
                    return [this.extractedData.point.x, this.extractedData.point.y];
                case GEOMETRY_TYPES.LINE:
                    return [this.extractedData.start.x, this.extractedData.start.y];
                case GEOMETRY_TYPES.CIRCLE:
                    return [this.extractedData.center.x, this.extractedData.center.y];
                case GEOMETRY_TYPES.POLYGON:
                    const v = this.extractedData.vertices[0];
                    return [v.x, v.y];
            }
        }
        if (this.collectionType === 'shape3d' && this.extractedPoints.length > 0) {
            const p = this.extractedPoints[0];
            return [p.x, p.y, p.z];
        }
        return [];
    }

    getEndValue() {
        if (this.collectionType === 'shape2d') {
            switch (this.extractedShapeType) {
                case GEOMETRY_TYPES.POINT:
                    return [this.extractedData.point.x, this.extractedData.point.y];
                case GEOMETRY_TYPES.LINE:
                    return [this.extractedData.end.x, this.extractedData.end.y];
                case GEOMETRY_TYPES.CIRCLE:
                    return [this.extractedData.center.x, this.extractedData.center.y];
                case GEOMETRY_TYPES.POLYGON:
                    const verts = this.extractedData.vertices;
                    const last = verts[verts.length - 1];
                    return [last.x, last.y];
            }
        }
        if (this.collectionType === 'shape3d' && this.extractedPoints.length > 1) {
            const p = this.extractedPoints[this.extractedPoints.length - 1];
            return [p.x, p.y, p.z];
        }
        return [];
    }

    // ===== Text item accessor =====

    /**
     * Set the textItem (called by ItemCommand during doInit)
     * @param {TextItem} textItem
     */
    setTextItem(textItem) {
        this.textItem = textItem;
    }

    /**
     * Get the resolved value (TextItem, TableRow, or TableCell)
     * @returns {TextItem|TableRow|TableCell}
     */
    getResolvedValue() {
        if (this.isTableRowAccess) {
            return this.getTableRow();
        }
        if (this.isTableCellAccess) {
            return this.getTableCell();
        }
        return this.textItem;
    }

    // ===== Table accessors =====

    /**
     * Get table row (for 2-arg table access)
     * @returns {TableRow|null}
     */
    getTableRow() {
        if (!this.isTableRowAccess) return null;
        const collection = this.sourceExpression?.getTableCollection?.();
        return collection?.getRow(this.rowIndex) || null;
    }

    /**
     * Get table cell (for 3-arg table access)
     * @returns {TableCell|null}
     */
    getTableCell() {
        if (!this.isTableCellAccess) return null;
        const collection = this.sourceExpression?.getTableCollection?.();
        return collection?.getCell(this.rowIndex, this.colIndex) || null;
    }

    /**
     * Check if this is a table row access
     * @returns {boolean}
     */
    isRowAccess() {
        return this.isTableRowAccess;
    }

    /**
     * Check if this is a table cell access
     * @returns {boolean}
     */
    isCellAccess() {
        return this.isTableCellAccess;
    }

    // ===== Command generation =====

    toCommand(options = {}) {
        return new ItemCommand({
            collectionType: this.collectionType,
            collectionVariableName: this.collectionVariableName,
            index: this.index,
            expression: this
        });
    }

    canPlay() {
        // Text items don't play directly, shapes can be used in playable expressions
        return this.collectionType !== 'text';
    }

    getFriendlyToStr() {
        if (this.isTableCellAccess) {
            return `item[${this.collectionVariableName}, ${this.rowIndex}, ${this.colIndex}]`;
        }
        if (this.isTableRowAccess) {
            return `item[${this.collectionVariableName}, ${this.rowIndex}]`;
        }
        return `item[${this.collectionVariableName}, ${this.index}]`;
    }
}
