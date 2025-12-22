/**
 * SelectExpression - Extracts ONLY the specified parts of math text into a TextItemCollection
 *
 * Syntax:
 *   select(M, "pattern")              - Extract matching parts
 *   select(M, "pattern1", "pattern2") - Extract multiple patterns
 *
 * Returns a TextItemCollection that can be animated with write().
 * The extraction happens during command execution (doInit), not during resolve.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SelectCommand } from '../../commands/SelectCommand.js';

export class SelectExpression extends AbstractNonArithmeticExpression {
    static NAME = 'select';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.targetVariableName = null;
        this.includePatterns = [];
        this.collection = null;  // Set by command during doInit
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('select() requires at least 2 arguments: select(M, "pattern")');
        }

        // First arg: variable reference to mathtext
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('select() first argument must be a mathtext variable');
        }
        this.targetVariableName = targetExpr.variableName;

        // Verify the referenced expression exists and is a MathTextExpression or WriteExpression
        const resolvedExpr = context.getReference(this.targetVariableName);
        if (!resolvedExpr) {
            this.dispatchError(`select(): Variable "${this.targetVariableName}" not found`);
        }
        const validSources = ['mathtext', 'write'];
        if (resolvedExpr.getName && !validSources.includes(resolvedExpr.getName())) {
            this.dispatchError(`select(): "${this.targetVariableName}" must be a mathtext or write expression`);
        }

        // Remaining args: patterns to extract (strings)
        for (let i = 1; i < this.subExpressions.length; i++) {
            const patternExpr = this.subExpressions[i];
            patternExpr.resolve(context);
            const resolvedPattern = this._getResolvedExpression(context, patternExpr);
            if (!resolvedPattern || resolvedPattern.getName() !== 'quotedstring') {
                this.dispatchError(`select() argument ${i + 1} must be a quoted string (pattern)`);
            }
            this.includePatterns.push(resolvedPattern.getStringValue());
        }
    }

    getName() {
        return SelectExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Set the collection (called by SelectCommand during doInit)
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
        return new SelectCommand({
            targetVariableName: this.targetVariableName,
            includePatterns: this.includePatterns,
            expression: this
        });
    }

    canPlay() {
        return false;
    }
}
