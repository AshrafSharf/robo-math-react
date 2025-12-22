# select(M, "pattern") - Extract Matching Parts of Math Text

Extract specific parts of a MathTextComponent that match a pattern. Returns a TextItemCollection that can be animated, replaced, or manipulated.

## Basic Usage

```
M = mathtext(3, 2, "x^2 + y^2 = r^2")
S = select(M, "x^2")

# Animate just the x^2 portion
write(S)
```

## Multiple Pattern Matching

```
M = mathtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")

# Extract all theta occurrences
thetas = select(M, "\theta")

# Extract trig functions
sins = select(M, "\sin")
coses = select(M, "\cos")
```

## Animate Extracted Items

```
M = mathtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
hide(M)

# Extract and write all thetas sequentially
thetas = select(M, "\theta")
write(thetas)

# Or animate a specific item from the collection
write(item(thetas, 0))
write(item(thetas, 1))
```

## Clone to New Position

```
M = mathtext(3, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
thetas = select(M, "\theta")

# Clone first theta to new position
write(5, 2, item(thetas, 0))

# Clone second theta to another position
write(5, 4, item(thetas, 1))
```

## Replace Selected Parts

```
M = mathtext(5, 12, "x^2 + y^2 = 20")
write(M)

# Select and replace x^2 with a^2
x_square = select(M, "x^2")
replace("a^2", x_square)

# Select and replace 20 with 30
val_20 = select(M, "20")
replace("30", val_20)
```

## With Fade Animation

```
M = mathtext(5, 12, "x^2 + y^2 = 20")
write(M)

x_square = select(M, "x^2")
seq(fadeout(x_square), replace("a^2", x_square))
```

## Annotate Selected Parts

```
M = write(4, 10, "x^2 + y^2")
T = select(M, "x^2")

# Add arrow annotation pointing to x^2
arrow(T, "bl", "S", 60, "squared", 70, 5)

# Or add topwrite annotation
topw(T, "numerator")

# Or add cancel line
cancel(T, "1", "u")
```

## Visibility Control

```
M = mathtext(3, 2, "a + b + c")
parts = select(M, "b")

# Hide the selected part
hide(parts)

# Show the selected part
show(parts)

# Fade effects
fadeout(parts)
fadein(parts)
```

## Notes

- Returns a TextItemCollection containing all matches
- Each pattern match becomes a TextItem in the collection
- Use `item(collection, index)` to access specific items
- Works with mathtext and write expressions
- Patterns match LaTeX content (use `\\` for LaTeX commands like `\\sin`, `\\frac`)
