# enclosure

LaTeX commands for drawing shapes around expressions and adding annotations above/below text.

## Enclosure Shapes

Use `\enclose{style}{content}` to draw shapes around expressions.

### Available Styles

| Style | Description |
|-------|-------------|
| `circle` | Circle around content |
| `box` | Rectangle around content |
| `roundedbox` | Rounded rectangle |
| `updiagonalstrike` | Diagonal line (bottom-left to top-right) |
| `downdiagonalstrike` | Diagonal line (top-left to bottom-right) |
| `horizontalstrike` | Horizontal line through center |
| `verticalstrike` | Vertical line through center |

## Code - Enclosures

```
# Circle around expression
eq1 = "\\enclose{circle}{x^2}"
write(4, 4, eq1)

# Box around expression
eq2 = "\\enclose{box}{a + b}"
write(5, 4, eq2)

# Rounded box
eq3 = "\\enclose{roundedbox}{formula}"
write(6, 4, eq3)

# Strikethrough styles
eq4 = "\\enclose{updiagonalstrike}{old}"
write(7, 4, eq4)

eq5 = "\\enclose{horizontalstrike}{deleted}"
write(8, 4, eq5)

# Colored enclosure
eq6 = "{\\color{red}\\enclose{circle}{x^2}}"
write(9, 4, eq6)

# Colored circle with different inner color
eq7 = "{\\color{green}\\enclose{circle}{\\color{blue}x^2}}"
write(10, 4, eq7)
```

## Annotation Commands

### overset / underset

Place annotations above or below expressions.

```
# Annotation above
eq8 = "\\overset{\\text{annotation}}{x^2}"
write(4, 10, eq8)

# Annotation below
eq9 = "\\underset{\\text{key}}{\\frac{c}{y}}"
write(5, 10, eq9)

# Stacked relation
eq10 = "\\stackrel{x \\cdot 6}{hey}"
write(6, 10, eq10)
```

### Arrow Annotations

Arrows with text above and below.

```
# Left arrow with annotations
eq11 = "\\xleftarrow[below]{above}"
write(4, 14, eq11)

# Right arrow showing transformation
eq12 = "x \\xrightarrow[\\text{subtract}]{\\text{add}} y"
write(5, 14, eq12)

# Chain of transformations
eq13 = "x \\xrightarrow[\\text{step 1}]{f(x)} y \\xrightarrow[\\text{step 2}]{g(y)} z"
write(6, 14, eq13)
```

## Comments

| Line | Explanation |
|------|-------------|
| `\enclose{circle}{x^2}` | Draws circle around x^2 |
| `\color{red}\enclose{...}` | Red colored enclosure |
| `\overset{top}{bottom}` | Places "top" above "bottom" |
| `\xleftarrow[below]{above}` | Arrow with annotations |

## Notes

- Enclosures are pure LaTeX and render as part of the math expression
- Use `\text{}` inside annotations for non-math text
- Colors can be applied to the enclosure, content, or both
- These are different from `mcancel()` which adds interactive annotations
