/**
 * Expression Parser Module - ES6
 *
 * A standalone expression parser and evaluator for mathematical expressions
 * Migrated from robocompass-source without graphics dependencies
 *
 * @example
 * import { ExpressionInterpreter, ExpressionContext, IntrepreterFunctionTable } from './expression-parser';
 *
 * // Initialize the function table
 * IntrepreterFunctionTable.populateFunctionTable();
 *
 * // Create an interpreter and context
 * const interpreter = new ExpressionInterpreter();
 * const context = new ExpressionContext();
 *
 * // Evaluate an expression
 * const ast = { name: 'numeric', value: 42 };
 * const result = interpreter.evalExpression(ast);
 */

// Core classes
export { ExpressionInterpreter } from './core/ExpressionInterpreter.js';
export { ExpressionContext } from './core/ExpressionContext.js';
export { ExpressionError } from './core/ExpressionError.js';
export { IntrepreterFunctionTable } from './core/IntrepreterFunctionTable.js';

// Base expression classes
export { AbstractArithmeticExpression } from './expressions/AbstractArithmeticExpression.js';
export { AbstractNonArithmeticExpression } from './expressions/AbstractNonArithmeticExpression.js';

// Expression types
export { NumericExpression } from './expressions/NumericExpression.js';
export { PointExpression } from './expressions/PointExpression.js';
export { LineExpression } from './expressions/LineExpression.js';
export { VariableReferenceExpression } from './expressions/VariableReferenceExpression.js';
export { AssignmentExpression } from './expressions/AssignmentExpression.js';

// Arithmetic operations
export { AdditionExpression } from './expressions/AdditionExpression.js';
export { SubtractionExpression } from './expressions/SubtractionExpression.js';
export { MultiplicationExpression } from './expressions/MultiplicationExpression.js';
export { DivisionExpression } from './expressions/DivisionExpression.js';
export { PowerExpression } from './expressions/PowerExpression.js';

// Utilities
export { MathUtils } from './utils/MathUtils.js';

// Parser (from robocompass-source)
export { parse, SyntaxError as ParserSyntaxError } from './parser/index.js';
