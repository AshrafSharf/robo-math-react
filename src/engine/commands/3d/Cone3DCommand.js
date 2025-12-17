/**
 * Cone3DCommand - Command for rendering a 3D cone
 */
import { Base3DCommand } from './Base3DCommand.js';
import { Math3DShapeEffect } from '../../../effects/shape-effects/math-3d-shape-effect.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class Cone3DCommand extends Base3DCommand {
    /**
     * Create a cone3d command
     * @param {Object} graphExpression - The graph expression
     * @param {Object} shapeData - { apex: {x,y,z}, baseCenter: {x,y,z}, radius: number }
     * @param {Object} options - { styleOptions: { color, opacity, ... } }
     */
    constructor(graphExpression, shapeData, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.shapeData = shapeData;
        this.styleOptions = options.styleOptions || {};
    }

    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('cone3d'));
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

        this.commandResult = this.graphContainer.diagram3d.cone3d(
            this.shapeData.apex,
            this.shapeData.baseCenter,
            this.shapeData.radius,
            '',
            this.styleOptions.color,
            { opacity: this.styleOptions.opacity }
        );
    }

    async playSingle() {
        if (!this.commandResult) return;

        const pen = this.graphContainer.getPen();
        const camera = this.graphContainer.getCamera();
        const canvas = this.graphContainer.getCanvas();
        const effect = new Math3DShapeEffect(this.commandResult, 'cone', { pen, camera, canvas });
        return effect.play();
    }
}
