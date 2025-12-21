/**
 * WriteTextItemVarCommand - Animates a single TextItem (looked up by variable name)
 *
 * Used when write() is called with a variable containing a TextItem.
 * The textItem is looked up from the expression context during doInit.
 */
import { BaseCommand } from './BaseCommand.js';
import { RewriteOnlyEffect } from '../../mathtext/effects/rewrite-only-effect.js';

export class WriteTextItemVarCommand extends BaseCommand {
    /**
     * @param {string} textItemVariableName - Variable name of the TextItem (from item)
     */
    constructor(textItemVariableName) {
        super();
        this.textItemVariableName = textItemVariableName;
        this.textItem = null;
        this.mathComponent = null;
    }

    async doInit() {
        // Get the TextItem from shapeRegistry (stored by ItemCommand)
        this.textItem = this.commandContext.shapeRegistry[this.textItemVariableName];
        if (!this.textItem) {
            console.warn(`WriteTextItemVarCommand: "${this.textItemVariableName}" not found in registry`);
            return;
        }

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
