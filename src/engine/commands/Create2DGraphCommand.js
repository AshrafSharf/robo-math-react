/**
 * Create2DGraphCommand - Command for creating a 2D graph container
 *
 * Creates a graph container via diagram.graphContainer()
 */
import { BaseCommand } from './BaseCommand.js';

export class Create2DGraphCommand extends BaseCommand {
    /**
     * Create a 2D graph command using logical coordinate bounds
     * @param {number} row1 - Start row (top)
     * @param {number} col1 - Start column (left)
     * @param {number} row2 - End row (bottom)
     * @param {number} col2 - End column (right)
     * @param {Object} options - Additional options {xRange, yRange, showGrid}
     * @param {Object} expression - Reference to Graph2DExpression for storing grapher
     */
    constructor(row1, col1, row2, col2, options = {}, expression = null) {
        super();
        this.row1 = row1;
        this.col1 = col1;
        this.row2 = row2;
        this.col2 = col2;
        this.xRange = options.xRange || [-10, 10];
        this.yRange = options.yRange || [-10, 10];
        this.showGrid = options.showGrid !== false;
        this.expression = expression;  // Reference to Graph2DExpression
    }

    /**
     * Create graph container via diagram
     * @returns {Promise}
     */
    async doInit() {
        const { diagram } = this.commandContext;

        // Create graph container using bounds-based API
        const grapher = diagram.graphContainer(this.row1, this.col1, this.row2, this.col2, {
            xRange: this.xRange,
            yRange: this.yRange,
            showGrid: this.showGrid
        });

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
