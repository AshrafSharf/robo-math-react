/**
 * SubOnlyExpression - Extracts ONLY the specified parts of math text into a TextItemCollection
 *
 * Syntax:
 *   subonly(M, "pattern")              - Extract matching parts
 *   subonly(M, "pattern1", "pattern2") - Extract multiple patterns
 *
 * Returns a TextItemCollection that can be animated with write().
 * The extraction happens during command execution (doInit), not during resolve.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SubOnlyCommand } from '../../commands/SubOnlyCommand.js';

export class SubOnlyExpression extends AbstractNonArithmeticExpression {
    static NAME = 'subonly';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.targetVariableName = null;
        this.includePatterns = [];
        this.collection = null;  // Set by command during doInit
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('subonly() requires at least 2 arguments: subonly(M, "pattern")');
        }

        // First arg: variable reference to mathtext
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('subonly() first argument must be a mathtext variable');
        }
        this.targetVariableName = targetExpr.variableName;

        // Verify the referenced expression exists and is a MathTextExpression
        const resolvedExpr = context.getReference(this.targetVariableName);
        if (!resolvedExpr) {
            this.dispatchError(`subonly(): Variable "${this.targetVariableName}" not found`);
        }
        if (resolvedExpr.getName && resolvedExpr.getName() !== 'mathtext') {
            this.dispatchError(`subonly(): "${this.targetVariableName}" must be a mathtext expression`);
        }

        // Remaining args: patterns to extract (strings)
        for (let i = 1; i < this.subExpressions.length; i++) {
            const patternExpr = this.subExpressions[i];
            patternExpr.resolve(context);
            const resolvedPattern = this._getResolvedExpression(context, patternExpr);
            if (!resolvedPattern || resolvedPattern.getName() !== 'quotedstring') {
                this.dispatchError(`subonly() argument ${i + 1} must be a quoted string (pattern)`);
            }
            this.includePatterns.push(resolvedPattern.getStringValue());
        }
    }

    getName() {
        return SubOnlyExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Set the collection (called by SubOnlyCommand during doInit)
     * @param {TextItemCollection} collection
     */
    setCollection(collection) {
        this.collection = collection;
    }

    /**
     * Get the resolved TextItemCollection
     * @returns {TextItemCollection}
     */
    getResolvedValue() {
        return this.collection;
    }

    toCommand(options = {}) {
        return new SubOnlyCommand({
            targetVariableName: this.targetVariableName,
            includePatterns: this.includePatterns,
            expression: this
        });
    }

    canPlay() {
        return false;
    }
}
