/**
 * Create2DGraphCommand - Command for creating a 2D graph container
 *
 * Creates a graph container via diagram.graphContainer()
 */
import { BaseCommand } from './BaseCommand.js';

export class Create2DGraphCommand extends BaseCommand {
    /**
     * Create a 2D graph command
     * @param {number} row - Logical row coordinate
     * @param {number} col - Logical column coordinate
     * @param {number} width - Graph width in pixels
     * @param {number} height - Graph height in pixels
     * @param {Object} options - Additional options {xRange, yRange, showGrid}
     * @param {Object} expression - Reference to Graph2DExpression for storing grapher
     */
    constructor(row, col, width, height, options = {}, expression = null) {
        super();
        this.row = row;
        this.col = col;
        this.width = width;
        this.height = height;
        this.xRange = options.xRange || [-10, 10];
        this.yRange = options.yRange || [-10, 10];
        this.showGrid = options.showGrid !== false;
        this.expression = expression;  // Reference to Graph2DExpression
    }

    /**
     * Create graph container via diagram
     */
    doInit() {
        const { diagram } = this.commandContext;

        // Create graph container
        const grapher = diagram.graphContainer(this.col, this.row, {
            width: this.width,
            height: this.height,
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
