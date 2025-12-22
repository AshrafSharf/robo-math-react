# selectexcept(M, "pattern") - Extract Everything Except Pattern

Extract all parts of a MathTextComponent except those matching the pattern. Returns a TextItemCollection containing everything that doesn't match.

## Basic Usage

```
M = mathtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")

# Get everything except theta
nonThetas = selectexcept(M, "\theta")

# Animate the non-theta parts
write(nonThetas)
```

## Selective Animation

```
M = mathtext(5, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
hide(M)

# First write everything except thetas
nonThetas = selectexcept(M, "\theta")
write(nonThetas)

# Then write the thetas
thetas = select(M, "\theta")
write(thetas)
```

## Multiple Patterns to Exclude

```
M = mathtext(5, 2, "\frac{2}{3}")

# Exclude both 2 and 3 - writes just the fraction bar
writewithout(M, "2", "3")
```

## Replace Everything Except Pattern

```
M = mathtext(5, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")

# Get non-theta parts
nonThetas = selectexcept(M, "\theta")

# Replace them with x
replace("x", nonThetas)
```

## Combining with select

```
M = mathtext(5, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
hide(M)

# Extract both groups
thetas = select(M, "\theta")
nonThetas = selectexcept(M, "\theta")

# Animate non-thetas first, then thetas
write(nonThetas)
write(thetas)
```

## Hide/Show Parts

```
M = mathtext(3, 2, "a + b + c = d")

# Get everything except "b"
others = selectexcept(M, "b")

# Hide everything except b (so only b is visible)
hide(others)

# Show them again
show(others)
```

## Notes

- Returns a TextItemCollection with a single TextItem containing all non-matching nodes
- Useful for animating "the rest" of an expression
- Works with mathtext and write expressions
- Commonly used with `select()` to split an expression into two animatable groups
- Patterns match LaTeX content (use `\\` for LaTeX commands)
