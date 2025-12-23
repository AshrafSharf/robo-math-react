/**
 * ChangeExpression - Unified animation for scalars, points, lines, vectors
 *
 * Syntax:
 *   change(var, target)         // 2 args: animate from current value to target
 *   change(var, from, to)       // 3 args: animate from explicit value to target
 *
 * Examples:
 *   change(A, 10)                              // scalar: current → 10
 *   change(A, 5, 10)                           // scalar: 5 → 10
 *   change(P, point(G, 8, 8))                  // point: current → (8,8)
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

        // Determine from/to based on argument count
        let fromExprResolved;
        if (this.subExpressions.length >= 3) {
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
            options
        );
    }
}
