/**
 * SubWithoutCommand - Extracts everything EXCEPT the specified parts of math text
 *
 * This command doesn't play - it just extracts data during doInit.
 * The TextItemCollection is stored in commandResult for later use.
 */
import { BaseCommand } from './BaseCommand.js';
import { TextItem } from '../../mathtext/models/text-item.js';
import { TextItemCollection } from '../../mathtext/models/text-item-collection.js';
import { SelectionUnit } from '../../mathtext/models/selection-unit.js';
import { wrapMultipleWithBBox } from '../../mathtext/utils/bbox-latex-wrapper.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';

export class SubWithoutCommand extends BaseCommand {
    /**
     * @param {Object} options
     * @param {string} options.targetVariableName - Variable name of the mathtext
     * @param {Array<string>} options.excludePatterns - Patterns to exclude
     * @param {SubWithoutExpression} options.expression - Reference to expression for storing result
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
            console.warn(`SubWithoutCommand: "${this.options.targetVariableName}" not found in registry`);
            return;
        }

        // Extract bounds and create TextItems (excluding the patterns)
        this.collection = this._extractTextItemsWithout();

        // Store in expression for variable assignment
        if (this.options.expression) {
            this.options.expression.setCollection(this.collection);
        }

        this.commandResult = this.collection;
    }

    /**
     * Extract TextItems from mathComponent EXCLUDING the patterns
     * @returns {TextItemCollection}
     */
    _extractTextItemsWithout() {
        const originalContent = this.mathComponent.getContent();
        const wrappedContent = wrapMultipleWithBBox(originalContent, this.options.excludePatterns);

        // Create temp component with bbox markers
        const tempComponent = MathTextComponent.createTempAtSamePosition(
            this.mathComponent,
            wrappedContent
        );

        // Extract bounds from temp's bbox regions (these are the EXCLUDED regions)
        const bboxBounds = tempComponent.getBBoxHighlightBounds();

        // Destroy temp - we only needed the bounds
        tempComponent.destroy();

        // Map bounds to selection units on the original component (to exclude)
        const excludeSelectionUnits = this.mathComponent.computeSelectionUnitsFromBounds(bboxBounds);

        // Get the remaining nodes (everything NOT in the excluded selection units)
        const remainingNodes = this.mathComponent.excludeTweenNodes(excludeSelectionUnits);

        // Create a SelectionUnit from the remaining nodes
        const remainingSelectionUnit = new SelectionUnit();
        remainingNodes.forEach(node => {
            if (node.fragmentId) {
                remainingSelectionUnit.addFragment(node.fragmentId);
            }
        });

        // Create a single TextItem with all remaining nodes
        const collection = new TextItemCollection();
        if (remainingSelectionUnit.hasFragment()) {
            const textItem = new TextItem(
                this.mathComponent,
                remainingSelectionUnit,
                null  // No single bounds for "without" selection
            );
            collection.add(textItem);
        }

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
