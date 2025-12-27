/**
 * AttachExpression - attaches a child object to a parent (scene or group)
 *
 * Syntax: attach(parent, child)
 *   - parent: s3d space or a group
 *   - child: s3d object (group, face, sphere, etc.)
 *
 * Features:
 *   - Removes child from current parent (if any)
 *   - Adds child to new parent
 *   - Enables nested group hierarchies
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { AttachCommand } from '../../../commands/s3d/AttachCommand.js';

export class AttachExpression extends AbstractNonArithmeticExpression {
    static NAME = 'attach';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Parent expression (s3d or group)
        this.parentExpression = null;
        // Child expression (object to attach)
        this.childExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('attach() requires 2 arguments: parent and child');
        }

        // First arg is parent (s3d or group)
        this.subExpressions[0].resolve(context);
        const parentExpr = this._getResolvedExpression(context, this.subExpressions[0]);

        if (this._isValidParent(parentExpr)) {
            this.parentExpression = parentExpr;
        } else {
            this.dispatchError('attach() first argument must be an s3d space or a group');
        }

        // Second arg is child (any s3d object)
        this.subExpressions[1].resolve(context);
        const childExpr = this._getResolvedExpression(context, this.subExpressions[1]);

        if (this._isS3DObject(childExpr)) {
            this.childExpression = childExpr;
        } else {
            this.dispatchError('attach() second argument must be an s3d object (group, face, sphere, etc.)');
        }
    }

    /**
     * Check if expression is a valid parent (s3d or group)
     */
    _isValidParent(expr) {
        return (expr.isSpace3D && expr.isSpace3D()) ||
               (expr.isS3DGroup && expr.isS3DGroup());
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
        return AttachExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new AttachCommand(
            this.parentExpression,
            this.childExpression
        );
    }

    canPlay() {
        return this.parentExpression != null && this.childExpression != null;
    }
}
