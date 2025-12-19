# Dynamic LaTeX Positioning Pattern

## Overview

A technique for creating LaTeX constructs that dynamically match the size of existing rendered elements. Uses `\phantom{\hspace{Wpx}}` as an invisible spacer with a calculated width, combined with LaTeX structures like `\overbrace` or `\underbrace`.

## The Problem

When annotating existing math text (e.g., adding a brace above a portion of an equation), we need the annotation to:
1. Match the exact width of the target element
2. Be positioned precisely relative to the target
3. Render as valid LaTeX with proper styling

## The Solution

### Step 1: Measure Target Bounds

```javascript
const targetBounds = textItem.getCanvasBounds();
// Returns Bounds2 with: minX, minY, maxX, maxY, width, height, centerX, centerY
```

### Step 2: Construct Dynamic LaTeX

Use `\phantom{\hspace{Wpx}}` where W is the measured width:

```javascript
// For overbrace (annotation above)
const latex = `\\overbrace{\\phantom{\\hspace{${targetBounds.width}px}}}^{${annotation}}`;

// For underbrace (annotation below)
const latex = `\\underbrace{\\phantom{\\hspace{${targetBounds.width}px}}}_{${annotation}}`;
```

**How it works:**
- `\hspace{Wpx}` creates horizontal space of exactly W pixels
- `\phantom{...}` makes the space invisible (no rendering, but occupies space)
- `\overbrace{...}^{text}` draws a brace over the phantom, with annotation above
- `\underbrace{...}_{text}` draws a brace under the phantom, with annotation below

### Step 3: Create and Position Component

```javascript
// Create new MathTextComponent with the dynamic LaTeX
const mathComponent = new MathTextComponent(
    latex,
    0, 0,  // row, col not used - position set directly
    targetMathComponent.coordinateMapper,
    targetMathComponent.parentDOM,
    { fontSize, stroke, fill }
);

// Measure internal path bounds (offset from container top-left)
const sourceBounds = MathTextPositionUtil.getPathBoundsInContainer(mathComponent.containerDOM);

// Calculate aligned position
const position = MathTextPositionUtil.topAlignPosition(targetBounds, sourceBounds, buffer);
// or: MathTextPositionUtil.bottomAlignPosition(targetBounds, sourceBounds, buffer);

// Apply position
mathComponent.setCanvasPosition(position.x, position.y);
```

## Why This Works

1. **Pixel-perfect width matching**: `\hspace{Wpx}` accepts pixel values, matching the measured width exactly

2. **LaTeX handles the decorations**: The brace, tips, and annotation text are all rendered by MathJax with proper styling

3. **Phantom is invisible**: The spacer doesn't render, so only the brace and annotation are visible

4. **Standard positioning**: Once rendered, we use `MathTextPositionUtil` to align the component precisely

## Use Cases

### TopWriteCommand / BottomWriteCommand

Adds overbrace/underbrace annotations to selected math text:

```
M = write("\frac{a+b}{c}")
T = subonly(M, "a+b")
topw(T, "numerator")      // Draws overbrace with "numerator" above "a+b"
bottomw(T, "denominator") // Draws underbrace with "denominator" below
```

### Potential Extensions

- **Arrows**: `\xrightarrow[\phantom{\hspace{W}}]{label}` for arrows spanning content
- **Boxes**: `\boxed{\phantom{\hspace{W}\vspace{H}}}` for rectangular highlights
- **Brackets**: `\left[\phantom{...}\right]` for spanning brackets

## Implementation Files

- `src/engine/commands/TopWriteCommand.js`
- `src/engine/commands/BottomWriteCommand.js`
- `src/mathtext/utils/math-text-position-util.js`

## Key Insight

The pattern separates concerns:
1. **LaTeX** handles the visual structure (braces, annotations)
2. **JavaScript** handles the dynamic measurement and positioning
3. **MathJax** renders everything consistently with the rest of the math
