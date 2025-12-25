/**
 * ItemCommand - Extracts a single item from a collection
 *
 * For text collections: extracts TextItem at command time from shapeRegistry
 * For polygon collections: creates a NEW LineCommand from edge coordinates
 * For shape collections: the data is already extracted during resolve,
 *                        this command just ensures proper registry handling
 */
import { BaseCommand } from './BaseCommand.js';
import { LineCommand } from './LineCommand.js';

export class ItemCommand extends BaseCommand {
    /**
     * @param {Object} options
     * @param {string} options.collectionType - 'text', 'shape2d', 'shape3d', 'polygon'
     * @param {string} options.collectionVariableName - Variable name of the collection
     * @param {number} options.index - Index of the item to get
     * @param {ItemExpression} options.expression - Reference to expression for storing result
     */
    constructor(options = {}) {
        super();
        this.options = options;
        this.extractedItem = null;
        this.lineCommand = null;  // For polygon edge access
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
        } else if (collectionType === 'polygon') {
            // Polygon edge access: create a NEW line from edge coordinates
            const edgeData = expression.extractedData;
            if (!edgeData) {
                console.warn(`ItemCommand: No edge data found for polygon item at index ${index}`);
                return;
            }

            // Create a new LineCommand for this edge
            this.lineCommand = new LineCommand(
                expression.graphExpression,
                edgeData.start,
                edgeData.end,
                {}
            );
            this.lineCommand.diagram2d = this.diagram2d;
            await this.lineCommand.init(this.commandContext);
            this.commandResult = this.lineCommand.commandResult;
        } else {
            // Shape collections (translate, rotate, scale, change)
            const collection = this.commandContext.shapeRegistry[collectionVariableName];
            if (collection && typeof collection.get === 'function') {
                this.commandResult = collection.get(index);
            }
        }
    }

    async playSingle() {
        if (this.lineCommand) {
            return this.lineCommand.playSingle();
        }
        return Promise.resolve();
    }

    doDirectPlay() {
        if (this.lineCommand) {
            this.lineCommand.directPlay();
        }
        // For text/shape collections - item already extracted in doInit
    }

    getLabelPosition() {
        if (this.lineCommand) {
            return this.lineCommand.getLabelPosition();
        }
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
        if (this.lineCommand) {
            this.lineCommand.clear();
        }
        this.extractedItem = null;
        this.lineCommand = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
