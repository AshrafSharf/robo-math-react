/**
 * Measure3DCommand - Command for rendering a 3D measurement indicator
 *
 * Creates a dimension line between two 3D points with perpendicular end markers
 * and an optional text label. Uses fade-in animation.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { fadeInGroup } from '../../../3d/common/animator/solid_animator.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class Measure3DCommand extends Base3DCommand {
    /**
     * Create a measure3d command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} startPoint - Start position {x, y, z}
     * @param {Object} endPoint - End position {x, y, z}
     * @param {string} text - Label text for the measurement
     * @param {Object} options - { styleOptions: { color, ... } }
     */
    constructor(graphExpression, startPoint, endPoint, text, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.text = text;
        this.styleOptions = options.styleOptions || {};
    }

    /**
     * Create measurement indicator shape via diagram3d
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g3d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('measure3d'));
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

        // Create measurement indicator with label
        this.commandResult = this.graphContainer.diagram3d.measurementIndicator3d(
            this.startPoint,
            this.endPoint,
            this.text,
            this.styleOptions.color,
            {
                mainRadius: this.styleOptions.mainRadius,
                markerRadius: this.styleOptions.markerRadius,
                markerLength: this.styleOptions.markerLength,
                labelOffset: this.styleOptions.labelOffset
            }
        );
        // Shapes are visible by default - playSingle() will handle animation
    }

    /**
     * Get label position at midpoint of measurement
     * @returns {{x: number, y: number, z: number}}
     */
    getLabelPosition() {
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2,
            z: (this.startPoint.z + this.endPoint.z) / 2
        };
    }

    /**
     * Get start point
     * @returns {{x: number, y: number, z: number}}
     */
    getStartPoint() {
        return this.startPoint;
    }

    /**
     * Get end point
     * @returns {{x: number, y: number, z: number}}
     */
    getEndPoint() {
        return this.endPoint;
    }

    /**
     * Get measurement length
     * @returns {number}
     */
    getLength() {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const dz = this.endPoint.z - this.startPoint.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Play animation - fade in the measurement indicator and label
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.commandResult) return;

        return new Promise(resolve => {
            fadeInGroup(this.commandResult, {
                duration: 2,
                onComplete: resolve
            });
        });
    }
}
