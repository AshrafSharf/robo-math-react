# text-replace

Replace parts of a math expression with new content using the `msub()` function.

## Code

```
M = write(1,10,"a + b = c")
T = select(M, "b")
msub(T,"\beta")

P = write(5,10,"x^2 + y^2")
c = select(P, "x^2")
msub(c,"z^2")
mcancel(c)
```

## With Fade Animation

```
M = write(1,10,"a + b = c")
T = select(M, "b")
seq(fadeout(T), msub(T, "\beta"))
```

## Comments

| Line | Explanation |
|------|-------------|
| `select(M, "b")` | Get reference to "b" in the expression |
| `msub(T, "\beta")` | Replace selection with \beta |
| `mcancel(c)` | Add cancel line through the replaced text |

## Related

- `select` - Extract patterns from write/print
- `seq` - Run effects sequentially
- `fadeout` - Fade out animation
- `mcancel` - Add cancel line
