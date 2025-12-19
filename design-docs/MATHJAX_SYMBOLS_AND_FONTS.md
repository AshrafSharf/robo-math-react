# MathJax Symbols and Font System Documentation

This document explains how MathJax renders LaTeX symbols, how we intercept font definitions to provide custom strokeable paths, and how to add support for new symbols.

## Overview

MathJax converts LaTeX to SVG. For pen-tracing animations, we need:
1. SVG `<path>` elements (not `<text>`)
2. Strokeable paths (open paths with `fill: none`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYMBOL RENDERING PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   LaTeX Input     MathJax        Font Defs       Output Processor        │
│       │              │              │                  │                 │
│       ▼              ▼              ▼                  ▼                 │
│   ┌────────┐    ┌─────────┐    ┌─────────┐      ┌───────────┐           │
│   │\square │───▶│ Parse   │───▶│ Lookup  │─────▶│ Replace   │           │
│   │        │    │ to AST  │    │ 0x25A1  │      │ with      │           │
│   └────────┘    └─────────┘    │ in FONTS│      │ strokeable│           │
│                                └─────────┘      │ paths     │           │
│                                     │           └───────────┘           │
│                                     ▼                  │                 │
│                              ┌───────────┐             ▼                 │
│                              │ SVG Path  │      ┌───────────┐           │
│                              │ (filled)  │      │ SVG Path  │           │
│                              └───────────┘      │ (stroked) │           │
│                                                 └───────────┘           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Architecture

### Key Files

| File | Purpose |
|------|---------|
| `src/utils/plugin-initializer.js` | MathJax config & extension loading |
| `src/mathtext/font-defs.js` | MathJax font definitions (character → filled path) |
| `src/mathtext/processor/main-font-map.js` | Strokeable paths for pen tracing |
| `src/mathtext/processor/symbol-characters-map.js` | Additional symbol paths |
| `src/mathtext/processor/jax-output-processor.js` | Post-processes MathJax SVG output |
| `src/mathtext/services/font-map.service.js` | Serves strokeable paths by character ID |

### SVG Element Converters

Located in `src/mathtext/processor/`:

| File | Converts |
|------|----------|
| `rect-to-path-converter.js` | `<rect>`, `<line>` → `<path>` |
| `polygon-to-path-converter.js` | `<polygon>` → `<path>` |
| `ellipse-to-path-converter.js` | `<ellipse>`, `<circle>` → `<path>` |

## MathJax Extensions

Extensions provide additional LaTeX commands. Configured in `plugin-initializer.js`:

```javascript
'    TeX: {\n' +
'      extensions: ["bbox.js", "color.js", "cancel.js", "enclose.js", "AMSsymbols.js"]\n' +
'    },\n' +
```

### Available Extensions

| Extension | Commands Provided |
|-----------|-------------------|
| `bbox.js` | `\bbox[options]{content}` - bounding boxes |
| `color.js` | `\color{red}{text}`, `\textcolor` |
| `cancel.js` | `\cancel`, `\bcancel`, `\xcancel`, `\cancelto` |
| `enclose.js` | `\enclose{notation}{content}` |
| `AMSsymbols.js` | `\therefore`, `\because`, `\square`, `\blacksquare`, Greek letters, etc. |

### Enclose Notations

```latex
\enclose{circle}{x}           % circle around content
\enclose{box}{x}              % box around content
\enclose{roundedbox}{x}       % rounded box
\enclose{horizontalstrike}{x} % strikethrough
\enclose{updiagonalstrike}{x} % diagonal strike (same as \cancel)
```

## How Font Interception Works

### 1. MathJax Font Loading

MathJax loads fonts with character definitions. Each character has:
- Unicode code point (e.g., `0x25A1` for □)
- Metrics: `[height, depth, width, leftBearing, rightBearing, 'svgPath']`

### 2. Our Font Definitions (`font-defs.js`)

We provide our own definitions that MathJax uses:

```javascript
// In font-defs.js - loadMJMain()
0x25A1: [695, 195, 667, 56, 611, 'M71 -6V689H596V-6H71ZM126 49H541V634H126V49'],
```

This tells MathJax to output a `<path>` element with the given SVG path data.

### 3. Path Replacement (`main-font-map.js`)

MathJax outputs filled paths. We replace them with strokeable paths:

```javascript
// In main-font-map.js
'MJMAIN-25A1': ['m71 -6 v695 h525 v-695 h-525'],
```

The key format is `MJMAIN-{hexCode}` or `MJMATHI-{hexCode}` (for italic).

### 4. Output Processing (`jax-output-processor.js`)

```javascript
process(svgHtml, strokeWidthInEx) {
  // 1. Replace paths with strokeable versions from font map
  cheerio$('path').each(function() {
    const pathValues = FontMapService.getInstance().getPathList(metaPathValue);
    // Replace with strokeable paths, set fill='none'
  });

  // 2. Convert other SVG elements to paths
  convertRectsToPath(cheerio$, strokeWidthInEx);
  convertLinesToPath(cheerio$, strokeWidthInEx);
  convertPolygonsToPath(cheerio$, strokeWidthInEx);
  convertEllipsesToPath(cheerio$, strokeWidthInEx);
  convertCirclesToPath(cheerio$, strokeWidthInEx);
}
```

## Adding Support for New Symbols

### Step 1: Check if Extension is Needed

If you get "Undefined control sequence", add the extension to `plugin-initializer.js`:

```javascript
extensions: ["bbox.js", "color.js", "cancel.js", "enclose.js", "AMSsymbols.js", "newextension.js"]
```

### Step 2: Add Font Definition

If the symbol renders as `<text>` instead of `<path>`, add to `font-defs.js`:

1. Find the Unicode code point (e.g., U+2234 for ∴)
2. Add to `loadMJMain()` function:

```javascript
// THEREFORE (∴)
0x2234: [521, 16, 620, 54, 566, 'M250 436Q250 473...path data...'],
```

Format: `[height, depth, width, leftBearing, rightBearing, 'svgPathData']`

### Step 3: Add Strokeable Path

Add to `main-font-map.js` for pen-tracing animation:

```javascript
// ∴ therefore (U+2234)
'MJMAIN-2234': [
  'm250 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',  // top dot
  'm80 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',   // bottom left
  'm420 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0'   // bottom right
],
```

Key format: `'MJMAIN-{hexCodeUppercase}'` or `'MJMATHI-{hexCodeUppercase}'`

Multi-path symbols use arrays - each path is drawn sequentially.

### Step 4: Handle Special SVG Elements

If MathJax outputs non-path elements, add converters:

| Element | Converter File |
|---------|----------------|
| `<rect>` | `rect-to-path-converter.js` |
| `<line>` | `rect-to-path-converter.js` |
| `<polygon>` | `polygon-to-path-converter.js` |
| `<ellipse>` | `ellipse-to-path-converter.js` |
| `<circle>` | `ellipse-to-path-converter.js` |

## Path Data Guidelines

### Strokeable vs Filled Paths

**Filled Path (MathJax default):**
```
M71 -6V689H596V-6H71ZM126 49H541V634H126V49
```
- Closed shapes (ends with Z or returns to start)
- Uses fill color

**Strokeable Path (for pen tracing):**
```
m71 -6 v695 h525 v-695 h-525
```
- Open or single-stroke paths
- Uses `fill: none`, `stroke-width: 85`

### Common Path Commands

| Command | Meaning |
|---------|---------|
| `M x,y` | Move to (absolute) |
| `m dx,dy` | Move to (relative) |
| `L x,y` | Line to (absolute) |
| `l dx,dy` | Line to (relative) |
| `H x` | Horizontal line to |
| `h dx` | Horizontal line (relative) |
| `V y` | Vertical line to |
| `v dy` | Vertical line (relative) |
| `A rx,ry rot large-arc sweep x,y` | Arc |
| `a rx,ry rot large-arc sweep dx,dy` | Arc (relative) |
| `Z` | Close path |

### Drawing Circles/Dots

Use two arcs to draw a circle:
```
m250 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0
```
- Start at left point of circle
- Arc to right point
- Arc back to start

## Debugging

### Check MathJax Output

Use the debug method in browser console:
```javascript
MathJaxProcessor.debugRenderLatex("\\square")
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Undefined control sequence" | Extension not loaded | Add to `extensions` array |
| Renders as `<text>` | No font definition | Add to `font-defs.js` |
| Renders but no animation | No strokeable path | Add to `main-font-map.js` |
| Shape outline missing | Element type not converted | Add converter in `jax-output-processor.js` |

## Symbol Reference

### Currently Supported Special Symbols

| Command | Symbol | Unicode | Key |
|---------|--------|---------|-----|
| `\therefore` | ∴ | U+2234 | MJMAIN-2234 |
| `\because` | ∵ | U+2235 | MJMAIN-2235 |
| `\square` | □ | U+25A1 | MJMAIN-25A1 |
| `\blacksquare` | ■ | U+25A0 | MJMAIN-25A0 |
| `\triangle` | △ | U+25B3 | MJMAIN-25B3 |
| `\blacktriangle` | ▲ | U+25B2 | MJMAIN-25B2 |
| `\triangledown` | ▽ | U+25BD | MJMAIN-25BD |
| `\blacktriangledown` | ▼ | U+25BC | MJMAIN-25BC |
| `\diamond` | ◇ | U+25C7 | MJMAIN-25C7 |
| `>` | > | U+003E | MJMAIN-3E |
| `<` | < | U+003C | MJMAIN-3C |

### Cancel Commands

| Command | Effect |
|---------|--------|
| `\cancel{x}` | Diagonal line ╱ |
| `\bcancel{x}` | Back-diagonal ╲ |
| `\xcancel{x}` | X through content |
| `\cancelto{y}{x}` | Diagonal with arrow to y |
