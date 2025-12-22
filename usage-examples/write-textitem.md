# write(row, col, item(S, i)) - Clone TextItem to Position

Clone a TextItem from a collection to a new position and animate it.

## Basic Usage

```
M = mathtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
thetas = select(M, "\theta")

# Clone first theta to new position
write(5, 2, item(thetas, 0))

# Clone second theta to another position
write(5, 4, item(thetas, 1))

# Clone third theta to yet another position
write(5, 6, item(thetas, 2))
```

## Extract and Clone Different Patterns

```
M = mathtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")

# Extract sin occurrences
sins = select(M, "\sin")
write(6, 2, item(sins, 0))

# Extract cos occurrences
coses = select(M, "\cos")
write(8, 2, item(coses, 0))
```

## Comparison with In-Place Animation

```
M = mathtext(3, 2, "x^2 + y^2 = r^2")
S = select(M, "x^2")

# Animate in place (original position)
write(item(S, 0))

# Clone to new position
write(6, 2, item(S, 0))
```

## Notes

- Creates an independent copy - no reference to original MathTextComponent
- Uses `getClonedSVG()` which removes non-matching paths (not just hides them)
- Animates with pen-tracing WriteEffect
- Position is in logical coordinates (row, col)
