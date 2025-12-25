/**
 * ChangeExpression - Unified animation for scalars, points, lines, vectors
 *
 * Syntax:
 *   change(var, target)              // 2 args: hides originals by default
 *   change(var, target, false)       // keep original shapes visible
 *   change(var, from, to)            // 3 args: hides originals by default
 *   change(var, from, to, false)     // keep original shapes visible
 *
 * Examples:
 *   change(A, 10)                              // scalar: current → 10
 *   change(A, 5, 10)                           // scalar: 5 → 10
 *   change(P, point(G, 8, 8))                  // point: current → (8,8), hides original
 *   change(P, point(G, 8, 8), false)           // point: current → (8,8), keeps original visible
 *   change(P, point(G, 0, 0), point(G, 8, 8))  // point: (0,0) → (8,8)
 *   change(L, line(G, 0, 0, 5, 5))             // line: current → target
 *   change(V, vector(G, 1, 1, 3, 4))           // vector: current → target
 *
 * Source and target must be the same type.
 */
import { FromToExpression } from '../fromTo/FromToExpression.js';
import { ChangeCommand } from './ChangeCommand.js';
import { strategyRegistry } from './strategies/index.js';

export class ChangeExpression extends FromToExpression {
    static NAME = 'change';

    constructor(subExpressions) {
        super(subExpressions);
        this.subExpressions = subExpressions;
    }

    /**
     * Check if an expression is a boolean literal (variable named 'true' or 'false')
     */
    _isBooleanLiteral(expr) {
        if (expr && expr.getName && expr.getName() === 'variable') {
            const name = expr.getVariableName();
            return name === 'true' || name === 'false';
        }
        return false;
    }

    /**
     * Get boolean value from a variable reference expression
     */
    _getBooleanValue(expr) {
        return expr.getVariableName() === 'true';
    }

    resolve(context) {
        // Get source variable name and expression
        this.variableName = this.subExpressions[0].getVariableName();

        // Get reference WITHOUT registering as dependent (avoid self-dependency)
        const savedCaller = context.getCaller();
        context.setCaller(null);
        this.sourceExpr = context.getReference(this.variableName);
        context.setCaller(savedCaller);

        if (!this.sourceExpr) {
            throw new Error(`change(): variable '${this.variableName}' not found in context`);
        }

        // Check if last argument is a boolean (true/false)
        const lastArg = this.subExpressions[this.subExpressions.length - 1];
        const hasBoolean = this._isBooleanLiteral(lastArg);

        // Default is true (hide originals), unless explicitly set to false
        this.hideOriginals = hasBoolean ? this._getBooleanValue(lastArg) : true;

        // Determine effective arg count (excluding boolean if present)
        const effectiveArgCount = hasBoolean
            ? this.subExpressions.length - 1
            : this.subExpressions.length;

        // Determine from/to based on argument count
        let fromExprResolved;
        if (effectiveArgCount >= 3) {
            // 3 args: change(var, from, to)
            this.subExpressions[1].resolve(context);
            fromExprResolved = this.subExpressions[1];
            this.subExpressions[2].resolve(context);
            this.targetExpr = this.subExpressions[2];
        } else {
            // 2 args: change(var, target) - use current value as from
            fromExprResolved = this.sourceExpr;
            this.subExpressions[1].resolve(context);
            this.targetExpr = this.subExpressions[1];
        }

        // Select strategy based on source type
        this.strategy = strategyRegistry.getStrategy(this.sourceExpr);

        // Validate type compatibility (throws if incompatible)
        this.strategy.validate(fromExprResolved, this.targetExpr);

        // Get from/to values via strategy
        this.fromValues = this.strategy.getFromValues(fromExprResolved);
        this.toValues = this.strategy.getToValues(this.targetExpr);

        // Build ordered dependents using inherited Kahn's algorithm
        this.orderedDependents = this._getOrderedDependents(context, this.variableName);
        this.context = context;
    }

    getName() {
        return ChangeExpression.NAME;
    }

    toCommand(options = {}) {
        return new ChangeCommand(
            this.variableName,
            this.sourceExpr,
            this.fromValues,
            this.toValues,
            this.strategy,
            this.orderedDependents,
            this.context,
            this.hideOriginals,
            options
        );
    }
}
