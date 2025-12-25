/**
 * ASAExpression - constructs a triangle from Angle-Side-Angle
 *
 * Syntax:
 *   asa(graph, angleA, c, angleB)                    - triangle at origin
 *   asa(graph, angleA, c, angleB, basePoint)         - triangle with first vertex at basePoint
 *   asa(graph, angleA, c, angleB, basePoint, angle)  - triangle rotated by angle (degrees)
 *
 * Parameters:
 * - angleA: angle at vertex A (in degrees)
 * - c: side from A to B (between the two angles)
 * - angleB: angle at vertex B (in degrees)
 *
 * The third angle C is computed as 180 - angleA - angleB.
 * Side length can be a numeric value or expression (e.g., mag(L) for line length).
 *
 * Construction:
 * - Vertex A at origin (or basePoint)
 * - Vertex B at distance 'c' along x-axis (or rotated by angle)
 * - Vertex C computed using the angles
 *
 * Examples:
 *   asa(G, 60, 5, 60)                    // isoceles triangle (60-60-60 = equilateral)
 *   asa(G, 90, 5, 45)                    // 90-45-45 triangle
 *   asa(G, 30, mag(L), 60)               // triangle from line length
 *   asa(G, 60, 5, 60, point(G, 2, 3))    // positioned at (2, 3)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PolygonCommand } from '../../commands/PolygonCommand.js';

export class ASAExpression extends AbstractNonArithmeticExpression {
    static NAME = 'asa';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vertices = [];
        this.graphExpression = null;
        this.angleA = 0; // angle at A (degrees)
        this.sideC = 0;  // A to B (side c)
        this.angleB = 0; // angle at B (degrees)

        // Multi-shape support for edge access
        this.isMultiShape = true;
        this.shapeDataArray = [];
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('asa() requires: asa(graph, angleA, sideC, angleB) - two angles and included side');
        }

        // Resolve all subexpressions first
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be graph
        this.graphExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        if (!this.graphExpression || this.graphExpression.getName() !== 'g2d') {
            this.dispatchError('asa() requires graph as first argument');
        }

        // Get angle-side-angle values
        const angleAExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const cExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const angleBExpr = this._getResolvedExpression(context, this.subExpressions[3]);

        this.angleA = angleAExpr.getVariableAtomicValues()[0];
        this.sideC = cExpr.getVariableAtomicValues()[0];
        this.angleB = angleBExpr.getVariableAtomicValues()[0];

        // Validate
        if (this.sideC <= 0) {
            this.dispatchError('asa() side length must be positive');
        }
        if (this.angleA <= 0 || this.angleB <= 0) {
            this.dispatchError('asa() angles must be positive');
        }
        if (this.angleA + this.angleB >= 180) {
            this.dispatchError('asa() sum of angles must be less than 180 degrees');
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
     * Compute triangle vertices using angles and included side
     */
    _computeVertices(baseX, baseY, rotationDeg) {
        const c = this.sideC;
        const angleARad = this.angleA * Math.PI / 180;
        const angleBRad = this.angleB * Math.PI / 180;

        // Vertex A at origin
        let Ax = 0, Ay = 0;

        // Vertex B at distance c along x-axis
        let Bx = c, By = 0;

        // Vertex C: intersection of rays from A (at angleA) and B (at 180-angleB)
        // From A: direction is (cos(angleA), sin(angleA))
        // From B: direction is (cos(π - angleB), sin(π - angleB)) = (-cos(angleB), sin(angleB))

        // Using law of sines: a/sin(A) = b/sin(B) = c/sin(C)
        const angleC = Math.PI - angleARad - angleBRad;
        const sinC = Math.sin(angleC);

        // b = c * sin(B) / sin(C)
        const b = c * Math.sin(angleBRad) / sinC;

        // C is at distance b from A at angle angleA
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
        return ASAExpression.NAME;
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
        return `asa(${this.angleA}°, ${this.sideC}, ${this.angleB}°)`;
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
