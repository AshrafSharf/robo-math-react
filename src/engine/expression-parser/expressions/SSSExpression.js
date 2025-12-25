/**
 * SSSExpression - constructs a triangle from three side lengths (Side-Side-Side)
 *
 * Syntax:
 *   sss(graph, a, b, c)                    - triangle at origin
 *   sss(graph, a, b, c, basePoint)         - triangle with first vertex at basePoint
 *   sss(graph, a, b, c, basePoint, angle)  - triangle rotated by angle (degrees)
 *
 * Side lengths can be numeric values or expressions (e.g., distance(L) for line length).
 * Sides a, b, c are opposite to vertices A, B, C respectively.
 * - Side 'a' connects B to C (opposite vertex A)
 * - Side 'b' connects A to C (opposite vertex B)
 * - Side 'c' connects A to B (opposite vertex C)
 *
 * Construction:
 * - Vertex A at origin (or basePoint)
 * - Vertex B at distance 'c' along x-axis (or rotated by angle)
 * - Vertex C computed using law of cosines
 *
 * Examples:
 *   sss(G, 3, 4, 5)                    // 3-4-5 right triangle at origin
 *   sss(G, distance(L1), distance(L2), distance(L3))  // triangle from line lengths
 *   sss(G, 5, 5, 5)                    // equilateral triangle
 *   sss(G, 3, 4, 5, point(G, 2, 3))    // positioned at (2, 3)
 *   sss(G, 3, 4, 5, O, 45)             // rotated 45 degrees
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PolygonCommand } from '../../commands/PolygonCommand.js';

export class SSSExpression extends AbstractNonArithmeticExpression {
    static NAME = 'sss';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vertices = []; // [{x, y}, {x, y}, {x, y}]
        this.graphExpression = null;
        this.sideA = 0; // opposite to vertex A (B to C)
        this.sideB = 0; // opposite to vertex B (A to C)
        this.sideC = 0; // opposite to vertex C (A to B)

        // Multi-shape support for edge access
        this.isMultiShape = true;
        this.shapeDataArray = [];
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('sss() requires: sss(graph, a, b, c) where a, b, c are side lengths');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('sss() requires graph as first argument');
        }

        // Get side lengths
        const aExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const bExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const cExpr = this._getResolvedExpression(context, this.subExpressions[3]);

        this.sideA = aExpr.getVariableAtomicValues()[0];
        this.sideB = bExpr.getVariableAtomicValues()[0];
        this.sideC = cExpr.getVariableAtomicValues()[0];

        // Validate triangle inequality
        if (!this._isValidTriangle(this.sideA, this.sideB, this.sideC)) {
            this.dispatchError(`sss() invalid triangle: sides ${this.sideA}, ${this.sideB}, ${this.sideC} do not satisfy triangle inequality`);
        }

        // Get optional base point
        let baseX = 0, baseY = 0;
        if (this.subExpressions.length >= 5) {
            const baseExpr = this._getResolvedExpression(context, this.subExpressions[4]);
            const baseValues = baseExpr.getVariableAtomicValues();
            baseX = baseValues[0];
            baseY = baseValues[1];
        }

        // Get optional rotation angle (in degrees)
        let rotationDeg = 0;
        if (this.subExpressions.length >= 6) {
            const angleExpr = this._getResolvedExpression(context, this.subExpressions[5]);
            rotationDeg = angleExpr.getVariableAtomicValues()[0];
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
     * Check if three sides can form a valid triangle
     */
    _isValidTriangle(a, b, c) {
        return (a + b > c) && (a + c > b) && (b + c > a) && a > 0 && b > 0 && c > 0;
    }

    /**
     * Compute triangle vertices using law of cosines
     */
    _computeVertices(baseX, baseY, rotationDeg) {
        const a = this.sideA;
        const b = this.sideB;
        const c = this.sideC;

        // Vertex A at origin
        let Ax = 0, Ay = 0;

        // Vertex B at distance c along x-axis
        let Bx = c, By = 0;

        // Vertex C using law of cosines
        // cos(A) = (b² + c² - a²) / (2bc)
        const cosA = (b * b + c * c - a * a) / (2 * b * c);
        const angleA = Math.acos(Math.max(-1, Math.min(1, cosA))); // Clamp for numerical stability

        let Cx = b * Math.cos(angleA);
        let Cy = b * Math.sin(angleA);

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
        return SSSExpression.NAME;
    }

    getGeometryType() {
        return 'polygon';
    }

    getVariableAtomicValues() {
        // Return flattened coordinates
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
        return `sss(${this.sideA}, ${this.sideB}, ${this.sideC})`;
    }

    toCommand(options = {}) {
        return new PolygonCommand(this.graphExpression, this.vertices, options);
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
