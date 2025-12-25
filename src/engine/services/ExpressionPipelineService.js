/**
 * Expression Pipeline Service
 *
 * Handles the complete expression processing pipeline:
 * String -> Parse -> Eval -> Resolve -> Command
 */
import { parse } from '../expression-parser/parser/index.js';
import { ExpressionInterpreter } from '../expression-parser/core/ExpressionInterpreter.js';
import { ExpressionContext } from '../expression-parser/core/ExpressionContext.js';
import { AssignmentExpression } from '../expression-parser/expressions/AssignmentExpression.js';
import { ExpressionOptionsRegistry } from '../expression-parser/core/ExpressionOptionsRegistry.js';
import { getColorByIndex } from '../constants/colors.js';

/**
 * Map expression names to their normalized type for options lookup
 */
const EXPRESSION_TYPE_MAP = {
    'g2d': 'g2d',
    'p2d': 'p2d',
    'g3d': 'g3d',
    'point': 'point',
    'line': 'line',
    'segment': 'segment',
    'ray': 'ray',
    'circle': 'circle',
    'ellipse': 'ellipse',
    'arc': 'arc',
    'vector': 'vector',
    'angle': 'angle',
    'anglex': 'angle',
    'anglex2': 'angle',
    'angler': 'angle',
    'anglert': 'angle',
    'angleo': 'angle',
    'label': 'label',
    'polygon': 'polygon',
    'plot': 'plot',
    'paraplot': 'paraplot',
    // MathText expressions - all map to 'mathtext' for unified options
    'mathtext': 'mathtext',
    'write': 'mathtext',
    'writeonly': 'mathtext',
    'writewithout': 'mathtext',
    // Ref expression
    'ref': 'ref',
    // Point-producing expressions - map to 'point' for radius defaults
    'intersect': 'point',
    'mid': 'point',
    'polarpoint': 'point',
    'startpoint': 'point',
    'pointatratio': 'point',
    'a2p': 'point',
    'project': 'point',
};

export class ExpressionPipelineService {
    constructor() {
        this.interpreter = new ExpressionInterpreter();
    }

    /**
     * Process a single expression string into a Command
     * @param {string} expressionStr - The expression string (e.g., "point(0,0)")
     * @param {ExpressionContext} context - Context for variable resolution
     * @param {Object} options - Command options {color, label, showLabel, offsetX, offsetY, expressionId}
     * @param {number} index - Command index for color cycling (default 0)
     * @returns {{ command: BaseCommand|null, expression: Expression|null, error: Error|null, label: string, canPlay: boolean }}
     */
    processExpression(expressionStr, context, options = {}, index = 0) {
        const result = {
            command: null,
            expression: null,
            error: null,
            label: '',
            canPlay: false
        };

        // Skip empty expressions
        if (!expressionStr || expressionStr.trim() === '') {
            return result;
        }

        try {
            // 1. Parse string to AST
            const ast = parse(expressionStr);

            // 2. Evaluate AST to Expression object
            const expression = this.interpreter.evalExpression(ast[0]);
            result.expression = expression;

            // 3. Resolve variables in context (set caller for dependency tracking)
            context.setCaller(expression);
            expression.resolve(context);

            // 4. Determine if expression can play
            result.canPlay = typeof expression.canPlay === 'function' && expression.canPlay();

            // 5. Handle assignment expressions (variable binding)
            if (expression instanceof AssignmentExpression) {
                result.label = expression.getLabel();

                // Get the RHS expression for command creation
                const rhsExpression = expression.getComparableExpression();

                // Only create command if RHS has toCommand method
                if (rhsExpression && typeof rhsExpression.toCommand === 'function') {
                    result.command = this._createCommand(rhsExpression, options, result.label, index);
                }
            } else {
                // Non-assignment: create command directly if toCommand exists
                if (typeof expression.toCommand === 'function') {
                    result.command = this._createCommand(expression, options, options.label || '', index);
                }
            }

        } catch (error) {
            result.error = error;
        }

        return result;
    }

    /**
     * Create command from expression with options
     * @private
     * @param {Expression} expression - The expression to create command from
     * @param {Object} options - Command options
     * @param {string} label - Label for the command
     * @param {number} index - Command index for color cycling
     */
    _createCommand(expression, options, label, index = 0) {
        // Get the expression type and look up type-specific options
        const expressionName = expression.getName ? expression.getName().toLowerCase() : null;
        const normalizedType = expressionName ? EXPRESSION_TYPE_MAP[expressionName] : null;

        // Get options from registry by item ID (includes type defaults + instance overrides)
        const registryOptions = options.expressionId
            ? ExpressionOptionsRegistry.getById(options.expressionId, normalizedType)
            : {};

        // Merge type-specific options for command creation
        const commandOptions = {
            // Point options
            radius: registryOptions.radius,
            fill: registryOptions.fill,

            // Line/shape stroke options (default to 2)
            strokeWidth: registryOptions.strokeWidth ?? 2,
            strokeOpacity: registryOptions.strokeOpacity,
            dashPattern: registryOptions.dashPattern,

            // Fill options (circle, polygon, angle, ellipse)
            fillOpacity: registryOptions.fillOpacity,

            // Vector options
            arrowSize: registryOptions.arrowSize,

            // Angle options
            showArc: registryOptions.showArc,

            // Label options
            fontSize: registryOptions.fontSize,
            fontColor: registryOptions.fontColor,

            // Plot options
            samples: registryOptions.samples,

            // G2D options
            showGrid: registryOptions.showGrid,
            showGridLines: registryOptions.showGridLines,
            xMin: registryOptions.xMin,
            xMax: registryOptions.xMax,
            yMin: registryOptions.yMin,
            yMax: registryOptions.yMax,
            xScaleType: registryOptions.xScaleType,
            yScaleType: registryOptions.yScaleType,
            xDivisions: registryOptions.xDivisions,
            yDivisions: registryOptions.yDivisions,
            xLogBase: registryOptions.xLogBase,
            yLogBase: registryOptions.yLogBase,
            xPiMultiplier: registryOptions.xPiMultiplier,
            yPiMultiplier: registryOptions.yPiMultiplier,

            // P2D (polar) options
            rMax: registryOptions.rMax,
            radialLines: registryOptions.radialLines,
            concentricCircles: registryOptions.concentricCircles,
            angleLabels: registryOptions.angleLabels,

            // Ref expression content
            content: registryOptions.content,

            // Table options (registry spreads them at top level, TableExpression expects them under .table)
            table: {
                rows: registryOptions.rows,
                cols: registryOptions.cols,
                headers: registryOptions.headers,
                headerBgColor: registryOptions.headerBgColor,
                cells: registryOptions.cells,
                borderStyle: registryOptions.borderStyle,
                cellPadding: registryOptions.cellPadding,
            },
        };

        const command = expression.toCommand(commandOptions);

        // Some expressions (like def(), fun()) don't produce commands
        if (!command) {
            return null;
        }

        // Apply command options - color from registry takes precedence, then options, then cycling
        const color = registryOptions.color || options.color || getColorByIndex(index);
        command.setColor(color);
        if (label) {
            command.setLabelName(label);
        }
        if (options.showLabel !== undefined) {
            command.setShowLabel(options.showLabel);
        }
        if (options.offsetX !== undefined || options.offsetY !== undefined) {
            command.setLabelOffset(options.offsetX || 0, options.offsetY || 0);
        }
        if (options.expressionId !== undefined) {
            command.setExpressionId(options.expressionId);
        }

        return command;
    }

    /**
     * Process multiple command models in sequence
     * Re-creates ExpressionContext for each batch to handle dependencies
     * @param {Array<CommandModel>} commandModels - Array of command models from CommandEditor
     * @param {ExpressionContext} freshContext - A fresh context (clears variables)
     * @returns {{ commands: BaseCommand[], errors: Array<{index, id, error}>, canPlayInfos: Array<{index, id, canPlay}>, context: ExpressionContext }}
     */
    processCommandList(commandModels, freshContext = new ExpressionContext()) {
        const result = {
            commands: [],
            errors: [],
            canPlayInfos: [],
            context: freshContext
        };

        // Initialize registry from persisted command model options
        commandModels.forEach((cmdModel) => {
            if (cmdModel.id) {
                // Load top-level style options from command model into registry
                const styleOptions = {};
                if (cmdModel.color != null) styleOptions.color = cmdModel.color;
                if (cmdModel.fillColor != null) styleOptions.fillColor = cmdModel.fillColor;
                if (cmdModel.strokeWidth != null) styleOptions.strokeWidth = cmdModel.strokeWidth;
                if (cmdModel.strokeOpacity != null) styleOptions.strokeOpacity = cmdModel.strokeOpacity;
                if (cmdModel.fillOpacity != null) styleOptions.fillOpacity = cmdModel.fillOpacity;

                if (Object.keys(styleOptions).length > 0) {
                    ExpressionOptionsRegistry.setById(cmdModel.id, styleOptions);
                }

                // Load expression-specific options from command model into registry
                if (cmdModel.expressionOptions) {
                    Object.entries(cmdModel.expressionOptions).forEach(([expType, options]) => {
                        if (options && Object.keys(options).length > 0) {
                            ExpressionOptionsRegistry.setExpressionOptions(cmdModel.id, expType, options);
                        }
                    });
                }
            }
        });

        commandModels.forEach((cmdModel, index) => {
            const processResult = this.processExpression(
                cmdModel.expression,
                freshContext,
                {
                    color: cmdModel.color,
                    label: cmdModel.label ? cmdModel.text : '',
                    showLabel: cmdModel.label,
                    offsetX: cmdModel.offsetX,
                    offsetY: cmdModel.offsetY,
                    expressionId: cmdModel.id
                    // Note: expression-specific options are now fetched from ExpressionOptionsRegistry by ID
                },
                index  // Pass index for color cycling
            );

            if (processResult.error) {
                result.errors.push({
                    index,
                    id: cmdModel.id,
                    error: processResult.error
                });
            }

            // Track canPlay info for each command
            result.canPlayInfos.push({
                index,
                id: cmdModel.id,
                canPlay: processResult.canPlay
            });

            if (processResult.command) {
                result.commands.push(processResult.command);
            }
        });

        return result;
    }
}
