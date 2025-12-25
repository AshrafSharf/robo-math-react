# writeonly

Animates writing only specific patterns within a math expression. The rest of the expression appears instantly.

## API

```
writeonly(m, pattern1, pattern2, ...)
          │     └── patterns to animate (one or more)
          └──────── mathtext expression

writeonly(row, col, eq, pattern1, pattern2, ...)
           │    │    │     └── patterns to animate
           │    │    └──────── LaTeX string variable
           │    └───────────── column position
           └────────────────── row position
```

## Code

```
# Animate only theta symbols
eq1 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m1 = mtext(5, 2, eq1)
writeonly(m1, "\\theta")

# Direct write with pattern
eq2 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
writeonly(5, 2, eq2, "\\theta")

# Multiple patterns
eq3 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
writeonly(6, 2, eq3, "\\theta", "\\sin", "\\cos")

# Animate specific parts of fraction
eq4 = "\\frac{2}{3}"
writeonly(7, 2, eq4, "2")

# Animate sqrt and index
eq5 = "\\sqrt[3]{8}+\\sqrt{2}"
writeonly(8, 2, eq5, "\\sqrt", "3")
```

## Comments

| Line | Explanation |
|------|-------------|
| `writeonly(m1, "\\theta")` | Animate only theta, rest appears instantly |
| `writeonly(5, 2, eq2, "\\theta")` | Create and animate in one step |
| `writeonly(6, 2, eq3, "\\theta", "\\sin", "\\cos")` | Animate multiple patterns |
| `writeonly(7, 2, eq4, "2")` | Animate only the numerator |

## Use Cases

- Highlight new terms being introduced
- Draw attention to specific variables
- Step-by-step equation building
- Emphasize pattern recognition

## Related

- `writewithout` - Animate everything except specific patterns
- `select` - Extract patterns for manipulation
- `write` - Animate entire expression
