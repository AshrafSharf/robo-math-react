/**
 * CreatePolar2DGraphCommand - Command for creating a polar coordinate graph container
 *
 * Creates a polar graph container with concentric circles and radial lines
 */
import { BaseCommand } from './BaseCommand.js';

export class CreatePolar2DGraphCommand extends BaseCommand {
    /**
     * Create a polar 2D graph command using logical coordinate bounds
     * @param {number} row1 - Start row (top)
     * @param {number} col1 - Start column (left)
     * @param {number} row2 - End row (bottom)
     * @param {number} col2 - End column (right)
     * @param {Object} options - Additional options including polar grid settings
     * @param {Object} expression - Reference to Polar2DExpression for storing grapher
     */
    constructor(row1, col1, row2, col2, options = {}, expression = null) {
        super();
        this.row1 = row1;
        this.col1 = col1;
        this.row2 = row2;
        this.col2 = col2;

        // Polar grid options
        this.rMax = options.rMax || 10;
        this.showGrid = options.showGrid !== false;
        this.radialLines = options.radialLines || 12;
        this.concentricCircles = options.concentricCircles || 5;
        this.angleLabels = options.angleLabels !== false;

        this.expression = expression;  // Reference to Polar2DExpression
    }

    /**
     * Create polar graph container via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Build options object with all polar grid settings
        const graphOptions = {
            rMax: this.rMax,
            showGrid: this.showGrid,
            radialLines: this.radialLines,
            concentricCircles: this.concentricCircles,
            angleLabels: this.angleLabels
        };

        // Create polar graph container using bounds-based API
        const grapher = this.diagram2d.polarGraphContainer(
            this.row1, this.col1, this.row2, this.col2, graphOptions
        );

        // Store reference in expression for variable access
        if (this.expression) {
            this.expression.setGrapher(grapher);
        }

        // Store as command result
        this.commandResult = grapher;
    }

    /**
     * No animation - graph already created in doInit()
     */
    doPlay() {
        // No animation needed
    }

    /**
     * Graph already visible from doInit()
     */
    doDirectPlay() {
        // Nothing extra needed
    }

    /**
     * Get the created grapher instance
     * @returns {Grapher}
     */
    getGrapher() {
        return this.commandResult;
    }

    /**
     * Clear the graph container
     * Override base to also remove DOM container
     */
    clear() {
        if (this.commandResult) {
            const containerDOM = this.commandResult.containerDOM;
            this.commandResult.destroy();
            if (containerDOM && containerDOM.parentNode) {
                containerDOM.parentNode.removeChild(containerDOM);
            }
            this.commandResult = null;
        }
        this.isInitialized = false;
    }
}
