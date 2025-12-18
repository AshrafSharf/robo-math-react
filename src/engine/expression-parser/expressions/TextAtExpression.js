/**
 * TextAtExpression - Get a single TextItem from a TextItemCollection by index
 *
 * Syntax:
 *   textat(collection, index)
 *   textat(subonly(M, "pattern"), index)
 *
 * Returns a single TextItem that can be animated with write().
 * The extraction happens during command execution (doInit), not during resolve.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { TextAtCommand } from '../../commands/TextAtCommand.js';

export class TextAtExpression extends AbstractNonArithmeticExpression {
    static NAME = 'textat';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.collectionVariableName = null;
        this.inlineExpression = null;  // For inline subonly/subwithout
        this.index = 0;
        this.textItem = null;  // Set by command during doInit
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('textat() requires 2 arguments: textat(collection, index)');
        }

        // First arg: collection variable or inline expression
        const collectionExpr = this.subExpressions[0];
        collectionExpr.resolve(context);

        // Check if it's an inline subonly/subwithout expression
        const exprName = collectionExpr.getName && collectionExpr.getName();
        const validSources = ['subonly', 'subwithout', 'writeonly', 'writewithout'];

        if (validSources.includes(exprName)) {
            // Inline expression - store it for the command to execute
            this.inlineExpression = collectionExpr;
        } else if (collectionExpr.variableName) {
            // Variable reference
            this.collectionVariableName = collectionExpr.variableName;

            // Verify the referenced expression exists and is a TextItemCollection source
            const resolvedExpr = context.getReference(this.collectionVariableName);
            if (!resolvedExpr) {
                this.dispatchError(`textat(): Variable "${this.collectionVariableName}" not found`);
            }
            const refExprName = resolvedExpr.getName && resolvedExpr.getName();
            if (!validSources.includes(refExprName)) {
                this.dispatchError(`textat(): "${this.collectionVariableName}" must be from subonly(), subwithout(), writeonly(), or writewithout()`);
            }
        } else {
            this.dispatchError('textat() first argument must be a TextItemCollection variable or subonly()/subwithout() expression');
        }

        // Second arg: index (numeric)
        const indexExpr = this.subExpressions[1];
        indexExpr.resolve(context);
        const indexValues = indexExpr.getVariableAtomicValues();
        if (indexValues.length === 0) {
            this.dispatchError('textat() second argument must be a number (index)');
        }
        this.index = Math.floor(indexValues[0]);
    }

    getName() {
        return TextAtExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Set the textItem (called by TextAtCommand during doInit)
     * @param {TextItem} textItem
     */
    setTextItem(textItem) {
        this.textItem = textItem;
    }

    /**
     * Get the resolved TextItem
     * @returns {TextItem}
     */
    getResolvedValue() {
        return this.textItem;
    }

    toCommand(options = {}) {
        return new TextAtCommand({
            collectionVariableName: this.collectionVariableName,
            inlineExpression: this.inlineExpression,
            index: this.index,
            expression: this
        });
    }

    canPlay() {
        return false;
    }
}
