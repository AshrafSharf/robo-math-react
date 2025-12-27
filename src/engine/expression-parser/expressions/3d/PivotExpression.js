/**
 * PivotExpression - Accessor for getting the pivot/hinge line from a face
 *
 * Syntax:
 *   pivot(face)   - get the hinge line for rotation
 *
 * Returns a Line3D-compatible object { start: {x,y,z}, end: {x,y,z} }
 * that can be used as rotation axis in rotate3d().
 *
 * Example:
 *   F = foldable(G, 12, 2, "box")
 *   T = face(F, "top")
 *   P = pivot(T)
 *   rotate3d(T, 90, P)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class PivotExpression extends AbstractNonArithmeticExpression {
    static NAME = 'pivot';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.faceExpression = null;
        this.pivot = null;  // { start: {x,y,z}, end: {x,y,z} }
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('pivot() requires 1 argument: face');
        }

        // First arg: face expression
        this.subExpressions[0].resolve(context);
        this.faceExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.faceExpression || this.faceExpression.getName() !== 'face') {
            this.dispatchError('pivot() argument must be a face (from face() expression)');
        }

        // Get pivot from face
        const face = this.faceExpression.getFace();
        if (face) {
            this.pivot = face.getPivot();
        }
    }

    getName() {
        return PivotExpression.NAME;
    }

    getGeometryType() {
        return 'line3d';
    }

    /**
     * Get the pivot line
     */
    getPivot() {
        // Re-fetch if needed
        if (!this.pivot && this.faceExpression) {
            const face = this.faceExpression.getFace();
            if (face) {
                this.pivot = face.getPivot();
            }
        }
        return this.pivot;
    }

    /**
     * Get start point of pivot line
     */
    getStart() {
        const pivot = this.getPivot();
        return pivot ? pivot.start : { x: 0, y: 0, z: 0 };
    }

    /**
     * Get end point of pivot line
     */
    getEnd() {
        const pivot = this.getPivot();
        return pivot ? pivot.end : { x: 0, y: 0, z: 0 };
    }

    /**
     * Get as vector direction (for rotate3d axis)
     */
    getDirection() {
        const pivot = this.getPivot();
        if (!pivot) return { x: 1, y: 0, z: 0 };

        return {
            x: pivot.end.x - pivot.start.x,
            y: pivot.end.y - pivot.start.y,
            z: pivot.end.z - pivot.start.z
        };
    }

    getVariableAtomicValues() {
        const pivot = this.getPivot();
        if (!pivot) return [];
        return [
            pivot.start.x, pivot.start.y, pivot.start.z,
            pivot.end.x, pivot.end.y, pivot.end.z
        ];
    }

    getStartValue() {
        const s = this.getStart();
        return [s.x, s.y, s.z];
    }

    getEndValue() {
        const e = this.getEnd();
        return [e.x, e.y, e.z];
    }

    getFriendlyToStr() {
        const pivot = this.getPivot();
        if (!pivot) return 'pivot(?)';
        return `pivot[(${pivot.start.x}, ${pivot.start.y}, ${pivot.start.z}) -> (${pivot.end.x}, ${pivot.end.y}, ${pivot.end.z})]`;
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
