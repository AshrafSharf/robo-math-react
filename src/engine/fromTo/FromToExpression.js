/**
 * FromToExpression - Animates a variable value and updates all dependents
 *
 * Syntax: fromTo(variableName, fromValue, toValue)
 *
 * Example:
 *   A = 5
 *   L = line(G, 0, 0, A, 10)
 *   fromTo(A, 5, 15)  // Animates A from 5 to 15, L updates accordingly
 */
import { AbstractNonArithmeticExpression } from '../expression-parser/expressions/AbstractNonArithmeticExpression.js';
import { FromToCommand } from './FromToCommand.js';

export class FromToExpression extends AbstractNonArithmeticExpression {
    static NAME = 'fromTo';

    constructor(subExpressions) {
        super();
        this.variableNameExpr = subExpressions[0];
        this.fromExpr = subExpressions[1];
        this.toExpr = subExpressions[2];

        // Resolved values
        this.variableName = null;
        this.fromValue = null;
        this.toValue = null;
        this.orderedDependents = [];
        this.context = null;
    }

    resolve(context) {
        // Get the variable name
        this.variableName = this.variableNameExpr.getVariableName();

        // Resolve from/to expressions
        this.fromExpr.resolve(context);
        this.toExpr.resolve(context);
        this.fromValue = this.fromExpr.getVariableAtomicValues()[0];
        this.toValue = this.toExpr.getVariableAtomicValues()[0];

        // Get ordered dependents (topological sort for cascading)
        this.orderedDependents = this._getOrderedDependents(context, this.variableName);

        // Store context reference for command
        this.context = context;
    }

    /**
     * Build transitive closure of dependents in topological order using Kahn's algorithm.
     * Ensures expressions with multiple dependencies are only processed after ALL dependencies.
     * @param {ExpressionContext} context
     * @param {string} variableName
     * @returns {Array<{expr: Expression, label: string}>}
     */
    _getOrderedDependents(context, variableName) {
        const allExprs = new Set();
        const exprToLabel = new Map();

        // Phase 1: Collect all dependent expressions transitively
        const collectAll = (varName) => {
            const deps = context.getDependents(varName);
            for (const expr of deps) {
                if (!allExprs.has(expr)) {
                    allExprs.add(expr);
                    const label = typeof expr.getLabel === 'function' ? expr.getLabel() : null;
                    if (label) {
                        exprToLabel.set(expr, label);
                        collectAll(label);
                    }
                }
            }
        };
        collectAll(variableName);

        // Phase 2: Build in-degree map (count dependencies within allExprs)
        const inDegree = new Map();
        for (const expr of allExprs) {
            inDegree.set(expr, 0);
        }

        // Build label -> expr lookup for expressions that assign to variables
        const labelToExpr = new Map();
        for (const expr of allExprs) {
            const label = exprToLabel.get(expr);
            if (label) {
                labelToExpr.set(label, expr);
            }
        }

        // For each expression that assigns to a variable, increment in-degree of its dependents
        for (const expr of allExprs) {
            const label = exprToLabel.get(expr);
            if (label) {
                const deps = context.getDependents(label);
                for (const depExpr of deps) {
                    if (allExprs.has(depExpr)) {
                        inDegree.set(depExpr, inDegree.get(depExpr) + 1);
                    }
                }
            }
        }

        // Phase 3: Kahn's algorithm - process expressions with in-degree 0
        const queue = [];
        for (const expr of allExprs) {
            if (inDegree.get(expr) === 0) {
                queue.push(expr);
            }
        }

        const order = [];
        while (queue.length > 0) {
            const expr = queue.shift();
            order.push({ expr, label: exprToLabel.get(expr) || null });

            // Decrement in-degree of dependents
            const label = exprToLabel.get(expr);
            if (label) {
                const deps = context.getDependents(label);
                for (const depExpr of deps) {
                    if (allExprs.has(depExpr)) {
                        const newDegree = inDegree.get(depExpr) - 1;
                        inDegree.set(depExpr, newDegree);
                        if (newDegree === 0) {
                            queue.push(depExpr);
                        }
                    }
                }
            }
        }

        // Detect cycles: if not all expressions were processed, a cycle exists
        if (order.length < allExprs.size) {
            const unprocessed = [...allExprs].filter(expr => !order.some(o => o.expr === expr));
            const cycleLabels = unprocessed
                .map(expr => exprToLabel.get(expr) || '(unlabeled)')
                .join(', ');
            throw new Error(
                `Circular dependency detected when animating '${variableName}'. ` +
                `Expressions involved: ${cycleLabels}`
            );
        }

        return order;
    }

    getName() {
        return FromToExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new FromToCommand(
            this.variableName,
            this.fromValue,
            this.toValue,
            this.orderedDependents,
            this.context,
            options
        );
    }

    canPlay() {
        return true;
    }
}
