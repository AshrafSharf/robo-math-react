/**
 * GroupExpression - creates a THREE.Group and re-parents objects into it
 *
 * Syntax: group(obj1, obj2, ...)
 *   - obj1, obj2, ...: s3d objects (faces, spheres, other groups, etc.)
 *
 * Features:
 *   - Creates THREE.Group
 *   - Re-parents objects from their current parent into the new group
 *   - Group is NOT attached to any parent (use attach() to add to scene/group)
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { GroupCommand } from '../../../commands/s3d/GroupCommand.js';

export class GroupExpression extends AbstractNonArithmeticExpression {
    static NAME = 'group';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Child expressions (objects to group)
        this.childExpressions = [];
        // Reference to created THREE.Group (set by command after init)
        this.threeGroup = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('group() requires at least one object');
        }

        // All args are objects to group
        this.childExpressions = [];
        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);

            // Get the actual resolved expression (handles variable references)
            const expr = this._getResolvedExpression(context, subExpr);

            // Validate that it's an s3d object
            if (!this._isS3DObject(expr)) {
                this.dispatchError('group() arguments must be s3d objects (faces, groups, spheres, etc.)');
            }

            this.childExpressions.push(expr);
        }
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
        return GroupExpression.NAME;
    }

    /**
     * Check if this is an s3d group expression
     */
    isS3DGroup() {
        return true;
    }

    /**
     * Get the THREE.Group
     */
    getGroup() {
        return this.threeGroup;
    }

    /**
     * Set the THREE.Group (called by command after init)
     */
    setGroup(group) {
        this.threeGroup = group;
    }

    /**
     * Get Three.js object from expression
     */
    static getThreeObject(expr) {
        if (expr.isS3DGroup && expr.isS3DGroup()) {
            return expr.getGroup();
        } else if (expr.isS3DFace && expr.isS3DFace()) {
            return expr.getMesh();
        } else if (expr.isS3DSphere && expr.isS3DSphere()) {
            return expr.getMesh();
        } else if (expr.isS3DCube && expr.isS3DCube()) {
            return expr.getMesh();
        } else if (expr.isS3DCone && expr.isS3DCone()) {
            return expr.getMesh();
        } else if (expr.isS3DCylinder && expr.isS3DCylinder()) {
            return expr.getMesh();
        }
        return null;
    }

    getVariableAtomicValues() {
        // Group doesn't contribute coordinates
        return [];
    }

    toCommand(options = {}) {
        return new GroupCommand(
            this.childExpressions,
            this  // Pass expression reference so command can set threeGroup
        );
    }

    canPlay() {
        return this.childExpressions.length > 0;
    }
}
