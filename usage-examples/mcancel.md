# mcancel

Draws a cancellation line through a text item, optionally replacing it with new text. Used for showing simplification steps in mathematical expressions.

## Visual

```
  Before:        After (style "u"):    After (style "x"):
   5               5                      5
  ---             /--                    X--
  10             /10                     X10
                  1                        1
```

## API

```
mcancel(textItem, replacement, style, color)
          │          │          │      └── stroke color (optional)
          │          │          └───────── "u", "d", "x", or ""
          │          └──────────────────── replacement text (or "")
          └─────────────────────────────── selected text item
```

### Styles

| Style | Description |
|-------|-------------|
| `"u"` | Diagonal line going up (bottom-left to top-right) |
| `"d"` | Diagonal line going down (top-left to bottom-right) |
| `"x"` | X-shaped cross through the text |
| `""`  | No line (just replacement) |

## Code

```
# Cancel with replacement
eq1 = "\\frac{5}{10}"
m1 = write(4, 14, eq1)
sel1 = select(m1, "5")
mcancel(sel1, "1", "u")

# Cancel without replacement
eq2 = "a + b - c"
m2 = write(4, 14, eq2)
sel2 = select(m2, "b")
mcancel(sel2, "", "d")

# X-style cancel with color
eq3 = "wrong answer"
m3 = write(4, 14, eq3)
sel3 = select(m3, "wrong")
mcancel(sel3, "", "x", "red")

# Cancel all occurrences
eq4 = "x^2 + 2x + 1"
m4 = write(4, 14, eq4)
sel4 = select(m4, "x")
mcancel(sel4, "", "u", "red")

# Cancel fraction numerator
eq5 = "\\frac{a}{b} + c = d"
m5 = write(4, 14, eq5)
sel5 = select(m5, "\\frac{a}{b}")
mcancel(sel5, "0", "u")
```

## Comments

| Line | Explanation |
|------|-------------|
| `mcancel(sel1, "1", "u")` | Cancel "5" with up-diagonal, replace with "1" |
| `mcancel(sel2, "", "d")` | Cancel "b" with down-diagonal, no replacement |
| `mcancel(sel3, "", "x", "red")` | Red X through "wrong" |
| `mcancel(sel4, "", "u", "red")` | Cancel all "x" occurrences in red |
| `mcancel(sel5, "0", "u")` | Cancel entire fraction, replace with "0" |

## Notes

- When selecting patterns that appear multiple times, all occurrences are cancelled
- The replacement text appears near the cancelled content
- Use `select()` or `subonly()` to get the text item to cancel
