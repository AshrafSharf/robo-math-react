/**
 * Polygon3DCommand - Command for rendering a 3D polygon with fade-in animation
 */
import { Base3DCommand } from './Base3DCommand.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';
import { fadeInPolygon } from '../../../3d/lhs/animator/lhs_polygon_animator.js';

export class Polygon3DCommand extends Base3DCommand {
    /**
     * Create a polygon3d command
     * @param {Object} graphExpression - The graph expression
     * @param {Object} shapeData - { vertices: [{x,y,z}, ...] }
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
            const err = new Error(common_error_messages.GRAPH_REQUIRED('polygon3d'));
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

        // Create polygon using diagram3d
        this.commandResult = this.graphContainer.diagram3d.polygon(
            this.shapeData.vertices,
            '',
            this.styleOptions.color,
            {
                opacity: this.styleOptions.opacity || 0.7,
                showEdges: this.styleOptions.showEdges || false,
                edgeColor: this.styleOptions.edgeColor
            }
        );
    }

    /**
     * Fade in animation for polygon3d
     */
    async playSingle() {
        if (!this.commandResult) return;

        return new Promise((resolve) => {
            fadeInPolygon(this.commandResult, {
                duration: this.styleOptions.duration || 2,
                toOpacity: this.styleOptions.opacity || 0.7,
                onComplete: resolve
            });
        });
    }
}
