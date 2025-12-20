/**
 * DistanceMarkerCommand - Draws a measurement indicator with text label
 *
 * Creates:
 * - MeasurementIndicatorPrimitiveShape (start marker, main line, end marker)
 * - MathTextComponent for label at midpoint
 *
 * Animation sequence: Measurement indicator draws, then text
 */
import { BaseCommand } from './BaseCommand.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';
import { MathTextPositionUtil } from '../../mathtext/utils/math-text-position-util.js';

// Default text offset in pixels (so text doesn't overlap the line)
const DEFAULT_TEXT_OFFSET = 15;
// Default marker offset in pixels (so marker doesn't overlap the shape being measured)
const DEFAULT_MARKER_OFFSET = 15;
// Default marker length in pixels
const DEFAULT_MARKER_LENGTH = 16;

export class DistanceMarkerCommand extends BaseCommand {
    /**
     * Create a distance marker command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Object} start - Start position in model coordinates {x, y}
     * @param {Object} end - End position in model coordinates {x, y}
     * @param {string} text - LaTeX string for the label
     * @param {number} textOffset - Perpendicular offset for text from midpoint (default: 0.5)
     * @param {number} markerOffset - Perpendicular offset for the whole marker
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, start, end, text, textOffset = DEFAULT_TEXT_OFFSET, markerOffset = DEFAULT_MARKER_OFFSET, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.start = start;
        this.end = end;
        this.text = text;
        this.textOffset = textOffset;
        this.markerOffset = markerOffset;
        this.options = options;

        // Shapes created during init
        this.measurementShape = null;
        this.textComponent = null;
    }

    /**
     * Format text - wrap in \text{} if plain text (no LaTeX commands)
     * @param {string} text - The text to format
     * @returns {string} Formatted text
     */
    _formatText(text) {
        // Check if text contains LaTeX commands (backslash)
        const hasLatexCommands = /\\/.test(text);
        if (hasLatexCommands) {
            return text;
        }
        // Wrap plain text in \text{}
        return `\\text{${text}}`;
    }

    /**
     * Create shapes via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('dm'));
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

        // Create the measurement indicator shape
        // Pass markerOffset as the offset option, and increase marker length
        const measurementOptions = {
            markerLength: DEFAULT_MARKER_LENGTH,
            ...this.options,
            offset: this.markerOffset
        };

        this.measurementShape = this.graphContainer.measurementIndicator(
            this.start.x,
            this.start.y,
            this.end.x,
            this.end.y,
            measurementOptions
        );

        // Apply color from command options
        if (this.color) {
            this.measurementShape.stroke(this.color);
        }

        // Hide initially for animation
        this.measurementShape.disableStroke();

        // Calculate text position at midpoint
        const textPosition = this._calculateTextPosition();

        // Calculate pixel offset for text (perpendicular to line)
        const textPixelOffset = this._calculateTextPixelOffset();

        // Format text - wrap in \text{} if plain text
        const formattedText = this._formatText(this.text);

        // Create the label using diagram's label method
        this.textComponent = this.diagram2d._createLabel(
            this.graphContainer,
            textPosition,
            formattedText,
            this.color || 'black',
            {
                fontSize: this.options.fontSize || 18,
                ...this.options,
                offset: textPixelOffset
            }
        );

        // Center the text horizontally on the midpoint
        if (this.textComponent) {
            MathTextPositionUtil.centerHorizontally(this.textComponent.containerDOM);
        }

        // Store command result for potential external access
        this.commandResult = {
            measurementShape: this.measurementShape,
            textComponent: this.textComponent
        };
    }

    /**
     * Calculate text position at midpoint (in model coordinates)
     * @returns {{x: number, y: number}}
     */
    _calculateTextPosition() {
        // Calculate midpoint in model coordinates
        return {
            x: (this.start.x + this.end.x) / 2,
            y: (this.start.y + this.end.y) / 2
        };
    }

    /**
     * Calculate perpendicular pixel offset for text
     * @returns {{x: number, y: number}}
     */
    _calculateTextPixelOffset() {
        if (this.textOffset === 0) {
            return { x: 0, y: 0 };
        }

        // Convert start and end to view coordinates to get pixel direction
        const startViewX = this.graphContainer.toViewX(this.start.x);
        const startViewY = this.graphContainer.toViewY(this.start.y);
        const endViewX = this.graphContainer.toViewX(this.end.x);
        const endViewY = this.graphContainer.toViewY(this.end.y);

        // Calculate direction in pixel space
        const dx = endViewX - startViewX;
        const dy = endViewY - startViewY;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) {
            return { x: 0, y: 0 };
        }

        // Perpendicular direction in pixel space (rotate 90 degrees)
        const perpX = -dy / length;
        const perpY = dx / length;

        // Apply textOffset along perpendicular direction (in pixels)
        return {
            x: perpX * this.textOffset,
            y: perpY * this.textOffset
        };
    }

    /**
     * Get label position
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return this._calculateTextPosition();
    }

    /**
     * Play animation - measurement indicator first, then text
     * @returns {Promise}
     */
    async playSingle() {
        // Reset to hidden state
        if (this.measurementShape) {
            this.measurementShape.disableStroke();
        }
        if (this.textComponent) {
            this.textComponent.hide();
            this.textComponent.disableStroke();
        }

        // Phase 1: Animate the measurement indicator
        if (this.measurementShape) {
            const startPoint = RoboEventManager.getLastVisitedPenPoint();
            await new Promise(resolve => {
                this.measurementShape.renderWithAnimation(startPoint, resolve);
            });
        }

        // Phase 2: Animate the text
        if (this.textComponent) {
            const textEffect = new WriteEffect(this.textComponent);
            await textEffect.play();
        }
    }

    /**
     * Direct play (instant, no animation)
     */
    doDirectPlay() {
        // Instant render measurement indicator
        if (this.measurementShape) {
            this.measurementShape.renderEndState();
            this.measurementShape.enableStroke();
        }

        // Instant render text
        if (this.textComponent) {
            this.textComponent.show();
            this.textComponent.enableStroke();
        }
    }

    /**
     * Clear and remove shapes
     */
    clear() {
        if (this.measurementShape) {
            this.measurementShape.remove();
            this.measurementShape = null;
        }
        if (this.textComponent) {
            if (this.textComponent.containerDOM && this.textComponent.containerDOM.parentNode) {
                this.textComponent.containerDOM.parentNode.removeChild(this.textComponent.containerDOM);
            }
            this.textComponent = null;
        }
        this.commandResult = null;
        this.isInitialized = false;
    }
}
