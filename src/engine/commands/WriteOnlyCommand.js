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
import { wrapWithBBox } from '../../mathtext/utils/bbox-latex-wrapper.js';

export class WriteOnlyCommand extends BaseCommand {
    /**
     * Create a writeonly command
     * @param {string} mode - 'existing' or 'create'
     * @param {Object} options - Mode-specific options
     *   For 'existing': { targetVariableName, includePattern }
     *   For 'create': { row, col, latexString, includePattern, expression }
     */
    constructor(mode, options = {}) {
        super();
        this.mode = mode;
        this.options = options;
        this.mathComponent = null;
    }

    /**
     * Initialize the command - wrap inclusions with bbox and prepare for animation
     */
    async doInit() {
        if (this.mode === 'existing') {
            // Look up existing MathTextComponent from shapeRegistry
            this.mathComponent = this.commandContext.shapeRegistry[this.options.targetVariableName];
            if (!this.mathComponent) {
                console.warn(`WriteOnlyCommand: "${this.options.targetVariableName}" not found in registry`);
                return;
            }
            // For existing components, we assume they already have bbox markers
            // or we work with them as-is
        } else {
            // Create new MathTextComponent with bbox-wrapped inclusions
            const wrappedLatex = wrapWithBBox(this.options.latexString, this.options.includePattern);

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
     * Play the write animation (only bbox-marked parts)
     */
    async playSingle() {
        if (!this.mathComponent) return;
        const effect = this.mathComponent.writeOnlyBBox();
        return effect.play();
    }

    /**
     * Instant render without animation
     */
    doDirectPlay() {
        if (this.mathComponent) {
            this.mathComponent.show();
            // Show only bbox content (end state of the effect)
            const effect = this.mathComponent.writeOnlyBBox();
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
