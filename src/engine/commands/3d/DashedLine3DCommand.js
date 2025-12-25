/**
 * DashedLine3DCommand - Command for rendering a 3D dashed line segment with fade-in animation
 *
 * Uses grapher.diagram3d.dashedLine3d() for dashed line creation.
 * Uses fade-in animation instead of pen-tracing animation.
 */
import { Base3DCommand } from './Base3DCommand.js';
import { common_error_messages } from '../../expression-parser/core/ErrorMessages.js';
import { TweenMax } from 'gsap';

export class DashedLine3DCommand extends Base3DCommand {
    /**
     * Create a dashed line3d command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} startPoint - Start position {x, y, z}
     * @param {Object} endPoint - End position {x, y, z}
     * @param {Object} options - { styleOptions: { strokeWidth, color, dashSize, gapSize, ... } }
     */
    constructor(graphExpression, startPoint, endPoint, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.styleOptions = options.styleOptions || {};
        this.fadeDuration = options.fadeDuration ?? 0.5; // Fade-in duration in seconds
    }

    /**
     * Create dashed line shape via diagram3d
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g3d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('dashedline3d'));
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

        // Create dashed line using diagram3d.dashedLine3d
        this.commandResult = this.graphContainer.diagram3d.dashedLine3d(
            this.startPoint,
            this.endPoint,
            '', // label
            this.styleOptions.color,
            { radius: this.styleOptions.strokeWidth }
        );

        // Hide initially for fade-in animation
        if (this.commandResult) {
            this.commandResult.visible = false;
        }
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
     * Play animation - fade in the dashed line
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.commandResult) return;

        // Make visible first
        this.commandResult.visible = true;

        // Traverse all meshes and fade in their materials
        return new Promise(resolve => {
            const materials = [];
            this.commandResult.traverse(child => {
                if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 0;
                    materials.push(child.material);
                }
            });

            if (materials.length === 0) {
                resolve();
                return;
            }

            // Animate all materials
            let completed = 0;
            materials.forEach(material => {
                TweenMax.to(material, this.fadeDuration, {
                    opacity: 1,
                    onComplete: () => {
                        completed++;
                        if (completed === materials.length) {
                            resolve();
                        }
                    }
                });
            });
        });
    }

    /**
     * Direct play - show immediately without animation
     */
    doDirectPlay() {
        if (this.commandResult) {
            this.commandResult.visible = true;
            this.commandResult.traverse(child => {
                if (child.material) {
                    child.material.opacity = 1;
                }
            });
        }
    }
}
