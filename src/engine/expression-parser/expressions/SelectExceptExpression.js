/**
 * SelectExceptExpression - Extracts everything EXCEPT the specified parts of math text
 *
 * Syntax:
 *   selectexcept(M, "pattern")              - Extract all except matching parts
 *   selectexcept(M, "pattern1", "pattern2") - Exclude multiple patterns
 *
 * Returns a TextItemCollection that can be animated with write().
 * The extraction happens during command execution (doInit), not during resolve.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SelectExceptCommand } from '../../commands/SelectExceptCommand.js';

export class SelectExceptExpression extends AbstractNonArithmeticExpression {
    static NAME = 'selectexcept';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.targetVariableName = null;
        this.excludePatterns = [];
        this.itemIndex = null;  // Optional: 1-based index to extract single item
        this.collection = null;  // Set by command during doInit
        this.singleItem = null;  // Set when itemIndex is specified
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('selectexcept() requires at least 2 arguments: selectexcept(M, "pattern")');
        }

        // First arg: variable reference to mathtext
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('selectexcept() first argument must be a mathtext variable');
        }
        this.targetVariableName = targetExpr.variableName;

        // Verify the referenced expression exists and is a MathTextExpression or WriteExpression
        const resolvedExpr = context.getReference(this.targetVariableName);
        if (!resolvedExpr) {
            this.dispatchError(`selectexcept(): Variable "${this.targetVariableName}" not found`);
        }
        const validSources = ['mathtext', 'write', 'meq', 'mtext'];
        if (resolvedExpr.getName && !validSources.includes(resolvedExpr.getName())) {
            this.dispatchError(`selectexcept(): "${this.targetVariableName}" must be a mathtext, write, or meq expression`);
        }

        // Check if last argument is a number (item index)
        const lastExpr = this.subExpressions[this.subExpressions.length - 1];
        lastExpr.resolve(context);
        const resolvedLast = this._getResolvedExpression(context, lastExpr);

        let endIndex = this.subExpressions.length;
        if (resolvedLast && resolvedLast.getName() !== 'quotedstring') {
            // Last arg is not a string - treat as index
            const indexValues = resolvedLast.getVariableAtomicValues();
            if (indexValues.length === 1 && typeof indexValues[0] === 'number') {
                this.itemIndex = Math.floor(indexValues[0]);
                if (this.itemIndex < 1) {
                    this.dispatchError('selectexcept() index must be >= 1');
                }
                endIndex = this.subExpressions.length - 1;
            }
        }

        // Remaining args (up to endIndex): patterns to exclude (strings)
        for (let i = 1; i < endIndex; i++) {
            const patternExpr = this.subExpressions[i];
            if (i !== this.subExpressions.length - 1) {
                patternExpr.resolve(context);
            }
            const resolvedPattern = this._getResolvedExpression(context, patternExpr);
            if (!resolvedPattern || resolvedPattern.getName() !== 'quotedstring') {
                this.dispatchError(`selectexcept() argument ${i + 1} must be a quoted string (pattern)`);
            }
            this.excludePatterns.push(resolvedPattern.getStringValue());
        }
    }

    getName() {
        return SelectExceptExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Set the collection (called by SelectExceptCommand during doInit)
     * @param {TextItemCollection} collection
     */
    setCollection(collection) {
        this.collection = collection;

        // If itemIndex specified, extract single item
        if (this.itemIndex !== null && collection) {
            const zeroBasedIndex = this.itemIndex - 1;
            if (zeroBasedIndex >= 0 && zeroBasedIndex < collection.size()) {
                this.singleItem = collection.get(zeroBasedIndex);
            }
        }
    }

    /**
     * Get the resolved value
     * @returns {TextItemCollection|TextItem} Collection or single item if index was specified
     */
    getResolvedValue() {
        if (this.itemIndex !== null) {
            return this.singleItem;
        }
        return this.collection;
    }

    toCommand(options = {}) {
        return new SelectExceptCommand({
            targetVariableName: this.targetVariableName,
            excludePatterns: this.excludePatterns,
            expression: this
        });
    }

    canPlay() {
        return false;
    }
}
