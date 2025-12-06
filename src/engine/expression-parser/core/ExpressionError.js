/**
 * Custom error class for expression evaluation errors
 */
export class ExpressionError extends Error {
    constructor(expressionId, expressionType, message) {
        super(message);
        this.name = 'ExpressionError';
        this.expressionId = expressionId;
        this.expressionType = expressionType;
        this.message = message;
    }
}
