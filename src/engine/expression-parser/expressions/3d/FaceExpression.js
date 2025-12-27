/**
 * FaceExpression - Accessor for getting a specific face from a foldable
 *
 * Syntax:
 *   face(foldable, "top")     - get face by name
 *   face(foldable, 0)         - get face by index
 *
 * Returns a Face3D object that can be used with rotate3d().
 *
 * Example:
 *   F = foldable(G, 12, 2, "box")
 *   T = face(F, "top")
 *   rotate3d(T, 90)           // auto-detects pivot
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class FaceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'face';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.foldableExpression = null;
        this.faceId = null;  // string name or number index
        this.face = null;    // resolved Face3D
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('face() requires 2 arguments: foldable and face id');
        }

        // First arg: foldable expression
        this.subExpressions[0].resolve(context);
        this.foldableExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.foldableExpression || this.foldableExpression.getName() !== 'foldable') {
            this.dispatchError('face() first argument must be a foldable');
        }

        // Second arg: face id (string or number)
        this.subExpressions[1].resolve(context);
        const idArg = this._getResolvedExpression(context, this.subExpressions[1]);

        if (idArg.getName() === 'quotedstring') {
            this.faceId = idArg.getStringValue();
        } else {
            const values = idArg.getVariableAtomicValues();
            if (values.length > 0) {
                this.faceId = Math.floor(values[0]);
            } else {
                this.dispatchError('face() second argument must be a face name or index');
            }
        }

        // Try to get the face (will be null until foldable command is executed)
        this.face = this.foldableExpression.getFace(this.faceId);
    }

    getName() {
        return FaceExpression.NAME;
    }

    getGeometryType() {
        return 'face3d';
    }

    /**
     * Get the Face3D object
     */
    getFace() {
        // Re-fetch in case it wasn't available during resolve
        if (!this.face && this.foldableExpression) {
            this.face = this.foldableExpression.getFace(this.faceId);
        }
        return this.face;
    }

    /**
     * Get the face ID (for display/debug)
     */
    getFaceId() {
        return this.faceId;
    }

    /**
     * Get the parent foldable expression
     */
    getFoldableExpression() {
        return this.foldableExpression;
    }

    /**
     * Get graph expression (from parent foldable)
     */
    get graphExpression() {
        return this.foldableExpression?.graphExpression;
    }

    getVariableAtomicValues() {
        // Return face vertices if available
        const face = this.getFace();
        if (face) {
            const vertices = face.getVertices();
            const values = [];
            for (const v of vertices) {
                values.push(v.x, v.y, v.z);
            }
            return values;
        }
        return [];
    }

    getFriendlyToStr() {
        return `face(${this.faceId})`;
    }

    /**
     * face() doesn't create a command - it's an accessor
     * But it can be used with rotate3d()
     */
    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
