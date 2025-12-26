/**
 * MlineExpression - Data holder for a single line in meq
 *
 * Syntax:
 *   mline(equation, reason?, explicitNumber?)
 *
 * Used inside meq() to define an equation step with optional reason and number.
 * Not playable on its own.
 *
 * Examples:
 *   mline("x^2 = 4", "given")           // auto-numbered with reason
 *   mline("x = \\pm 2")                 // auto-numbered, no reason
 *   mline("E = mc^2", "Einstein", 42)   // explicit number 42
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';

export class MlineExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mline';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.equation = '';      // The equation string (e.g., "x^2 = 4")
        this.reason = '';        // Optional reason/annotation (e.g., "given")
        this.explicitNumber = null;  // Optional explicit equation number
        this.number = null;      // Assigned number (set by meq)
    }

    resolve(context) {
        if (this.subExpressions.length < 1) {
            this.dispatchError('mline() requires at least 1 argument: mline(equation, reason?, number?)');
        }

        // Resolve equation (first arg) - required
        const eqExpr = this.subExpressions[0];
        eqExpr.resolve(context);
        const resolvedEq = this._getResolvedExpression(context, eqExpr);
        if (resolvedEq && resolvedEq.getName() === 'quotedstring') {
            this.equation = resolvedEq.getStringValue();
        } else {
            this.dispatchError('mline() first argument (equation) must be a quoted string');
        }

        // Resolve reason (second arg) - optional
        if (this.subExpressions.length >= 2) {
            const reasonExpr = this.subExpressions[1];
            reasonExpr.resolve(context);
            const resolvedReason = this._getResolvedExpression(context, reasonExpr);
            if (resolvedReason && resolvedReason.getName() === 'quotedstring') {
                this.reason = resolvedReason.getStringValue();
            } else if (resolvedReason && resolvedReason.getName() === 'numeric') {
                // If second arg is a number, treat it as explicit number (no reason)
                this.explicitNumber = resolvedReason.getVariableAtomicValues()[0];
            }
        }

        // Resolve explicit number (third arg) - optional
        if (this.subExpressions.length >= 3) {
            const numExpr = this.subExpressions[2];
            numExpr.resolve(context);
            const resolvedNum = this._getResolvedExpression(context, numExpr);
            if (resolvedNum) {
                const values = resolvedNum.getVariableAtomicValues();
                if (values.length > 0) {
                    this.explicitNumber = values[0];
                }
            }
        }
    }

    getName() {
        return MlineExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand() {
        // mline is not directly playable
        return null;
    }

    canPlay() {
        return false;
    }
}
