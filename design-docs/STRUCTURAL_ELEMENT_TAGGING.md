# Pattern-Based Selection for Selective Animation

## Problem

Animating specific parts of math expressions requires identifying elements that cannot be matched by simple LaTeX patterns:

1. **Structural elements** - Fraction bars, square root symbols cannot be referenced by LaTeX pattern alone (`\frac` requires arguments)
2. **Single characters** - Characters like "3" in `\sqrt[3]{8}` fail with bbox wrapping (produces invalid `\sqrt[\bbox{3}]{8}`)
3. **Greek letters** - Need to match `\alpha`, `\beta` etc. by their LaTeX commands

## Solution: PatternSelector

A single abstraction that handles ALL pattern types. Commands just call one method:

```javascript
const units = PatternSelector.getSelectionUnits(mathComponent, patterns);
```

### Architecture

```
PatternSelector.getSelectionUnits(mathComponent, patterns)
    │
    ├── Special Patterns → BoundsByLatex
    │       │
    │       ├── Structural (\frac, \sqrt, etc.) → Dedicated Extractors
    │       │       ├── FracBarExtractor
    │       │       ├── SqrtBarExtractor
    │       │       └── (overline, underline inline)
    │       │
    │       └── Characters/Greek → CharacterExtractor
    │               ├── Single chars (A-Z, a-z, 0-9)
    │               └── Greek letters (\alpha, \beta, etc.)
    │
    └── LaTeX Patterns → Temp Component + BBox approach
            └── wrapMultipleWithBBox → computeSelectionUnitsFromBounds
```

### Files

| File | Purpose |
|------|---------|
| `pattern-selector.js` | Single entry point for all patterns |
| `bounds-by-latex.js` | Routes to appropriate extractor |
| `frac-bar-extractor.js` | Extracts fraction bars |
| `sqrt-bar-extractor.js` | Extracts sqrt/root symbols |
| `character-extractor.js` | Single chars and Greek letters |

## Pattern Types

### 1. Structural Patterns

Patterns that reference MathJax CSS classes:

| Pattern | CSS Class | Elements Matched |
|---------|-----------|-----------------|
| `\frac` | `.mjx-svg-mfrac` | Fraction bar (horizontal line) |
| `\sqrt` | `.mjx-svg-msqrt`, `.mjx-svg-mroot` | Radical sign + vinculum |
| `\overline` | `.mjx-svg-mover` | Overline bar |
| `\underline` | `.mjx-svg-munder` | Underline bar |

### 2. Single Character Patterns

Direct meta attribute lookup bypassing bbox:

| Pattern | Meta Attribute |
|---------|---------------|
| `A`-`Z` | `MJMATHI-41` to `MJMATHI-5A` |
| `a`-`z` | `MJMATHI-61` to `MJMATHI-7A` |
| `0`-`9` | `MJMAIN-30` to `MJMAIN-39` |

### 3. Greek Letter Patterns

LaTeX commands mapped to meta attributes:

| Pattern | Meta Attribute |
|---------|---------------|
| `\alpha` | `MJMATHI-3B1` |
| `\beta` | `MJMATHI-3B2` |
| `\gamma` | `MJMATHI-3B3` |
| `\Gamma` | `MJMAIN-393` |
| `\Delta` | `MJMAIN-394` |
| ... | ... |

Full list includes all lowercase Greek, uppercase Greek, and variants (`\varepsilon`, `\varphi`, etc.)

### 4. LaTeX Patterns (Multi-character)

Any pattern not matching above categories uses bbox wrapping:

```javascript
// Original: "\frac{2}{3}"
// Pattern: "2"  (single char → CharacterExtractor)
// Pattern: "23" (multi-char → bbox approach)
wrapMultipleWithBBox("\frac{2}{3}", ["23"])
// → "\frac{\bbox[0px]{2}\bbox[0px]{3}}{3}" (hypothetical)
```

## Usage Examples

```
// Structural patterns
M = mathtext(2, 3, "\frac{2}{3}")
hide(M)
writeonly(M, "\frac")    // Animate fraction bar only
writeonly(M, "2")        // Animate numerator
writeonly(M, "3")        // Animate denominator

// Greek letters
M = writeonly(4, 4, "\alpha + \beta = \gamma", "\alpha")

// Square root (includes radical sign + bar)
M = writeonly(4, 4, "\sqrt[3]{8}", "\sqrt")
writeonly(M, "3")        // Animate the cube indicator
writeonly(M, "8")        // Animate the radicand

// Exclusion patterns
writewithout(4, 4, "\frac{x^2}{y}", "\frac")  // Everything except the bar
```

## MathJax Configuration

Required in `plugin-initializer.js`:

```javascript
SVG: {
    useFontCache: false,
    addMMLclasses: true  // Adds CSS classes based on MathML structure
}
```

## Extractor Details

### FracBarExtractor

Queries `.mjx-svg-mfrac` containers for `path[meta="rect"]` (the horizontal bar):

```javascript
svg.querySelectorAll('.mjx-svg-mfrac').forEach(container => {
    container.querySelectorAll('path[meta="rect"]').forEach(path => {
        // Create SelectionUnit from nodepath
    });
});
```

### SqrtBarExtractor

Handles both square roots and nth roots. Includes radical sign AND vinculum:

```javascript
svg.querySelectorAll('.mjx-svg-msqrt, .mjx-svg-mroot').forEach(container => {
    container.querySelectorAll('path').forEach(path => {
        const meta = path.getAttribute('meta');
        // Include: MJMAIN-221A (radical sign) and rect (horizontal bar)
        if (meta === 'MJMAIN-221A' || meta === 'rect') {
            unit.addFragment(nodepath);
        }
    });
});
```

### CharacterExtractor

Maps characters/Greek letters to MathJax meta values:

```javascript
static CHARACTER_MAP = {
    'A': 'MJMATHI-41', ... 'Z': 'MJMATHI-5A',
    'a': 'MJMATHI-61', ... 'z': 'MJMATHI-7A',
    '0': 'MJMAIN-30',  ... '9': 'MJMAIN-39'
};

static GREEK_MAP = {
    '\\alpha': 'MJMATHI-3B1',
    '\\beta': 'MJMATHI-3B2',
    // ... all Greek letters
};

svg.querySelectorAll(`path[meta="${metaValue}"]`).forEach(path => {
    // Create SelectionUnit from nodepath
});
```

## Commands Using PatternSelector

All pattern-based commands now use PatternSelector:

- `RewriteOnlyCommand` - Animate only matching patterns on existing component
- `RewriteWithoutCommand` - Animate everything except matching patterns
- `WriteOnlyCommand` - Create and animate only matching patterns
- `WriteWithoutCommand` - Create and animate everything except patterns
- `SubOnlyCommand` - Extract TextItems for matching patterns
- `SubWithoutCommand` - Extract TextItems excluding patterns

## Edge Cases

### Nested Fractions

For `\frac{\frac{a}{b}}{c}`:
- Inner fraction bar has 2+ `.mjx-svg-mfrac` ancestors
- Outer fraction bar has exactly 1 ancestor
- Current implementation: `\frac` matches ALL fraction bars

### Multiple Occurrences

Pattern "x" in `x^2 + x` creates separate SelectionUnits for each occurrence.
