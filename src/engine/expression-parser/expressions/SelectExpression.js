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
import { SelectKatexCommand } from '../../commands/SelectKatexCommand.js';

export class SelectExpression extends AbstractNonArithmeticExpression {
    static NAME = 'select';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.targetVariableName = null;
        this.includePatterns = [];
        this.itemIndex = null;  // Optional: 1-based index to extract single item
        this.collection = null;  // Set by command during doInit
        this.singleItem = null;  // Set when itemIndex is specified
        this.sourceExpression = null;  // Reference to source expression for type detection
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
        const validSources = ['mathtext', 'write', 'meq', 'mtext', 'print', 'printonly', 'printwithout'];
        if (resolvedExpr.getName && !validSources.includes(resolvedExpr.getName())) {
            this.dispatchError(`select(): "${this.targetVariableName}" must be a mathtext, write, meq, or print expression`);
        }
        this.sourceExpression = resolvedExpr;

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
                    this.dispatchError('select() index must be >= 1');
                }
                endIndex = this.subExpressions.length - 1;
            }
        }

        // Remaining args (up to endIndex): patterns to extract (strings)
        for (let i = 1; i < endIndex; i++) {
            const patternExpr = this.subExpressions[i];
            if (i !== this.subExpressions.length - 1) {
                patternExpr.resolve(context);
            }
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
        // Detect if source is KaTeX-based
        const katexSources = ['print', 'printonly', 'printwithout'];
        const isKatexSource = this.sourceExpression &&
            katexSources.includes(this.sourceExpression.getName());

        if (isKatexSource) {
            return new SelectKatexCommand({
                targetVariableName: this.targetVariableName,
                includePatterns: this.includePatterns,
                expression: this
            });
        }

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
