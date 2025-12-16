/**
 * WriteCommand - Animates math text with pen-tracing write effect
 *
 * Supports two modes:
 * - 'existing': Animate an existing MathTextComponent from shapeRegistry
 * - 'create': Create a new MathTextComponent and animate it
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
     */
    constructor(mode, options = {}) {
        super();
        this.mode = mode;
        this.options = options;
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

            this.mathComponent = new MathTextComponent(
                this.options.latexString,
                this.options.row,
                this.options.col,
                coordinateMapper,
                canvasSection,
                { fontSize: 22, stroke: '#000000', fill: '#000000' }
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
