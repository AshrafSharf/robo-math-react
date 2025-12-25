/**
 * ItemCommand - Extracts a single item from a collection
 *
 * For text collections: extracts TextItem at command time from shapeRegistry
 * For shape collections: the data is already extracted during resolve,
 *                        this command just ensures proper registry handling
 */
import { BaseCommand } from './BaseCommand.js';

export class ItemCommand extends BaseCommand {
    /**
     * @param {Object} options
     * @param {string} options.collectionType - 'text', 'shape2d', or 'shape3d'
     * @param {string} options.collectionVariableName - Variable name of the collection
     * @param {number} options.index - Index of the item to get
     * @param {ItemExpression} options.expression - Reference to expression for storing result
     */
    constructor(options = {}) {
        super();
        this.options = options;
        this.extractedItem = null;
    }

    async doInit() {
        const { collectionType, collectionVariableName, index, expression } = this.options;

        if (collectionType === 'text') {
            // Text collections: extract TextItem from shapeRegistry
            const collection = this.commandContext.shapeRegistry[collectionVariableName];
            if (!collection) {
                console.warn(`ItemCommand: "${collectionVariableName}" not found in registry`);
                return;
            }

            // Validate index
            const size = collection.size?.() || collection.length || 0;
            if (index < 0 || index >= size) {
                console.warn(`ItemCommand: Index ${index} out of bounds (collection has ${size} items)`);
                return;
            }

            // Get the TextItem
            this.extractedItem = collection.get(index);

            // Store in expression for later access
            if (expression) {
                expression.setTextItem(this.extractedItem);
            }

            this.commandResult = this.extractedItem;
        } else {
            // Shape collections (translate, rotate, scale, polygon, change)
            const collection = this.commandContext.shapeRegistry[collectionVariableName];
            this.commandResult = collection.get(index);
        }
    }

    async playSingle() {
        return Promise.resolve();
    }

    doDirectPlay() {
        // Nothing to do - shape already extracted in doInit
    }

    getLabelPosition() {
        if (this.extractedItem) {
            // For TextItem
            const bounds = this.extractedItem.getBounds?.();
            if (bounds) {
                return { x: bounds.minX, y: bounds.minY };
            }
        }
        return { x: 0, y: 0 };
    }

    clear() {
        this.extractedItem = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
