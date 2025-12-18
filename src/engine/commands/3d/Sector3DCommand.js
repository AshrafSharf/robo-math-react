/**
 * Sector3DCommand - Command for rendering a 3D filled angle sector (pie slice)
 *
 * Uses grapher.diagram3d.angleSector() for rendering.
 * Animation: sector grows from zero scale to full scale with fade-in.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { TweenMax } from 'gsap';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';

export class Sector3DCommand extends Base3DCommand {
    /**
     * Create a sector3d command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} vertex - Vertex point {x, y, z}
     * @param {Object} point1 - First ray endpoint {x, y, z}
     * @param {Object} point2 - Second ray endpoint {x, y, z}
     * @param {Object} options - Additional options {radius, color, opacity}
     */
    constructor(graphExpression, vertex, point1, point2, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.vertex = vertex;
        this.point1 = point1;
        this.point2 = point2;
        this.radius = options.radius || 1.0;
        this.color = options.color || 0xffaa00;
        this.opacity = options.opacity || 0.5;
    }

    /**
     * Initialize - resolve graph container
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('sector3d'));
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
     * Create sector and animate it growing with fade-in
     * @returns {Promise}
     */
    async play() {
        // Compute direction vectors from vertex to points
        const startVector = {
            x: this.point1.x - this.vertex.x,
            y: this.point1.y - this.vertex.y,
            z: this.point1.z - this.vertex.z
        };
        const endVector = {
            x: this.point2.x - this.vertex.x,
            y: this.point2.y - this.vertex.y,
            z: this.point2.z - this.vertex.z
        };

        const options = {
            radius: this.radius,
            color: this.color,
            opacity: this.opacity,
            label: this.labelName
        };

        // Create the sector
        this.commandResult = this.graphContainer.diagram3d.angleSector(
            startVector,
            endVector,
            this.labelName || '',
            this.color,
            options
        );

        // Animate: grow from zero scale with fade-in
        return new Promise((resolve) => {
            if (!this.commandResult) {
                resolve();
                return;
            }

            // Start at zero scale and transparent
            this.commandResult.scale.set(0, 0, 0);
            if (this.commandResult.material) {
                this.commandResult.material.transparent = true;
                this.commandResult.material.opacity = 0;
            }

            // Animate scale
            TweenMax.to(this.commandResult.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 1.5,
                ease: "power2.out"
            });

            // Animate opacity
            if (this.commandResult.material) {
                TweenMax.to(this.commandResult.material, {
                    opacity: this.opacity,
                    duration: 1.5,
                    ease: "power2.out",
                    onComplete: resolve
                });
            } else {
                // If no material, just wait for scale animation
                TweenMax.delayedCall(1.5, resolve);
            }
        });
    }

    /**
     * Create sector instantly without animation
     * @returns {Promise}
     */
    async directPlay() {
        const startVector = {
            x: this.point1.x - this.vertex.x,
            y: this.point1.y - this.vertex.y,
            z: this.point1.z - this.vertex.z
        };
        const endVector = {
            x: this.point2.x - this.vertex.x,
            y: this.point2.y - this.vertex.y,
            z: this.point2.z - this.vertex.z
        };

        const options = {
            radius: this.radius,
            color: this.color,
            opacity: this.opacity,
            label: this.labelName
        };

        this.commandResult = this.graphContainer.diagram3d.angleSector(
            startVector,
            endVector,
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
