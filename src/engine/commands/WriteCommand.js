/**
 * WriteCommand - Writes math text with pen animation
 *
 * Supports two modes:
 * - 'existing': Animate an existing MathTextComponent from shapeRegistry
 * - 'create': Create a new MathTextComponent and animate it
 *
 * Lifecycle:
 *   doInit():
 *     - Creates MathTextComponent (hidden, strokes disabled)
 *     - Component stays hidden until play
 *
 *   playSingle() (animated):
 *     - Effect.show() → showContainer() - container visible, strokes hidden
 *     - Effect.doPlay() → writeAnimate() - pen traces and reveals strokes
 *
 *   doDirectPlay() (instant):
 *     - show() - container AND strokes visible immediately
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';

export class WriteCommand extends BaseCommand {
    /**
     * Create a write command
     * @param {string} mode - 'existing' or 'create'
     * @param {Object} options - Mode-specific options
     *   For 'existing': { targetVariableName }
     *   For 'create': { row, col, latexString, expression }
     * @param {Object} styleOptions - Style options {fontSize, color}
     */
    constructor(mode, options = {}, styleOptions = {}) {
        super();
        this.mode = mode;
        this.options = options;
        this.styleOptions = styleOptions;
        this.mathComponent = null;
    }

    /**
     * Initialize the command - either look up existing or create new MathTextComponent
     */
    async doInit() {
        if (this.mode === 'existing') {
            // Look up MathTextComponent from shapeRegistry
            const shape = this.commandContext.shapeRegistry[this.options.targetVariableName];
            if (!shape) {
                console.warn(`WriteCommand: Shape "${this.options.targetVariableName}" not found in registry`);
                return;
            }
            this.mathComponent = shape;
            // Prepare for animation - hide and disable strokes
            this.mathComponent.hide();
            this.mathComponent.disableStroke();
        } else {
            // Create new MathTextComponent
            const coordinateMapper = this.diagram2d.coordinateMapper;
            const canvasSection = this.diagram2d.canvasSection;

            // Use color from styleOptions if provided, otherwise fall back to BaseCommand default
            const effectiveColor = this.styleOptions.color || this.color;

            this.mathComponent = new MathTextComponent(
                this.options.latexString,
                this.options.row,
                this.options.col,
                coordinateMapper,
                canvasSection,
                {
                    fontSize: this.styleOptions.fontSize ?? 22,
                    stroke: effectiveColor,
                    fill: effectiveColor
                }
            );

            // Start hidden with strokes disabled for animation
            this.mathComponent.hide();
            this.mathComponent.disableStroke();

            // Store reference in expression for variable assignment
            if (this.options.expression) {
                this.options.expression.setMathTextComponent(this.mathComponent);
            }
        }

        this.commandResult = this.mathComponent;
    }

    /**
     * Play the write animation
     */
    async playSingle() {
        if (!this.mathComponent) return;

        const effect = new WriteEffect(this.mathComponent);
        return effect.play();
    }

    /**
     * Instant render without animation
     */
    doDirectPlay() {
        if (this.mathComponent) {
            this.mathComponent.show();
            this.mathComponent.enableStroke();
        }
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
        // Only remove DOM for components we created
        if (this.mode === 'create' && this.mathComponent && this.mathComponent.containerDOM) {
            const containerDOM = this.mathComponent.containerDOM;
            if (containerDOM.parentNode) {
                containerDOM.parentNode.removeChild(containerDOM);
            }
        }
        this.mathComponent = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
