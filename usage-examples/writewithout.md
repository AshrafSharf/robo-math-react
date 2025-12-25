# writewithout

Animates writing a math expression except for specific patterns. The specified patterns appear instantly while the rest animates.

## API

```
writewithout(m, pattern1, pattern2, ...)
             │     └── patterns to skip (one or more)
             └──────── mathtext expression

writewithout(row, col, eq, pattern1, pattern2, ...)
              │    │    │     └── patterns to skip
              │    │    └──────── LaTeX string variable
              │    └───────────── column position
              └────────────────── row position
```

## Code

```
# Skip theta, animate everything else
eq1 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m1 = mtext(5, 2, eq1)
writewithout(m1, "\\theta")

# Direct write skipping pattern
eq2 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
writewithout(5, 2, eq2, "\\theta")

# Skip trig functions
eq3 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
writewithout(6, 2, eq3, "\\sin", "\\cos")

# Skip numerator and denominator
eq4 = "\\frac{2}{3}"
writewithout(7, 2, eq4, "2", "3")

# Skip sqrt symbols
eq5 = "\\sqrt[3]{8}+\\sqrt{2}"
writewithout(8, 2, eq5, "\\sqrt", "3")
```

## Comments

| Line | Explanation |
|------|-------------|
| `writewithout(m1, "\\theta")` | Theta appears instantly, rest animates |
| `writewithout(6, 2, eq3, "\\sin", "\\cos")` | Skip multiple patterns |
| `writewithout(7, 2, eq4, "2", "3")` | Only fraction bar animates |

## Use Cases

- Show context instantly, animate new content
- Pre-display known variables
- Focus animation on the changing parts
- Efficient step-by-step explanations

## Related

- `writeonly` - Animate only specific patterns
- `select` - Extract patterns for manipulation
- `write` - Animate entire expression
