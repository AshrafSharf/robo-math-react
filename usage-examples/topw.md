# topw

Adds a text annotation above a selected text item. Short for "top write".

## Visual

```
  annotation
  ─────────
     ↓
   target
```

## API

```
topw(textItem, annotation)
        │          └── text to display above
        └───────────── selected text item
```

## Code

```
# Add "numerator" label above fraction part
eq1 = "\\frac{a}{b} + c = d"
m1 = write(4, 14, eq1)
sel1 = select(m1, "a")
topw(sel1, "numerator")

# Label multiple parts
eq2 = "x^2 + 2xy + y^2"
m2 = write(6, 10, eq2)

sel2 = select(m2, "x^2")
topw(sel2, "first term")

sel3 = select(m2, "y^2")
topw(sel3, "last term")

# Annotate equals sign
eq3 = "a = b"
m3 = write(8, 10, eq3)
sel4 = select(m3, "=")
topw(sel4, "equals")
```

## Comments

| Line | Explanation |
|------|-------------|
| `topw(sel1, "numerator")` | Shows "numerator" above selected "a" |
| `topw(sel2, "first term")` | Labels x^2 as "first term" |
| `topw(sel3, "last term")` | Labels y^2 as "last term" |

## Notes

- The annotation appears centered above the selected text
- Use `select()` to get the text item to annotate
- For more control over position and styling, use `arrow()` instead
