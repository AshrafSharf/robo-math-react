/**
 * DependencyTrackingUtil - Utility for finding transitive dependents of a variable
 *
 * Extracted from FromToExpression for reuse across transformation expressions
 * (rotate, translate, scale, and their 3D variants).
 */

/**
 * Get all expressions that depend on a variable, in topological order.
 * Uses Kahn's algorithm to handle diamond dependencies correctly.
 *
 * This is the exact same algorithm used by FromToExpression._getOrderedDependents
 *
 * @param {ExpressionContext} context - The expression context
 * @param {string} variableName - The variable to find dependents of
 * @returns {Array<{expr, label}>} - Ordered list of dependent expressions
 */
export function getOrderedDependents(context, variableName) {
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
            `Circular dependency detected when transforming '${variableName}'. ` +
            `Expressions involved: ${cycleLabels}`
        );
    }

    return order;
}
