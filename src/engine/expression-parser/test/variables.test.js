/**
 * Test variable assignment and references
 */

import {
    ExpressionInterpreter,
    ExpressionContext,
    IntrepreterFunctionTable
} from '../index.js';
import { describe, test, assert, printSummary } from './test-framework.js';

// Initialize
IntrepreterFunctionTable.populateFunctionTable();

describe('Variable Assignment and Reference', () => {
    test('Simple variable assignment', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const assignX = {
            name: 'assignment',
            args: [
                { name: 'string', value: 'x' },
                { name: 'numeric', value: 42 }
            ]
        };
        interpreter.evalExpression(assignX).resolve(context);

        const useX = { name: 'string', value: 'x' };
        const xResult = interpreter.evalExpression(useX);
        xResult.resolve(context);

        assert.arrayEqual(xResult.getVariableAtomicValues(), [42]);
    });

    test('Variable in expression', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [
                { name: 'string', value: 'x' },
                { name: 'numeric', value: 42 }
            ]
        }).resolve(context);

        const exprWithVar = {
            name: '+',
            args: [
                { name: 'string', value: 'x' },
                { name: 'numeric', value: 10 }
            ]
        };
        const exprResult = interpreter.evalExpression(exprWithVar);
        exprResult.resolve(context);

        assert.arrayEqual(exprResult.getVariableAtomicValues(), [52]);
    });

    test('Multiple variables', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [{ name: 'string', value: 'x' }, { name: 'numeric', value: 6 }]
        }).resolve(context);

        interpreter.evalExpression({
            name: 'assignment',
            args: [{ name: 'string', value: 'y' }, { name: 'numeric', value: 7 }]
        }).resolve(context);

        const multiVarExpr = {
            name: '*',
            args: [
                { name: 'string', value: 'x' },
                { name: 'string', value: 'y' }
            ]
        };
        const result = interpreter.evalExpression(multiVarExpr);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [42]);
    });

    test('Variable reassignment', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [{ name: 'string', value: 'x' }, { name: 'numeric', value: 10 }]
        }).resolve(context);

        interpreter.evalExpression({
            name: 'assignment',
            args: [{ name: 'string', value: 'x' }, { name: 'numeric', value: 100 }]
        }).resolve(context);

        const result = interpreter.evalExpression({ name: 'string', value: 'x' });
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [100]);
    });

    test('Expression assignment', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [
                { name: 'string', value: 'z' },
                {
                    name: '+',
                    args: [
                        { name: 'numeric', value: 5 },
                        { name: 'numeric', value: 3 }
                    ]
                }
            ]
        }).resolve(context);

        const result = interpreter.evalExpression({ name: 'string', value: 'z' });
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [8]);
    });

    test('Power with variables', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [{ name: 'string', value: 'base' }, { name: 'numeric', value: 2 }]
        }).resolve(context);

        const powerExpr = {
            name: '^',
            args: [
                { name: 'string', value: 'base' },
                { name: 'numeric', value: 10 }
            ]
        };
        const result = interpreter.evalExpression(powerExpr);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [1024]);
    });

    test('Get all variables from context', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [{ name: 'string', value: 'a' }, { name: 'numeric', value: 10 }]
        }).resolve(context);

        interpreter.evalExpression({
            name: 'assignment',
            args: [{ name: 'string', value: 'b' }, { name: 'numeric', value: 20 }]
        }).resolve(context);

        const allRefs = context.getReferencesCopyAsPrimitiveValues();

        assert.equal(allRefs.a, 10);
        assert.equal(allRefs.b, 20);
    });
});

printSummary();
