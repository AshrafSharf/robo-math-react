/**
 * DashedLineCommand - Command for rendering a dashed line with fade-in animation
 *
 * Creates a dashed line shape via diagram.line() with dashPattern.
 * Uses fade-in animation instead of pen-tracing animation.
 */
import { BaseCommand } from './BaseCommand.js';
import { ShapeVisibilityAdapter } from './visibility/ShapeVisibilityAdapter.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class DashedLineCommand extends BaseCommand {
    /**
     * Create a dashed line command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} startPoint - Start position {x, y}
     * @param {Object} endPoint - End position {x, y}
     * @param {Object} options - Additional options {strokeWidth, dashPattern}
     */
    constructor(graphExpression, startPoint, endPoint, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.strokeWidth = options.strokeWidth ?? 2;
        this.strokeOpacity = options.strokeOpacity ?? null;
        this.dashPattern = options.dashPattern || '5,3'; // Default dashed pattern
        this.fadeDuration = options.fadeDuration ?? 0.5; // Fade-in duration in seconds
    }

    /**
     * Create dashed line shape via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('dashedline'));
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

        const options = {
            label: this.labelName,
            strokeWidth: this.strokeWidth,
            dashPattern: this.dashPattern
        };

        if (this.strokeOpacity !== null) {
            options.strokeOpacity = this.strokeOpacity;
        }

        this.commandResult = this.diagram2d.line(
            this.graphContainer,
            this.startPoint,
            this.endPoint,
            this.color,
            options
        );

        // Hide initially for fade-in animation
        if (this.commandResult && this.commandResult.hide) {
            this.commandResult.hide();
        }
    }

    /**
     * Get label position at midpoint of line
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return {
            x: (this.startPoint.x + this.endPoint.x) / 2,
            y: (this.startPoint.y + this.endPoint.y) / 2
        };
    }

    /**
     * Get start point
     * @returns {{x: number, y: number}}
     */
    getStartPoint() {
        return this.startPoint;
    }

    /**
     * Get end point
     * @returns {{x: number, y: number}}
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
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Play animation - fade in the dashed line
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.commandResult) return;

        const adapter = ShapeVisibilityAdapter.for(this.commandResult);
        return new Promise(resolve => {
            adapter.fadeIn(this.fadeDuration, resolve);
        });
    }

    /**
     * Direct play - show immediately without animation
     */
    doDirectPlay() {
        if (this.commandResult) {
            const adapter = ShapeVisibilityAdapter.for(this.commandResult);
            adapter.show();
        }
    }
}
