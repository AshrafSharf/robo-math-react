# text-replace

Replace parts of a math expression with new content using the `replace()` function.

## Code

```
eq1 = "x^2+y^2=20"
m1 = mathtext(5, 12, eq1)
write(m1)

sel1 = select(m1, "x^2")
replace("a^2", sel1)

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

## Comments

| Line | Explanation |
|------|-------------|
| `select(m1, "x^2")` | Get reference to x^2 in the expression |
| `replace("a^2", sel1)` | Replace x^2 with a^2 |
| `seq(fadeout(...), replace(...))` | Fade out then replace |

## Related

- `select` - Extract patterns from mathtext
- `seq` - Run effects sequentially
- `fadeout` - Fade out animation
