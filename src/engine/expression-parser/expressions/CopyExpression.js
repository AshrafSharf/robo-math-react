/**
 * CopyExpression - copies expressions from another page
 *
 * Syntax:
 *   copy("Page 1", 1, 2, 3)  - copy expressions at indices 1, 2, 3 from "Page 1"
 *   copy(1, ALL)             - copy all expressions from page 1
 *
 * The copied expressions are executed (directPlay) but don't appear in the command editor UI.
 * Only previous pages can be copied from (to avoid circular dependencies).
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CopyCommand } from '../../commands/CopyCommand.js';

export class CopyExpression extends AbstractNonArithmeticExpression {
    static NAME = 'copy';

    /**
     * @param {Expression} pageRefExpr - Expression for page name (string) or page number
     * @param {Expression[]|'ALL'} indicesExpr - Array of index expressions or 'ALL'
     */
    constructor(pageRefExpr, indicesExpr) {
        super();
        this.pageRefExpr = pageRefExpr;
        this.indicesExpr = indicesExpr;
        this.resolvedPageRef = null;
        this.resolvedIndices = null;
        this.childCommands = [];
    }

    getName() {
        return CopyExpression.NAME;
    }

    resolve(context) {
        // Resolve page reference expression
        this.pageRefExpr.resolve(context);

        // Extract page reference value
        if (this.pageRefExpr.getName() === 'quotedstring') {
            this.resolvedPageRef = this.pageRefExpr.quotedComment;
        } else if (this.pageRefExpr.getName() === 'number') {
            this.resolvedPageRef = this.pageRefExpr.getNumericValue();
        } else {
            this.dispatchError('Page reference must be a string or number');
        }

        // Resolve indices
        if (this.indicesExpr === 'ALL') {
            this.resolvedIndices = 'ALL';
        } else {
            this.resolvedIndices = [];
            for (const indexExpr of this.indicesExpr) {
                indexExpr.resolve(context);
                if (indexExpr.getName() === 'number') {
                    this.resolvedIndices.push(indexExpr.getNumericValue());
                } else {
                    this.dispatchError('Index must be a number');
                }
            }
        }

        // Validate context has pages
        if (!context.pages || context.pages.length === 0) {
            this.dispatchError('No pages available for copy');
        }

        // Find the referenced page
        const page = this._findPage(context.pages, context.currentPageIndex);
        if (!page) {
            this.dispatchError(`Page not found: ${this.resolvedPageRef}`);
        }

        // Get command models from the page
        const models = this._getCommandModels(page.commands);

        // Validate we have something to copy
        if (models.length === 0) {
            return; // No-op if nothing to copy
        }

        // Validate pipeline service is available
        if (!context.pipelineService) {
            this.dispatchError('Pipeline service not available for copy resolution');
        }

        // Process each expression through the pipeline
        for (const model of models) {
            if (!model.expression || model.expression.trim() === '') {
                continue;
            }

            const result = context.pipelineService.processExpression(
                model.expression,
                context,
                {
                    expressionId: model.id
                }
            );

            if (result.error) {
                // Skip expressions that error, or we could collect errors
                console.warn(`Copy: skipping expression due to error: ${result.error.message}`);
                continue;
            }

            if (result.command) {
                this.childCommands.push(result.command);
            }
        }
    }

    /**
     * Find page by name or number
     * Only allows previous pages (index < currentPageIndex)
     */
    _findPage(pages, currentPageIndex) {
        let targetPage = null;
        let targetIndex = -1;

        if (typeof this.resolvedPageRef === 'number') {
            // Page number is 1-based
            targetIndex = this.resolvedPageRef - 1;
            targetPage = pages[targetIndex];
        } else if (typeof this.resolvedPageRef === 'string') {
            // Find by name
            targetIndex = pages.findIndex(p => p.name === this.resolvedPageRef);
            targetPage = targetIndex >= 0 ? pages[targetIndex] : null;
        }

        // Validate it's a previous page
        if (targetPage && targetIndex >= currentPageIndex) {
            this.dispatchError(`Cannot copy from current or future page: ${this.resolvedPageRef}`);
            return null;
        }

        return targetPage;
    }

    /**
     * Get command models based on indices
     */
    _getCommandModels(commands) {
        if (!commands || commands.length === 0) {
            return [];
        }

        if (this.resolvedIndices === 'ALL') {
            return commands;
        }

        // Filter by 1-based indices
        return commands.filter((_, i) => this.resolvedIndices.includes(i + 1));
    }

    /**
     * Create CopyCommand with the resolved child commands
     * Apply styling from the copy command to all children
     */
    toCommand(options = {}) {
        // Apply copy command's styling to all child commands
        this.childCommands.forEach(cmd => {
            if (options.color) {
                cmd.setColor(options.color);
            }
        });

        return new CopyCommand(this.childCommands);
    }

    /**
     * Copy expressions can be played
     */
    canPlay() {
        return true;
    }

    getVariableAtomicValues() {
        return [];
    }
}
