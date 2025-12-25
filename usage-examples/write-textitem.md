# write(row, col, item(s, i)) - Clone TextItem to Position

Clone a TextItem from a collection to a new position and animate it.

## Basic Usage

```
eq1 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m1 = mathtext(3, 2, eq1)
thetas = select(m1, "\\theta")

# Clone first theta to new position
write(5, 2, item(thetas, 0))

# Clone second theta to another position
write(5, 4, item(thetas, 1))

# Clone third theta to yet another position
write(5, 6, item(thetas, 2))
```

## Extract and Clone Different Patterns

```
eq1 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m1 = mathtext(3, 2, eq1)

# Extract sin occurrences
sines = select(m1, "\\sin")
write(6, 2, item(sines, 0))

# Extract cos occurrences
cosines = select(m1, "\\cos")
write(8, 2, item(cosines, 0))
```

## Comparison with In-Place Animation

```
eq1 = "x^2 + y^2 = r^2"
m1 = mathtext(3, 2, eq1)
sel1 = select(m1, "x^2")

# Animate in place (original position)
write(item(sel1, 0))

# Clone to new position
write(6, 2, item(sel1, 0))
```

## Notes

- Creates an independent copy - no reference to original MathTextComponent
- Uses `getClonedSVG()` which removes non-matching paths (not just hides them)
- Animates with pen-tracing WriteEffect
- Position is in logical coordinates (row, col)
