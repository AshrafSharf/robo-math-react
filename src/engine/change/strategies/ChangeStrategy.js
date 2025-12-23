/**
 * Base strategy interface for change animation
 *
 * Each strategy handles a specific expression type (scalar, point, line, vector, etc.)
 */
export class ChangeStrategy {
    /**
     * Validate that source and target are compatible
     * @param {Expression} sourceExpr - Source expression from context
     * @param {Expression} targetExpr - Target expression to animate to
     * @throws {Error} if types are incompatible
     */
    validate(sourceExpr, targetExpr) {
        throw new Error('Subclass must implement validate()');
    }

    /**
     * Get the "from" values from source expression
     * @param {Expression} sourceExpr - Source expression
     * @returns {Array<number>} Array of numeric values
     */
    getFromValues(sourceExpr) {
        throw new Error('Subclass must implement getFromValues()');
    }

    /**
     * Get the "to" values from target expression
     * @param {Expression} targetExpr - Target expression
     * @returns {Array<number>} Array of numeric values
     */
    getToValues(targetExpr) {
        throw new Error('Subclass must implement getToValues()');
    }

    /**
     * Create a new expression with interpolated values and update context
     * @param {ExpressionContext} context - Expression context
     * @param {string} variableName - Variable name to update
     * @param {Array<number>} values - Interpolated values
     * @param {Expression} sourceExpr - Original source expression (for graphExpression, etc.)
     */
    updateContext(context, variableName, values, sourceExpr) {
        throw new Error('Subclass must implement updateContext()');
    }
}
