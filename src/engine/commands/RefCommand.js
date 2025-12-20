/**
 * RefCommand - Command that executes expression content from Settings panel
 *
 * Parses and executes the ref content string during init().
 * Delegates all rendering to the inner command created from the parsed expression.
 */
import { BaseCommand } from './BaseCommand.js';
import { parse } from '../expression-parser/parser/index.js';
import { ExpressionInterpreter } from '../expression-parser/core/ExpressionInterpreter.js';

export class RefCommand extends BaseCommand {
    /**
     * Create a ref command
     * @param {string} refContent - Expression string from Ref tab
     * @param {Object} options - Command options (style, etc.)
     */
    constructor(refContent, options = {}) {
        super();
        this.refContent = refContent;
        this.options = options;
        this.innerCommand = null;
        this.innerExpression = null;
        this.interpreter = new ExpressionInterpreter();
    }

    /**
     * Parse and execute ref content
     * @returns {Promise}
     */
    async doInit() {
        // Skip if no content
        if (!this.refContent || this.refContent.trim() === '') {
            return;
        }

        try {
            // 1. Parse the ref content
            const ast = parse(this.refContent);
            if (!ast || ast.length === 0) {
                return;
            }

            // 2. Evaluate AST to Expression
            let expression = this.interpreter.evalExpression(ast[0]);

            // Set expression ID for error reporting
            expression.setExpressionId(this.expressionId);

            // 3. Resolve using the shared expressionContext
            const context = this.commandContext.expressionContext;
            expression.resolve(context);

            this.innerExpression = expression;

            // 5. Store inner expression in context with the outer label (e.g., g = ref() stores g2d as 'g')
            // This allows subsequent expressions like point(g, 2, 3) to resolve 'g'
            if (this.labelName && expression) {
                context.addReference(this.labelName, expression);
            }

            // 6. Create inner command if expression has toCommand method
            if (typeof expression.toCommand === 'function') {
                this.innerCommand = expression.toCommand(this.options);

                if (this.innerCommand) {
                    // Transfer properties to inner command
                    this.innerCommand.setColor(this.color);
                    this.innerCommand.setLabelName(this.labelName);
                    this.innerCommand.setShowLabel(this.showLabel);
                    this.innerCommand.setLabelOffset(this.labelOffsetX, this.labelOffsetY);
                    this.innerCommand.setExpressionId(this.expressionId);
                    this.innerCommand.diagram2d = this.diagram2d;

                    // Initialize inner command
                    await this.innerCommand.init(this.commandContext);

                    // Copy result for registry
                    this.commandResult = this.innerCommand.commandResult;
                }
            }
        } catch (error) {
            // Attach expression ID for error display
            error.expressionId = this.expressionId;
            throw error;
        }
    }

    /**
     * Get the inner expression's type name (for dynamic styling)
     * @returns {string|null}
     */
    getInnerExpressionName() {
        return this.innerExpression?.getName?.() || null;
    }

    /**
     * Play animation - delegate to inner command
     * @returns {Promise}
     */
    async doPlay() {
        if (this.innerCommand) {
            return this.innerCommand.doPlay();
        }
    }

    /**
     * Direct play - delegate to inner command
     */
    doDirectPlay() {
        if (this.innerCommand) {
            this.innerCommand.directPlay();
        }
    }

    /**
     * Replay animation - delegate to inner command
     * @returns {Promise}
     */
    async playSingle() {
        if (this.innerCommand) {
            return this.innerCommand.playSingle();
        }
    }

    /**
     * Clear shapes - delegate to inner command
     */
    clear() {
        if (this.innerCommand) {
            this.innerCommand.clear();
        }
        super.clear();
    }

    /**
     * Get label position - delegate to inner command
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        if (this.innerCommand) {
            return this.innerCommand.getLabelPosition();
        }
        return super.getLabelPosition();
    }
}
