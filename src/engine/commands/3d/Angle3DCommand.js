/**
 * Angle3DCommand - Command for rendering a 3D angle arc
 *
 * Uses grapher.diagram3d.arcByThreePoints() for angle rendering.
 * Supports interior and reflex angle types.
 * Animation: arc grows from zero radius to target radius.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { TweenMax } from 'gsap';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class Angle3DCommand extends Base3DCommand {
    /**
     * Create an angle3d command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} vertex - Vertex point {x, y, z}
     * @param {Object} point1 - First ray endpoint {x, y, z}
     * @param {Object} point2 - Second ray endpoint {x, y, z}
     * @param {string} angleType - Type of angle ('interior', 'reflex')
     * @param {Object} options - Additional options {radius, color, tubeRadius}
     */
    constructor(graphExpression, vertex, point1, point2, angleType, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.vertex = vertex;
        this.point1 = point1;
        this.point2 = point2;
        this.angleType = angleType;
        this.radius = options.radius || 0.8;
        this.color = options.color || 0x00ff00;
        this.tubeRadius = options.tubeRadius || 0.04;
    }

    /**
     * Initialize - resolve graph container
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('angle3d'));
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
     * Create arc and animate it growing from zero radius
     * @returns {Promise}
     */
    async play() {
        const options = {
            radius: this.radius,
            tubeRadius: this.tubeRadius,
            color: this.color,
            label: this.labelName
        };

        // For reflex angles, swap points to trace the larger angle
        let p1 = this.point1;
        let p2 = this.point2;
        if (this.angleType === 'reflex') {
            p1 = this.point2;
            p2 = this.point1;
        }

        // Create the arc
        this.commandResult = this.graphContainer.diagram3d.arcByThreePoints(
            p1,
            this.vertex,
            p2,
            this.labelName || '',
            this.color,
            options
        );

        // Animate: grow from zero scale to full scale
        return new Promise((resolve) => {
            if (!this.commandResult) {
                resolve();
                return;
            }

            // Start at zero scale
            this.commandResult.scale.set(0, 0, 0);

            TweenMax.to(this.commandResult.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.5,
                ease: "power2.out",
                onComplete: resolve
            });
        });
    }

    /**
     * Create arc instantly without animation
     * @returns {Promise}
     */
    async directPlay() {
        const options = {
            radius: this.radius,
            tubeRadius: this.tubeRadius,
            color: this.color,
            label: this.labelName
        };

        let p1 = this.point1;
        let p2 = this.point2;
        if (this.angleType === 'reflex') {
            p1 = this.point2;
            p2 = this.point1;
        }

        this.commandResult = this.graphContainer.diagram3d.arcByThreePoints(
            p1,
            this.vertex,
            p2,
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

    /**
     * Get label position at angle center
     * @returns {{x: number, y: number, z: number}}
     */
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

    getAngleType() {
        return this.angleType;
    }
}
