# MathText System Design

## Overview

The mathtext system provides animated mathematical text rendering using MathJax. It processes LaTeX-style mathematical expressions into SVG, then animates them with a "handwriting" effect that traces each stroke in order.

## Core Components

### MathTextComponent (`src/mathtext/components/math-text-component.js`)

The central component that orchestrates the entire mathtext pipeline:

1. **Initialization**: Takes LaTeX text and rendering options (fontSize, stroke color, etc.)
2. **MathJax Processing**: Converts LaTeX to SVG via MathJax
3. **SVG Analysis**: Parses the SVG structure to build an animation graph
4. **Animation Graph**: Creates a tree of `MathNodeGraph` objects representing the SVG hierarchy
5. **Tweening**: Extracts drawable elements (paths, lines, rects) as `TweenableNode` objects
6. **Effect Creation**: Provides effects that can animate the SVG

**Key Methods:**
- `init()` - Processes LaTeX through MathJax and builds the animation graph
- `getTweenableNodes()` - Returns all drawable elements ready for animation
- `writeOnlyBBox()` - Creates effect to animate only bbox-highlighted parts
- `writeWithoutBBox()` - Creates effect to animate everything except bbox-highlighted parts
- `getBBoxHighlightBounds()` - Extracts bounding boxes of special `<rect meta="highlight">` elements

### LogicalCoordinateMapper (`src/mathtext/components/logical-coordinate-mapper.js`)

Maps logical grid coordinates to pixel coordinates for text positioning. Enables users to place text using simple grid positions (e.g., row 2, column 3) instead of calculating pixel positions.

**Example:**
```javascript
const mapper = new LogicalCoordinateMapper(800, 600, 8, 16);
const pos = mapper.toPixels(2, 3); // Returns {x: pixels, y: pixels}
```

## Animation Graph Structure

### MathNodeGraph (`src/mathtext/animator/math-node-graph.js`)

Represents a node in the SVG hierarchy. Each MathNodeGraph:
- Wraps a cheerio element from the parsed SVG
- Has an element ID for DOM manipulation
- Contains child nodes (tree structure)
- Tracks stroke color
- Has a node path for identification (e.g., "0.1.2")

**Key Responsibilities:**
- Collects all `TweenableNode` objects from drawable children
- Assigns node paths for hierarchical identification
- Manages stroke visibility (dash-array manipulation)
- Collects selection units based on bounding box intersections
- Updates stroke colors recursively

### TweenableNode (`src/mathtext/animator/tweenable-node.js`)

Wraps drawable SVG elements (path, line, rect) for animation. Each TweenableNode:
- Calculates total path length
- Extracts start/end points for pen tracing
- Provides tween targets for GSAP animation

**Animation Strategy:**
Uses SVG stroke-dasharray and stroke-dashoffset to create the "writing" effect:
```javascript
// Initially: hide the stroke
strokeDasharray = "0, 10000"

// During animation: reveal progressively
strokeDasharray = `${progress}, ${totalLength - progress}`
```

## Effects System

Effects encapsulate different animation strategies for mathtext. All effects follow the same pattern:
1. Get twenable nodes from MathTextComponent
2. Configure which nodes to animate (all, some, or exclude some)
3. Execute GSAP timeline to animate the strokes
4. Return to caller when animation completes

### WriteEffect (`src/mathtext/effects/write-effect.js`)

Animates the entire mathematical expression from start to finish.

**Usage:**
```javascript
const effect = new WriteEffect(mathComponent);
await effect.play();
```

**Animation Flow:**
1. Gets all twenable nodes from mathComponent
2. Disables all strokes initially (dash-array = "0,10000")
3. Creates GSAP timeline that animates each node sequentially
4. Each node animates from strokeDashoffset = totalLength → 0
5. Returns promise that resolves when complete

### WriteOnlyEffect (`src/mathtext/effects/write-only-effect.js`)

Animates only specific parts of the expression based on selection units.

**Parameters:**
- `selectionUnits` - Array of SelectionUnit objects defining which fragments to animate
- `includeAll` - If true, shows non-selected parts; if false, hides them

**Usage:**
```javascript
const selectionUnit = new SelectionUnit();
// ... populate selection unit with node paths
const effect = new WriteOnlyEffect(mathComponent, [selectionUnit], false);
await effect.play();
```

**Animation Flow:**
1. Filters twenable nodes to only those in selection units
2. Hides non-selected nodes (if includeAll = false)
3. Animates only selected nodes
4. Enables strokes on non-selected nodes after animation (if includeAll = true)

### WriteWithoutEffect (`src/mathtext/effects/write-without-effect.js`)

Animates everything except specific parts (inverse of WriteOnlyEffect).

**Parameters:**
- `selectionUnits` - Array of SelectionUnit objects defining which fragments to exclude

**Usage:**
```javascript
const selectionUnit = new SelectionUnit();
// ... populate selection unit with node paths to exclude
const effect = new WriteWithoutEffect(mathComponent, [selectionUnit]);
await effect.play();
```

**Animation Flow:**
1. Immediately shows excluded fragments (stroke-dasharray = "0,0")
2. Filters twenable nodes to exclude selection units
3. Animates remaining nodes

## Selection System

### SelectionUnit (`src/mathtext/models/selection-unit.js`)

Represents a set of node paths (fragments) to include/exclude in animation.

**Key Methods:**
- `addFragment(nodePath)` - Adds a node path to the selection
- `containsFragment(nodePath)` - Checks if node path is in selection

### BBox-Based Selection

MathText supports special `<rect meta="highlight">` elements in LaTeX that define bounding boxes for partial selection.

**Example LaTeX:**
```latex
\bbox[yellow]{x^2} + \bbox[green]{2x} + 1
```

The bbox rectangles are extracted and used to compute which SVG fragments fall within those bounds, enabling effects like:
- Animate only the highlighted terms
- Animate everything except the highlighted terms

## Integration with Diagram Classes

### Diagram (`src/diagram/diagram.js`)

Static (instant) rendering without animation.

**mathText Method:**
```javascript
mathText(text, col, row, options = {}) {
  const mathComponent = new MathTextComponent(/*...*/);
  await mathComponent.init();
  // Immediately show all strokes without animation
  mathComponent.enableStroke();
  return mathComponent;
}
```

### AnimatedDiagram (`src/diagram/animated-diagram.js`)

Queued animation system. Each operation is added to a queue and played sequentially.

**mathText Method:**
```javascript
async mathText(text, col, row, options = {}) {
  const mathComponent = new MathTextComponent(/*...*/);
  await mathComponent.init();

  // Create animation effect
  const writeEffect = new WriteEffect(mathComponent);

  // Queue the animation
  this.queue.push({
    type: 'mathtext',
    play: async () => {
      await writeEffect.play();
    }
  });

  return mathComponent;
}
```

**Key Difference:**
- `Diagram` shows text instantly
- `AnimatedDiagram` queues animation and plays when `playNext()` or `playAll()` is called

## Animation Pipeline

### Complete Flow

1. **User calls mathText()** with LaTeX string and position
   ```javascript
   await animatedDiagram.mathText('f(x) = x^2', 2, 3);
   ```

2. **MathTextComponent initialization**
   - Converts logical coordinates (2,3) to pixels
   - Processes LaTeX through MathJax → SVG
   - Parses SVG with cheerio
   - Builds MathNodeGraph tree
   - Assigns node paths
   - Appends SVG to DOM

3. **Effect creation**
   - Creates `WriteEffect` with the mathComponent
   - Effect is queued in AnimatedDiagram

4. **Animation playback** (when playNext() is called)
   - Effect retrieves all TweenableNode objects
   - Disables all strokes initially
   - Creates GSAP timeline
   - For each node:
     - Calculates path length
     - Animates strokeDashoffset from length → 0
     - Duration based on length (longer paths take more time)
   - Returns promise when animation completes

5. **Pen tracing** (optional)
   - If pen tracer is enabled, moves pen along animation
   - Uses TweenableNode's getPointAt(progress) to follow path

## Advanced Usage Examples

### Example 1: Full Expression Animation

```javascript
// Create and animate entire expression
const mathComp = await animatedDiagram.mathText('\\frac{a}{b} + c', 1, 1);
await animatedDiagram.playNext();
```

### Example 2: Partial Animation with BBox

```javascript
// LaTeX with highlighted sections
const latex = '\\bbox[yellow]{x^2} + \\bbox[green]{2x} + 1';
const mathComp = await animatedDiagram.mathText(latex, 2, 2);

// Animate only yellow-highlighted part
const effect = mathComp.writeOnlyBBox(false);
await effect.play();

// Later: animate the rest
const effect2 = mathComp.writeWithoutBBox();
await effect2.play();
```

### Example 3: Custom Selection

```javascript
const mathComp = await animatedDiagram.mathText('a + b + c', 3, 3);
await mathComp.init();

// Create custom selection unit
const selectionUnit = new SelectionUnit();
// Manually compute which fragments to include
const bounds = Bounds2.rect(x, y, width, height);
mathComp.computeSelectionUnit(bounds, selectionUnit);

// Animate only selected parts
const effect = new WriteOnlyEffect(mathComp, [selectionUnit], false);
await effect.play();
```

## Dependencies

### External Libraries
- **MathJax** - Converts LaTeX to SVG
- **cheerio-standalone** - Server-side HTML/XML parser for SVG processing
- **GSAP** - Animation engine for tweening strokes

### Internal Dependencies
- **Geometry** (`src/geom/`) - Point, Bounds2 for spatial calculations
- **Pen System** (`src/pen/`) - Optional pen tracing during animation
- **DOM Query** (`src/mathtext/utils/dom-query.js`) - Lightweight jQuery-like DOM manipulation

## Key Design Decisions

### Why Cheerio?
MathJax outputs complex SVG with nested groups and metadata. Cheerio provides jQuery-like API for parsing and traversing this SVG structure server-side or in-browser.

### Why Node Paths?
Node paths (e.g., "0.1.2") provide stable identifiers for SVG fragments independent of DOM changes. They enable:
- Selection unit matching
- Partial animation control
- Debugging and inspection

### Why Separate Effects?
Separating effects from MathTextComponent follows single-responsibility principle:
- MathTextComponent: LaTeX processing and SVG management
- Effects: Animation strategies
- Enables easy creation of new animation patterns without modifying core component

### Why TweenableNode Wrapper?
SVG elements alone don't have animation-specific data. TweenableNode adds:
- Cached path length calculations
- Start/end point extraction
- Tween progress → point mapping for pen tracing

## Performance Considerations

1. **Lazy Tween Collection**: TweenableNodes are collected on-demand, not during init
2. **Path Length Caching**: SVG path lengths calculated once and cached
3. **Selective Animation**: WriteOnly/WriteWithout effects avoid unnecessary tweens
4. **Sequential Rendering**: AnimatedDiagram queue prevents overlapping animations

## Future Extension Points

To integrate mathtext into a different diagram system:

1. **Create your own diagram class** with a mathText method
2. **Instantiate MathTextComponent** with your container and options
3. **Call await mathComponent.init()** to process LaTeX
4. **Choose animation strategy**:
   - `new WriteEffect(mathComponent)` for full animation
   - `new WriteOnlyEffect(mathComponent, selections, includeAll)` for partial
   - `new WriteWithoutEffect(mathComponent, exclusions)` for inverse partial
   - Or `mathComponent.enableStroke()` for instant display
5. **Call effect.play()** to execute animation
6. **Optional**: Integrate with your own pen/tracer system using TweenableNode's getPointAt()

The system is designed to be portable - as long as you can provide a DOM container and handle the async initialization, you can integrate mathtext animations into any graphics framework.
