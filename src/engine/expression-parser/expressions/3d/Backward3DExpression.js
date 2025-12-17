/**
 * Backward3DExpression - animates a 3D vector sliding backward along its direction
 *
 * Syntax:
 *   backward3d(vectorVar)             - slide vector backward by 1 unit (its own length)
 *   backward3d(vectorVar, scalar)     - slide vector backward by scalar amount
 *
 * This is an animation-only operation - it animates the existing vector sliding backward
 * and then returning to its original position.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 2, 1)
 *   backward3d(V)                     // animate V sliding backward by 1 unit
 *   backward3d(V, 2)                  // animate V sliding backward by 2 units
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Backward3DCommand } from '../../../commands/3d/Backward3DCommand.js';

export class Backward3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'backward3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vectorExpression = null;
        this.originalShapeVarName = null;
        this.scalar = 1;
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('backward3d() requires at least 1 argument: backward3d(vectorVar) or backward3d(vectorVar, scalar)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be a vector3d variable reference
        this.vectorExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        this.originalShapeVarName = this.subExpressions[0].variableName || this.vectorExpression.variableName;

        if (!this.vectorExpression || this.vectorExpression.getName() !== 'vector3d') {
            this.dispatchError('backward3d() requires a vector3d as first argument');
        }

        // Second arg (optional) is scalar distance
        if (this.subExpressions.length >= 2) {
            const scalarExpr = this._getResolvedExpression(context, this.subExpressions[1]);
            this.scalar = scalarExpr.getVariableAtomicValues()[0];
        }
    }

    getName() {
        return Backward3DExpression.NAME;
    }

    getGeometryType() {
        return 'vector3d';
    }

    getVariableAtomicValues() {
        // Return the original vector coordinates
        return this.vectorExpression ? this.vectorExpression.getVariableAtomicValues() : [];
    }

    getFriendlyToStr() {
        return `backward3d[${this.originalShapeVarName}, scalar=${this.scalar}]`;
    }

    toCommand(options = {}) {
        return new Backward3DCommand(
            this.vectorExpression,
            this.originalShapeVarName,
            this.scalar,
            options
        );
    }

    canPlay() {
        return true;
    }
}
