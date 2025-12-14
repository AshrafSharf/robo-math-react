/**
 * Line3DCommand - Command for rendering a 3D line segment
 *
 * Uses grapher.diagram3d.segment3dByTwoPoints() - polymorphism handles LHS vs RHS automatically.
 * No conditional statements needed for coordinate system selection.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { Math3DShapeEffect } from '../../../effects/shape-effects/math-3d-shape-effect.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class Line3DCommand extends Base3DCommand {
    /**
     * Create a line3d command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} startPoint - Start position {x, y, z}
     * @param {Object} endPoint - End position {x, y, z}
     * @param {Object} options - { styleOptions: { strokeWidth, color, ... } }
     */
    constructor(graphExpression, startPoint, endPoint, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.styleOptions = options.styleOptions || {};
    }

    /**
     * Create line shape via diagram3d
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g3d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('line3d'));
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

        this.commandResult = this.graphContainer.diagram3d.segment3dByTwoPoints(
            this.startPoint,
            this.endPoint,
            '',
            this.styleOptions.color,
            { radius: this.styleOptions.strokeWidth }
        );
    }

    /**
     * Get label position at midpoint of line
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
     * Get line length
     * @returns {number}
     */
    getLength() {
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const dz = this.endPoint.z - this.startPoint.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.commandResult) return;

        const penTracker = this.graphContainer.getPenTracker();
        const effect = new Math3DShapeEffect(this.commandResult, 'line', { penTracker });
        return effect.play();
    }
}
