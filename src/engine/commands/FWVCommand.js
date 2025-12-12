/**
 * FWVCommand - Command for rendering a forward-shifted vector with animation
 *
 * Uses VectorCommand as delegate to create the shifted shape.
 * For animated mode: creates shape without animation, then plays TranslateEffect.
 * For static mode: delegate command creates and shows shape normally.
 */
import { BaseCommand } from './BaseCommand.js';
import { VectorCommand } from './VectorCommand.js';
import { TranslateEffect } from '../../effects/translate-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class FWVCommand extends BaseCommand {
    /**
     * Create a forward vector command
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original vector (for registry lookup)
     * @param {Object} shiftedData - Computed shifted coordinates {start, end}
     * @param {number} dx - Translation in x direction
     * @param {number} dy - Translation in y direction
     * @param {Object} options - Additional options
     */
    constructor(graphExpression, originalShapeVarName, shiftedData, dx, dy, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.originalShapeVarName = originalShapeVarName;
        this.shiftedData = shiftedData;
        this.dx = dx;
        this.dy = dy;
        this.options = options;

        // Set during init/play
        this.originalShape = null;
        this.shiftedShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape and store references
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('fwv'));
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

        // Look up original shape from registry - required for translation animation
        this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
        if (!this.originalShape) {
            throw new Error(`FWVCommand: original shape '${this.originalShapeVarName}' not found in registry`);
        }
    }

    /**
     * Play animation - create shape, then play translation effect
     * @returns {Promise}
     */
    async play() {
        // Create shifted shape via delegate command
        this.delegateCommand = new VectorCommand(this.graphExpression, this.shiftedData.start, this.shiftedData.end);
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.shiftedShape = this.delegateCommand.commandResult;
        this.commandResult = this.shiftedShape;

        // Hide shifted shape, will be shown by translation animation
        this.shiftedShape.hide();

        // Play translation effect with model-space dx, dy
        const effect = new TranslateEffect(this.originalShape, this.shiftedShape, this.dx, this.dy);
        await effect.play();
    }

    /**
     * Direct play (no animation) - use delegate command to create and show shifted shape
     * @returns {Promise}
     */
    async directPlay() {
        // Create shifted shape via delegate command
        this.delegateCommand = new VectorCommand(this.graphExpression, this.shiftedData.start, this.shiftedData.end);
        this.delegateCommand.diagram2d = this.diagram2d;
        this.delegateCommand.setColor(this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);

        this.shiftedShape = this.delegateCommand.commandResult;
        this.commandResult = this.shiftedShape;
    }

    /**
     * Replay animation on existing shape
     * @returns {Promise}
     */
    async playSingle() {
        // Hide shifted shape and replay animation
        this.shiftedShape.hide();

        // Play translation effect with model-space dx, dy
        const effect = new TranslateEffect(this.originalShape, this.shiftedShape, this.dx, this.dy);
        return effect.play();
    }

    /**
     * Get label position at midpoint of shifted vector
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return {
            x: (this.shiftedData.start.x + this.shiftedData.end.x) / 2,
            y: (this.shiftedData.start.y + this.shiftedData.end.y) / 2
        };
    }
}
