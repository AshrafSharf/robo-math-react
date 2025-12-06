/**
 * Test point operations
 */

import {
    ExpressionInterpreter,
    ExpressionContext,
    IntrepreterFunctionTable
} from '../index.js';
import { describe, test, assert, printSummary } from './test-framework.js';

// Initialize
IntrepreterFunctionTable.populateFunctionTable();

function createPoint(x, y) {
    return {
        name: 'point',
        args: [
            { name: 'numeric', value: x },
            { name: 'numeric', value: y }
        ]
    };
}

describe('Point Operations', () => {
    test('Point creation', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const pointAST = createPoint(10, 20);
        const point = interpreter.evalExpression(pointAST);
        point.resolve(context);

        assert.arrayEqual(point.getVariableAtomicValues(), [10, 20]);
        assert.equal(point.getFriendlyToStr(), '(10,20)');
    });

    test('Point addition', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const addAST = {
            name: '+',
            args: [createPoint(10, 20), createPoint(5, 15)]
        };
        const result = interpreter.evalExpression(addAST);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [15, 35]);
    });

    test('Point subtraction', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const subAST = {
            name: '-',
            args: [createPoint(10, 20), createPoint(5, 15)]
        };
        const result = interpreter.evalExpression(subAST);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [5, 5]);
    });

    test('Scalar multiplication', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const mulAST = {
            name: '*',
            args: [createPoint(3, 4), { name: 'numeric', value: 2 }]
        };
        const result = interpreter.evalExpression(mulAST);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [6, 8]);
    });

    test('Scalar division', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const divAST = {
            name: '/',
            args: [createPoint(10, 20), { name: 'numeric', value: 5 }]
        };
        const result = interpreter.evalExpression(divAST);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [2, 4]);
    });

    test('Complex point expression', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const complexAST = {
            name: '/',
            args: [
                {
                    name: '+',
                    args: [createPoint(10, 20), createPoint(5, 5)]
                },
                { name: 'numeric', value: 2 }
            ]
        };
        const result = interpreter.evalExpression(complexAST);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [7.5, 12.5]);
    });

    test('Point in variable', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [
                { name: 'string', value: 'origin' },
                createPoint(0, 0)
            ]
        }).resolve(context);

        const useVarAST = {
            name: '+',
            args: [
                { name: 'string', value: 'origin' },
                createPoint(10, 10)
            ]
        };
        const result = interpreter.evalExpression(useVarAST);
        result.resolve(context);

        assert.arrayEqual(result.getVariableAtomicValues(), [10, 10]);
    });
});

printSummary();
