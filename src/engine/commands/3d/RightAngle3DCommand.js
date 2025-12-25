/**
 * RightAngle3DCommand - Command for rendering a 3D right angle marker (90 degree square)
 *
 * Uses grapher.diagram3d.rightAngleMarker() for rendering.
 * Animation: marker grows from zero scale to full scale.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class RightAngle3DCommand extends Base3DCommand {
    /**
     * Create a rightangle3d command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} vertex - Vertex point {x, y, z}
     * @param {Object} point1 - First ray endpoint {x, y, z}
     * @param {Object} point2 - Second ray endpoint {x, y, z}
     * @param {Object} options - Additional options {size, color, filled, fillOpacity, tubeRadius}
     */
    constructor(graphExpression, vertex, point1, point2, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.vertex = vertex;
        this.point1 = point1;
        this.point2 = point2;
        this.size = options.size || 0.4;
        this.color = options.color || 0xff6600;
        this.filled = options.filled !== false;
        this.fillOpacity = options.fillOpacity || 0.7;
        this.tubeRadius = options.tubeRadius || 0.03;
    }

    /**
     * Initialize - resolve graph container
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('rightangle3d'));
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
    }

    /**
     * Create right angle marker - animated diagram handles the animation
     * @returns {Promise}
     */
    async play() {
        const options = {
            size: this.size,
            color: this.color,
            filled: this.filled,
            fillOpacity: this.fillOpacity,
            tubeRadius: this.tubeRadius,
            label: this.labelName
        };

        // Create the right angle marker - animated diagram handles animation internally
        this.commandResult = this.graphContainer.diagram3d.rightAngleMarker(
            this.point1,
            this.vertex,
            this.point2,
            this.labelName || '',
            this.color,
            options
        );

        // Wait for the diagram's animation to complete
        const animationDuration = this.graphContainer.diagram3d.animationDuration || 1;
        return new Promise((resolve) => {
            setTimeout(resolve, animationDuration * 1000);
        });
    }

    /**
     * Create right angle marker instantly without animation
     * @returns {Promise}
     */
    async directPlay() {
        const options = {
            size: this.size,
            color: this.color,
            filled: this.filled,
            fillOpacity: this.fillOpacity,
            tubeRadius: this.tubeRadius,
            label: this.labelName
        };

        this.commandResult = this.graphContainer.diagram3d.rightAngleMarker(
            this.point1,
            this.vertex,
            this.point2,
            this.labelName || '',
            this.color,
            options
        );
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        const scene = this.graphContainer.getScene();

        // Remove existing shape
        if (this.commandResult) {
            scene.remove(this.commandResult);
        }

        // Recreate and animate
        return this.play();
    }

    getLabelPosition() {
        return this.vertex;
    }

    getVertex() {
        return this.vertex;
    }

    getPoint1() {
        return this.point1;
    }

    getPoint2() {
        return this.point2;
    }
}
