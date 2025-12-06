/**
 * Test parsing from string expressions to AST to expression objects
 *
 * This test file demonstrates the complete pipeline:
 * 1. Parse string expression to AST using compass-parser
 * 2. Convert AST to expression object using ExpressionInterpreter
 * 3. Resolve the expression to get final values
 */

import { parse } from '../parser/index.js';
import {
    ExpressionInterpreter,
    ExpressionContext,
    IntrepreterFunctionTable
} from '../index.js';
import { describe, test, assert, printSummary } from './test-framework.js';

// Initialize the function table
IntrepreterFunctionTable.populateFunctionTable();

describe('Parser - String to AST', () => {
    test('Parse simple point expression', () => {
        const input = 'point(3, 4)';
        const ast = parse(input);

        assert.equal(ast.length, 1);
        assert.equal(ast[0].name, 'point');
        assert.equal(ast[0].args.length, 2);
        assert.equal(ast[0].args[0].name, 'numeric');
        assert.equal(ast[0].args[0].value, 3);
        assert.equal(ast[0].args[1].name, 'numeric');
        assert.equal(ast[0].args[1].value, 4);
    });

    test('Parse line expression with coordinates', () => {
        const input = 'line(0, 0, 10, 10)';
        const ast = parse(input);

        assert.equal(ast.length, 1);
        assert.equal(ast[0].name, 'line');
        assert.equal(ast[0].args.length, 4);
        assert.equal(ast[0].args[0].value, 0);
        assert.equal(ast[0].args[1].value, 0);
        assert.equal(ast[0].args[2].value, 10);
        assert.equal(ast[0].args[3].value, 10);
    });

    test('Parse line with nested points', () => {
        const input = 'line(point(0, 0), point(5, 5))';
        const ast = parse(input);

        assert.equal(ast.length, 1);
        assert.equal(ast[0].name, 'line');
        assert.equal(ast[0].args.length, 2);
        assert.equal(ast[0].args[0].name, 'point');
        assert.equal(ast[0].args[1].name, 'point');
    });

    test('Parse assignment expression', () => {
        const input = 'A = point(3, 4)';
        const ast = parse(input);

        assert.equal(ast.length, 1);
        assert.equal(ast[0].name, 'assignment');
        assert.equal(ast[0].args[0].name, 'string');
        assert.equal(ast[0].args[0].value, 'A');
        assert.equal(ast[0].args[1].name, 'point');
    });

    test('Parse arithmetic expressions', () => {
        const input = 'point(2+3, 4*2)';
        const ast = parse(input);

        assert.equal(ast[0].name, 'point');
        assert.equal(ast[0].args[0].name, '+');
        assert.equal(ast[0].args[1].name, '*');
    });

    test('Parse multiple expressions', () => {
        const input = 'A = point(0, 0)\nB = point(5, 5)\nline(A, B)';
        const ast = parse(input);

        assert.equal(ast.length, 3);
        assert.equal(ast[0].name, 'assignment');
        assert.equal(ast[1].name, 'assignment');
        assert.equal(ast[2].name, 'line');
    });
});

describe('Parser - Full Pipeline (String -> AST -> Expression -> Values)', () => {
    test('Parse and evaluate simple point', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse string to AST
        const input = 'point(3, 4)';
        const ast = parse(input);

        // Convert AST to expression object
        const pointExpr = interpreter.evalExpression(ast[0]);

        // Resolve to get final values
        pointExpr.resolve(context);

        // Verify the values
        assert.arrayEqual(pointExpr.getVariableAtomicValues(), [3, 4]);
    });

    test('Parse and evaluate line from coordinates', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse: line(0, 0, 10, 10)
        const input = 'line(0, 0, 10, 10)';
        const ast = parse(input);

        // Evaluate AST
        const lineExpr = interpreter.evalExpression(ast[0]);
        lineExpr.resolve(context);

        // Verify
        assert.arrayEqual(lineExpr.getVariableAtomicValues(), [0, 0, 10, 10]);
        assert.arrayEqual(lineExpr.getStartValue(), [0, 0]);
        assert.arrayEqual(lineExpr.getEndValue(), [10, 10]);
    });

    test('Parse and evaluate line from nested points', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse: line(point(0, 0), point(5, 5))
        const input = 'line(point(0, 0), point(5, 5))';
        const ast = parse(input);

        // Evaluate
        const lineExpr = interpreter.evalExpression(ast[0]);
        lineExpr.resolve(context);

        // Verify
        assert.arrayEqual(lineExpr.getVariableAtomicValues(), [0, 0, 5, 5]);
        assert.equal(lineExpr.length(), Math.sqrt(50)); // sqrt(5^2 + 5^2)
    });

    test('Parse and evaluate with arithmetic', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse: point(2+3, 4*2)
        const input = 'point(2+3, 4*2)';
        const ast = parse(input);

        // Evaluate
        const pointExpr = interpreter.evalExpression(ast[0]);
        pointExpr.resolve(context);

        // Verify: should be point(5, 8)
        assert.arrayEqual(pointExpr.getVariableAtomicValues(), [5, 8]);
    });

    test('Parse and evaluate assignment', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse: A = point(10, 20)
        const input = 'A = point(10, 20)';
        const ast = parse(input);

        // Evaluate assignment
        const assignmentExpr = interpreter.evalExpression(ast[0]);
        assignmentExpr.resolve(context);

        // Verify variable is stored in context
        const varExpr = interpreter.evalExpression({ name: 'string', value: 'A' });
        varExpr.resolve(context);
        assert.arrayEqual(varExpr.getVariableAtomicValues(), [10, 20]);
    });

    test('Parse and evaluate multiple expressions with variables', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse multiple lines
        const input = `A = point(0, 0)
B = point(3, 4)
line(A, B)`;
        const ast = parse(input);

        // Evaluate first two assignments
        interpreter.evalExpression(ast[0]).resolve(context);
        interpreter.evalExpression(ast[1]).resolve(context);

        // Evaluate line using the variables
        const lineExpr = interpreter.evalExpression(ast[2]);
        lineExpr.resolve(context);

        // Verify line uses the assigned points
        assert.arrayEqual(lineExpr.getVariableAtomicValues(), [0, 0, 3, 4]);
        assert.equal(lineExpr.length(), 5); // 3-4-5 triangle
    });

    test('Parse and evaluate complex expression', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse: line(point(1+1, 2*2), point(10-5, 8/2))
        const input = 'line(point(1+1, 2*2), point(10-5, 8/2))';
        const ast = parse(input);

        // Evaluate
        const lineExpr = interpreter.evalExpression(ast[0]);
        lineExpr.resolve(context);

        // Verify: line(point(2, 4), point(5, 4))
        assert.arrayEqual(lineExpr.getVariableAtomicValues(), [2, 4, 5, 4]);
        assert.equal(lineExpr.length(), 3); // horizontal line of length 3
    });

    test('Parse and evaluate negative coordinates', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse: point(-3, -4)
        const input = 'point(-3, -4)';
        const ast = parse(input);

        // Evaluate
        const pointExpr = interpreter.evalExpression(ast[0]);
        pointExpr.resolve(context);

        // Verify
        assert.arrayEqual(pointExpr.getVariableAtomicValues(), [-3, -4]);
    });

    test('Parse and evaluate line with extension', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Parse: line(0, 0, 3, 4, 5) - extends line by 5 units
        const input = 'line(0, 0, 3, 4, 5)';
        const ast = parse(input);

        // Evaluate
        const lineExpr = interpreter.evalExpression(ast[0]);
        lineExpr.resolve(context);

        // Original length is 5, extension adds 5 more = 10
        assert.equal(lineExpr.length(), 10);
        assert.arrayEqual(lineExpr.getVariableAtomicValues(), [0, 0, 6, 8]);
    });
});

describe('Parser - Error Handling', () => {
    test('Invalid syntax throws error', () => {
        try {
            parse('point(3, )'); // Missing second argument
            assert.fail('Should have thrown a syntax error');
        } catch (e) {
            assert.ok(e.message.includes('Expected'));
        }
    });

    test('Unclosed parenthesis throws error', () => {
        try {
            parse('point(3, 4');
            assert.fail('Should have thrown a syntax error');
        } catch (e) {
            assert.ok(e.message.includes('Expected'));
        }
    });
});

printSummary();
