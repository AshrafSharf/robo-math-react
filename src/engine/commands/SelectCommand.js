/**
 * SelectCommand - Extracts ONLY the specified parts of math text into a TextItemCollection
 *
 * This command doesn't play - it just extracts data during doInit.
 * The TextItemCollection is stored in commandResult for later use.
 */
import { BaseCommand } from './BaseCommand.js';
import { TextItem } from '../../mathtext/models/text-item.js';
import { TextItemCollection } from '../../mathtext/models/text-item-collection.js';
import { PatternSelector } from '../../mathtext/utils/pattern-selector.js';

export class SelectCommand extends BaseCommand {
    /**
     * @param {Object} options
     * @param {string} options.targetVariableName - Variable name of the mathtext
     * @param {Array<string>} options.includePatterns - Patterns to extract
     * @param {SelectExpression} options.expression - Reference to expression for storing result
     */
    constructor(options = {}) {
        super();
        this.options = options;
        this.mathComponent = null;
        this.collection = null;
    }

    async doInit() {
        // Get the MathTextComponent from the registry
        this.mathComponent = this.commandContext.shapeRegistry[this.options.targetVariableName];
        if (!this.mathComponent) {
            console.warn(`SelectCommand: "${this.options.targetVariableName}" not found in registry`);
            return;
        }

        // Extract bounds and create TextItems
        this.collection = this._extractTextItems();

        // Store in expression for variable assignment
        if (this.options.expression) {
            this.options.expression.setCollection(this.collection);
        }

        this.commandResult = this.collection;
    }

    /**
     * Extract TextItems from mathComponent using include patterns
     * @returns {TextItemCollection}
     */
    _extractTextItems() {
        const selectionUnits = PatternSelector.getSelectionUnits(
            this.mathComponent,
            this.options.includePatterns
        );

        const collection = new TextItemCollection();
        selectionUnits.forEach(unit => {
            const textItem = new TextItem(this.mathComponent, unit, null);
            collection.add(textItem);
        });

        return collection;
    }

    async playSingle() {
        // No-op - this command doesn't animate
        return Promise.resolve();
    }

    doDirectPlay() {
        // No-op - this command doesn't animate
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }

    clear() {
        this.mathComponent = null;
        this.collection = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
