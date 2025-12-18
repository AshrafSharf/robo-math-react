import { BaseCommand } from './BaseCommand.js';
import { RewriteOnlyEffect } from '../../mathtext/effects/rewrite-only-effect.js';
import { PatternSelector } from '../../mathtext/utils/pattern-selector.js';
import { TextItem } from '../../mathtext/models/text-item.js';
import { TextItemCollection } from '../../mathtext/models/text-item-collection.js';
import { SelectionUnit } from '../../mathtext/models/selection-unit.js';

/**
 * RewriteOnlyCommand - Animates ONLY the pattern-matched parts on an existing MathTextComponent.
 * Returns TextItemCollection of excluded (non-written) parts.
 *
 * Usage:
 *   M = mathtext(5, 2, "\tan(\theta) = ...")
 *   excluded = writeonly(M, "\theta")  // Returns collection of non-theta parts
 */
export class RewriteOnlyCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.mathComponent = null;
        this.selectionUnits = null;
    }

    async doInit() {
        this.mathComponent = this.commandContext.shapeRegistry[this.options.targetVariableName];
        if (!this.mathComponent) {
            console.warn(`RewriteOnlyCommand: "${this.options.targetVariableName}" not found in registry`);
            return;
        }

        this.selectionUnits = PatternSelector.getSelectionUnits(
            this.mathComponent,
            this.options.includePatterns
        );

        // Return TextItemCollection of EXCLUDED items (what we didn't write)
        this.commandResult = this._createExcludedCollection();
    }

    /**
     * Create TextItemCollection from excluded (non-selected) nodes
     * @returns {TextItemCollection}
     */
    _createExcludedCollection() {
        const excludedNodes = this.mathComponent.excludeTweenNodes(this.selectionUnits);

        const excludedUnit = new SelectionUnit();
        excludedNodes.forEach(node => {
            if (node.fragmentId) {
                excludedUnit.addFragment(node.fragmentId);
            }
        });

        const collection = new TextItemCollection();
        if (excludedUnit.hasFragment()) {
            const textItem = new TextItem(this.mathComponent, excludedUnit, null);
            collection.add(textItem);
        }

        return collection;
    }

    async doPlay() {
        if (!this.mathComponent || !this.selectionUnits) return;

        // Disable non-selected strokes so they stay hidden
        const nonSelectedNodes = this.mathComponent.excludeTweenNodes(this.selectionUnits);
        nonSelectedNodes.forEach(node => node.disableStroke());

        return this.playSingle();
    }

    async playSingle() {
        if (!this.mathComponent || !this.selectionUnits) return;

        const effect = new RewriteOnlyEffect(this.mathComponent, this.selectionUnits);
        return effect.play();
    }

    doDirectPlay() {
        if (this.mathComponent && this.selectionUnits) {
            const effect = new RewriteOnlyEffect(this.mathComponent, this.selectionUnits);
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
