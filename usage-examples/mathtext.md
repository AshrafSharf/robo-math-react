# mathtext

Creates a LaTeX math expression at a specified position. Returns a MathTextComponent that can be animated, selected, or manipulated.

## API

```
mathtext(row, col, latex)
          │    │     └── LaTeX string
          │    └──────── column position
          └───────────── row position
```

## Code

```
# Basic math text
eq1 = "x^2 + y^2 = r^2"
m1 = mathtext(5, 2, eq1)

# Fraction
eq2 = "\\frac{a}{b}"
m2 = mathtext(6, 2, eq2)

# Trig identity
eq3 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m3 = mathtext(7, 2, eq3)

# Create hidden, then animate
eq4 = "e^{i\\pi} + 1 = 0"
m4 = mathtext(8, 2, eq4)
hide(m4)
write(m4)

# Select and manipulate parts
eq5 = "a + b + c"
m5 = mathtext(9, 2, eq5)
sel1 = select(m5, "b")
fadeout(sel1)
```

## Comments

| Line | Explanation |
|------|-------------|
| `m1 = mathtext(5, 2, eq1)` | Create and display at row 5, col 2 |
| `hide(m4)` | Hide before animating |
| `write(m4)` | Animate with pen-tracing effect |
| `select(m5, "b")` | Get reference to "b" for manipulation |

## Difference from write()

| Function | Behavior |
|----------|----------|
| `mathtext(row, col, eq)` | Creates text, displays instantly |
| `write(row, col, eq)` | Creates text, animates writing |

## Visibility Control

```
eq6 = "hidden content"
m6 = mathtext(10, 2, eq6)
hide(m6)      # Make invisible
show(m6)      # Make visible instantly
fadein(m6)    # Animate appearance
fadeout(m6)   # Animate disappearance
```

## Selection Operations

```
eq7 = "x^2 + 2x + 1"
m7 = mathtext(11, 2, eq7)

# Select matching patterns
sel2 = select(m7, "x")        # All x's
sel3 = select(m7, "x^2")      # Just x^2

# Animate selections
write(sel2)
fadeout(sel3)
replace("a^2", sel3)
```

## Related

- `write` - Create and animate text
- `select` - Extract patterns from mathtext
- `hide`, `show` - Visibility control
- `replace` - Replace text content
