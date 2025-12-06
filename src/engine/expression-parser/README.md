# Expression Parser Module

A standalone ES6 module for parsing and evaluating mathematical expressions. Migrated from the robocompass-source project without graphics dependencies.

## Features

- **String Parsing**: Parse string expressions like `"line(0, 0, 10, 10)"` to AST using compass-parser
- **Pure JavaScript**: No external dependencies, uses plain JavaScript objects
- **Expression Evaluation**: Supports arithmetic operations, variables, and function calls
- **Point Operations**: Built-in support for 2D point arithmetic using simple `{x, y}` objects
- **Line Operations**: Built-in support for line operations and calculations
- **Extensible**: Easy to add new expression types and functions

## Quick Start

### Option 1: Parse String Expressions

```javascript
import {
    parse,
    ExpressionInterpreter,
    ExpressionContext,
    IntrepreterFunctionTable
} from './expression-parser';

// Initialize the function table (must be called once)
IntrepreterFunctionTable.populateFunctionTable();

// Create an interpreter and context
const interpreter = new ExpressionInterpreter();
const context = new ExpressionContext();

// Parse string expression to AST
const input = 'line(point(0, 0), point(10, 10))';
const ast = parse(input);

// Evaluate AST to expression object
const lineExpr = interpreter.evalExpression(ast[0]);
lineExpr.resolve(context);

// Get the line values
console.log(lineExpr.getVariableAtomicValues()); // [0, 0, 10, 10]
console.log(lineExpr.length()); // 14.142135623730951 (sqrt(200))

// More examples:
const ast2 = parse('A = point(3, 4)');
interpreter.evalExpression(ast2[0]).resolve(context);

const ast3 = parse('line(A, point(6, 8))');
const line2 = interpreter.evalExpression(ast3[0]);
line2.resolve(context);
console.log(line2.length()); // 5 (3-4-5 triangle)
```

### Option 2: Create AST Manually

```javascript
import {
    ExpressionInterpreter,
    ExpressionContext,
    IntrepreterFunctionTable
} from './expression-parser';

// Initialize the function table (must be called once)
IntrepreterFunctionTable.populateFunctionTable();

// Create an interpreter and context
const interpreter = new ExpressionInterpreter();
const context = new ExpressionContext();

// Example 1: Evaluate a numeric expression
const numericAST = { name: 'numeric', value: 42 };
const result = interpreter.evalExpression(numericAST);
result.resolve(context);
console.log(result.getVariableAtomicValues()); // [42]

// Example 2: Evaluate a point
const pointAST = {
    name: 'point',
    args: [
        { name: 'numeric', value: 10 },
        { name: 'numeric', value: 20 }
    ]
};
const point = interpreter.evalExpression(pointAST);
point.resolve(context);
console.log(point.getVariableAtomicValues()); // [10, 20]

// Example 3: Variable assignment
const assignmentAST = {
    name: 'assignment',
    args: [
        { name: 'string', value: 'x' },
        { name: 'numeric', value: 5 }
    ]
};
const assignment = interpreter.evalExpression(assignmentAST);
assignment.resolve(context);

// Example 4: Use the variable
const variableAST = { name: 'string', value: 'x' };
const varRef = interpreter.evalExpression(variableAST);
varRef.resolve(context);
console.log(varRef.getVariableAtomicValues()); // [5]

// Example 5: Addition
const addAST = {
    name: '+',
    args: [
        { name: 'numeric', value: 10 },
        { name: 'numeric', value: 5 }
    ]
};
const sum = interpreter.evalExpression(addAST);
sum.resolve(context);
console.log(sum.getVariableAtomicValues()); // [15]

// Example 6: Math functions
const sqrtAST = {
    name: 'sqrt',
    args: [
        { name: 'numeric', value: 16 }
    ]
};
const sqrtResult = interpreter.evalExpression(sqrtAST);
sqrtResult.resolve(context);
console.log(sqrtResult.getVariableAtomicValues()); // [4]
```

## Supported Operations

### Arithmetic Operators
- `+` Addition
- `-` Subtraction
- `*` Multiplication
- `/` Division
- `^` Power

### Expression Types
- `numeric` - Numeric values
- `point` - 2D points (x, y)
- `string` - Variable references
- `assignment` - Variable assignments

### Math Functions
- Trigonometric: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`
- Exponential: `exp`, `log`, `sqrt`
- Rounding: `floor`, `ceil`, `round`, `abs`
- Comparison: `min`, `max`

## Architecture

The module is organized into:

- `parser/` - Compass parser (ported from robocompass-source) for parsing string expressions to AST
  - `compass-parser.js` - **Generated file (DO NOT MODIFY)** - PEG.js generated parser
  - `compassgrammar.pegjs` - Parser grammar definition (for reference)
  - `index.js` - ES6 wrapper for the parser
- `core/` - Core interpreter and context classes
- `expressions/` - All expression type implementations
- `utils/` - Utility functions
- `test/` - Comprehensive test suite

## Key Differences from Original

This version removes all graphics-specific dependencies:
- No `away.geom.Point` - uses plain `{x, y}` objects
- No `robo.core.*` transformable interfaces
- No `robo.geom.GraphSheet3D` dependency
- No `robo.util.PMath` - replaced with built-in `MathUtils`

## Testing

The module includes a comprehensive test suite with proper assertions:

```bash
# Run all tests
npm run test:expressions

# Or directly
./src/expression-parser/test/run-tests.sh

# Run individual test files
node src/expression-parser/test/variables.test.js
node src/expression-parser/test/point-operations.test.js
node src/expression-parser/test/math-functions.test.js
node src/expression-parser/test/line-expressions.test.js
```

**Test Coverage:**
- 51 total tests across 5 test suites
- Parsing (string to AST to expression) (17 tests)
- Variables and expressions (7 tests)
- Point operations (7 tests)
- Math functions (11 tests)
- Line expressions (9 tests)

All tests include proper assertions with pass/fail reporting and color-coded output.

See [test/README.md](./test/README.md) for more details on writing tests.

## License

Migrated from robocompass-source project.
