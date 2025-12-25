/**
 * MstepExpression - Data holder for a single step in mflow
 *
 * Syntax:
 *   mstep(above, below, result)
 *
 * Used inside mflow() to define a transformation step.
 * Not playable on its own.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';

export class MstepExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mstep';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.above = '';   // Text above arrow (transformation/function)
        this.below = '';   // Text below arrow (label/step name)
        this.result = '';  // Result after this step
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('mstep() requires 3 arguments: mstep(above, below, result)');
        }

        // Resolve above (first arg)
        const aboveExpr = this.subExpressions[0];
        aboveExpr.resolve(context);
        const resolvedAbove = this._getResolvedExpression(context, aboveExpr);
        if (resolvedAbove && resolvedAbove.getName() === 'quotedstring') {
            this.above = resolvedAbove.getStringValue();
        } else {
            this.dispatchError('mstep() first argument (above) must be a quoted string');
        }

        // Resolve below (second arg)
        const belowExpr = this.subExpressions[1];
        belowExpr.resolve(context);
        const resolvedBelow = this._getResolvedExpression(context, belowExpr);
        if (resolvedBelow && resolvedBelow.getName() === 'quotedstring') {
            this.below = resolvedBelow.getStringValue();
        } else {
            this.dispatchError('mstep() second argument (below) must be a quoted string');
        }

        // Resolve result (third arg)
        const resultExpr = this.subExpressions[2];
        resultExpr.resolve(context);
        const resolvedResult = this._getResolvedExpression(context, resultExpr);
        if (resolvedResult && resolvedResult.getName() === 'quotedstring') {
            this.result = resolvedResult.getStringValue();
        } else {
            this.dispatchError('mstep() third argument (result) must be a quoted string');
        }
    }

    getName() {
        return MstepExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        // mstep is not directly playable
        return null;
    }

    canPlay() {
        return false;
    }
}
