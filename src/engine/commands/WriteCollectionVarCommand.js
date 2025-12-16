/**
 * WriteCollectionVarCommand - Animates all TextItems in a collection (looked up by variable name)
 *
 * Used when write() is called with a variable containing a TextItemCollection.
 * The collection is looked up from the expression context during doInit.
 */
import { BaseCommand } from './BaseCommand.js';
import { RewriteOnlyEffect } from '../../mathtext/effects/rewrite-only-effect.js';

export class WriteCollectionVarCommand extends BaseCommand {
    /**
     * @param {string} collectionVariableName - Variable name of the TextItemCollection
     */
    constructor(collectionVariableName) {
        super();
        this.collectionVariableName = collectionVariableName;
        this.collection = null;
        this.mathComponent = null;
        this.items = [];
    }

    async doInit() {
        // Get the TextItemCollection from shapeRegistry (stored by SubOnlyCommand/SubWithoutCommand)
        this.collection = this.commandContext.shapeRegistry[this.collectionVariableName];
        if (!this.collection) {
            console.warn(`WriteCollectionVarCommand: "${this.collectionVariableName}" not found in registry`);
            return;
        }

        this.mathComponent = this.collection.getMathComponent();
        this.items = this.collection.getAll();
        this.commandResult = this.collection;
    }

    async playSingle() {
        if (!this.mathComponent || this.items.length === 0) return;

        // Animate each item sequentially
        for (const item of this.items) {
            const effect = new RewriteOnlyEffect(
                this.mathComponent,
                [item.selectionUnit]
            );
            await effect.play();
        }
    }

    doDirectPlay() {
        if (!this.mathComponent) return;

        // Enable all items instantly
        for (const item of this.items) {
            const effect = new RewriteOnlyEffect(
                this.mathComponent,
                [item.selectionUnit]
            );
            effect.toEndState();
        }
    }

    getLabelPosition() {
        if (this.items.length > 0) {
            const bounds = this.items[0].getBounds();
            if (bounds) {
                return { x: bounds.minX, y: bounds.minY };
            }
        }
        return { x: 0, y: 0 };
    }

    clear() {
        this.collection = null;
        this.mathComponent = null;
        this.items = [];
        this.commandResult = null;
        this.isInitialized = false;
    }
}
