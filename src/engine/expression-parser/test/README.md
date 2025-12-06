# Expression Parser Tests

This folder contains a complete test suite for the expression-parser module with proper assertions and test framework.

## Test Framework

The tests use a custom lightweight test framework (`test-framework.js`) that provides:
- **Assertions**: `assert.equal()`, `assert.arrayEqual()`, `assert.closeTo()`, `assert.throws()`, etc.
- **Test organization**: `describe()` for test suites, `test()` for individual tests
- **Color-coded output**: Green for passing tests, red for failures
- **Pass/fail reporting**: Complete summary of test results

## Running Tests

### Run All Tests
```bash
# Using npm
npm run test:expressions

# Or directly
./src/expression-parser/test/run-tests.sh
```

### Run Individual Test Files
```bash
node src/expression-parser/test/variables.test.js
node src/expression-parser/test/point-operations.test.js
node src/expression-parser/test/math-functions.test.js
node src/expression-parser/test/line-expressions.test.js
```

## Test Files

### parsing.test.js
Tests parsing string expressions to AST and evaluating them (13 tests):
- String to AST parsing (point, line, assignment, arithmetic)
- Full pipeline: string -> AST -> expression -> values
- Parsing nested expressions
- Parsing multiple expressions
- Error handling for invalid syntax

### variables.test.js
Tests variable assignment and references (7 tests):
- Simple variable assignment
- Variables in expressions
- Multiple variables
- Variable reassignment
- Expression assignment to variables
- Power operations with variables
- Getting all variables from context

### point-operations.test.js
Tests 2D point operations (7 tests):
- Point creation
- Point addition and subtraction
- Scalar multiplication and division
- Complex point expressions
- Points in variables

### math-functions.test.js
Tests all mathematical functions (11 tests):
- Trigonometric: sin, cos, tan
- Exponential: exp, log, sqrt
- Rounding: floor, ceil, round, abs
- Comparison: min, max

### line-expressions.test.js
Tests line expressions (9 tests):
- Line creation from points and numerics
- Line properties (slope, length, midpoint)
- Line extension (positive and negative)
- Lines in variables
- Line as vector

## Writing New Tests

Create a new test file following this pattern:

```javascript
import {
    ExpressionInterpreter,
    ExpressionContext,
    IntrepreterFunctionTable
} from '../index.js';
import { describe, test, assert, printSummary } from './test-framework.js';

// Initialize
IntrepreterFunctionTable.populateFunctionTable();

describe('My Test Suite', () => {
    test('My first test', () => {
        const interpreter = new ExpressionInterpreter();
        const context = new ExpressionContext();

        // Your test code here
        const result = interpreter.evalExpression(/* ... */);
        result.resolve(context);

        // Assertions
        assert.equal(result.getVariableAtomicValues()[0], 42);
    });

    test('Another test', () => {
        // ...
    });
});

printSummary();
```

## Available Assertions

- `assert.ok(value, message)` - Assert value is truthy
- `assert.equal(actual, expected, message)` - Assert strict equality (===)
- `assert.deepEqual(actual, expected, message)` - Assert deep equality for objects/arrays
- `assert.arrayEqual(actual, expected, message)` - Assert array equality
- `assert.closeTo(actual, expected, delta, message)` - Assert approximate equality (for floats)
- `assert.throws(fn, message)` - Assert function throws an error

## Test Output

Tests produce color-coded output:
- ✓ Green checkmarks for passing tests
- ✗ Red X marks for failing tests
- Summary showing total, passed, and failed counts
- Exit code 0 for success, 1 for failures (for CI/CD integration)
