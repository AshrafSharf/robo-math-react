# marrow

Draws a circle around a TextItem/KatexTextItem and a curved arrow pointing outward.

## Syntax

```
marrow(T)
marrow(T, "anchor", "direction")
marrow(T, "anchor", "direction", length)
marrow(T, "anchor", "direction", length, curvature)
marrow(T, ..., c(color), s(width))
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| T | TextItem | required | Selection from `select()` |
| anchor | string | "rm" | Position on TextItem where arrow starts |
| direction | string | "E" | Direction arrow points |
| length | number | 50 | Arrow length in pixels |
| curvature | number | 50 | Curve amount (higher = more curved) |

### Anchors

```
tl --- tm --- tr
|             |
lm           rm
|             |
bl --- bm --- br
```

- `tl` - top-left
- `tm` - top-middle
- `tr` - top-right
- `lm` - left-middle
- `rm` - right-middle (default)
- `bl` - bottom-left
- `bm` - bottom-middle
- `br` - bottom-right

### Directions

- `N` - North (up)
- `E` - East (right) - default
- `S` - South (down)
- `W` - West (left)

## Examples

### Basic usage

```
Q = print(6, 4, "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
D = select(Q, "b^2 - 4ac")
marrow(D)
```

### Different anchors and directions

```
marrow(D, "tm", "N")      # top-middle, arrow pointing up
marrow(D, "bl", "W")      # bottom-left, arrow pointing left
marrow(D, "rm", "S")      # right-middle, arrow pointing down
marrow(D, "lm", "W")      # left-middle, arrow pointing left
```

### With arrow length

```
marrow(D, "tm", "N", 80)   # 80px long arrow
marrow(D, "rm", "E", 100)  # 100px long arrow
```

### With length and curvature

```
marrow(D, "rm", "E", 60, 30)   # less curved
marrow(D, "rm", "E", 60, 100)  # more curved
```

### With styling

```
marrow(D, c(red))                       # red color
marrow(D, "tm", "N", c(blue), s(3))     # blue, 3px stroke width
marrow(D, "rm", "E", 70, 50, c(green))  # all options + green color
```

### Multiple annotations

```
Q = print(6, 4, "x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}")
A = select(Q, "-b")
B = select(Q, "b^2 - 4ac")
C = select(Q, "2a")

marrow(A, "tm", "N", 40, c(red))
marrow(B, "bm", "S", 60, c(blue))
marrow(C, "rm", "E", 50, c(green))
```

## Notes

- `length` controls how far the arrow extends from the text
- `curvature` controls the bend of the arrow (higher = more curved)
- Works with both `write()` (MathJax) and `print()` (KaTeX) expressions
