# select

Extract specific parts of a MathTextComponent that match a pattern. Returns a TextItemCollection that can be animated, replaced, or manipulated.

## Basic Usage

```
eq1 = "x^2 + y^2 = r^2"
m1 = mathtext(3, 2, eq1)
sel1 = select(m1, "x^2")

# Animate just the x^2 portion
write(sel1)
```

## Multiple Pattern Matching

```
eq1 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m1 = mathtext(3, 2, eq1)

# Extract all theta occurrences
thetas = select(m1, "\\theta")

# Extract trig functions
sines = select(m1, "\\sin")
cosines = select(m1, "\\cos")
```

## Animate Extracted Items

```
eq1 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m1 = mathtext(3, 2, eq1)
hide(m1)

# Extract and write all thetas sequentially
thetas = select(m1, "\\theta")
write(thetas)

# Or animate a specific item from the collection
write(item(thetas, 0))
write(item(thetas, 1))
```

## Clone to New Position

```
eq1 = "\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}"
m1 = mathtext(3, 2, eq1)
thetas = select(m1, "\\theta")

# Clone first theta to new position
write(5, 2, item(thetas, 0))

# Clone second theta to another position
write(5, 4, item(thetas, 1))
```

## Replace Selected Parts

```
eq1 = "x^2 + y^2 = 20"
m1 = mathtext(5, 12, eq1)
write(m1)

# Select and replace x^2 with a^2
sel1 = select(m1, "x^2")
replace("a^2", sel1)

# Select and replace 20 with 30
sel2 = select(m1, "20")
replace("30", sel2)
```

## With Fade Animation

```
eq1 = "x^2 + y^2 = 20"
m1 = mathtext(5, 12, eq1)
write(m1)

sel1 = select(m1, "x^2")
seq(fadeout(sel1), replace("a^2", sel1))
```

## Annotate Selected Parts

```
eq1 = "x^2 + y^2"
m1 = write(4, 10, eq1)
sel1 = select(m1, "x^2")

# Add arrow annotation pointing to x^2
lbl1 = "squared"
arrow(sel1, "bl", "S", 60, lbl1, 70, 5)

# Or add topwrite annotation
topw(sel1, "numerator")

# Or add cancel line
cancel(sel1, "1", "u")
```

## Visibility Control

```
eq1 = "a + b + c"
m1 = mathtext(3, 2, eq1)
sel1 = select(m1, "b")

# Hide the selected part
hide(sel1)

# Show the selected part
show(sel1)

# Fade effects
fadeout(sel1)
fadein(sel1)
```

## Notes

- Returns a TextItemCollection containing all matches
- Each pattern match becomes a TextItem in the collection
- Use `item(collection, index)` to access specific items
- Works with mathtext and write expressions
- Patterns match LaTeX content (use `\\` for LaTeX commands like `\\sin`, `\\frac`)
