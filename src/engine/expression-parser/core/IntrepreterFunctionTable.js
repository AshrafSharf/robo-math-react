/**
 * Interpreter Function Table - populates the expression table with all available functions
 */
import { ExpressionInterpreter } from './ExpressionInterpreter.js';
import { NumericExpression } from '../expressions/NumericExpression.js';
import { PointExpression } from '../expressions/PointExpression.js';
import { LineExpression } from '../expressions/LineExpression.js';
import { ArcExpression } from '../expressions/ArcExpression.js';
import { VariableReferenceExpression } from '../expressions/VariableReferenceExpression.js';
import { AssignmentExpression } from '../expressions/AssignmentExpression.js';
import { AdditionExpression } from '../expressions/AdditionExpression.js';
import { SubtractionExpression } from '../expressions/SubtractionExpression.js';
import { MultiplicationExpression } from '../expressions/MultiplicationExpression.js';
import { DivisionExpression } from '../expressions/DivisionExpression.js';
import { PowerExpression } from '../expressions/PowerExpression.js';
import { resolveExpressionDependencies } from './ExpressionDependencyResolver.js';
import { registerCustomFunctions } from './CustomFunctionDefinitions.js';

export class IntrepreterFunctionTable {
    constructor() {}

    /**
     * Populate the function table with all available expressions
     */
    static populateFunctionTable() {
        // Resolve circular dependencies between expression classes
        resolveExpressionDependencies();

        // Helper: register binary expression (lhs op rhs)
        const registerBinary = (symbol, ExprClass) => {
            ExpressionInterpreter.expTable[symbol] = (e) =>
                new ExprClass(e.args[0], e.args[1]);
        };

        // Arithmetic operators
        registerBinary('*', MultiplicationExpression);
        registerBinary('/', DivisionExpression);
        registerBinary('+', AdditionExpression);
        registerBinary('-', SubtractionExpression);
        registerBinary('^', PowerExpression);
        registerBinary('assignment', AssignmentExpression);

        // Helper: register unary expression (single arg)
        const registerUnary = (symbol, ExprClass) => {
            ExpressionInterpreter.expTable[symbol] = (e) =>
                new ExprClass(e.args[0]);
        };

        // Helper: register expression that takes all args
        const registerMultiArg = (symbol, ExprClass) => {
            ExpressionInterpreter.expTable[symbol] = (e) => new ExprClass(e.args);
        };

        // Primitives
        registerUnary('string', VariableReferenceExpression);
        registerUnary('numeric', NumericExpression);

        // Geometry expressions
        registerMultiArg('point', PointExpression);
        registerMultiArg('line', LineExpression);
        registerMultiArg('arc', ArcExpression);

        // Custom functions (math, utility, etc.)
        registerCustomFunctions(ExpressionInterpreter.expTable);
    }
}
