/**
 * NextBoundsExpression - Get spanning bounds relative to another item's bounds
 *
 * Syntax: nextbounds(reference, position, rows, cols, dx?, dy?)
 *
 * Arguments:
 *   - reference: Variable reference to an existing item
 *   - position: Position shorthand (tl, tr, bl, br, mt, mb, ml, mr, c)
 *   - rows: Height in logical units (rows to span)
 *   - cols: Width in logical units (columns to span)
 *   - dx: Optional horizontal offset in pixels (default: 10)
 *   - dy: Optional vertical offset in pixels (default: 10)
 *
 * Returns: {row1, col1, row2, col2} for spanning items like graphContainer
 *
 * Note: Uses deferred evaluation like NextToExpression.
 *
 * Example:
 *   G = g2d(0, 0, 16, 8, ...)
 *   G2 = g2d(nextbounds(G, br, 16, 8, 20, 0))  // Graph below-right of G
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CanvasBoundsAdapter, POSITION_MAP } from '../../../adapters/canvas-bounds-adapter.js';

export class NextBoundsExpression extends AbstractNonArithmeticExpression {
    static NAME = 'nextbounds';

    // Marker to identify this as a bounds expression
    static isBoundsExpression = true;

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;

        // Stored during resolve()
        this.referenceExpr = null;
        this.referenceName = null;
        this.position = 'br';           // Position shorthand
        this.rows = 16;                 // Height in logical rows
        this.cols = 8;                  // Width in logical cols
        this.dx = 10;                   // Horizontal offset
        this.dy = 10;                   // Vertical offset

        // Computed during evaluate() - deferred
        this.row1 = null;
        this.col1 = null;
        this.row2 = null;
        this.col2 = null;
        this.isEvaluated = false;
    }

    resolve(context) {
        // Need at least 4 args: reference, position, rows, cols
        if (this.subExpressions.length < 4) {
            this.dispatchError('nextbounds() requires at least 4 arguments: nextbounds(reference, position, rows, cols)');
        }

        // First arg: variable reference
        this.referenceExpr = this.subExpressions[0];
        this.referenceExpr.resolve(context);

        if (this.referenceExpr.getName() === 'variable') {
            this.referenceName = this.referenceExpr.getVariableName();
        } else {
            const resolvedExpr = this._getResolvedExpression(context, this.referenceExpr);
            if (resolvedExpr && resolvedExpr.getLabel) {
                this.referenceName = resolvedExpr.getLabel();
            }
        }

        if (!this.referenceName) {
            this.dispatchError('nextbounds() first argument must be a variable reference');
        }

        // Second arg: position
        const positionExpr = this.subExpressions[1];
        positionExpr.resolve(context);

        if (positionExpr.getName() === 'variable') {
            this.position = positionExpr.getVariableName();
        } else if (typeof positionExpr.getStringValue === 'function') {
            this.position = positionExpr.getStringValue();
        }

        if (!POSITION_MAP[this.position]) {
            this.dispatchError(
                `nextbounds() invalid position "${this.position}". ` +
                `Valid: tl, tr, bl, br, mt, mb, ml, mr, c`
            );
        }

        // Third arg: rows
        const rowsExpr = this.subExpressions[2];
        rowsExpr.resolve(context);
        const rowsValues = rowsExpr.getVariableAtomicValues();
        if (rowsValues.length > 0 && typeof rowsValues[0] === 'number') {
            this.rows = rowsValues[0];
        } else {
            this.dispatchError('nextbounds() rows must be a number');
        }

        // Fourth arg: cols
        const colsExpr = this.subExpressions[3];
        colsExpr.resolve(context);
        const colsValues = colsExpr.getVariableAtomicValues();
        if (colsValues.length > 0 && typeof colsValues[0] === 'number') {
            this.cols = colsValues[0];
        } else {
            this.dispatchError('nextbounds() cols must be a number');
        }

        // Fifth arg: dx (optional)
        if (this.subExpressions.length >= 5) {
            const dxExpr = this.subExpressions[4];
            dxExpr.resolve(context);
            const dxValues = dxExpr.getVariableAtomicValues();
            if (dxValues.length > 0 && typeof dxValues[0] === 'number') {
                this.dx = dxValues[0];
            }
        }

        // Sixth arg: dy (optional)
        if (this.subExpressions.length >= 6) {
            const dyExpr = this.subExpressions[5];
            dyExpr.resolve(context);
            const dyValues = dyExpr.getVariableAtomicValues();
            if (dyValues.length > 0 && typeof dyValues[0] === 'number') {
                this.dy = dyValues[0];
            }
        }
    }

    /**
     * Evaluate the actual bounds coordinates.
     * Called by consuming commands at init time when shapeRegistry is available.
     *
     * @param {CommandContext} commandContext - Has shapeRegistry and layoutMapper
     * @returns {{row1: number, col1: number, row2: number, col2: number}}
     */
    evaluate(commandContext) {
        if (this.isEvaluated) {
            return { row1: this.row1, col1: this.col1, row2: this.row2, col2: this.col2 };
        }

        const shapeRegistry = commandContext.shapeRegistry;
        const layoutMapper = commandContext.layoutMapper;

        if (!shapeRegistry || !layoutMapper) {
            throw new Error('nextbounds() requires commandContext with shapeRegistry and layoutMapper');
        }

        // Look up the referenced item
        const item = shapeRegistry[this.referenceName];
        if (!item) {
            throw new Error(`nextbounds(): Referenced item "${this.referenceName}" not found in shapeRegistry`);
        }

        // Get bounds via adapter
        const adapter = CanvasBoundsAdapter.for(item);
        const bounds = adapter.getBounds();

        if (!bounds || bounds.isEmpty()) {
            throw new Error(`nextbounds(): Could not get bounds for "${this.referenceName}"`);
        }

        // Get anchor position point from bounds
        const methodName = POSITION_MAP[this.position];
        const point = bounds[methodName];

        if (!point) {
            throw new Error(`nextbounds(): Could not get position "${this.position}" from bounds`);
        }

        // Apply offset to get starting point
        const canvasX = point.x + this.dx;
        const canvasY = point.y + this.dy;

        // Convert to logical coordinates (anchor point)
        const logical = layoutMapper.toLogical(canvasX, canvasY);
        this.row1 = logical.row;
        this.col1 = logical.col;

        // Calculate end bounds
        this.row2 = this.row1 + this.rows;
        this.col2 = this.col1 + this.cols;

        this.isEvaluated = true;

        return { row1: this.row1, col1: this.col1, row2: this.row2, col2: this.col2 };
    }

    getName() {
        return NextBoundsExpression.NAME;
    }

    /**
     * Returns bounds if already evaluated.
     * Note: May return empty if not yet evaluated (deferred).
     */
    getVariableAtomicValues() {
        if (this.isEvaluated) {
            return [this.row1, this.col1, this.row2, this.col2];
        }
        return [];
    }

    isNextBoundsExpression() {
        return true;
    }

    getReferenceName() {
        return this.referenceName;
    }

    getPosition() {
        return this.position;
    }

    getRows() {
        return this.rows;
    }

    getCols() {
        return this.cols;
    }

    getDx() {
        return this.dx;
    }

    getDy() {
        return this.dy;
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
