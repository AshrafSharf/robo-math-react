# FromTo Animation System

## Purpose

`fromTo` enables reactive animations where changing a single variable automatically updates all dependent shapes. This creates smooth, coordinated animations without manually animating each shape.

## Usage Examples

### Basic Variable Animation
```
G = g2d(0, 0, 20, 20)
A = 3
P = point(G, A, A)
fromTo(A, 3, 8)  // Point smoothly moves from (3,3) to (8,8)
```

### Cascading Dependencies
```
G = g2d(0, 0, 20, 20)
A = 3
P1 = point(G, -3, A)      // depends on A
P2 = point(G, A, 2)       // depends on A
L = line(G, P1, P2)       // depends on P1 AND P2
C = circle(G, 1, ed(G,L)) // depends on L
fromTo(A, 3, 8)           // ALL shapes update together
```

### Animation with Duration
```
fromTo(A, 0, 10, { duration: 2 })  // 2-second animation
```

### Animating Plot Parameters
```
G = g2d(0, 0, 20, 8, -10, 10, -5, 5, 1)
a = 1
P = plot(G, "a * sin(x)")
fromTo(a, 1, 5)  // Sine wave amplitude animates from 1 to 5
```

### Animating Parametric Plots
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
r = 1
C = paraplot(G, "r * cos(t)", "r * sin(t)")
fromTo(r, 1, 4)  // Circle expands from radius 1 to 4
```

### Function Definitions with fun()
```
G = g2d(0, 0, 20, 20)
a = 2
f = def(x, "a * sin(x)")
P = plot(G, f)
Q = point(G, 3, fun(f, 3))   // Point ON the curve at x=3
fromTo(a, 1, 5)              // Both plot AND point update together
```

## Design

### Dependency Tracking

When expressions resolve, `ExpressionContext` automatically tracks dependencies:

```
context.getReference('A')  →  registers caller as dependent of 'A'
```

This builds a dependency graph:
```
A ──► P1 ──► L ──► C
  └──► P2 ──┘
```

### MathJS Expression Dependencies

Expressions using mathjs strings (`plot`, `paraplot`, `fun`) need special handling because variables are embedded in strings like `"a * sin(x)"`.

**Solution:** `MathFunctionCompiler.registerDependencies()` parses the equation to find user variables.

```javascript
MathFunctionCompiler.extractUserVariables("a * sin(x) + b", ['x'])
// Returns: ['a', 'b']
// Excludes: functions (sin), built-ins (pi, e), parameters (x)
```

**Two Registration Modes:**

1. **Explicit Mode** (plot, paraplot) - registers the expression itself:
```javascript
// In PlotExpression.resolve():
MathFunctionCompiler.registerDependencies(this.equation, ['x'], context, this);
//                                                                       ^^^^
//                                                            explicit expression
```

2. **Caller Mode** (fun) - registers the parent expression:
```javascript
// In FunctionCallExpression.resolve():
MathFunctionCompiler.registerDependencies(funcDef.getBodyString(), funcDef.getParameters(), context);
//                                                                                          ^^^^^^^
//                                                                              no 4th arg = caller mode
```

**Why Caller Mode for fun()?**

`fun()` is a subexpression that produces a value, not a shape:
- `toCommand()` returns `null`
- `canPlay()` returns `false`
- It just produces a numeric value via `getVariableAtomicValues()`

When used in `point(G, 3, fun(f, 3))`:
- The **caller** is the PointExpression (set by `ExpressionPipelineService.setCaller()`)
- `fun()` calls `context.getReference('a')` which registers the **caller** (point) as dependent
- When `a` changes, the **point** gets re-resolved (not just fun)

This is generic - works for any expression using `fun()`: point, line, circle, vector, etc.

**fun() Execution Flow with fromTo:**

```
Q = point(G, 3, fun(f, 3))   // f = def(x, "a * sin(x)")
fromTo(a, 1, 5)

Initial resolution:
────────────────────
PointExpression.resolve()
       │
       ├─► fun(f, 3).resolve()
       │         │
       │         ├─► Gets funcDef from context
       │         ├─► Compiles with current scope {a: 1}
       │         └─► Evaluates → returns value (e.g., 2.52)
       │
       ▼
Point uses 2.52 as y-coordinate
       │
       ▼
PointCommand created and rendered


When fromTo updates 'a':
────────────────────────
fromTo changes a: 1 → 5
       │
       ▼
Point is in 'a' dependents list (registered by fun's caller mode)
       │
       ▼
Point.resolve(context) called again
       │
       ├─► fun(f, 3).resolve()
       │         │
       │         ├─► Gets funcDef from context
       │         ├─► Compiles with NEW scope {a: 5}
       │         └─► Evaluates → returns NEW value (e.g., -4.79)
       │
       ▼
Point uses -4.79 as y-coordinate
       │
       ▼
PointCommand.toCommand() → PointCommand.directPlay()
```

**Key insight:** `fun()` has no command. The parent expression (point) is re-resolved by fromTo, and during re-resolution `fun()` naturally re-executes with updated context.

### Topological Ordering (Kahn's Algorithm)

Dependents must be processed in correct order. If L depends on both P1 and P2, L must be resolved AFTER both P1 and P2.

**Algorithm:**
1. Collect all transitive dependents
2. Calculate in-degree (number of dependencies) for each
3. Process expressions with in-degree 0 first
4. Decrement in-degrees as dependencies are satisfied
5. Add to queue when in-degree reaches 0

**Example:**
```
P1: in-degree 0  →  process first
P2: in-degree 0  →  process second
L:  in-degree 2  →  wait for P1 AND P2, then process
C:  in-degree 1  →  wait for L, then process

Result: [P1, P2, L, C]
```

### Animation Flow

**Animated (`play`/`playSingle`):**
```
TweenMax animates value from → to
    │
    ├─► onUpdate (each frame):
    │       1. Update variable in context
    │       2. Clear previous frame's shapes
    │       3. Re-resolve all dependents
    │       4. Recreate and render shapes
    │
    └─► onComplete:
            Final update with exact toValue
```

**Instant (`directPlay`):**
```
1. Set variable to final value
2. Clear previous shapes
3. Re-resolve all dependents (in topological order)
4. Recreate and render shapes
```

### Command Lifecycle

```
FromToExpression.resolve()
    │
    ├─► Get variable name, from/to values
    ├─► Build ordered dependents list (topological sort)
    └─► Store context reference
            │
            ▼
FromToExpression.toCommand()
    │
    └─► Creates FromToCommand with:
            - variableName
            - fromValue, toValue
            - orderedDependents
            - expressionContext
                    │
                    ▼
FromToCommand.doPlay() or directPlay()
    │
    └─► _updateDependentCommands():
            for each dependent in order:
                1. expr.resolve(context)  // get new values
                2. expr.toCommand()       // create shape command
                3. cmd.directPlay()       // render shape
                4. track in currentCommands[]
```

## Key Files

- `src/engine/fromTo/FromToExpression.js` - Expression with dependency resolution
- `src/engine/fromTo/FromToCommand.js` - Command with animation logic
- `src/engine/expression-parser/core/ExpressionContext.js` - Dependency tracking
- `src/engine/expression-parser/utils/MathFunctionCompiler.js` - Parses mathjs strings, extracts variables, registers dependencies
- `src/engine/expression-parser/expressions/PlotExpression.js` - Uses explicit mode
- `src/engine/expression-parser/expressions/ParametricPlotExpression.js` - Uses explicit mode
- `src/engine/expression-parser/expressions/FunctionCallExpression.js` - Uses caller mode

## Notes

- FromToCommand manages its own temporary shapes in `currentCommands[]`
- Original shapes (from initial render) remain untouched
- Each animation frame clears previous frame's shapes before creating new ones
- Topological ordering ensures expressions see updated values from their dependencies
