/**
 * Map expression - linear interpolation between two values
 *
 * Syntax:
 *   map(t, a, b)  - interpolates between a and b based on t (0 to 1)
 *
 * Returns: a + t * (b - a)
 *   t=0 returns a
 *   t=1 returns b
 *   t=0.5 returns midpoint
 *
 * Works with:
 *   - Numbers: map(0.5, 0, 10) → 5
 *   - Points: map(0.5, P1, P2) → midpoint
 *
 * Examples:
 *   map(0.5, 0, 100)        // 50
 *   map(0.25, A, B)         // point 25% along from A to B
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { NumericExpression } from './NumericExpression.js';
import { PointExpression } from './PointExpression.js';

export class MapExpression extends AbstractNonArithmeticExpression {
    static NAME = 'map';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.resultValues = [];  // The interpolated result
        this.resultType = 'number';  // 'number' or 'point'
    }

    resolve(context) {
        if (this.subExpressions.length !== 3) {
            this.dispatchError(`map() needs 3 arguments.\nUsage: map(t, a, b)`);
        }

        // Resolve all arguments
        for (let i = 0; i < 3; i++) {
            this.subExpressions[i].resolve(context);
        }

        // Get t (ratio/interpolation factor)
        const tExpr = this._getResolvedExpression(context, this.subExpressions[0]);
        const tValues = tExpr.getVariableAtomicValues();
        if (tValues.length !== 1) {
            this.dispatchError(`map() first arg must be a number.\nGot ${tValues.length} values.`);
        }
        const t = tValues[0];

        // Get a (start value)
        const aExpr = this._getResolvedExpression(context, this.subExpressions[1]);
        const aValues = aExpr.getVariableAtomicValues();

        // Get b (end value)
        const bExpr = this._getResolvedExpression(context, this.subExpressions[2]);
        const bValues = bExpr.getVariableAtomicValues();

        // Validate a and b have same dimensions
        if (aValues.length !== bValues.length) {
            this.dispatchError(`map() a and b must have same type.\na has ${aValues.length} values, b has ${bValues.length}.`);
        }

        // Interpolate: result = a + t * (b - a)
        this.resultValues = aValues.map((a, i) => a + t * (bValues[i] - a));
        this.resultType = this.resultValues.length === 2 ? 'point' : 'number';
    }

    getName() {
        return MapExpression.NAME;
    }

    getVariableAtomicValues() {
        return this.resultValues;
    }

    /**
     * Map doesn't produce a command - it's a pure value expression
     */
    toCommand() {
        return null;
    }

    canPlay() {
        return false;
    }
}
