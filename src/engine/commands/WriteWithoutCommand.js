/**
 * WriteWithoutCommand - Writes math text excluding bbox-marked parts
 *
 * Uses wrapWithBBox() to mark exclusions, then writeWithoutBBox() to animate
 * only the non-excluded content.
 *
 * Lifecycle:
 *   doInit():
 *     - Creates MathTextComponent with bbox markers (hidden, strokes disabled)
 *     - Calls hide() + disableStroke() to ensure hidden state
 *
 *   playSingle() (animated):
 *     - Effect.show() → showContainer() - container visible, strokes hidden
 *     - Effect.doPlay() → writeWithoutSelectionAnimate() - pen traces non-excluded parts
 *
 *   doDirectPlay() (instant):
 *     - show() - container visible
 *     - toEndState() - enables non-excluded strokes only
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { PatternSelector } from '../../mathtext/utils/pattern-selector.js';
import { WriteWithoutEffect } from '../../mathtext/effects/write-without-effect.js';
import { TextItem } from '../../mathtext/models/text-item.js';
import { TextItemCollection } from '../../mathtext/models/text-item-collection.js';

export class WriteWithoutCommand extends BaseCommand {
    /**
     * Create a writewithout command
     * @param {string} mode - 'existing' or 'create'
     * @param {Object} options - Mode-specific options
     *   For 'existing': { targetVariableName, excludePatterns }
     *   For 'create': { row, col, latexString, excludePatterns, expression }
     * @param {Object} styleOptions - Style options {fontSize, color}
     */
    constructor(mode, options = {}, styleOptions = {}) {
        super();
        this.mode = mode;
        this.options = options;
        this.styleOptions = styleOptions;
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
                console.warn(`WriteWithoutCommand: "${this.options.targetVariableName}" not found in registry`);
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
                {
                    fontSize: this.styleOptions.fontSize,
                    stroke: this.color,
                    fill: this.color
                }
            );

            if (this.options.expression) {
                this.options.expression.setMathTextComponent(this.mathComponent);
            }
        }

        this.selectionUnits = PatternSelector.getSelectionUnits(
            this.mathComponent,
            this.options.excludePatterns
        );

        this.mathComponent.hide();
        this.mathComponent.disableStroke();

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

    /**
     * Play the write animation (excluding specified parts)
     */
    async playSingle() {
        if (!this.mathComponent || !this.selectionUnits?.length) return;

        // Disable excluded strokes
        const excludedNodes = this.mathComponent.includeTweenNodes(this.selectionUnits);
        excludedNodes.forEach(node => node.disableStroke());

        const effect = new WriteWithoutEffect(this.mathComponent, this.selectionUnits);
        return effect.play();
    }

    /**
     * Instant render without animation
     */
    doDirectPlay() {
        if (!this.mathComponent || !this.selectionUnits?.length) return;
        this.mathComponent.show();

        const effect = new WriteWithoutEffect(this.mathComponent, this.selectionUnits);
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
