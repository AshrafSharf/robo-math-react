/**
 * Expression Dependency Resolver
 *
 * Handles circular dependency resolution between expression classes.
 * This is necessary because some expressions need to reference each other
 * (e.g., arithmetic expressions may return either NumericExpression or PointExpression).
 */
import { AbstractArithmeticExpression } from '../expressions/AbstractArithmeticExpression.js';
import { NumericExpression } from '../expressions/NumericExpression.js';
import { PointExpression } from '../expressions/PointExpression.js';

/**
 * Resolve circular dependencies between expression classes
 * Must be called before expressions are used
 */
export function resolveExpressionDependencies() {
    // AbstractArithmeticExpression needs to create NumericExpression/PointExpression results
    AbstractArithmeticExpression.NumericExpression = NumericExpression;
    AbstractArithmeticExpression.PointExpression = PointExpression;

    // NumericExpression needs PointExpression for point arithmetic
    NumericExpression.PointExpression = PointExpression;
}
