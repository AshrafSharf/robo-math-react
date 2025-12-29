# TextItem Effects - Coordinate Systems

This document explains the coordinate systems and layer stacking used by `MathTextMoveEffect` and `MathTextRectEffect`.

## Layer Stacking

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER VIEWPORT                        │
│  (screen coordinates from getBoundingClientRect)             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    PARENT DOM                          │ │
│  │  (robo-canvas-section)                                 │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │              ANNOTATION LAYER                     │ │ │
│  │  │  (SVG overlay for rect effects)                   │ │ │
│  │  │  - MathTextRectEffect renders here                │ │ │
│  │  │  - Same coordinate space as canvas                │ │ │
│  │  │  z-index: above canvas content                    │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │                 CANVAS LAYER                      │ │ │
│  │  │                                                   │ │ │
│  │  │   ┌─────────────────────────────────────────┐    │ │ │
│  │  │   │         MATH TEXT COMPONENT              │    │ │ │
│  │  │   │  position: absolute                      │    │ │ │
│  │  │   │  left: componentState.left               │    │ │ │
│  │  │   │  top: componentState.top                 │    │ │ │
│  │  │   │                                          │    │ │ │
│  │  │   │   ┌──────────────────────────────┐      │    │ │ │
│  │  │   │   │     TEXT ITEM (bbox region)   │      │    │ │ │
│  │  │   │   │  offset: internalOffsetX/Y    │      │    │ │ │
│  │  │   │   │  (relative to container)      │      │    │ │ │
│  │  │   │   └──────────────────────────────┘      │    │ │ │
│  │  │   │                                          │    │ │ │
│  │  │   └─────────────────────────────────────────┘    │ │ │
│  │  │                                                   │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    PEN LAYER                           │ │
│  │  (fixed position SVG overlay)                          │ │
│  │  z-index: 10000 (topmost)                              │ │
│  │  Uses SCREEN coordinates                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Coordinate Systems

### 1. Screen Coordinates
- Origin: top-left of browser viewport
- Used by: Pen layer, `getBoundingClientRect()`
- Unit: pixels

### 2. Canvas Coordinates
- Origin: top-left of parentDOM (robo-canvas-section)
- Used by: MathTextComponent positioning, annotation layer
- Unit: pixels

### 3. Internal Offset (Client Bounds)
- Origin: top-left of MathTextComponent container
- Used by: TextItem bounds within its parent component
- Unit: pixels

## MathTextMoveEffect Coordinate Flow

```
                    TARGET POSITION (canvas coords)
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                        INPUTS                                 │
│                                                               │
│  targetX, targetY ────────────────────────┐                  │
│  (where TextItem content should land)      │                  │
│                                            ▼                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    _init()                               │ │
│  │                                                          │ │
│  │  clientBounds = textItem.getClientBounds()               │ │
│  │       │                                                  │ │
│  │       ▼                                                  │ │
│  │  internalOffsetX = clientBounds.x  ◄── offset within    │ │
│  │  internalOffsetY = clientBounds.y      MathTextComponent │ │
│  │       │                                                  │ │
│  │       ▼                                                  │ │
│  │  startX = mathComponent.componentState.left              │ │
│  │  startY = mathComponent.componentState.top               │ │
│  │       │                                                  │ │
│  │       ▼                                                  │ │
│  │  endX = targetX - internalOffsetX  ◄── adjust so        │ │
│  │  endY = targetY - internalOffsetY      content lands     │ │
│  │                                        at target         │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

                            │
                            ▼

┌──────────────────────────────────────────────────────────────┐
│                      doPlay() ANIMATION                       │
│                                                               │
│  for each frame (tweener.progress 0 → 1):                    │
│                                                               │
│    currentX = startX + (endX - startX) * progress            │
│    currentY = startY + (endY - startY) * progress            │
│         │                                                     │
│         ├──────────────────────────────────────────┐         │
│         │                                          │         │
│         ▼                                          ▼         │
│    ┌─────────────────┐                 ┌─────────────────┐   │
│    │ UPDATE CLONE    │                 │ UPDATE PEN      │   │
│    │ POSITION        │                 │ POSITION        │   │
│    │                 │                 │                 │   │
│    │ setCanvasPos(   │                 │ penX = currentX │   │
│    │   currentX,     │                 │   + internalX   │   │
│    │   currentY      │                 │ penY = currentY │   │
│    │ )               │                 │   + internalY   │   │
│    │                 │                 │                 │   │
│    └─────────────────┘                 │ screenPos =     │   │
│                                        │   canvasToScreen│   │
│                                        │   (parentDOM,   │   │
│                                        │    penX, penY)  │   │
│                                        │                 │   │
│                                        │ firePenPosition │   │
│                                        │   (screenPos)   │   │
│                                        └─────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Canvas to Screen Conversion

```
┌─────────────────────────────────────────────────────────────┐
│              PenCoordinateUtil.canvasToScreen()              │
│                                                              │
│  FORMULA:                                                    │
│  ────────                                                    │
│  screenX = parentRect.left + (canvasX * scaleFactor)         │
│  screenY = parentRect.top  + (canvasY * scaleFactor)         │
│                                                              │
│                                                              │
│  VISUAL:                                                     │
│  ───────                                                     │
│                                                              │
│  Browser Viewport                                            │
│  ┌─────────────────────────────────────────────┐            │
│  │                                             │            │
│  │   parentRect.left                           │            │
│  │   ◄──────────────►                          │            │
│  │                   ┌───────────────────────┐ │            │
│  │   parentRect.top  │      PARENT DOM       │ │            │
│  │        ▲          │                       │ │            │
│  │        │          │   canvasX             │ │            │
│  │        │          │   ◄──────►            │ │            │
│  │        ▼          │          ●────────────┼─┼─► screenX  │
│  │                   │   canvasY│            │ │            │
│  │                   │     ▲    │            │ │            │
│  │                   │     │    ▼            │ │            │
│  │                   │     ▼    screenY      │ │            │
│  │                   │                       │ │            │
│  │                   └───────────────────────┘ │            │
│  │                                             │            │
│  └─────────────────────────────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## MathTextRectEffect Coordinate Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    MathTextRectEffect                         │
│                                                               │
│  Uses canvas coordinates directly (no screen conversion)      │
│  because it renders into the annotation SVG layer which       │
│  shares the same coordinate space as the canvas.              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   _createShape()                         │ │
│  │                                                          │ │
│  │  canvasBounds = textItem.getCanvasBounds()               │ │
│  │       │                                                  │ │
│  │       │  getCanvasBounds() calculates:                   │ │
│  │       │  ─────────────────────────────                   │ │
│  │       │  x = containerLeft + clientBounds.x              │ │
│  │       │  y = containerTop  + clientBounds.y              │ │
│  │       │                                                  │ │
│  │       ▼                                                  │ │
│  │  rectShape = new MathTextRectShape(                      │ │
│  │    targetSvg,     ◄── annotation layer SVG               │ │
│  │    canvasBounds,  ◄── position in canvas coords          │ │
│  │    options                                               │ │
│  │  )                                                       │ │
│  │                                                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  The rect is drawn at canvasBounds position in the           │
│  annotation SVG, which overlays the canvas at the same       │
│  coordinate origin.                                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Comparison: Move vs Rect Effects

```
┌────────────────────┬─────────────────────┬─────────────────────┐
│                    │  MathTextMoveEffect │  MathTextRectEffect │
├────────────────────┼─────────────────────┼─────────────────────┤
│ Renders to         │ parentDOM           │ annotation SVG      │
│                    │ (creates clone)     │ (draws rect)        │
├────────────────────┼─────────────────────┼─────────────────────┤
│ Position coords    │ canvas coords       │ canvas coords       │
│                    │ (startX/Y, endX/Y)  │ (canvasBounds)      │
├────────────────────┼─────────────────────┼─────────────────────┤
│ Pen tracking       │ YES - converts to   │ YES - uses          │
│                    │ screen coords via   │ renderWithAnimation │
│                    │ PenCoordinateUtil   │ (shape handles it)  │
├────────────────────┼─────────────────────┼─────────────────────┤
│ Needs internal     │ YES - to calculate  │ NO - getCanvasBounds│
│ offset?            │ pen position        │ includes it         │
├────────────────────┼─────────────────────┼─────────────────────┤
│ Screen conversion  │ Manual via          │ Handled by shape's  │
│                    │ canvasToScreen()    │ renderWithAnimation │
└────────────────────┴─────────────────────┴─────────────────────┘
```

## Key Methods

### TextItem
- `getClientBounds()` - bounds relative to MathTextComponent container
- `getCanvasBounds()` - bounds relative to canvas (adds container position)

### PenCoordinateUtil
- `canvasToScreen(parentDOM, canvasX, canvasY)` - converts canvas to screen coords

### MathTextComponent
- `setCanvasPosition(x, y)` - sets position in canvas coordinates
- `getPosition()` - gets current canvas position

---

## TextItem Visibility Operations

TextItem and TextItemCollection support visibility operations through the `ShapeVisibilityAdapter` pattern.

### Supported Commands

```
M = mathtext(2, 3, "x^2 + y^2 = r^2")
write(M)
C = subonly(M, "x^2")

// Visibility commands work with both TextItem and TextItemCollection
show(C)       // Show the text item(s)
hide(C)       // Hide using stroke-dasharray
fadein(C)     // Fade in with animation
fadeout(C)    // Fade out with animation
```

### Implementation

The `ShapeVisibilityAdapter.for(shape)` factory detects:
- **TextItem**: Has `mathComponent` and `selectionUnit` properties
- **TextItemCollection**: Has `items` array and `get()` method

Both use stroke-dasharray technique (consistent with MathTextComponent):
- **Hide**: `stroke-dasharray: 0,10000` (large gap = invisible)
- **Show**: `stroke-dasharray: 0,0` (no gap = visible)

### Adapters

| Adapter | Detection | Target |
|---------|-----------|--------|
| `TextItemAdapter` | `shape.mathComponent && shape.selectionUnit` | Single TextItem |
| `TextItemCollectionAdapter` | `shape.items && shape.get` | Collection from subonly/subwithout |

---

## Replace Expression

Creates a new MathTextComponent at a TextItem's position with matching style.

### Syntax

```
msub(textItemOrCollection, "latex string")
```

### Example

```
M = print(1,10,"a + b = c")
T = select(M, "b")
msub(T, "\beta")

P = print(5,10,"x^2 + y^2")
msub(select(P, "x^2"), "z^2")
```

### How It Works

1. Gets target TextItem (or first item from collection)
2. Gets canvas position via `textItem.getCanvasBounds()`
3. Gets style from parent MathTextComponent (`fontSizeValue`, `strokeColor`, `fillColor`)
4. Creates new MathTextComponent with same style at same position
5. Animates writing the new text via `WriteEffect`

### Files

- `src/engine/expression-parser/expressions/ReplaceTextItemExpression.js`
- `src/engine/commands/ReplaceTextItemCommand.js`
- `src/engine/commands/visibility/ShapeVisibilityAdapter.js` (TextItemAdapter, TextItemCollectionAdapter)
