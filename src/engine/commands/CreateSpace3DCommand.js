/**
 * CreateSpace3DCommand - Command for creating a pure Three.js 3D space container
 *
 * Creates a Space3D container via Space3DFactory
 */
import { BaseCommand } from './BaseCommand.js';
import { Space3DFactory } from '../../3d/space3d_factory.js';

export class CreateSpace3DCommand extends BaseCommand {
    /**
     * Create a Space3D command using logical coordinate bounds
     * @param {number} row1 - Start row (top)
     * @param {number} col1 - Start column (left)
     * @param {number} row2 - End row (bottom)
     * @param {number} col2 - End column (right)
     * @param {Object} expression - Reference to Space3DExpression for storing space3d
     */
    constructor(row1, col1, row2, col2, expression = null) {
        super();
        this.row1 = row1;
        this.col1 = col1;
        this.row2 = row2;
        this.col2 = col2;
        this.expression = expression;
    }

    /**
     * Create Space3D container via factory
     * @returns {Promise}
     */
    async doInit() {
        // Create Space3D container using factory
        const space3d = Space3DFactory.create(
            this.commandContext.layoutMapper,
            this.commandContext.canvasSection,
            this.row1, this.col1, this.row2, this.col2
        );

        // Store reference in expression for variable access
        if (this.expression) {
            this.expression.setSpace3D(space3d);
        }

        // Store as command result
        this.commandResult = space3d;
    }

    /**
     * No animation - space already created in doInit()
     */
    doPlay() {
        // No animation needed
    }

    /**
     * Space already visible from doInit()
     */
    doDirectPlay() {
        // Nothing extra needed
    }

    /**
     * Get the created Space3D instance
     * @returns {Space3D}
     */
    getSpace3D() {
        return this.commandResult;
    }

    /**
     * Clear the space container
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
