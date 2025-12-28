/**
 * Pivot3DExpression - sets pivot point for an s3d object
 *
 * Syntax:
 *   pivot3d(obj, x, y, z)      - Pivot at specific coordinates
 *   pivot3d(obj, edge)         - Pivot at edge midpoint (extracts from EdgeExpression)
 *   pivot3d(obj, point3d)      - Pivot at point coordinates
 *
 * Creates a pivot group at the specified position and re-parents the object.
 * Future rotate3d() calls on this object will rotate around the pivot point.
 *
 * Examples:
 *   face = face3d(S, v0, v1, v2)
 *   e = edge(face, 0)
 *   pivot3d(face, e)            # Pivot at edge midpoint
 *   rotate3d(face, 90, e)       # Fold around edge axis
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Pivot3DCommand } from '../../../commands/s3d/Pivot3DCommand.js';

export class Pivot3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'pivot3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.targetExpression = null;
        this.pivotPosition = { x: 0, y: 0, z: 0 };
        // Store edge expression if provided (for rotate3d to extract axis)
        this.edgeExpression = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('pivot3d() requires at least 2 arguments: object and position');
        }

        // First arg is target object
        this.subExpressions[0].resolve(context);
        const targetExpr = this._getResolvedExpression(context, this.subExpressions[0]);

        if (!this._isS3DObject(targetExpr)) {
            this.dispatchError('pivot3d() first argument must be an s3d object');
        }
        this.targetExpression = targetExpr;

        // Remaining args are pivot position (x, y, z) or an edge expression
        const allValues = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
            const resolved = this._getResolvedExpression(context, this.subExpressions[i]);

            // Check if this is an edge expression
            if (resolved.isS3DEdge && resolved.isS3DEdge()) {
                this.edgeExpression = resolved;
                const midpoint = resolved.getMidpoint();
                allValues.push(midpoint[0], midpoint[1], midpoint[2]);
            } else {
                allValues.push(...resolved.getVariableAtomicValues());
            }
        }

        if (allValues.length < 3) {
            this.dispatchError('pivot3d() requires x, y, z pivot coordinates');
        }

        this.pivotPosition = { x: allValues[0], y: allValues[1], z: allValues[2] };
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
        return Pivot3DExpression.NAME;
    }

    /**
     * Get the target expression
     */
    getTargetExpression() {
        return this.targetExpression;
    }

    /**
     * Get the edge expression if pivot was set from an edge
     */
    getEdgeExpression() {
        return this.edgeExpression;
    }

    /**
     * Get pivot position
     */
    getPivotPosition() {
        return this.pivotPosition;
    }

    getVariableAtomicValues() {
        return [this.pivotPosition.x, this.pivotPosition.y, this.pivotPosition.z];
    }

    toCommand(options = {}) {
        return new Pivot3DCommand(
            this.targetExpression,
            this.pivotPosition,
            this.edgeExpression,
            options
        );
    }

    canPlay() {
        // pivot3d is a structural operation, not an animation
        return false;
    }
}
