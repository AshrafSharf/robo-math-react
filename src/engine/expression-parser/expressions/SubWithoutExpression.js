/**
 * SubWithoutExpression - Extracts everything EXCEPT the specified parts of math text
 *
 * Syntax:
 *   subwithout(M, "pattern")              - Extract all except matching parts
 *   subwithout(M, "pattern1", "pattern2") - Exclude multiple patterns
 *
 * Returns a TextItemCollection that can be animated with write().
 * The extraction happens during command execution (doInit), not during resolve.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SubWithoutCommand } from '../../commands/SubWithoutCommand.js';

export class SubWithoutExpression extends AbstractNonArithmeticExpression {
    static NAME = 'subwithout';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.targetVariableName = null;
        this.excludePatterns = [];
        this.collection = null;  // Set by command during doInit
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('subwithout() requires at least 2 arguments: subwithout(M, "pattern")');
        }

        // First arg: variable reference to mathtext
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('subwithout() first argument must be a mathtext variable');
        }
        this.targetVariableName = targetExpr.variableName;

        // Verify the referenced expression exists and is a MathTextExpression or WriteExpression
        const resolvedExpr = context.getReference(this.targetVariableName);
        if (!resolvedExpr) {
            this.dispatchError(`subwithout(): Variable "${this.targetVariableName}" not found`);
        }
        const validSources = ['mathtext', 'write'];
        if (resolvedExpr.getName && !validSources.includes(resolvedExpr.getName())) {
            this.dispatchError(`subwithout(): "${this.targetVariableName}" must be a mathtext or write expression`);
        }

        // Remaining args: patterns to exclude (strings)
        for (let i = 1; i < this.subExpressions.length; i++) {
            const patternExpr = this.subExpressions[i];
            patternExpr.resolve(context);
            const resolvedPattern = this._getResolvedExpression(context, patternExpr);
            if (!resolvedPattern || resolvedPattern.getName() !== 'quotedstring') {
                this.dispatchError(`subwithout() argument ${i + 1} must be a quoted string (pattern)`);
            }
            this.excludePatterns.push(resolvedPattern.getStringValue());
        }
    }

    getName() {
        return SubWithoutExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Set the collection (called by SubWithoutCommand during doInit)
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
        return new SubWithoutCommand({
            targetVariableName: this.targetVariableName,
            excludePatterns: this.excludePatterns,
            expression: this
        });
    }

    canPlay() {
        return false;
    }
}
