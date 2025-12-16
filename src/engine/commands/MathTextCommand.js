/**
 * MathTextCommand - Command for creating a MathTextComponent at logical coordinates
 *
 * Creates a MathTextComponent directly using coordinateMapper to convert
 * logical (row, col) to pixel coordinates. Shows instantly on init (like g2d).
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';

export class MathTextCommand extends BaseCommand {
    /**
     * Create a math text command
     * @param {number} row - Row position (logical coordinate)
     * @param {number} col - Column position (logical coordinate)
     * @param {string} latexString - LaTeX string to render
     * @param {Object} expression - Reference to MathTextExpression for storing component
     */
    constructor(row, col, latexString, expression = null) {
        super();
        this.row = row;
        this.col = col;
        this.latexString = latexString;
        this.expression = expression;
    }

    /**
     * Create MathTextComponent at logical position - shows instantly
     * @returns {Promise}
     */
    async doInit() {
        // Access coordinateMapper and canvasSection from diagram2d (like graphContainer does)
        const coordinateMapper = this.diagram2d.coordinateMapper;
        const canvasSection = this.diagram2d.canvasSection;

        // Create MathTextComponent - it does its own toPixel() conversion internally
        const mathComponent = new MathTextComponent(
            this.latexString,
            this.row,  // logical row
            this.col,  // logical col
            coordinateMapper,
            canvasSection,
            { fontSize: 22, stroke: '#000000', fill: '#000000' }
        );

        // Show instantly (MathTextComponent starts hidden by default)
        mathComponent.show();
        mathComponent.enableStroke();

        this.commandResult = mathComponent;

        // Store reference in expression for variable access
        if (this.expression) {
            this.expression.setMathTextComponent(mathComponent);
        }
    }

    // playSingle() uses base class default (no-op)
    // MathTextComponent is already visible from doInit, like g2d

    /**
     * Override to prevent base class from calling renderEndState()
     * Already visible from doInit
     */
    doDirectPlay() {
        // No-op - already visible
    }

    /**
     * Get label position (for compatibility)
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return { x: this.col, y: this.row };
    }

    /**
     * Clear the math text component
     * Override base to remove DOM element
     */
    clear() {
        if (this.commandResult && this.commandResult.containerDOM) {
            const containerDOM = this.commandResult.containerDOM;
            if (containerDOM.parentNode) {
                containerDOM.parentNode.removeChild(containerDOM);
            }
            this.commandResult = null;
        }
        this.isInitialized = false;
    }
}
