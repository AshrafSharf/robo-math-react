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

export class ExpressionPipelineService {
    constructor() {
        this.interpreter = new ExpressionInterpreter();
    }

    /**
     * Process a single expression string into a Command
     * @param {string} expressionStr - The expression string (e.g., "point(0,0)")
     * @param {ExpressionContext} context - Context for variable resolution
     * @param {Object} options - Command options {color, label, showLabel, offsetX, offsetY, expressionId}
     * @returns {{ command: BaseCommand|null, expression: Expression|null, error: Error|null, label: string }}
     */
    processExpression(expressionStr, context, options = {}) {
        const result = {
            command: null,
            expression: null,
            error: null,
            label: ''
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

            // 3. Resolve variables in context
            expression.resolve(context);

            // 4. Handle assignment expressions (variable binding)
            if (expression instanceof AssignmentExpression) {
                result.label = expression.getLabel();

                // Get the RHS expression for command creation
                const rhsExpression = expression.getComparableExpression();

                // Only create command if RHS has toCommand method
                if (rhsExpression && typeof rhsExpression.toCommand === 'function') {
                    result.command = this._createCommand(rhsExpression, options, result.label);
                }
            } else {
                // Non-assignment: create command directly if toCommand exists
                if (typeof expression.toCommand === 'function') {
                    result.command = this._createCommand(expression, options, options.label || '');
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
     */
    _createCommand(expression, options, label) {
        const command = expression.toCommand({
            radius: options.radius,
            strokeWidth: options.strokeWidth
        });

        // Apply command options
        if (options.color) {
            command.setColor(options.color);
        }
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
     * @returns {{ commands: BaseCommand[], errors: Array<{index, id, error}>, context: ExpressionContext }}
     */
    processCommandList(commandModels, freshContext = new ExpressionContext()) {
        const result = {
            commands: [],
            errors: [],
            context: freshContext
        };

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
                }
            );

            if (processResult.error) {
                result.errors.push({
                    index,
                    id: cmdModel.id,
                    error: processResult.error
                });
            }

            if (processResult.command) {
                result.commands.push(processResult.command);
            }
        });

        return result;
    }
}
