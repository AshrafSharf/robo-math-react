/**
 * EdgeExpression - extracts edge info from a face3d
 *
 * Syntax: edge(face, index)
 *   - face: a face3d expression
 *   - index: edge index (0-based, edge N connects vertex N to vertex (N+1) % count)
 *
 * Returns:
 *   - midpoint: [x, y, z] center of the edge
 *   - axis: [dx, dy, dz] normalized direction along the edge
 *   - start: [x, y, z] first vertex of the edge
 *   - end: [x, y, z] second vertex of the edge
 *
 * Usage:
 *   e = edge(face, 0)           # Get first edge
 *   pivot3d(face, e)            # Pivot at edge midpoint (pivot3d extracts midpoint)
 *   rotate3d(face, 90, e)       # Rotate around edge axis (rotate3d extracts axis)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { NoOpCommand } from '../../../commands/NoOpCommand.js';

export class EdgeExpression extends AbstractNonArithmeticExpression {
    static NAME = 'edge';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // The face expression we're extracting from
        this.faceExpression = null;
        // Edge index
        this.edgeIndex = 0;
        // Computed edge properties
        this.start = [0, 0, 0];
        this.end = [0, 0, 0];
        this.midpoint = [0, 0, 0];
        this.axis = [1, 0, 0];  // Normalized direction
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('edge() requires 2 arguments: face and index');
        }

        // First arg: face expression
        this.subExpressions[0].resolve(context);
        const faceExpr = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!faceExpr.isS3DFace || !faceExpr.isS3DFace()) {
            this.dispatchError('edge() first argument must be a face3d expression');
        }
        this.faceExpression = faceExpr;

        // Second arg: edge index
        this.subExpressions[1].resolve(context);
        const indexExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const indexValues = indexExpr.getVariableAtomicValues();
        if (indexValues.length < 1) {
            this.dispatchError('edge() second argument must be a numeric index');
        }
        this.edgeIndex = Math.floor(indexValues[0]);

        // Get vertices from face
        const vertices = faceExpr.vertices;
        if (!vertices || vertices.length < 2) {
            this.dispatchError('edge() face must have at least 2 vertices');
        }

        const vertexCount = vertices.length;
        if (this.edgeIndex < 0 || this.edgeIndex >= vertexCount) {
            this.dispatchError(`edge() index ${this.edgeIndex} out of range (face has ${vertexCount} edges)`);
        }

        // Edge N connects vertex N to vertex (N+1) % count
        const v1 = vertices[this.edgeIndex];
        const v2 = vertices[(this.edgeIndex + 1) % vertexCount];

        this.start = [...v1];
        this.end = [...v2];

        // Compute midpoint
        this.midpoint = [
            (v1[0] + v2[0]) / 2,
            (v1[1] + v2[1]) / 2,
            (v1[2] + v2[2]) / 2
        ];

        // Compute normalized axis (direction from start to end)
        const dx = v2[0] - v1[0];
        const dy = v2[1] - v1[1];
        const dz = v2[2] - v1[2];
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (length > 0.0001) {
            this.axis = [dx / length, dy / length, dz / length];
        } else {
            this.axis = [1, 0, 0];  // Default axis if edge is degenerate
        }
    }

    getName() {
        return EdgeExpression.NAME;
    }

    /**
     * Check if this is an edge expression
     */
    isS3DEdge() {
        return true;
    }

    /**
     * Get the edge midpoint [x, y, z]
     */
    getMidpoint() {
        return this.midpoint;
    }

    /**
     * Get the edge axis (normalized direction) [dx, dy, dz]
     */
    getAxis() {
        return this.axis;
    }

    /**
     * Get the start vertex [x, y, z]
     */
    getStart() {
        return this.start;
    }

    /**
     * Get the end vertex [x, y, z]
     */
    getEnd() {
        return this.end;
    }

    /**
     * Get the face expression this edge belongs to
     */
    getFaceExpression() {
        return this.faceExpression;
    }

    /**
     * Get edge index
     */
    getEdgeIndex() {
        return this.edgeIndex;
    }

    /**
     * By default, return midpoint coordinates
     * This allows edge to be used directly in position expressions
     */
    getVariableAtomicValues() {
        return [...this.midpoint];
    }

    /**
     * Get start point (for expressions that need start/end like line)
     */
    getStartValue() {
        return [...this.start];
    }

    /**
     * Get end point
     */
    getEndValue() {
        return [...this.end];
    }

    /**
     * Returns NoOpCommand - edge() doesn't render anything
     */
    toCommand() {
        return new NoOpCommand();
    }

    canPlay() {
        return false;
    }
}
