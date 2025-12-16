/**
 * BaseVisibilityExpression - Base class for visibility expressions (hide, show, fadein, fadeout)
 *
 * These expressions take one or more variable references to shapes
 * and produce commands that control their visibility.
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';

export class BaseVisibilityExpression extends AbstractNonArithmeticExpression {
    static NAME = 'visibility';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.resolvedShapes = [];  // Array of resolved shape objects
        this.shapeVariableNames = [];  // Variable names for debugging
    }

    /**
     * Resolve all shape references
     * @param {ExpressionContext} context
     */
    resolve(context) {
        if (this.subExpressions.length === 0) {
            this.dispatchError(`${this.getName()}() needs at least one shape.\nUsage: ${this.getName()}(shape1, shape2, ...)`);
        }

        this.resolvedShapes = [];
        this.shapeVariableNames = [];

        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);
            const resolved = this._getResolvedExpression(context, subExpr);

            if (!resolved) {
                this.dispatchError(`${this.getName()}(): Could not resolve shape argument.`);
            }

            // Store the resolved expression - the command will look up the actual shape
            // from the shapeRegistry at init time
            this.resolvedShapes.push(resolved);

            // Try to get the variable name for registry lookup
            if (subExpr.variableName) {
                this.shapeVariableNames.push(subExpr.variableName);
            } else if (resolved.variableName) {
                this.shapeVariableNames.push(resolved.variableName);
            } else {
                // Generate a temp name - the shape might be inline (rare case)
                this.shapeVariableNames.push(null);
            }
        }
    }

    getName() {
        return this.constructor.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Subclasses override this to return the appropriate command class
     */
    getCommandClass() {
        throw new Error('Subclass must implement getCommandClass()');
    }

    /**
     * Create the visibility command
     * Note: The command will resolve shapes from shapeRegistry at init time
     */
    toCommand() {
        const CommandClass = this.getCommandClass();
        // Pass variable names - command will look up actual shapes from registry
        return new CommandClass(this.shapeVariableNames);
    }

    canPlay() {
        return true;
    }
}
