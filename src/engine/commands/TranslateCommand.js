/**
 * TranslateCommand - Command for rendering translated shape(s)
 *
 * Supports two modes:
 * - Single shape: Uses delegate commands (PointCommand, LineCommand, etc.) to create shape.
 * - Multi-shape: Creates child TranslateCommands and plays them in parallel.
 *
 * For animated mode: creates shape without animation, then plays TranslateEffect.
 * For static mode: delegate command creates and shows shape normally.
 */
import { BaseCommand } from './BaseCommand.js';
import { PointCommand } from './PointCommand.js';
import { LineCommand } from './LineCommand.js';
import { VectorCommand } from './VectorCommand.js';
import { CircleCommand } from './CircleCommand.js';
import { PolygonCommand } from './PolygonCommand.js';
import { PlotCommand } from './PlotCommand.js';
import { TranslateEffect } from '../../effects/translate-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';
import { ShapeCollection } from '../../geom/ShapeCollection.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

export class TranslateCommand extends BaseCommand {
    /**
     * Create a translate command
     *
     * Single shape mode:
     * @param {Object} graphExpression - The graph expression
     * @param {string} originalShapeVarName - Variable name of original shape (for registry lookup)
     * @param {Object} translatedData - Computed translated coordinates
     * @param {string} originalShapeName - Original shape name ('point', 'line', 'vector', etc.)
     * @param {string} originalShapeType - GEOMETRY_TYPES value
     * @param {number} dx - Translation in x direction
     * @param {number} dy - Translation in y direction
     * @param {Object} options - Additional options
     *
     * Multi-shape mode:
     * @param {Object} graphExpression - The graph expression
     * @param {Array} shapeDataArray - Array of shape data objects
     * @param {number} dx - Translation in x direction
     * @param {number} dy - Translation in y direction
     * @param {Object} options - Additional options with isMultiShape: true
     */
    constructor(graphExpression, originalShapeVarNameOrArray, translatedDataOrDx, originalShapeNameOrDy, originalShapeType, dx, dy, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;

        // Detect multi-shape mode from options
        if (typeof translatedDataOrDx === 'number' && typeof originalShapeNameOrDy === 'number') {
            // Multi-shape mode: constructor(graphExpression, shapeDataArray, dx, dy, options)
            this.isMultiShape = true;
            this.shapeDataArray = originalShapeVarNameOrArray;  // Array of shape data
            this.dx = translatedDataOrDx;
            this.dy = originalShapeNameOrDy;
            this.options = originalShapeType || {};

            // Single shape fields not used
            this.originalShapeVarName = null;
            this.translatedData = null;
            this.originalShapeName = null;
            this.originalShapeType = null;

            // Multi-shape tracking
            this.childCommands = [];
        } else {
            // Single shape mode: constructor(graphExpression, varName, data, name, type, dx, dy, options)
            this.isMultiShape = false;
            this.originalShapeVarName = originalShapeVarNameOrArray;
            this.translatedData = translatedDataOrDx;
            this.originalShapeName = originalShapeNameOrDy;
            this.originalShapeType = originalShapeType;
            this.dx = dx;
            this.dy = dy;
            this.options = options;

            // Multi-shape fields not used
            this.shapeDataArray = null;
            this.childCommands = null;
        }

        // Set during init/play
        this.originalShape = null;
        this.translatedShape = null;
        this.delegateCommand = null;
    }

    /**
     * Initialize - look up original shape(s) and store references
     * @returns {Promise}
     */
    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('translate'));
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

        if (this.isMultiShape) {
            // Multi-shape mode: validate all original shapes exist
            for (const shapeData of this.shapeDataArray) {
                const shape = this.commandContext.shapeRegistry[shapeData.originalShapeVarName];
                if (!shape) {
                    throw new Error(`TranslateCommand: original shape '${shapeData.originalShapeVarName}' not found in registry`);
                }
            }
        } else {
            // Single shape mode: look up original shape from registry
            this.originalShape = this.commandContext.shapeRegistry[this.originalShapeVarName];
            if (!this.originalShape) {
                throw new Error(`TranslateCommand: original shape '${this.originalShapeVarName}' not found in registry`);
            }
        }
    }

    /**
     * Extract style options from original shape's styleObj
     * @returns {Object} Style options for delegate commands
     * @private
     */
    _getStyleOptionsFromOriginal() {
        if (!this.originalShape || !this.originalShape.styleObj) {
            return {};
        }
        const s = this.originalShape.styleObj;
        const options = {
            stroke: s.stroke,
            strokeWidth: s['stroke-width'],
            fill: s.fill,
            fillOpacity: s['fill-opacity']
        };
        // Include radius for point shapes
        if (this.originalShape.pointRadius !== undefined) {
            options.radius = this.originalShape.pointRadius;
        }
        return options;
    }

    /**
     * Create delegate command based on shape type
     * @returns {BaseCommand}
     * @private
     */
    _createDelegateCommand() {
        const styleOptions = this._getStyleOptionsFromOriginal();

        switch (this.originalShapeName) {
            case 'point':
                return new PointCommand(this.graphExpression, this.translatedData.point, styleOptions);
            case 'line':
                return new LineCommand(this.graphExpression, this.translatedData.start, this.translatedData.end, styleOptions);
            case 'vector':
                return new VectorCommand(this.graphExpression, this.translatedData.start, this.translatedData.end, styleOptions);
            case 'circle':
                return new CircleCommand(this.graphExpression, this.translatedData.center, this.translatedData.radius, styleOptions);
            case 'polygon':
                return new PolygonCommand(this.graphExpression, this.translatedData.vertices, styleOptions);
            case 'plot': {
                // For plot, create a translated function: f(x) + dy, with x shifted by dx
                const originalFunc = this.translatedData.compiledFunction;
                const dx = this.dx;
                const dy = this.dy;
                const translatedFunc = (x) => originalFunc(x - dx) + dy;
                const domain = this.translatedData.domain;
                return new PlotCommand(
                    this.graphExpression,
                    translatedFunc,
                    domain.min !== null ? domain.min + dx : null,
                    domain.max !== null ? domain.max + dx : null,
                    this.translatedData.equation,
                    { ...styleOptions, ...this.options }
                );
            }
            default:
                throw new Error(`TranslateCommand: unsupported shape type '${this.originalShapeName}'`);
        }
    }

    /**
     * Create a child TranslateCommand for a single shape (used in multi-shape mode)
     * @param {Object} shapeData - Shape data from shapeDataArray
     * @returns {TranslateCommand}
     * @private
     */
    _createChildCommand(shapeData) {
        return new TranslateCommand(
            this.graphExpression,
            shapeData.originalShapeVarName,
            shapeData.translatedData,
            shapeData.originalShapeName,
            shapeData.originalShapeType,
            this.dx,
            this.dy,
            this.options
        );
    }

    /**
     * Play animation - create shape(s), then play translation effect(s)
     * @returns {Promise}
     */
    async play() {
        if (this.isMultiShape) {
            // Multi-shape mode: create child commands and play in parallel
            this.childCommands = this.shapeDataArray.map(shapeData => {
                const cmd = this._createChildCommand(shapeData);
                cmd.diagram2d = this.diagram2d;
                return cmd;
            });

            // Initialize all child commands
            await Promise.all(this.childCommands.map(cmd => cmd.init(this.commandContext)));

            // Disable pen during parallel animation
            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                // Play all in parallel
                await Promise.all(this.childCommands.map(cmd => cmd.play()));
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }

            // Collect results as ShapeCollection
            this.commandResult = new ShapeCollection(
                this.childCommands.map(cmd => cmd.commandResult)
            );
            return;
        }

        // Single shape mode: existing behavior
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        // Use original shape's stroke color, fallback to command color
        const originalStroke = this.originalShape?.styleObj?.stroke;
        this.delegateCommand.setColor(originalStroke || this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }
        await this.delegateCommand.init(this.commandContext);

        this.translatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.translatedShape;

        // Hide translated shape, will be shown by translation animation
        this.translatedShape.hide();

        // Play translation effect with model-space dx, dy
        const effect = new TranslateEffect(this.originalShape, this.translatedShape, this.dx, this.dy);
        await effect.play();
    }

    /**
     * Direct play (no animation) - use delegate command to create and show translated shape(s)
     * @returns {Promise}
     */
    async directPlay() {
        if (this.isMultiShape) {
            // Multi-shape mode: create and direct-play child commands
            this.childCommands = this.shapeDataArray.map(shapeData => {
                const cmd = this._createChildCommand(shapeData);
                cmd.diagram2d = this.diagram2d;
                return cmd;
            });

            // Initialize and direct-play all child commands
            for (const cmd of this.childCommands) {
                await cmd.init(this.commandContext);
                await cmd.directPlay();
            }

            // Collect results as ShapeCollection
            this.commandResult = new ShapeCollection(
                this.childCommands.map(cmd => cmd.commandResult)
            );
            return;
        }

        // Single shape mode: existing behavior
        this.delegateCommand = this._createDelegateCommand();
        this.delegateCommand.diagram2d = this.diagram2d;
        // Use original shape's stroke color, fallback to command color
        const originalStroke = this.originalShape?.styleObj?.stroke;
        this.delegateCommand.setColor(originalStroke || this.color);
        if (this.labelName) {
            this.delegateCommand.setLabelName(this.labelName);
        }

        await this.delegateCommand.init(this.commandContext);

        this.translatedShape = this.delegateCommand.commandResult;
        this.commandResult = this.translatedShape;
    }

    /**
     * Replay animation on existing shape(s)
     * @returns {Promise}
     */
    async playSingle() {
        if (this.isMultiShape) {
            // Multi-shape mode: replay all child commands in parallel
            const wasPenActive = RoboEventManager.isPenActive();
            RoboEventManager.setPenActive(false);
            try {
                await Promise.all(this.childCommands.map(cmd => cmd.playSingle()));
            } finally {
                RoboEventManager.setPenActive(wasPenActive);
            }
            return;
        }

        // Single shape mode: existing behavior
        this.translatedShape.hide();

        // Play translation effect with model-space dx, dy
        const effect = new TranslateEffect(this.originalShape, this.translatedShape, this.dx, this.dy);
        return effect.play();
    }

    /**
     * Get label position based on shape type
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        if (this.isMultiShape) {
            // For multi-shape, return position of first shape
            if (this.childCommands && this.childCommands.length > 0) {
                return this.childCommands[0].getLabelPosition();
            }
            return { x: 0, y: 0 };
        }

        switch (this.originalShapeName) {
            case 'point':
                return this.translatedData.point;
            case 'line':
            case 'vector':
                // Midpoint of line
                return {
                    x: (this.translatedData.start.x + this.translatedData.end.x) / 2,
                    y: (this.translatedData.start.y + this.translatedData.end.y) / 2
                };
            case 'circle':
                return this.translatedData.center;
            case 'polygon':
                // Centroid
                const verts = this.translatedData.vertices;
                const n = verts.length - 1; // Exclude closing point
                const sumX = verts.slice(0, n).reduce((s, v) => s + v.x, 0);
                const sumY = verts.slice(0, n).reduce((s, v) => s + v.y, 0);
                return { x: sumX / n, y: sumY / n };
            case 'plot':
                // Return a point on the translated plot
                return { x: this.dx, y: this.dy };
            default:
                return { x: 0, y: 0 };
        }
    }

    /**
     * Clear the command and child commands
     */
    clear() {
        if (this.isMultiShape && this.childCommands) {
            for (const cmd of this.childCommands) {
                cmd.clear();
            }
        }
        super.clear();
    }
}
