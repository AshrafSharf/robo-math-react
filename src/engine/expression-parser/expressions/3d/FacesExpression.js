/**
 * FacesExpression - Accessor for getting all faces from a foldable
 *
 * Syntax:
 *   faces(foldable)   - get all foldable faces as array
 *
 * Returns an array of Face3D objects.
 *
 * Example:
 *   F = foldable(G, 12, 2, "box")
 *   allFaces = faces(F)   // [top, bottom, left, right]
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class FacesExpression extends AbstractNonArithmeticExpression {
    static NAME = 'faces';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.foldableExpression = null;
        this.facesList = [];
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('faces() requires 1 argument: foldable');
        }

        // First arg: foldable expression
        this.subExpressions[0].resolve(context);
        this.foldableExpression = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this.foldableExpression || this.foldableExpression.getName() !== 'foldable') {
            this.dispatchError('faces() argument must be a foldable');
        }

        // Get faces (may be empty until foldable command is executed)
        this.facesList = this.foldableExpression.getFaces() || [];
    }

    getName() {
        return FacesExpression.NAME;
    }

    getGeometryType() {
        return 'face3darray';
    }

    /**
     * Get the array of Face3D objects
     */
    getFaces() {
        // Re-fetch in case they weren't available during resolve
        if (this.facesList.length === 0 && this.foldableExpression) {
            this.facesList = this.foldableExpression.getFaces() || [];
        }
        return this.facesList;
    }

    /**
     * Get face at index
     */
    getFaceAt(index) {
        const faces = this.getFaces();
        return faces[index] || null;
    }

    /**
     * Get number of faces
     */
    getCount() {
        return this.getFaces().length;
    }

    getVariableAtomicValues() {
        return [this.getCount()];
    }

    getFriendlyToStr() {
        return `faces[${this.getCount()}]`;
    }

    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
