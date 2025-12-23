# Change Animation System

## Purpose

`change` enables reactive animations where changing a single variable automatically updates all dependent shapes. This creates smooth, coordinated animations without manually animating each shape.

## Syntax

```
change(var, target)       // 2 args: animate from current value to target
change(var, from, to)     // 3 args: animate from explicit value to target
```

- **var**: The variable to animate
- **target/to**: The target value (scalar, point, line, or vector)
- **from** (optional): Explicit starting value; if omitted, uses current value

## Usage Examples

### Scalar
```
a = 1
change(a, 5)      // 2 args: animates a from 1 to 5
change(a, 0, 10)  // 3 args: animates a from 0 to 10
```

### Point
```
G = g2d(0, 0, 20, 20)
P = point(G, 2, 2)
change(P, point(G, 8, 8))                       // 2 args: (2,2) → (8,8)
change(P, point(G, 0, 0), point(G, 10, 10))     // 3 args: (0,0) → (10,10)
```

### 3D Point
```
G = g3d(0, 0, 16, 20)
P = point3d(G, 1, 1, 1)
change(P, point3d(G, 4, 5, 6))  // Point moves to (4,5,6)
```

### Vector
```
G = g2d(0, 0, 20, 20)
V = vector(G, 0, 0, 3, 2)
change(V, vector(G, 0, 0, 6, 4))  // Vector grows
```

### Line
```
G = g2d(0, 0, 20, 20)
L = line(G, 0, 0, 3, 3)
change(L, line(G, 0, 0, 8, 8))  // Line extends
```

### Cascading Dependencies
```
G = g2d(0, 0, 20, 20)
A = 3
P1 = point(G, -3, A)      // depends on A
P2 = point(G, A, 2)       // depends on A
L = line(G, P1, P2)       // depends on P1 AND P2
C = circle(G, 1, ed(G,L)) // depends on L
change(A, 8)              // ALL shapes update together
```

### Plot with Parameter
```
G = g2d(0, 0, 20, 8, -10, 10, -5, 5, 1)
a = 1
P = plot(G, "a * sin(x)")
change(a, 5)  // Sine wave amplitude grows from 1 to 5
```

### Parametric Plot
```
G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
r = 1
C = paraplot(G, "r * cos(t)", "r * sin(t)")
change(r, 4)  // Circle expands from radius 1 to 4
```

### 3D Parametric Surface
```
G = g3d(0, 0, 16, 20)
r = 2
para3d(G, "r*cos(u)*sin(v)", "r*sin(u)*sin(v)", "r*cos(v)", 0, 6.28, 0, 3.14)
change(r, 4)  // Sphere grows from radius 2 to 4
```

### Function Definitions with fun()
```
G = g2d(0, 0, 20, 20)
a = 2
f = def(x, "a * sin(x)")
P = plot(G, f)
Q = point(G, 3, fun(f, 3))   // Point ON the curve at x=3
change(a, 5)                 // Both plot AND point update together
```

---

## Internal Design

> Note: `fromTo(var, from, to)` is the internal implementation. Users should use `change()`.

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

## Key Files

- `src/engine/change/ChangeExpression.js` - User-facing change() expression
- `src/engine/change/ChangeCommand.js` - Animation command for change()
- `src/engine/fromTo/FromToExpression.js` - Internal base class with dependency resolution
- `src/engine/fromTo/FromToCommand.js` - Internal base command with animation logic
- `src/engine/expression-parser/core/ExpressionContext.js` - Dependency tracking
- `src/engine/expression-parser/utils/MathFunctionCompiler.js` - Parses mathjs strings, extracts variables, registers dependencies

## Notes

- ChangeCommand manages its own temporary shapes in `currentCommands[]`
- Original shapes (from initial render) remain untouched
- Each animation frame clears previous frame's shapes before creating new ones
- Topological ordering ensures expressions see updated values from their dependencies
