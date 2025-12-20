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

### CancelCommand

Draws diagonal strikethrough lines over selected math text:

```
M = write("\frac{a+b}{c}")
T = subonly(M, "a")
cancel(T, "0", "u")   // Diagonal strike with arrow pointing to "0"
cancel(T, "", "d")    // Down diagonal (no text)
cancel(T, "", "x")    // X pattern (cross)
```

**2D Phantom (Width × Height):**

For cancel, we need both width AND height to size the diagonal correctly:

```javascript
// Create phantom box matching target dimensions
const phantomContent = `\\phantom{\\rule{${width}px}{${height}px}}`;

// Wrap in cancel command
const latex = `\\cancel{${phantomContent}}`;      // up diagonal
const latex = `\\bcancel{${phantomContent}}`;     // down diagonal
const latex = `\\xcancel{${phantomContent}}`;     // X pattern
const latex = `\\cancelto{text}{${phantomContent}}`; // with annotation
```

**Positioning Strategy - Left/Bottom Align:**

For cancel overlays, we use left-align horizontally and bottom-align vertically because the phantom (and thus the diagonal) is at the bottom of the component structure:

```javascript
const pathBounds = MathTextPositionUtil.getPathBoundsInContainer(mathComponent.containerDOM);

// Left align: paths left edge at target left edge
const x = targetBounds.minX - pathBounds.offsetX;

// Bottom align: paths bottom at target bottom (phantom is at bottom of cancelto)
const y = targetBounds.maxY - pathBounds.offsetY - pathBounds.height;

mathComponent.setCanvasPosition(x, y);
```

### Potential Extensions

- **Arrows**: `\xrightarrow[\phantom{\hspace{W}}]{label}` for arrows spanning content
- **Boxes**: `\boxed{\phantom{\hspace{W}\vspace{H}}}` for rectangular highlights
- **Brackets**: `\left[\phantom{...}\right]` for spanning brackets

## Implementation Files

- `src/engine/commands/TopWriteCommand.js`
- `src/engine/commands/BottomWriteCommand.js`
- `src/engine/commands/CancelCommand.js`
- `src/mathtext/utils/math-text-position-util.js`
- `src/mathtext/processor/svg-converters/cancel-arrow-converter.js`

## Cancel Arrow Post-Processing

MathJax's `\cancelto` renders a diagonal line with an arrow head pointing to the annotation text. For pen animation, we:

1. **Remove arrow head polygons** - Closed paths (ending with `Z`) are arrow heads
2. **Shorten diagonal lines** - The line extends to where the arrow tip was

### Trim Strategies

The converter supports multiple strategies via `setTrimStrategy()`:

| Strategy | Description |
|----------|-------------|
| `'fixed'` | Trim 28% from both ends - simple, tested fallback |
| `'calculated'` | Measure arrow head size, trim based on actual dimensions (default) |
| `'none'` | Just remove arrow heads, no line trimming |

```javascript
import { setTrimStrategy } from './cancel-arrow-converter.js';
setTrimStrategy('calculated');  // Use precise calculation
setTrimStrategy('fixed');       // Use fixed percentage
```

## Key Insight

The pattern separates concerns:
1. **LaTeX** handles the visual structure (braces, annotations)
2. **JavaScript** handles the dynamic measurement and positioning
3. **MathJax** renders everything consistently with the rest of the math
4. **Post-processors** adjust MathJax output for animation needs (e.g., cancel arrows)
