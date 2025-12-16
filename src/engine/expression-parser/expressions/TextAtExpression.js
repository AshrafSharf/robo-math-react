/**
 * TextAtExpression - Get a single TextItem from a TextItemCollection by index
 *
 * Syntax:
 *   textat(collection, index)
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
        this.index = 0;
        this.textItem = null;  // Set by command during doInit
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('textat() requires 2 arguments: textat(collection, index)');
        }

        // First arg: collection variable
        const collectionExpr = this.subExpressions[0];
        collectionExpr.resolve(context);

        // Get the variable name for the collection
        if (collectionExpr.variableName) {
            this.collectionVariableName = collectionExpr.variableName;
        } else {
            this.dispatchError('textat() first argument must be a variable reference to a TextItemCollection');
        }

        // Verify the referenced expression exists and is a subonly/subwithout
        const resolvedExpr = context.getReference(this.collectionVariableName);
        if (!resolvedExpr) {
            this.dispatchError(`textat(): Variable "${this.collectionVariableName}" not found`);
        }
        const exprName = resolvedExpr.getName && resolvedExpr.getName();
        if (exprName !== 'subonly' && exprName !== 'subwithout') {
            this.dispatchError(`textat(): "${this.collectionVariableName}" must be from subonly() or subwithout()`);
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
            index: this.index,
            expression: this
        });
    }

    canPlay() {
        return false;
    }
}
