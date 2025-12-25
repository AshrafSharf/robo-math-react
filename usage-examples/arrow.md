# arrow

Adds a curved annotation arrow pointing to a text item with an optional label. Useful for explaining parts of mathematical expressions.

## Visual

```
                    "squared"
                        |
                       \|/
    x^2 + y^2  <--------'
    ^^^
    target
```

## API

```
arrow(textItem, anchor, direction, length, label, curvature, offset)
         │        │        │         │       │        │         └── offset from edge (px)
         │        │        │         │       │        └──────────── bend amount (px)
         │        │        │         │       └───────────────────── label text
         │        │        │         └───────────────────────────── arrow length (px)
         │        │        └─────────────────────────────────────── arrow direction
         │        └──────────────────────────────────────────────── anchor position
         └───────────────────────────────────────────────────────── selected text item
```

### Anchor Positions

| Code | Position |
|------|----------|
| `"tl"` | top-left |
| `"tm"` | top-middle |
| `"tr"` | top-right |
| `"ml"` | middle-left |
| `"mr"` | middle-right |
| `"bl"` | bottom-left |
| `"bm"` | bottom-middle |
| `"br"` | bottom-right |
| `"rm"` | right-middle (alias for mr) |

### Directions

| Code | Direction |
|------|-----------|
| `"N"` | North (up) |
| `"S"` | South (down) |
| `"E"` | East (right) |
| `"W"` | West (left) |
| `"NE"` | Northeast |
| `"NW"` | Northwest |
| `"SE"` | Southeast |
| `"SW"` | Southwest |

## Code

```
# Basic arrow pointing to x^2
eq1 = "x^2 + y^2"
m1 = write(4, 10, eq1)
sel1 = select(m1, "x^2")
lbl1 = "squared"
arrow(sel1, "bl", "S", 60, lbl1, 70, 5)

# Arrow from the right side
eq2 = "a + b = c"
m2 = write(6, 10, eq2)
sel2 = select(m2, "b")
lbl2 = "variable"
arrow(sel2, "rm", "E", 50, lbl2, 20, 5)

# Arrow with more curvature
eq3 = "\\frac{a}{b}"
m3 = write(8, 10, eq3)
sel3 = select(m3, "a")
lbl3 = "numerator"
arrow(sel3, "tm", "N", 40, lbl3, 50, 3)

# Arrow pointing to denominator
sel4 = select(m3, "b")
lbl4 = "denominator"
arrow(sel4, "bm", "S", 40, lbl4, 50, 3)
```

## Comments

| Line | Explanation |
|------|-------------|
| `arrow(sel1, "bl", "S", 60, lbl1, 70, 5)` | Arrow from bottom-left, pointing south, 60px long, 70px curve, 5px offset |
| `arrow(sel2, "rm", "E", 50, lbl2, 20, 5)` | Arrow from right-middle, pointing east, slight curve |
| `arrow(sel3, "tm", "N", 40, lbl3, 50, 3)` | Arrow from top-middle, pointing north |

## Notes

- `length` controls how far the arrow extends from the text
- `curvature` controls the bend of the arrow (higher = more curved)
- `offset` adds spacing between the text edge and arrow start
- The label appears at the end of the arrow
