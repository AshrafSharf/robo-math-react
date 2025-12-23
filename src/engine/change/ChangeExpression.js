/**
 * ChangeExpression - Unified animation for scalars, points, lines, vectors
 *
 * Syntax: change(sourceVar, target, { duration })
 *
 * Examples:
 *   change(A, 10)                      // scalar
 *   change(P, point(G, 8, 8))          // 2D point
 *   change(P, point3d(G, 4, 5, 6))     // 3D point
 *   change(L, line(G, 0, 0, 5, 5))     // line
 *   change(V, vector(G, 1, 1, 3, 4))   // vector
 *
 * Source and target must be the same type.
 */
import { FromToExpression } from '../fromTo/FromToExpression.js';
import { ChangeCommand } from './ChangeCommand.js';
import { strategyRegistry } from './strategies/index.js';

export class ChangeExpression extends FromToExpression {
    static NAME = 'change';

    resolve(context) {
        // Get source variable name and expression
        this.variableName = this.variableNameExpr.getVariableName();

        // Get reference WITHOUT registering as dependent (avoid self-dependency)
        const savedCaller = context.getCaller();
        context.setCaller(null);
        this.sourceExpr = context.getReference(this.variableName);
        context.setCaller(savedCaller);

        if (!this.sourceExpr) {
            throw new Error(`change(): variable '${this.variableName}' not found in context`);
        }

        // Resolve target expression
        this.fromExpr.resolve(context);
        this.targetExpr = this.fromExpr;

        // Select strategy based on source type
        this.strategy = strategyRegistry.getStrategy(this.sourceExpr);

        // Validate type compatibility (throws if incompatible)
        this.strategy.validate(this.sourceExpr, this.targetExpr);

        // Get from/to values via strategy
        this.fromValues = this.strategy.getFromValues(this.sourceExpr);
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
