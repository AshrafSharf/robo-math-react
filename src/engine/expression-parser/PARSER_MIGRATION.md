# Parser Migration from robocompass-source

This document describes the migration of the compass parser and grammar from the robocompass-source project.

## Overview

The compass parser has been successfully ported from robocompass-source to the expression-parser module. This enables parsing of string expressions like `"line(0, 0, 10, 10)"` into AST (Abstract Syntax Tree) format, which can then be evaluated using the ExpressionInterpreter.

## Files Ported

### From robocompass-source/js/parser/

1. **compass-parser.js** (Generated File - DO NOT MODIFY)
   - Location: `src/expression-parser/parser/compass-parser.js`
   - This is a PEG.js generated parser from `compassgrammar.pegjs`
   - Contains all parsing logic for mathematical expressions
   - Exports `robo.compass.CompassParser` with `parse()` and `SyntaxError` methods

2. **compassgrammar.pegjs** (Reference File)
   - Location: `src/expression-parser/parser/compassgrammar.pegjs`
   - The grammar definition used to generate compass-parser.js
   - Included for reference and documentation purposes
   - Defines syntax for points, lines, arithmetic, assignments, etc.

## New Files Created

1. **parser/index.js**
   - ES6 module wrapper for compass-parser.js
   - Exports `parse()` function and `SyntaxError` class
   - Handles loading and executing the generated parser in Node.js environment
   - Sets up global `robo` object required by compass-parser.js

2. **test/parsing.test.js**
   - Comprehensive test suite for the parser (17 tests)
   - Tests string → AST conversion
   - Tests full pipeline: string → AST → expression object → values
   - Tests error handling for invalid syntax

## How It Works

### 1. Parsing Pipeline

```
String Expression → Parser → AST → Interpreter → Expression Object → Resolved Values
```

**Example:**

```javascript
import { parse, ExpressionInterpreter, ExpressionContext } from './expression-parser';

// 1. Parse string to AST
const input = 'line(0, 0, 10, 10)';
const ast = parse(input);
// ast = [{ name: 'line', args: [
//   { name: 'numeric', value: 0 },
//   { name: 'numeric', value: 0 },
//   { name: 'numeric', value: 10 },
//   { name: 'numeric', value: 10 }
// ]}]

// 2. Evaluate AST to expression object
const interpreter = new ExpressionInterpreter();
const context = new ExpressionContext();
const lineExpr = interpreter.evalExpression(ast[0]);

// 3. Resolve to get final values
lineExpr.resolve(context);
console.log(lineExpr.getVariableAtomicValues()); // [0, 0, 10, 10]
```

### 2. Parser Capabilities

The compass parser supports:

#### Basic Expressions
- **Points**: `point(x, y)` → `{ name: 'point', args: [...] }`
- **Lines**: `line(x1, y1, x2, y2)` or `line(point1, point2)`
- **Numbers**: `42`, `-3.14`
- **Variables**: `A`, `myVar_123`

#### Arithmetic
- **Operators**: `+`, `-`, `*`, `/`, `^` (power)
- **Operator precedence**: `^` > `*,/` > `+,-`
- **Grouping**: `(2 + 3) * 4`
- **Examples**: `point(2+3, 4*2)` → evaluates to `point(5, 8)`

#### Assignments
- **Syntax**: `variableName = expression`
- **Example**: `A = point(3, 4)`
- **AST**: `{ name: 'assignment', args: [{ name: 'string', value: 'A' }, ...] }`

#### Nested Expressions
- **Commands in commands**: `line(point(0, 0), point(5, 5))`
- **Arithmetic in commands**: `point(2+3, sqrt(16))`
- **Variables in commands**: `line(A, B)`

#### Comments
- **Syntax**: `// comment text`
- **Example**: `point(3, 4) // create point at (3,4)`

### 3. AST Structure

The parser generates consistent AST nodes:

```typescript
interface ASTNode {
  name: string;        // Node type: "point", "line", "numeric", "string", "+", etc.
  args?: ASTNode[];   // Child nodes (for commands and operations)
  value?: any;        // Literal value (for numeric, string, quotedstring)
}
```

**Examples:**

```javascript
// Input: "point(3, 4)"
{
  name: 'point',
  args: [
    { name: 'numeric', value: 3 },
    { name: 'numeric', value: 4 }
  ]
}

// Input: "A = point(2+3, 4)"
{
  name: 'assignment',
  args: [
    { name: 'string', value: 'A' },
    {
      name: 'point',
      args: [
        {
          name: '+',
          args: [
            { name: 'numeric', value: 2 },
            { name: 'numeric', value: 3 }
          ]
        },
        { name: 'numeric', value: 4 }
      ]
    }
  ]
}
```

## Usage Examples

### Example 1: Simple Point

```javascript
import { parse, ExpressionInterpreter, ExpressionContext, IntrepreterFunctionTable } from './expression-parser';

IntrepreterFunctionTable.populateFunctionTable();
const interpreter = new ExpressionInterpreter();
const context = new ExpressionContext();

const ast = parse('point(3, 4)');
const point = interpreter.evalExpression(ast[0]);
point.resolve(context);

console.log(point.getVariableAtomicValues()); // [3, 4]
```

### Example 2: Line with Nested Points

```javascript
const ast = parse('line(point(0, 0), point(3, 4))');
const line = interpreter.evalExpression(ast[0]);
line.resolve(context);

console.log(line.getVariableAtomicValues()); // [0, 0, 3, 4]
console.log(line.length()); // 5 (3-4-5 triangle)
```

### Example 3: Arithmetic Expressions

```javascript
const ast = parse('point(2+3, 4*2)');
const point = interpreter.evalExpression(ast[0]);
point.resolve(context);

console.log(point.getVariableAtomicValues()); // [5, 8]
```

### Example 4: Variables and Multiple Expressions

```javascript
const input = `A = point(0, 0)
B = point(3, 4)
line(A, B)`;
const ast = parse(input);

// Evaluate assignments
interpreter.evalExpression(ast[0]).resolve(context);
interpreter.evalExpression(ast[1]).resolve(context);

// Use variables in line
const line = interpreter.evalExpression(ast[2]);
line.resolve(context);

console.log(line.length()); // 5
```

### Example 5: Complex Expression

```javascript
const ast = parse('line(point(1+1, 2*2), point(10-5, 8/2))');
const line = interpreter.evalExpression(ast[0]);
line.resolve(context);

console.log(line.getVariableAtomicValues()); // [2, 4, 5, 4]
```

## Testing

All parser functionality is thoroughly tested in `test/parsing.test.js`:

### Test Coverage (17 tests)

**String to AST (6 tests):**
- Parse simple point expression
- Parse line expression with coordinates
- Parse line with nested points
- Parse assignment expression
- Parse arithmetic expressions
- Parse multiple expressions

**Full Pipeline (9 tests):**
- Parse and evaluate simple point
- Parse and evaluate line from coordinates
- Parse and evaluate line from nested points
- Parse and evaluate with arithmetic
- Parse and evaluate assignment
- Parse and evaluate multiple expressions with variables
- Parse and evaluate complex expression
- Parse and evaluate negative coordinates
- Parse and evaluate line with extension

**Error Handling (2 tests):**
- Invalid syntax throws error
- Unclosed parenthesis throws error

### Running Tests

```bash
# Run all tests
./src/expression-parser/test/run-tests.sh

# Or run parsing tests specifically
node src/expression-parser/test/parsing.test.js
```

**Current Results:** ✓ All 51 tests passing across 5 test suites

## Technical Details

### ES6 Module Compatibility

The compass-parser.js is originally written for browser environments using global `robo` object. The wrapper (`parser/index.js`) handles this by:

1. Setting up global `robo` object
2. Loading compass-parser.js code as a string
3. Executing it using `Function` constructor
4. Exporting ES6-compatible `parse()` function

This approach ensures the generated parser works in Node.js without modification.

### Important Notes

1. **DO NOT MODIFY compass-parser.js**
   - This file is generated from compassgrammar.pegjs
   - Any changes will be lost when regenerating
   - Modify compassgrammar.pegjs instead and regenerate if needed

2. **Regenerating the Parser** (if grammar changes)
   ```bash
   # Install PEG.js
   npm install -g pegjs

   # Regenerate parser from grammar
   cd src/expression-parser/parser
   pegjs compassgrammar.pegjs compass-parser.js
   ```

3. **Parser Grammar Documentation**
   - See `/robocompass-source/parser-documentation.md` for complete grammar reference
   - Contains examples for all supported syntax
   - Explains AST structure and node types

## Integration with Expression System

The parser integrates seamlessly with the existing expression system:

1. **Parser** converts string → AST
2. **ExpressionInterpreter** converts AST → Expression objects
3. **Expression objects** provide methods like `resolve()`, `getVariableAtomicValues()`, `length()`, etc.

This separation of concerns allows:
- Using the parser independently for AST generation
- Using the interpreter without parsing (manual AST)
- Easy testing of each component
- Clear data flow through the system

## Future Enhancements

Possible additions:
- Support for more geometric primitives (circles, arcs, polygons)
- Additional math functions in grammar
- Support for arrays/lists
- Support for conditional expressions
- Support for loops/repetition

## References

- Original parser: `/robocompass-source/js/parser/`
- Parser documentation: `/robocompass-source/parser-documentation.md`
- PEG.js: https://pegjs.org/documentation
- Expression interpreter: `src/expression-parser/core/ExpressionInterpreter.js`

---

**Migration completed successfully!** All tests passing. The parser is ready for use.
