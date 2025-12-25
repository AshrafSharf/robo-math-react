/**
 * AASExpression - constructs a triangle from Angle-Angle-Side
 *
 * Syntax:
 *   aas(graph, angleA, angleB, a)                    - triangle at origin
 *   aas(graph, angleA, angleB, a, basePoint)         - triangle with first vertex at basePoint
 *   aas(graph, angleA, angleB, a, basePoint, angle)  - triangle rotated by angle (degrees)
 *
 * Parameters:
 * - angleA: angle at vertex A (in degrees)
 * - angleB: angle at vertex B (in degrees)
 * - a: side opposite to angle A (from B to C)
 *
 * The third angle C is computed as 180 - angleA - angleB.
 * Side length can be a numeric value or expression (e.g., mag(L) for line length).
 *
 * Construction:
 * - Vertex A at origin (or basePoint)
 * - Uses law of sines to compute other sides
 * - Vertex B and C computed from derived side lengths
 *
 * Examples:
 *   aas(G, 30, 60, 5)                    // 30-60-90 triangle with side a=5
 *   aas(G, 45, 45, 5)                    // isoceles right triangle
 *   aas(G, 30, 60, mag(L))               // triangle from line length
 *   aas(G, 30, 60, 5, point(G, 2, 3))    // positioned at (2, 3)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PolygonCommand } from '../../commands/PolygonCommand.js';

export class AASExpression extends AbstractNonArithmeticExpression {
    static NAME = 'aas';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vertices = [];
        this.graphExpression = null;
        this.angleA = 0; // angle at A (degrees)
        this.angleB = 0; // angle at B (degrees)
        this.sideA = 0;  // side opposite to A (B to C)

        // Multi-shape support for edge access
        this.isMultiShape = true;
        this.shapeDataArray = [];
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('aas() requires: aas(graph, angleA, angleB, sideA) - two angles and opposite side');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('aas() requires graph as first argument');
        }

        // Get angle-angle-side values
        const angleAExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const angleBExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const aExpr = this._getResolvedExpression(context, this.subExpressions[3]);

        this.angleA = angleAExpr.getVariableAtomicValues()[0];
        this.angleB = angleBExpr.getVariableAtomicValues()[0];
        this.sideA = aExpr.getVariableAtomicValues()[0];

        // Validate
        if (this.sideA <= 0) {
            this.dispatchError('aas() side length must be positive');
        }
        if (this.angleA <= 0 || this.angleB <= 0) {
            this.dispatchError('aas() angles must be positive');
        }
        if (this.angleA + this.angleB >= 180) {
            this.dispatchError('aas() sum of angles must be less than 180 degrees');
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
            const rotExpr = this._getResolvedExpression(context, this.subExpressions[5]);
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
     * Compute triangle vertices using two angles and opposite side
     */
    _computeVertices(baseX, baseY, rotationDeg) {
        const a = this.sideA;
        const angleARad = this.angleA * Math.PI / 180;
        const angleBRad = this.angleB * Math.PI / 180;
        const angleCRad = Math.PI - angleARad - angleBRad;

        // Using law of sines: a/sin(A) = b/sin(B) = c/sin(C)
        const sinA = Math.sin(angleARad);
        const sinB = Math.sin(angleBRad);
        const sinC = Math.sin(angleCRad);

        // Compute other sides
        const b = a * sinB / sinA; // side opposite to B (A to C)
        const c = a * sinC / sinA; // side opposite to C (A to B)

        // Vertex A at origin
        let Ax = 0, Ay = 0;

        // Vertex B at distance c along x-axis
        let Bx = c, By = 0;

        // Vertex C at distance b from A at angle angleA
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
        return AASExpression.NAME;
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
        return `aas(${this.angleA}°, ${this.angleB}°, ${this.sideA})`;
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
