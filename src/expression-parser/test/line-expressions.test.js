/**
 * Test line expressions
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

describe('Line Expressions', () => {
    test('Line from two points', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [createPoint(0, 0), createPoint(10, 10)]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        assert.arrayEqual(line.getVariableAtomicValues(), [0, 0, 10, 10]);
        assert.arrayEqual(line.getStartValue(), [0, 0]);
        assert.arrayEqual(line.getEndValue(), [10, 10]);
    });

    test('Line from 4 numeric values', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [
                { name: 'numeric', value: 5 },
                { name: 'numeric', value: 5 },
                { name: 'numeric', value: 15 },
                { name: 'numeric', value: 5 }
            ]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        assert.arrayEqual(line.getVariableAtomicValues(), [5, 5, 15, 5]);
        assert.equal(line.getSlope(), 0); // Horizontal line
    });

    test('Vertical line has infinite slope', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [createPoint(10, 0), createPoint(10, 20)]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        assert.equal(line.getSlope(), Infinity);
    });

    test('Line length calculation', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [createPoint(0, 0), createPoint(3, 4)]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        assert.equal(line.length(), 5); // 3-4-5 triangle
    });

    test('Line midpoint', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [createPoint(0, 0), createPoint(10, 10)]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        const midpoint = line.getMidpoint();
        assert.equal(midpoint.x, 5);
        assert.equal(midpoint.y, 5);
    });

    test('Line extension (positive)', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [
                { name: 'numeric', value: 0 },
                { name: 'numeric', value: 0 },
                { name: 'numeric', value: 3 },
                { name: 'numeric', value: 4 },
                { name: 'numeric', value: 5 } // extend by 5
            ]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        assert.arrayEqual(line.getVariableAtomicValues(), [0, 0, 6, 8]);
        assert.equal(line.length(), 10); // Original 5 + extension 5
    });

    test('Line extension (negative)', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [
                { name: 'numeric', value: 0 },
                { name: 'numeric', value: 0 },
                { name: 'numeric', value: 3 },
                { name: 'numeric', value: 4 },
                { name: 'numeric', value: -5 } // extend backwards
            ]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        assert.arrayEqual(line.getVariableAtomicValues(), [-3, -4, 3, 4]);
        assert.equal(line.length(), 10);
    });

    test('Line in variable', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        interpreter.evalExpression({
            name: 'assignment',
            args: [
                { name: 'string', value: 'myLine' },
                {
                    name: 'line',
                    args: [createPoint(0, 0), createPoint(5, 5)]
                }
            ]
        }).resolve(context);

        const useLine = interpreter.evalExpression({ name: 'string', value: 'myLine' });
        useLine.resolve(context);

        assert.arrayEqual(useLine.getVariableAtomicValues(), [0, 0, 5, 5]);
    });

    test('Line vector', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        const lineAST = {
            name: 'line',
            args: [createPoint(1, 2), createPoint(4, 6)]
        };
        const line = interpreter.evalExpression(lineAST);
        line.resolve(context);

        const vector = line.asVector();
        assert.equal(vector.x, 3);
        assert.equal(vector.y, 4);
    });
});

printSummary();
