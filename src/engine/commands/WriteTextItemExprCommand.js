/**
 * WriteTextItemExprCommand - Animates a TextItem from an inline item expression
 *
 * Used when write() is called with an inline item expression: write(item(thetas, 0))
 * The textItem is looked up via the item expression's collection variable.
 */
import { BaseCommand } from './BaseCommand.js';
import { RewriteOnlyEffect } from '../../mathtext/effects/rewrite-only-effect.js';

export class WriteTextItemExprCommand extends BaseCommand {
    /**
     * @param {string} collectionVariableName - Variable name of the TextItemCollection
     * @param {number} index - Index of the TextItem to animate
     */
    constructor(collectionVariableName, index) {
        super();
        this.collectionVariableName = collectionVariableName;
        this.index = index;
        this.textItem = null;
        this.mathComponent = null;
    }

    async doInit() {
        // Get the TextItemCollection from shapeRegistry (stored by SelectCommand/SelectExceptCommand)
        const collection = this.commandContext.shapeRegistry[this.collectionVariableName];
        if (!collection) {
            console.warn(`WriteTextItemExprCommand: "${this.collectionVariableName}" not found in registry`);
            return;
        }

        // Validate index
        if (this.index < 0 || this.index >= collection.size()) {
            console.warn(`WriteTextItemExprCommand: Index ${this.index} out of bounds (collection has ${collection.size()} items)`);
            return;
        }

        // Get the TextItem at index
        this.textItem = collection.get(this.index);
        this.mathComponent = this.textItem.getMathComponent();
        this.commandResult = this.textItem;
    }

    async playSingle() {
        if (!this.mathComponent || !this.textItem) return;

        const effect = new RewriteOnlyEffect(
            this.mathComponent,
            [this.textItem.selectionUnit]
        );
        return effect.play();
    }

    doDirectPlay() {
        if (!this.mathComponent || !this.textItem) return;

        const effect = new RewriteOnlyEffect(
            this.mathComponent,
            [this.textItem.selectionUnit]
        );
        effect.toEndState();
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
        this.mathComponent = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
