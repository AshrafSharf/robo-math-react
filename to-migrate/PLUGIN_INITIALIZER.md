# Plugin Initializer Documentation

## Overview

The PluginInitializer (`src/plugins/plugin-initializer.js`) is responsible for loading and initializing all external libraries required for the mathtext animation system. It orchestrates the asynchronous loading of MathJax, GSAP plugins, and other utilities from a CDN.

## Initialization Flow

```javascript
await PluginInitializer.initialize();
```

This single call performs the following steps:

1. **Configure MathJax** - Sets up MathJax configuration
2. **Create MathJax DOM** - Adds required DOM elements for MathJax processing
3. **Load Plugin Libraries** - Asynchronously loads all external scripts
4. **Load MathJax Hook** - Loads custom TEXT_TO_ML translator
5. **Initialize Font System** - Sets up font mapping and definitions

## Configuration Steps

### 1. MathJax Configuration (`addMathJaxConfig()`)

Creates a configuration script for MathJax with the following settings:

```javascript
MathJax.Hub.Config({
    extensions: ["tex2jax.js"],
    jax: ["input/TeX", "output/SVG"],
    showProcessingMessages: true,
    showMathMenu: false,
    messageStyle: 'none',
    skipStartupTypeset: false,
    tex2jax: {
        inlineMath: [["$","$"], ["\\(","\\)"]]
    },
    TeX: {
        extensions: ["bbox.js", "color.js"]
    },
    SVG: {
        useFontCache: false
    }
});
```

**Key Settings:**
- **Input**: TeX (LaTeX syntax)
- **Output**: SVG (required for animation)
- **Extensions**: bbox.js for bounding boxes, color.js for colored text
- **Font Cache**: Disabled to prevent conflicts with dynamic font loading
- **Inline Math**: Supports `$...$` and `\(...\)` delimiters

### 2. MathJax DOM Elements (`addMathJaxDOM()`)

Creates required DOM structure for MathJax processing:

```html
<div id="jax-container-dom">
  <div id="scratchpad-Frame"></div>
  <div id="inputjaxForm"></div>
  <div class="box" id="box" style="visibility:hidden">
    <div id="MathOutput" class="output">$${}$$</div>
  </div>
  <div id="svg-math-annotation"></div>
</div>
```

**Purpose:**
- **MathOutput**: Hidden container where MathJax renders SVG before it's moved to the final location
- **scratchpad-Frame**: Temporary processing area
- **svg-math-annotation**: Annotation container

## Library Loading

### CDN Base URL

All libraries are loaded from:
```
https://provility-lib.s3.amazonaws.com/assets/
```

### MathJax Core

| Library | Purpose |
|---------|---------|
| `mathjax/unpacked/MathJax.js` | Core MathJax library - converts LaTeX to SVG |

### MathJax Extension Modules

These are app-triggered loaders for specific MathJax features:

| Library | Purpose |
|---------|---------|
| `mathjax/unpacked/app-triggered/mtable-loader.js` | Matrix and table support (`\begin{array}`, `\begin{matrix}`) |
| `mathjax/unpacked/app-triggered/multiline-loader.js` | Multi-line equation support (`\begin{align}`, `\begin{gather}`) |
| `mathjax/unpacked/app-triggered/ms-loader.js` | Math spacing elements (`\mspace`, spacing rules) |
| `mathjax/unpacked/app-triggered/mmultiscript-loader.js` | Multiscript notation (tensor notation, prescripts) |
| `mathjax/unpacked/app-triggered/menclose-loader.js` | Enclosures (`\boxed{}`, circles, strike-through) |
| `mathjax/unpacked/app-triggered/rep-key-list.js` | Replacement key mapping for character substitution |

**Note:** These are "app-triggered" because they're loaded explicitly by the application rather than on-demand by MathJax.

### GSAP Animation Plugins

Premium GSAP plugins for advanced SVG animations:

| Library | Purpose | Usage in System |
|---------|---------|-----------------|
| `external/BezierPlugin.min.js` | Animate along Bezier curves | Used for smooth curved path animations |
| `external/DrawSVGPlugin.min.js` | Animate SVG stroke drawing | **Core plugin** - enables write effect by animating strokeDashoffset |
| `external/MorphSVGPlugin.min.js` | Morph between SVG shapes | Shape transformation animations |
| `external/SplitText.min.js` | Split text into characters/words | Character-by-character text animations |

**DrawSVGPlugin** is critical for the mathtext write effect:
```javascript
// DrawSVGPlugin controls this animation
gsap.to(element, {
    strokeDashoffset: 0,
    duration: 1
});
```

### Other Utilities

| Library | Purpose |
|---------|---------|
| `external/dom-to-image.js` | Convert DOM elements to images | Screenshot/export functionality |

### MathJax Hook

| Library | Purpose |
|---------|---------|
| `mathjax/hook.js` | Custom MathJax extension providing TEXT_TO_ML translator | Converts text to MathML representation |

**Loading Order:**
1. All MathJax core and extension modules load in parallel
2. After all complete, `hook.js` loads
3. After hook loads, font initialization begins

## Font System Initialization

After all libraries load, the initializer sets up the MathJax font system:

### 1. Ensure SVG Output is Ready

```javascript
if (!window.MathJax.OutputJax || !window.MathJax.OutputJax.SVG) {
    throw new Error("MathJax.OutputJax.SVG not available");
}
```

### 2. Initialize FONTDATA Structure

```javascript
window.MathJax.OutputJax.SVG.FONTDATA = {
    FONTS: {},      // Font definitions
    VARIANT: {},    // Font variants (bold, italic, etc.)
    RANGES: [],     // Unicode ranges
    DELIMITERS: {}, // Delimiter sizing data
    RULECHAR: 0x2212, // Default rule character (minus sign)
    REMAP: {}       // Character remapping
};
```

### 3. Initialize FontMapService

```javascript
FontMapService.getInstance();
```

Singleton service that manages font family mappings for different mathematical contexts.

### 4. Load Font Definitions

```javascript
FontDefs.loadAllDefs();
```

Populates `FONTDATA.FONTS` with complete font metric data for all mathematical characters.

## Error Handling

### Timeout Handling

Each script has a 10-second timeout:

```javascript
setTimeout(() => {
    if (url.startsWith('external/') || url.startsWith('mathjax/unpacked/app-triggered/')) {
        resolve(); // Non-critical plugins - continue without them
    } else {
        reject(new Error("Timeout loading: " + url));
    }
}, 10000);
```

**Critical Libraries** (will reject on timeout):
- `mathjax/unpacked/MathJax.js`
- `mathjax/hook.js`

**Non-Critical Libraries** (will continue on failure):
- All GSAP plugins (`external/*`)
- All MathJax app-triggered modules

### Load Failure Handling

If non-critical plugins fail to load, the initializer logs a warning but continues:

```javascript
console.warn("Non-critical plugin failed, continuing:", url);
resolve(); // Don't block initialization
```

## Usage in RoboCanvas

```javascript
// In RoboCanvas.init()
await PluginInitializer.initialize();
```

**Blocking Call:**
The initialization is intentionally blocking. The application shows a loading screen while plugins load:

```html
<div class="loading">
  <div class="spinner"></div>
  <h2>Initializing RoboCanvas</h2>
  <p>Loading MathJax and graphics libraries...</p>
</div>
```

**Why Blocking?**
- MathJax must be fully loaded before any LaTeX can be processed
- Font data must be loaded before rendering text
- GSAP plugins must be available before creating animations
- Loading everything upfront prevents runtime errors

## Initialization Promise Chain

```
addPluginLibraries()
  ↓
[Load MathJax core + extensions + GSAP plugins in parallel]
  ↓
Load hook.js
  ↓
MathJax.Hub.Queue(callback)
  ↓
Initialize FONTDATA structure
  ↓
FontMapService.getInstance()
  ↓
FontDefs.loadAllDefs()
  ↓
Resolve - System Ready
```

## Dependencies

The PluginInitializer depends on:

- **FontDefs** (`src/mathtext/font-defs.js`) - Font definition loader
- **FontMapService** (`src/mathtext/services/font-map.service.js`) - Font mapping service

These must be available as ES modules before initialization.

## Performance Considerations

### Parallel Loading

All main libraries load in parallel using `Promise.all()`:

```javascript
const libPromises = mathJaxLibs.map((libPath) => {
    return this.importScript(libPath.url, libPath.parent);
});

await Promise.all(libPromises);
```

**Benefit:** Reduces total load time from ~10s (sequential) to ~2-3s (parallel)

### CDN Caching

Libraries are loaded from a static CDN URL, enabling browser caching:
- First load: Downloads all libraries (~2-3 MB total)
- Subsequent loads: Uses cached versions (instant)

### Font Data Size

Font definitions are large (~500 KB of data). They're loaded after the UI is ready to prevent blocking initial render.

## Troubleshooting

### Common Issues

**Issue:** MathJax.Hub not available
```
Error: MathJax.Hub not available
```
**Solution:** Check that `mathjax/unpacked/MathJax.js` loaded successfully. Check CDN connectivity.

**Issue:** DrawSVGPlugin not found
```
Error: Invalid property strokeDashoffset
```
**Solution:** GSAP DrawSVGPlugin failed to load. Check if `external/DrawSVGPlugin.min.js` is accessible.

**Issue:** Font rendering incorrect
```
Characters display as empty boxes
```
**Solution:** FontDefs.loadAllDefs() may have failed. Check console for errors during font loading.

### Debug Logging

The initializer includes extensive console logging:

```javascript
console.log("MATHJAX Libraries added successfully");
console.log("MathJax hook.js loaded successfully");
console.log("Inside Hub.Queue callback");
console.log("Loading FontDefs...");
console.log("FontDefs.loadAllDefs completed");
```

Monitor the console during initialization to identify which step fails.

## Security Considerations

### External CDN Dependency

The system relies on external CDN (S3 bucket):
```
https://provility-lib.s3.amazonaws.com/assets/
```

**Risks:**
- CDN unavailability breaks the entire system
- CDN compromise could inject malicious code

**Mitigations:**
- Consider hosting libraries locally
- Implement Subresource Integrity (SRI) hashes
- Add fallback CDN sources

### Script Injection

Dynamic script loading from external sources:
```javascript
s.src = fullPath;
parentContainer.appendChild(s);
```

**Recommendation:** Validate or hash library contents before execution in production.

## Future Improvements

1. **Local Hosting**: Host critical libraries locally as fallback
2. **Lazy Loading**: Load non-critical plugins only when needed
3. **SRI Hashes**: Add integrity checking for CDN scripts
4. **Version Pinning**: Lock library versions to prevent unexpected updates
5. **Size Optimization**: Minify and bundle font definitions
6. **Progressive Loading**: Show UI progressively as libraries load
7. **Service Worker**: Cache libraries using service worker for offline support
