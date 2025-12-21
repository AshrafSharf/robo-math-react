/**
 * Forward3DExpression - animates a 3D vector sliding forward along its direction
 *
 * Syntax:
 *   forward3d(vectorVar)              - slide vector forward by 1 unit (its own length)
 *   forward3d(vectorVar, scalar)      - slide vector forward by scalar amount
 *
 * This is an animation-only operation - it animates the existing vector sliding forward
 * and then returning to its original position.
 *
 * Examples:
 *   g = g3d(0, 0, 20, 20)
 *   V = vector3d(g, 0, 0, 0, 3, 2, 1)
 *   forward3d(V)                      // animate V sliding forward by 1 unit
 *   forward3d(V, 2)                   // animate V sliding forward by 2 units
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Forward3DCommand } from '../../../commands/3d/Forward3DCommand.js';

export class Forward3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'forward3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.vectorExpression = null;
        this.originalShapeVarName = null;
        this.scalar = 1;
        this.inputType = 'vector3d'; // 'vector3d' or 'line3d'
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('forward3d() requires at least 1 argument: forward3d(vectorVar) or forward3d(vectorVar, scalar)');
        }

        // Resolve all subexpressions
        for (let i = 0; i < this.subExpressions.length; i++) {
            this.subExpressions[i].resolve(context);
        }

        // First arg must be a vector3d or line3d variable reference
        this.vectorExpression = this._getResolvedExpression(context, this.subExpressions[0]);
        this.originalShapeVarName = this.subExpressions[0].variableName || this.vectorExpression.variableName;

        const shapeType = this.vectorExpression?.getGeometryType?.() || this.vectorExpression?.getName();
        if (shapeType !== 'vector3d' && shapeType !== 'line3d') {
            this.dispatchError('forward3d() requires a vector3d or line3d as first argument');
        }
        this.inputType = shapeType;

        // Second arg (optional) is scalar distance
        if (this.subExpressions.length >= 2) {
            const scalarExpr = this._getResolvedExpression(context, this.subExpressions[1]);
            this.scalar = scalarExpr.getVariableAtomicValues()[0];
        }
    }

    getName() {
        return Forward3DExpression.NAME;
    }

    getGeometryType() {
        return this.inputType;
    }

    getVariableAtomicValues() {
        // Return the original vector coordinates
        return this.vectorExpression ? this.vectorExpression.getVariableAtomicValues() : [];
    }

    getFriendlyToStr() {
        return `forward3d[${this.originalShapeVarName}, scalar=${this.scalar}]`;
    }

    toCommand(options = {}) {
        return new Forward3DCommand(
            this.vectorExpression,
            this.originalShapeVarName,
            this.scalar,
            this.inputType,
            options
        );
    }

    canPlay() {
        return true;
    }
}
