/**
 * TextAtCommand - Gets a single TextItem from a TextItemCollection by index
 *
 * This command doesn't play - it just extracts data during doInit.
 * The TextItem is stored in commandResult for later use.
 */
import { BaseCommand } from './BaseCommand.js';

export class TextAtCommand extends BaseCommand {
    /**
     * @param {Object} options
     * @param {string} options.collectionVariableName - Variable name of the TextItemCollection
     * @param {number} options.index - Index of the TextItem to get
     * @param {TextAtExpression} options.expression - Reference to expression for storing result
     */
    constructor(options = {}) {
        super();
        this.options = options;
        this.textItem = null;
    }

    async doInit() {
        // Get the TextItemCollection from shapeRegistry (stored by SubOnlyCommand/SubWithoutCommand)
        const collection = this.commandContext.shapeRegistry[this.options.collectionVariableName];
        if (!collection) {
            console.warn(`TextAtCommand: "${this.options.collectionVariableName}" not found in registry`);
            return;
        }

        // Validate index
        const index = this.options.index;
        if (index < 0 || index >= collection.size()) {
            console.warn(`TextAtCommand: Index ${index} out of bounds (collection has ${collection.size()} items)`);
            return;
        }

        // Get the TextItem
        this.textItem = collection.get(index);

        // Store in expression for later access
        if (this.options.expression) {
            this.options.expression.setTextItem(this.textItem);
        }

        this.commandResult = this.textItem;
    }

    async playSingle() {
        // No-op - this command doesn't animate
        return Promise.resolve();
    }

    doDirectPlay() {
        // No-op - this command doesn't animate
    }

    getLabelPosition() {
        if (this.textItem) {
            const bounds = this.textItem.getBounds();
            if (bounds) {
                return { x: bounds.minX, y: bounds.minY };
            }
        }
        return { x: 0, y: 0 };
    }

    clear() {
        this.textItem = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
