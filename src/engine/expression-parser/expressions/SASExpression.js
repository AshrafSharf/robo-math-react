/**
 * SASExpression - constructs a triangle from Side-Angle-Side
 *
 * Syntax:
 *   sas(graph, b, angleA, c)                    - triangle at origin
 *   sas(graph, b, angleA, c, basePoint)         - triangle with first vertex at basePoint
 *   sas(graph, b, angleA, c, basePoint, angle)  - triangle rotated by angle (degrees)
 *
 * Parameters:
 * - b: side from A to C (opposite vertex B)
 * - angleA: angle at vertex A (in degrees)
 * - c: side from A to B (opposite vertex C)
 *
 * Side lengths can be numeric values or expressions (e.g., distance(L) for line length).
 *
 * Construction:
 * - Vertex A at origin (or basePoint)
 * - Vertex B at distance 'c' along x-axis (or rotated by angle)
 * - Vertex C at distance 'b' at angleA from AB
 *
 * Examples:
 *   sas(G, 4, 90, 3)                    // right triangle with legs 3 and 4
 *   sas(G, 5, 60, 5)                    // isoceles triangle with 60° angle
 *   sas(G, distance(L1), 45, distance(L2))        // triangle from line lengths
 *   sas(G, 4, 90, 3, point(G, 2, 3))    // positioned at (2, 3)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PolygonCommand } from '../../commands/PolygonCommand.js';

export class SASExpression extends AbstractNonArithmeticExpression {
    static NAME = 'sas';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vertices = [];
        this.graphExpression = null;
        this.sideB = 0; // A to C
        this.angleA = 0; // angle at A (degrees)
        this.sideC = 0; // A to B

        // Multi-shape support for edge access
        this.isMultiShape = true;
        this.shapeDataArray = [];
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('sas() requires: sas(graph, sideB, angleA, sideC) - two sides and included angle');
        }

        // Resolve all subexpressions first, separating styling
        const styleExprs = [];
        const resolvedExprs = [];

        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const expr = this.subExpressions[i];

            if (this._isStyleExpression(expr)) {
                styleExprs.push(expr);
            } else {
                resolvedExprs.push(expr);
            }
        }

        this._parseStyleExpressions(styleExprs);

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, resolvedExprs[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('sas() requires graph as first argument');
        }

        // Get side-angle-side values
        const bExpr = this._getResolvedExpression(context, resolvedExprs[1]);
        const angleExpr = this._getResolvedExpression(context, resolvedExprs[2]);
        const cExpr = this._getResolvedExpression(context, resolvedExprs[3]);

        this.sideB = bExpr.getVariableAtomicValues()[0];
        this.angleA = angleExpr.getVariableAtomicValues()[0];
        this.sideC = cExpr.getVariableAtomicValues()[0];

        // Validate
        if (this.sideB <= 0 || this.sideC <= 0) {
            this.dispatchError('sas() side lengths must be positive');
        }
        if (this.angleA <= 0 || this.angleA >= 180) {
            this.dispatchError('sas() angle must be between 0 and 180 degrees');
        }

        // Get optional base point
        let baseX = 0, baseY = 0;
        if (resolvedExprs.length >= 5) {
            const baseExpr = this._getResolvedExpression(context, resolvedExprs[4]);
            const baseValues = baseExpr.getVariableAtomicValues();
            baseX = baseValues[0];
            baseY = baseValues[1];
        }

        // Get optional rotation angle (in degrees)
        let rotationDeg = 0;
        if (resolvedExprs.length >= 6) {
            const rotExpr = this._getResolvedExpression(context, resolvedExprs[5]);
            rotationDeg = rotExpr.getVariableAtomicValues()[0];
        }

        // Compute vertices
        this.vertices = this._computeVertices(baseX, baseY, rotationDeg);

        // Compute edge data for item() access
        this._computeEdges();
    }

    /**
     * Compute edge data from vertices for item() access
     */
    _computeEdges() {
        this.shapeDataArray = [];
        for (let i = 0; i < this.vertices.length - 1; i++) {
            this.shapeDataArray.push({
                startPoint: this.vertices[i],
                endPoint: this.vertices[i + 1],
                edgeIndex: i,
                originalShapeType: 'line',
                originalShapeName: 'line'
            });
        }
    }

    /**
     * Compute triangle vertices
     */
    _computeVertices(baseX, baseY, rotationDeg) {
        const b = this.sideB;
        const c = this.sideC;
        const angleARad = this.angleA * Math.PI / 180;

        // Vertex A at origin
        let Ax = 0, Ay = 0;

        // Vertex B at distance c along x-axis
        let Bx = c, By = 0;

        // Vertex C at distance b at angle angleA from x-axis
        let Cx = b * Math.cos(angleARad);
        let Cy = b * Math.sin(angleARad);

        // Apply rotation if specified
        if (rotationDeg !== 0) {
            const rotationRad = rotationDeg * Math.PI / 180;
            const cos = Math.cos(rotationRad);
            const sin = Math.sin(rotationRad);

            // Rotate B
            const Bx2 = Bx * cos - By * sin;
            const By2 = Bx * sin + By * cos;
            Bx = Bx2;
            By = By2;

            // Rotate C
            const Cx2 = Cx * cos - Cy * sin;
            const Cy2 = Cx * sin + Cy * cos;
            Cx = Cx2;
            Cy = Cy2;
        }

        // Translate to base point
        return [
            { x: Ax + baseX, y: Ay + baseY },
            { x: Bx + baseX, y: By + baseY },
            { x: Cx + baseX, y: Cy + baseY },
            { x: Ax + baseX, y: Ay + baseY } // Close the polygon
        ];
    }

    getName() {
        return SASExpression.NAME;
    }

    getGeometryType() {
        return 'polygon';
    }

    getVariableAtomicValues() {
        const coords = [];
        for (const v of this.vertices) {
            coords.push(v.x, v.y);
        }
        return coords;
    }

    getVertices() {
        return this.vertices;
    }

    getStartValue() {
        return [this.vertices[0].x, this.vertices[0].y];
    }

    getEndValue() {
        return [this.vertices[2].x, this.vertices[2].y];
    }

    getFriendlyToStr() {
        return `sas(${this.sideB}, ${this.angleA}°, ${this.sideC})`;
    }

    toCommand(options = {}) {
        const mergedOptions = { ...options, ...this.getStyleOptions() };
        return new PolygonCommand(this.graphExpression, this.vertices, mergedOptions);
    }

    canPlay() {
        return true;
    }

    // ===== Collection Accessor Methods (for item() support) =====

    /**
     * Get shape data at index (edge data)
     * @param {number} index
     * @returns {Object} Edge data with startPoint, endPoint, etc.
     */
    getShapeDataAt(index) {
        return this.shapeDataArray[index];
    }

    /**
     * Get collection size (number of edges)
     * @returns {number}
     */
    getCollectionSize() {
        return this.shapeDataArray.length;
    }

    /**
     * Check if this is a collection
     * @returns {boolean}
     */
    isCollection() {
        return true;
    }
}
