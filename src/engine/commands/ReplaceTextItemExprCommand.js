/**
 * ReplaceTextItemExprCommand - Replaces a TextItem from an inline item expression
 *
 * Used when replace() is called with an inline item expression: replace("x", item(thetas, 0))
 * The textItem is looked up via the item expression's collection variable.
 *
 * Extends ReplaceTextItemCommand - only overrides doInit() to handle collection+index lookup.
 */
import { ReplaceTextItemCommand } from './ReplaceTextItemCommand.js';
import { FadeOutCommand } from './visibility/FadeOutCommand.js';

export class ReplaceTextItemExprCommand extends ReplaceTextItemCommand {
    /**
     * @param {string} sourceString - LaTeX string to render
     * @param {string} collectionVariableName - Variable name of the TextItemCollection
     * @param {number} index - Index of the TextItem to replace
     * @param {Object} collectionInlineExpression - Optional inline select/selectexcept expression
     */
    constructor(sourceString, collectionVariableName, index, collectionInlineExpression = null) {
        super(sourceString, collectionVariableName);
        this.index = index;
        this.collectionInlineExpression = collectionInlineExpression;
    }

    async doInit() {
        // If we have an inline expression (select/selectexcept), run it first
        if (this.collectionInlineExpression) {
            const subCommand = this.collectionInlineExpression.toCommand();
            await subCommand.init(this.commandContext);

            // Get the collection and register with a temp name
            const collection = this.collectionInlineExpression.getResolvedValue();
            this.targetVariableName = `__replace_item_inline_${Date.now()}`;
            this.commandContext.shapeRegistry[this.targetVariableName] = collection;
        }

        // Get the TextItemCollection from shapeRegistry
        const collection = this.commandContext.shapeRegistry[this.targetVariableName];
        if (!collection) {
            console.warn(`ReplaceTextItemExprCommand: "${this.targetVariableName}" not found in registry`);
            return;
        }

        // Validate index
        if (this.index < 0 || this.index >= collection.size()) {
            console.warn(`ReplaceTextItemExprCommand: Index ${this.index} out of bounds (collection has ${collection.size()} items)`);
            return;
        }

        // Get the single TextItem at index and add to parent's array
        const textItem = collection.get(this.index);
        this.targetTextItems.push(textItem);

        // Register textItem with temp name for FadeOutCommand
        const tempName = `__replace_item_${Date.now()}`;
        this.commandContext.shapeRegistry[tempName] = textItem;

        // Create FadeOutCommand for the target
        this.fadeOutCommand = new FadeOutCommand([tempName], 0.5);
        await this.fadeOutCommand.init(this.commandContext);

        // Call parent's helper to create MathTextComponent for each target
        await this._createMathComponentsForTargets();
    }
}
