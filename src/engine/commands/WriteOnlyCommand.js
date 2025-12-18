/**
 * WriteOnlyCommand - Writes ONLY bbox-marked parts of math text
 *
 * Uses wrapWithBBox() to mark inclusions, then writeOnlyBBox() to animate
 * only the included content (rest is hidden).
 *
 * Lifecycle:
 *   doInit():
 *     - Creates MathTextComponent with bbox markers (hidden, strokes disabled)
 *     - Calls hide() + disableStroke() to ensure hidden state
 *
 *   playSingle() (animated):
 *     - Effect.show() → showContainer() - container visible, strokes hidden
 *     - Effect.doPlay() → writeSelectionOnlyAnimate() - pen traces selected parts
 *
 *   doDirectPlay() (instant):
 *     - show() - container visible
 *     - toEndState() - enables selected strokes only
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { PatternSelector } from '../../mathtext/utils/pattern-selector.js';
import { WriteOnlyEffect } from '../../mathtext/effects/write-only-effect.js';
import { TextItem } from '../../mathtext/models/text-item.js';
import { TextItemCollection } from '../../mathtext/models/text-item-collection.js';
import { SelectionUnit } from '../../mathtext/models/selection-unit.js';

export class WriteOnlyCommand extends BaseCommand {
    /**
     * Create a writeonly command
     * @param {string} mode - 'existing' or 'create'
     * @param {Object} options - Mode-specific options
     *   For 'existing': { targetVariableName, includePatterns }
     *   For 'create': { row, col, latexString, includePatterns, expression }
     */
    constructor(mode, options = {}) {
        super();
        this.mode = mode;
        this.options = options;
        this.mathComponent = null;
        this.selectionUnits = null;
    }

    /**
     * Initialize the command
     */
    async doInit() {
        if (this.mode === 'existing') {
            this.mathComponent = this.commandContext.shapeRegistry[this.options.targetVariableName];
            if (!this.mathComponent) {
                console.warn(`WriteOnlyCommand: "${this.options.targetVariableName}" not found in registry`);
                return;
            }
        } else {
            const coordinateMapper = this.diagram2d.coordinateMapper;
            const canvasSection = this.diagram2d.canvasSection;

            this.mathComponent = new MathTextComponent(
                this.options.latexString,
                this.options.row,
                this.options.col,
                coordinateMapper,
                canvasSection,
                { fontSize: 22, stroke: '#000000', fill: '#000000' }
            );

            if (this.options.expression) {
                this.options.expression.setMathTextComponent(this.mathComponent);
            }
        }

        this.selectionUnits = PatternSelector.getSelectionUnits(
            this.mathComponent,
            this.options.includePatterns
        );

        this.mathComponent.hide();
        this.mathComponent.disableStroke();

        // Return TextItemCollection of EXCLUDED items (what we didn't write)
        this.commandResult = this._createExcludedCollection();
    }

    /**
     * Create TextItemCollection from excluded (non-selected) nodes
     * @returns {TextItemCollection}
     */
    _createExcludedCollection() {
        const excludedNodes = this.mathComponent.excludeTweenNodes(this.selectionUnits);

        // Create a SelectionUnit from excluded nodes
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

    /**
     * Play the write animation
     */
    async playSingle() {
        if (!this.mathComponent || !this.selectionUnits?.length) return;

        const nonSelectedNodes = this.mathComponent.excludeTweenNodes(this.selectionUnits);
        nonSelectedNodes.forEach(node => node.disableStroke());

        const effect = new WriteOnlyEffect(this.mathComponent, this.selectionUnits);
        return effect.play();
    }

    /**
     * Instant render without animation
     */
    doDirectPlay() {
        if (!this.mathComponent || !this.selectionUnits?.length) return;
        this.mathComponent.show();

        const effect = new WriteOnlyEffect(this.mathComponent, this.selectionUnits);
        effect.toEndState();
    }

    /**
     * Get label position for compatibility
     */
    getLabelPosition() {
        if (this.mode === 'create') {
            return { x: this.options.col, y: this.options.row };
        }
        return { x: 0, y: 0 };
    }

    /**
     * Clear the math text component (only for 'create' mode)
     */
    clear() {
        if (this.mode === 'create' && this.mathComponent && this.mathComponent.containerDOM) {
            const containerDOM = this.mathComponent.containerDOM;
            if (containerDOM.parentNode) {
                containerDOM.parentNode.removeChild(containerDOM);
            }
        }
        this.mathComponent = null;
        this.selectionUnits = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
