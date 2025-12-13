/**
 * Point3DCommand - Command for rendering a 3D point
 *
 * Uses grapher.diagram3d.point3d() - polymorphism handles LHS vs RHS automatically.
 * No conditional statements needed for coordinate system selection.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { Math3DShapeEffect } from '../../../effects/shape-effects/math-3d-shape-effect.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class Point3DCommand extends Base3DCommand {
    /**
     * Create a point3d command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} position - Position {x, y, z}
     * @param {Object} options - { styleOptions: { radius, color, ... } }
     */
    constructor(graphExpression, position, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.position = position;
        this.styleOptions = options.styleOptions || {};
    }

    /**
     * Create point shape via diagram3d
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g3d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('point3d'));
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

        this.commandResult = this.graphContainer.diagram3d.point3d(
            this.position,
            '',
            this.styleOptions.color,
            { radius: this.styleOptions.radius }
        );
    }

    /**
     * Get label position at the point
     * @returns {{x: number, y: number, z: number}}
     */
    getLabelPosition() {
        return this.position;
    }

    /**
     * Get the point position
     * @returns {{x: number, y: number, z: number}}
     */
    getPosition() {
        return this.position;
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.commandResult) return;

        // Use 3D-specific effect for animation
        const effect = new Math3DShapeEffect(this.commandResult, 'point');
        return effect.play();
    }
}
