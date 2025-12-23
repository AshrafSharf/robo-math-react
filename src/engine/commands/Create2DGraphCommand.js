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
     * @param {Object} options - Additional options including scale settings
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
        this.showGridLines = options.showGridLines !== false;

        // Scale type options
        this.xScaleType = options.xScaleType || 'linear';
        this.yScaleType = options.yScaleType || 'linear';
        this.xDivisions = options.xDivisions || 10;
        this.yDivisions = options.yDivisions || 10;
        this.xLogBase = options.xLogBase || '10';
        this.yLogBase = options.yLogBase || '10';
        this.xPiMultiplier = options.xPiMultiplier || 'pi';
        this.yPiMultiplier = options.yPiMultiplier || 'pi';

        // Legacy options (for backward compatibility)
        this.tickSize = options.tickSize || null;
        this.usePiLabels = options.usePiLabels || false;
        this.xPiScale = options.xPiScale || null;
        this.yPiScale = options.yPiScale || null;

        this.expression = expression;  // Reference to Graph2DExpression
    }

    /**
     * Create graph container via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Build options object with all grid settings
        const graphOptions = {
            xRange: this.xRange,
            yRange: this.yRange,
            showGrid: this.showGrid,
            showGridLines: this.showGridLines,
            // Scale type options
            xScaleType: this.xScaleType,
            yScaleType: this.yScaleType,
            xDivisions: this.xDivisions,
            yDivisions: this.yDivisions,
            xLogBase: this.xLogBase,
            yLogBase: this.yLogBase,
            xPiMultiplier: this.xPiMultiplier,
            yPiMultiplier: this.yPiMultiplier
        };

        // Add legacy grid settings if specified (backward compatibility)
        if (this.tickSize !== null) {
            graphOptions.tickSize = this.tickSize;
        }
        if (this.usePiLabels) {
            graphOptions.usePiLabels = this.usePiLabels;
        }
        if (this.xPiScale !== null) {
            graphOptions.xPiScale = this.xPiScale;
        }
        if (this.yPiScale !== null) {
            graphOptions.yPiScale = this.yPiScale;
        }

        // Create graph container using bounds-based API
        const grapher = this.diagram2d.graphContainer(this.row1, this.col1, this.row2, this.col2, graphOptions);

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
