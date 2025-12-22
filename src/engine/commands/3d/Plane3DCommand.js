/**
 * Plane3DCommand - Command for rendering a 3D plane with sweep animation
 */
import { Base3DCommand } from './Base3DCommand.js';
import { animatePlaneParametricSweep } from '../../../3d/lhs/animator/lhs_plane_animator.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class Plane3DCommand extends Base3DCommand {
    /**
     * Create a plane3d command
     * @param {Object} graphExpression - The graph expression
     * @param {Object} shapeData - { center: {x,y,z}, normal: {x,y,z} }
     * @param {Object} options - { styleOptions: { color, opacity, size, sweepDirection } }
     */
    constructor(graphExpression, shapeData, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.shapeData = shapeData;
        this.styleOptions = options.styleOptions || {};
        this.sweepDirection = this.styleOptions.sweepDirection || 'r';
    }

    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('plane3d'));
            err.expressionId = this.expressionId;
            throw err;
        }

        if (typeof this.graphExpression.getGrapher !== 'function') {
            const varName = this.graphExpression.variableName || 'first argument';
            const err = new Error(common_error_messages.INVALID_GRAPH_TYPE(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        this.graphContainer = this.graphExpression.getGrapher();
        if (!this.graphContainer) {
            const varName = this.graphExpression.variableName || 'graph';
            const err = new Error(common_error_messages.GRAPH_NOT_INITIALIZED(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        // Create plane using diagram3d
        this.commandResult = this.graphContainer.diagram3d.planeByPointAndNormal(
            this.shapeData.center,
            this.shapeData.normal,
            '',
            this.styleOptions.color,
            {
                size: this.styleOptions.size || 12,
                opacity: this.styleOptions.opacity || 0.5
            }
        );
    }

    /**
     * Replay animation on existing shape using sweep effect
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.commandResult) return;

        // Map short flags to full names for the animator
        const sweepMap = { 'h': 'horizontal', 'v': 'vertical', 'd': 'diagonal', 'r': 'radial' };
        const sweepDir = sweepMap[this.sweepDirection] || 'radial';

        return new Promise((resolve) => {
            animatePlaneParametricSweep(this.commandResult, {
                duration: 2,
                sweepDirection: sweepDir,
                onComplete: () => resolve()
            });
        });
    }
}
