import { BaseCommand } from './BaseCommand.js';
import { RewriteWithoutEffect } from '../../mathtext/effects/rewrite-without-effect.js';
import { PatternSelector } from '../../mathtext/utils/pattern-selector.js';
import { TextItem } from '../../mathtext/models/text-item.js';
import { TextItemCollection } from '../../mathtext/models/text-item-collection.js';

/**
 * RewriteWithoutCommand - Animates everything EXCEPT the pattern-matched parts
 * on an existing MathTextComponent. Returns TextItemCollection of excluded parts.
 *
 * Usage:
 *   M = mathtext(5, 2, "\tan(\theta) = ...")
 *   thetas = writewithout(M, "\theta")  // Returns collection of theta parts
 */
export class RewriteWithoutCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.mathComponent = null;
        this.selectionUnits = null;
    }

    async doInit() {
        this.mathComponent = this.commandContext.shapeRegistry[this.options.targetVariableName];
        if (!this.mathComponent) {
            console.warn(`RewriteWithoutCommand: "${this.options.targetVariableName}" not found in registry`);
            return;
        }

        this.selectionUnits = PatternSelector.getSelectionUnits(
            this.mathComponent,
            this.options.excludePatterns
        );

        // Return TextItemCollection of EXCLUDED items (the matched patterns we didn't write)
        this.commandResult = this._createExcludedCollection();
    }

    /**
     * Create TextItemCollection from excluded (matched pattern) nodes
     * @returns {TextItemCollection}
     */
    _createExcludedCollection() {
        const collection = new TextItemCollection();

        // Each selection unit becomes a TextItem
        this.selectionUnits.forEach(unit => {
            const textItem = new TextItem(this.mathComponent, unit, null);
            collection.add(textItem);
        });

        return collection;
    }

    async doPlay() {
        if (!this.mathComponent || !this.selectionUnits) return;

        // Disable excluded strokes so they stay hidden
        const excludedNodes = this.mathComponent.includeTweenNodes(this.selectionUnits);
        excludedNodes.forEach(node => node.disableStroke());

        return this.playSingle();
    }

    async playSingle() {
        if (!this.mathComponent || !this.selectionUnits) return;

        const effect = new RewriteWithoutEffect(this.mathComponent, this.selectionUnits);
        return effect.play();
    }

    doDirectPlay() {
        if (this.mathComponent && this.selectionUnits) {
            const effect = new RewriteWithoutEffect(this.mathComponent, this.selectionUnits);
            effect.toEndState();
        }
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }

    clear() {
        this.mathComponent = null;
        this.selectionUnits = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
