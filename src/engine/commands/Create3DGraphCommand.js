/**
 * Create3DGraphCommand - Command for creating a 3D graph container
 *
 * Creates a 3D graph container via Grapher3DFactory
 */
import { BaseCommand } from './BaseCommand.js';
import { Grapher3DFactory } from '../../3d/grapher_3d_factory.js';

export class Create3DGraphCommand extends BaseCommand {
    /**
     * Create a 3D graph command using logical coordinate bounds
     * @param {number} row1 - Start row (top)
     * @param {number} col1 - Start column (left)
     * @param {number} row2 - End row (bottom)
     * @param {number} col2 - End column (right)
     * @param {Object} options - Additional options {xRange, yRange, zRange, showGrid, coordinateSystem}
     * @param {Object} expression - Reference to Graph3DExpression for storing grapher
     */
    constructor(row1, col1, row2, col2, options = {}, expression = null) {
        super();
        this.row1 = row1;
        this.col1 = col1;
        this.row2 = row2;
        this.col2 = col2;
        this.xRange = options.xRange || [-10, 10];
        this.yRange = options.yRange || [-10, 10];
        this.zRange = options.zRange || [-10, 10];
        this.showGrid = options.showGrid !== false;
        this.coordinateSystem = options.coordinateSystem || 'lhs';
        this.expression = expression;  // Reference to Graph3DExpression
    }

    /**
     * Create 3D graph container via Grapher3DFactory
     * @returns {Promise}
     */
    async doInit() {
        // Create 3D graph container using factory
        const grapher = Grapher3DFactory.create(
            this.commandContext.layoutMapper,
            this.commandContext.canvasSection,
            this.row1, this.col1, this.row2, this.col2,
            {
                xRange: this.xRange,
                yRange: this.yRange,
                zRange: this.zRange,
                showGrid: this.showGrid,
                coordinateSystem: this.coordinateSystem
            }
        );

        // Set pen reference on grapher
        if (this.commandContext.pen) {
            grapher.setPen(this.commandContext.pen);
        }

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
     * @returns {Grapher3D}
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
            // Get outer container (from factory) before destroy nulls it
            const outerContainer = this.commandResult.containerElement;
            this.commandResult.destroy();
            // Remove outer container from canvasSection
            if (outerContainer && outerContainer.parentNode) {
                outerContainer.parentNode.removeChild(outerContainer);
            }
            this.commandResult = null;
        }
        this.isInitialized = false;
    }
}
