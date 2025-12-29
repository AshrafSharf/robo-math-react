# overbrace

Adds a text annotation above a selected text item with an overbrace.

## Visual

```
  annotation
  ─────────
     ↓
   target
```

## API

```
overbrace(textItem, annotation)
        │          └── text to display above
        └───────────── selected text item
```

## Code

```
# Add "numerator" label above fraction part
eq1 = "\\frac{a}{b} + c = d"
m1 = write(4, 14, eq1)
sel1 = select(m1, "a")
overbrace(sel1, "numerator")

# Label multiple parts
eq2 = "x^2 + 2xy + y^2"
m2 = write(6, 10, eq2)

sel2 = select(m2, "x^2")
overbrace(sel2, "first term")

sel3 = select(m2, "y^2")
overbrace(sel3, "last term")

# Annotate equals sign
eq3 = "a = b"
m3 = write(8, 10, eq3)
sel4 = select(m3, "=")
overbrace(sel4, "equals")
```


```
M=write(4,4,meq(mline("x^2 = \frac{3}{4}","given"),mline("x = \pm 2","solved")),c(black),f(30))
r1=select(M,"3",1)
overbrace(r1,"need to test for both",15)
msub(r1, "9")
K = print(10,10, "\frac{x^2}{y}")
```

## Comments

| Line | Explanation |
|------|-------------|
| `overbrace(sel1, "numerator")` | Shows "numerator" above selected "a" |
| `overbrace(sel2, "first term")` | Labels x^2 as "first term" |
| `overbrace(sel3, "last term")` | Labels y^2 as "last term" |

## Notes

- The annotation appears centered above the selected text
- Use `select()` to get the text item to annotate
- For more control over position and styling, use `marrow()` instead
