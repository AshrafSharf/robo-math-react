/**
 * Position3DExpression - sets position of an s3d object
 *
 * Syntax: position3d(obj, x, y, z)
 *   - obj: s3d object (group, face, sphere, cube, cone, cylinder)
 *   - x, y, z: position coordinates
 *
 * Directly mutates the Three.js object's position.
 *
 * Examples:
 *   earth = sphere(S, 1)
 *   position3d(earth, 10, 0, 0)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Position3DCommand } from '../../../commands/s3d/Position3DCommand.js';

export class Position3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'position3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.targetExpression = null;
        this.position = { x: 0, y: 0, z: 0 };
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('position3d() requires 4 arguments: object, x, y, z');
        }

        // First arg is target object
        this.subExpressions[0].resolve(context);
        const targetExpr = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this._isS3DObject(targetExpr)) {
            this.dispatchError('position3d() first argument must be an s3d object');
        }
        this.targetExpression = targetExpr;

        // Remaining args are x, y, z
        const allValues = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            allValues.push(...this.subExpressions[i].getVariableAtomicValues());
        }

        if (allValues.length < 3) {
            this.dispatchError('position3d() requires x, y, z coordinates');
        }

        this.position = { x: allValues[0], y: allValues[1], z: allValues[2] };
    }

    /**
     * Check if expression is an s3d object
     */
    _isS3DObject(expr) {
        return (expr.isS3DGroup && expr.isS3DGroup()) ||
               (expr.isS3DFace && expr.isS3DFace()) ||
               (expr.isS3DSphere && expr.isS3DSphere()) ||
               (expr.isS3DCube && expr.isS3DCube()) ||
               (expr.isS3DCone && expr.isS3DCone()) ||
               (expr.isS3DCylinder && expr.isS3DCylinder());
    }

    getName() {
        return Position3DExpression.NAME;
    }

    getVariableAtomicValues() {
        return [this.position.x, this.position.y, this.position.z];
    }

    toCommand(options = {}) {
        return new Position3DCommand(
            this.targetExpression,
            this.position,
            options
        );
    }

    canPlay() {
        return this.targetExpression != null;
    }
}
