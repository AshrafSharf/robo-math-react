/**
 * WriteWithoutCommand - Writes math text excluding bbox-marked parts
 *
 * Uses wrapWithBBox() to mark exclusions, then writeWithoutBBox() to animate
 * only the non-excluded content.
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { wrapWithBBox } from '../../mathtext/utils/bbox-latex-wrapper.js';

export class WriteWithoutCommand extends BaseCommand {
    /**
     * Create a writewithout command
     * @param {string} mode - 'existing' or 'create'
     * @param {Object} options - Mode-specific options
     *   For 'existing': { targetVariableName, excludePattern }
     *   For 'create': { row, col, latexString, excludePattern, expression }
     */
    constructor(mode, options = {}) {
        super();
        this.mode = mode;
        this.options = options;
        this.mathComponent = null;
    }

    /**
     * Initialize the command - wrap exclusions with bbox and prepare for animation
     */
    async doInit() {
        if (this.mode === 'existing') {
            // Look up existing MathTextComponent from shapeRegistry
            this.mathComponent = this.commandContext.shapeRegistry[this.options.targetVariableName];
            if (!this.mathComponent) {
                console.warn(`WriteWithoutCommand: "${this.options.targetVariableName}" not found in registry`);
                return;
            }
            // For existing components, we assume they already have bbox markers
            // or we work with them as-is
        } else {
            // Create new MathTextComponent with bbox-wrapped exclusions
            const wrappedLatex = wrapWithBBox(this.options.latexString, this.options.excludePattern);

            const coordinateMapper = this.diagram2d.coordinateMapper;
            const canvasSection = this.diagram2d.canvasSection;

            this.mathComponent = new MathTextComponent(
                wrappedLatex,
                this.options.row,
                this.options.col,
                coordinateMapper,
                canvasSection,
                { fontSize: 22, stroke: '#000000', fill: '#000000' }
            );

            // Store reference in expression for variable assignment
            if (this.options.expression) {
                this.options.expression.setMathTextComponent(this.mathComponent);
            }
        }

        // Prepare component for animation - hide and disable strokes
        this.mathComponent.hide();
        this.mathComponent.disableStroke();

        this.commandResult = this.mathComponent;
    }

    /**
     * Play the write animation (excluding bbox-marked parts)
     */
    async playSingle() {
        if (!this.mathComponent) return;
        const effect = this.mathComponent.writeWithoutBBox();
        return effect.play();
    }

    /**
     * Instant render without animation
     */
    doDirectPlay() {
        if (this.mathComponent) {
            this.mathComponent.show();
            // Show only non-bbox content (end state of the effect)
            const effect = this.mathComponent.writeWithoutBBox();
            effect.toEndState();
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
