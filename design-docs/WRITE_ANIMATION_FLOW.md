# Write Animation Flow Documentation

This document explains how `write`, `writeonly`, and `writewithout` commands animate math text with pen tracing.

## Overview

Math text is rendered as SVG paths. Animation works by:
1. Initially hiding all strokes (using `stroke-dasharray`)
2. Progressively revealing strokes as the pen traces each path

```
┌─────────────────────────────────────────────────────────────────┐
│                     ANIMATION LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Command Created    doInit()         play()        Animation   │
│        │                │               │              │        │
│        ▼                ▼               ▼              ▼        │
│   ┌─────────┐    ┌───────────┐    ┌─────────┐    ┌─────────┐   │
│   │ Parse   │───▶│ Create    │───▶│ Show    │───▶│ Animate │   │
│   │ LaTeX   │    │ Component │    │Container│    │ Strokes │   │
│   └─────────┘    │ (hidden)  │    │ (strokes│    │         │   │
│                  └───────────┘    │ hidden) │    └─────────┘   │
│                                   └─────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. Container Visibility vs Stroke Visibility

These are two separate concerns:

```
┌────────────────────────────────────────────────────────────────┐
│                    VISIBILITY LAYERS                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   CONTAINER (div)              SVG PATHS (strokes)             │
│   ─────────────────            ────────────────────            │
│   display: none/block          stroke-dasharray: 0,10000       │
│   opacity: 0/1                 (hidden = large dash gap)       │
│   visibility: hidden/visible                                   │
│                                stroke-dasharray: 0,0           │
│                                (visible = no dash gap)         │
│                                                                │
│   Container must be visible    Strokes revealed progressively  │
│   for animation to show        by animator during pen trace    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Why separate?**
- Container visibility controls whether the entire math text DOM is rendered
- Stroke-dasharray controls whether individual paths are visible within the SVG
- Animation needs container visible but strokes hidden, then reveals strokes one by one

### 2. stroke-dasharray Trick

SVG paths use `stroke-dasharray` to create dashed lines. We exploit this for animation:

```
stroke-dasharray: "0,10000"     stroke-dasharray: "0,0"
(HIDDEN)                        (VISIBLE)

   ┌──────────────┐              ┌──────────────┐
   │              │              │   ═══════    │
   │  (nothing    │              │   visible    │
   │   visible)   │              │   stroke     │
   │              │              │              │
   └──────────────┘              └──────────────┘

Dash length = 0                 Dash length = 0
Gap length = 10000              Gap length = 0
(gap covers entire path)        (no gap, full stroke)
```

### 3. Methods in MathTextComponent

```
┌─────────────────────────────────────────────────────────────────┐
│                  MathTextComponent Methods                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  show()          - Container visible + ALL strokes enabled      │
│                    Used by: directPlay() for instant render     │
│                                                                 │
│  showContainer() - Container visible, strokes remain hidden     │
│                    Used by: effect.show() before animation      │
│                                                                 │
│  hide()          - Container visible, strokes disabled          │
│                    Uses stroke-based hiding (not display:none)  │
│                    Allows writeOnly/writeWithout to work on it  │
│                                                                 │
│  enableStroke()  - Set stroke-dasharray: 0,0 on ALL paths       │
│                    Makes all strokes visible                    │
│                                                                 │
│  disableStroke() - Set stroke-dasharray: 0,10000 on ALL paths   │
│                    Hides all strokes                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Command Types

### 1. write - Animate entire expression

```
write(2, 3, "\tan(\theta)=\frac{\sin(\theta)}{\cos(\theta)}")

Animates: ALL paths in sequence
Result:   tan(θ) = sin(θ)/cos(θ)  (all animated)
```

### 2. writeonly - Animate ONLY marked parts

Supports multiple patterns - each pattern is wrapped with bbox.

```
# Single pattern
writeonly(2, 3, "\tan(\theta)=...", "\theta")

# Multiple patterns
writeonly(2, 3, "\tan(\theta)=...", "\theta", "\tan")

LaTeX wrapped: \tan(\bbox[0px]{\theta})=\frac{\sin(\bbox[0px]{\theta})}{...}

Animates: Only θ symbols (bbox-marked)
Hidden:   Everything else stays hidden
Result:   θ θ θ  (only thetas visible and animated)
```

### 3. writewithout - Animate everything EXCEPT marked parts

Supports multiple patterns - each pattern is wrapped with bbox.

```
# Single pattern
writewithout(2, 3, "\tan(\theta)=...", "\theta")

# Multiple patterns
writewithout(2, 3, "\tan(\theta)=...", "\theta", "\sin")

LaTeX wrapped: \tan(\bbox[0px]{\theta})=\frac{\sin(\bbox[0px]{\theta})}{...}

Animates: Everything except θ symbols
Hidden:   θ symbols stay hidden
Result:   tan( )=sin( )/cos( )  (thetas hidden)
```

## BBox Marking System

The `\bbox[0px]{...}` LaTeX command creates invisible boxes around content. MathJax renders these as `<g meta="mpadded">` groups in SVG.

```
┌─────────────────────────────────────────────────────────────────┐
│                    BBOX DETECTION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. wrapWithBBox("\tan(\theta)", "\theta")                      │
│     ──────────────────────────────────────                      │
│     Input:  \tan(\theta)                                        │
│     Output: \tan(\bbox[0px]{\theta})                            │
│                                                                 │
│  2. MathJax renders to SVG                                      │
│     ────────────────────────────                                │
│     <svg>                                                       │
│       <g meta="chargroup">tan</g>                               │
│       <g meta="mpadded">        ◄── bbox marker                 │
│         <g meta="chargroup">θ</g>                               │
│       </g>                                                      │
│     </svg>                                                      │
│                                                                 │
│  3. BoundsExtractor finds mpadded groups                        │
│     ────────────────────────────────────                        │
│     - Finds all <g meta="mpadded">                              │
│     - Gets bounding box coordinates                             │
│     - Identifies which paths are inside                         │
│                                                                 │
│  4. SelectionUnits map bounds to TweenableNodes                 │
│     ─────────────────────────────────────────                   │
│     - Each bbox region becomes a SelectionUnit                  │
│     - SelectionUnit contains node paths to animate              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Critical: getBBox() Requires Visible Container

**Problem:** SVG's `getBBox()` returns zeros when container has `display: none`

```
┌─────────────────────────────────────────────────────────────────┐
│                    getBBox() VISIBILITY ISSUE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Container: display: none          Container: display: block   │
│   ────────────────────────          ─────────────────────────   │
│                                                                 │
│   getBBox() returns:                getBBox() returns:          │
│   { x: 0, y: 0,                     { x: 45, y: 12,             │
│     width: 0, height: 0 }             width: 28, height: 15 }   │
│                                                                 │
│   ❌ Can't detect bbox regions      ✓ Correct bounds detected   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Solution:** Temporarily show container before extracting bounds:

```javascript
writeOnlyBBox() {
    // Temporarily show for getBBox() to work
    const wasHidden = this.containerDOM.style.display === 'none';
    if (wasHidden) {
        this.containerDOM.style.display = 'block';
    }

    const bboxBounds = this.getBBoxHighlightBounds();  // Now works!
    // ... create selection units ...

    // Restore hidden state
    if (wasHidden) {
        this.containerDOM.style.display = 'none';
    }

    return new WriteOnlyEffect(this, selectionUnits);
}
```

This is synchronous - no visual flicker occurs because browser doesn't repaint between show/hide.

## Execution Flows

### playSingle() Flow (Replay animation on existing component)

```
┌─────────────────────────────────────────────────────────────────┐
│                      playSingle() FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Component already exists (from previous executeAll/drawAll)    │
│  Container is VISIBLE, strokes are ENABLED                      │
│                                                                 │
│  1. command.playSingle()                                        │
│     │                                                           │
│     ▼                                                           │
│  2. effect = mathComponent.writeOnlyBBox()                      │
│     │  - Container visible, getBBox() works                     │
│     │  - Extract bbox bounds                                    │
│     │  - Create SelectionUnits                                  │
│     ▼                                                           │
│  3. effect.play()                                               │
│     │                                                           │
│     ├──▶ effect.show()                                          │
│     │    - Calls showContainer() (already visible, no-op)       │
│     │                                                           │
│     └──▶ effect.doPlay()                                        │
│          │                                                      │
│          ▼                                                      │
│          Animator.animateType()                                 │
│          - Disables strokes on nodes to animate                 │
│          - Creates GSAP timeline                                │
│          - Progressively enables strokes as pen traces          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### playAll() Flow (Fresh commands, animate from scratch)

```
┌─────────────────────────────────────────────────────────────────┐
│                       playAll() FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. controller.playAll()                                        │
│     │                                                           │
│     ├──▶ roboCanvas.clearAll()     // Clear diagram objects     │
│     │                                                           │
│     ├──▶ processCommandList()      // Create fresh commands     │
│     │                                                           │
│     ├──▶ executor.clearCommands()  // ⚠️ CRITICAL: Clear OLD    │
│     │                              //    command DOM elements   │
│     │                                                           │
│     └──▶ executor.playAll()                                     │
│          │                                                      │
│          ▼                                                      │
│  2. For each command:                                           │
│     │                                                           │
│     ├──▶ initCommand(command)                                   │
│     │    │                                                      │
│     │    ▼                                                      │
│     │    command.doInit()                                       │
│     │    - Create MathTextComponent                             │
│     │    - Container: display: none                             │
│     │    - Strokes: disabled (dasharray: 0,10000)               │
│     │                                                           │
│     └──▶ command.play()                                         │
│          │                                                      │
│          ▼                                                      │
│          command.playSingle()                                   │
│          │                                                      │
│          ▼                                                      │
│          effect = writeOnlyBBox()                               │
│          - ⚠️ Container hidden! getBBox() would fail!           │
│          - Temporarily show container                           │
│          - Extract bounds                                       │
│          - Restore hidden state                                 │
│          │                                                      │
│          ▼                                                      │
│          effect.play()                                          │
│          - show() → showContainer()                             │
│          - doPlay() → Animator animates selected strokes        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Animator Classes

```
┌─────────────────────────────────────────────────────────────────┐
│                      ANIMATOR HIERARCHY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MathNodeAnimator (base)                                        │
│  │  - animateType(): Disables ALL strokes, then animates all    │
│  │  - Used by: WriteEffect (regular write command)              │
│  │                                                              │
│  └── CustomOrderTypeAnimator                                    │
│      │  - animateType(): Disables ONLY selected strokes         │
│      │  - Animates nodes matching SelectionUnits                │
│      │  - Used by: WriteOnlyEffect                              │
│      │                                                          │
│      └── NonSelectionOrderTypeAnimator                          │
│          - Animates nodes NOT matching SelectionUnits           │
│          - Used by: WriteWithoutEffect                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Animator Disables Strokes

The animator disables strokes at the START of animation:

```javascript
// CustomOrderTypeAnimator.animateType()
tweenableNodes.forEach((tweenableNode) => {
    tweenableNode.disableStroke();   // Hide before animating
    tweenableNode.setStroke(color);  // Set color
});
// Then animate - progressively re-enable strokes
```

This ensures animation works correctly even if:
- Strokes were already enabled (from previous directPlay)
- playSingle() is called multiple times

## Effect Classes

```
┌─────────────────────────────────────────────────────────────────┐
│                       EFFECT CLASSES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BaseEffect                                                     │
│  │  play() {                                                    │
│  │      this.show();        // Show container                   │
│  │      this.doPlay();      // Run animation                    │
│  │  }                                                           │
│  │                                                              │
│  ├── WriteEffect                                                │
│  │   - show(): showContainer()                                  │
│  │   - doPlay(): writeAnimate() - animates ALL paths            │
│  │                                                              │
│  ├── WriteOnlyEffect                                            │
│  │   - show(): showContainer()                                  │
│  │   - doPlay(): writeSelectionOnlyAnimate() - selected only    │
│  │   - toEndState(): Enable selected, disable others            │
│  │                                                              │
│  └── WriteWithoutEffect (extends WriteOnlyEffect)               │
│      - doPlay(): writeWithoutSelectionAnimate() - non-selected  │
│      - toEndState(): Enable non-selected, disable selected      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Common Issues & Solutions

### Issue 1: Text visible before animation starts

**Cause:** Old command DOM elements not cleared before creating new ones

**Solution:** Call `clearCommands()` before `setCommands()` in playAll/playUpTo

### Issue 2: writeonly/writewithout animates everything

**Cause:** `getBBox()` returns zeros when container is hidden, so bbox regions aren't detected

**Solution:** Temporarily show container before extracting bounds

### Issue 3: playSingle works but playAll doesn't

**Cause:** In playSingle, component is already visible (from directPlay). In playAll, component is freshly created and hidden.

**Solution:** Ensure bounds extraction works with hidden containers (temp show)

## Hide + Selective Write Workflow

The `hide()` function uses stroke-based hiding (not `display: none`), which allows `writeOnly` and `writeWithout` to selectively reveal parts of hidden text.

### Usage

```
M = mathtext(5, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")
hide(M)                      # All strokes disabled, container stays in DOM
writeonly(M, "\theta")       # Animates only θ parts back to visible
writewithout(M, "\tan")      # Animates everything except tan back to visible
```

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                  HIDE + SELECTIVE WRITE FLOW                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. mathtext(...)                                               │
│     - Creates component                                         │
│     - Container: display: block, strokes: enabled               │
│     - Text is fully visible                                     │
│                                                                 │
│  2. hide(M)                                                     │
│     - Container: stays display: block (NOT display: none)       │
│     - Strokes: disabled (stroke-dasharray: 0,10000)             │
│     - Text appears invisible but DOM is intact                  │
│     - getBBox() still works (needed for writeOnly bounds)       │
│                                                                 │
│  3. writeonly(M, "\theta")                                      │
│     - Animation: Enables only θ strokes progressively           │
│     - directPlay: Instantly enables only θ strokes              │
│     - Other strokes remain disabled                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Stroke-Based Hiding?

**Old approach (display: none):**
- `getBBox()` returns zeros → can't detect bbox regions
- `writeOnly` fails because bounds extraction doesn't work

**New approach (stroke-dasharray):**
- Container stays in DOM layout
- `getBBox()` returns correct bounds
- `writeOnly`/`writeWithout` can selectively enable strokes

### directPlay vs playSingle

Both `RewriteOnlyEffect` and `RewriteWithoutEffect` support direct play after `hide()`:

| Mode | Method | Behavior |
|------|--------|----------|
| Animation | `playSingle()` | Pen traces selected/non-selected strokes |
| Instant | `directPlay()` | `toEndState()` enables selected/non-selected strokes immediately |

## Rewrite Commands (Existing Components)

When `writeonly` or `writewithout` is called with an **existing** MathTextComponent variable instead of creating a new one, the system uses "Rewrite" commands.

### Usage

```
M = mathtext(5, 2, "\tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)}")

# Single pattern
writeonly(M, "\theta")      # Animates only θ parts on existing M
writewithout(M, "\theta")   # Animates everything except θ parts on existing M

# Multiple patterns
writeonly(M, "\theta", "\tan")       # Animates θ and tan parts
writewithout(M, "\theta", "\sin")    # Animates everything except θ and sin
```

### Key Differences from Create Mode

| Aspect | Create Mode (new component) | Existing Mode (rewrite) |
|--------|----------------------------|------------------------|
| Component | Creates new MathTextComponent | Uses existing from registry |
| Container | Starts hidden, shows on play | Already visible, stays visible |
| Strokes | All disabled initially | May be enabled/disabled |
| Excluded nodes | Disabled by animator | NOT touched at all |

### Rewrite Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              REWRITE COMMAND FLOW (Existing Component)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  writeonly(M, "\theta") where M is existing mathtext            │
│                                                                 │
│  1. Expression detects 'existing' mode (first arg is variable)  │
│     └── Returns RewriteOnlyCommand instead of WriteOnlyCommand  │
│                                                                 │
│  2. RewriteOnlyCommand.doInit()                                 │
│     │                                                           │
│     ├── Get original component from shapeRegistry               │
│     │                                                           │
│     ├── Create TEMP component with bbox-wrapped content         │
│     │   - Same position, same parent, same font size            │
│     │   - Content: wrapWithBBox(original, "\theta")             │
│     │   - Uses visibility:hidden (not display:none)             │
│     │                                                           │
│     ├── Extract BOUNDS from temp's bbox regions                 │
│     │   - getBBoxHighlightBounds() returns coordinate bounds    │
│     │                                                           │
│     ├── Destroy temp component                                  │
│     │                                                           │
│     └── Use bounds to find nodePaths in ORIGINAL component      │
│         - computeSelectionUnitsFromBounds(bboxBounds)           │
│         - Returns SelectionUnits with original's nodePaths      │
│                                                                 │
│  3. RewriteOnlyCommand.doPlay() [during playAll]                │
│     │                                                           │
│     ├── Disable non-selected strokes (excludeTweenNodes)        │
│     │   - Ensures only selected parts will be visible           │
│     │                                                           │
│     └── Call playSingle()                                       │
│                                                                 │
│  4. RewriteOnlyCommand.playSingle()                             │
│     └── RewriteOnlyEffect.play()                                │
│         - show(): No-op (container already visible)             │
│         - doPlay(): Animate only selected strokes               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### doPlay() Override for playAll

During `playAll`, `mathtext` enables all strokes. The Rewrite commands must disable the strokes they're NOT animating before calling `playSingle()`:

```
┌─────────────────────────────────────────────────────────────────┐
│                   doPlay() STROKE HANDLING                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RewriteOnlyCommand.doPlay():                                   │
│  │                                                              │
│  ├── Disable NON-SELECTED strokes (excludeTweenNodes)           │
│  │   - Everything except the pattern stays hidden               │
│  │                                                              │
│  └── Call playSingle() to animate selected strokes              │
│                                                                 │
│  RewriteWithoutCommand.doPlay():                                │
│  │                                                              │
│  ├── Disable EXCLUDED strokes (includeTweenNodes)               │
│  │   - The pattern strokes stay hidden                          │
│  │                                                              │
│  └── Call playSingle() to animate non-excluded strokes          │
│                                                                 │
│  TextItem Commands (WriteCollectionVarCommand, etc.):           │
│  │                                                              │
│  └── NO doPlay() override - uses base class default             │
│      - Only animates its own TextItem strokes                   │
│      - Does NOT disable other strokes                           │
│      - Allows sequential: writewithout(M,...) then write(sins)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why this matters:**
- `mathtext(...)` shows all strokes immediately
- `writewithout(M, "\sin", "\cos")` must hide `\sin`/`\cos` strokes in `doPlay()`
- `write(sins)` (TextItem) later animates just the `\sin` strokes without touching others

### Why Temp Component?

The original component doesn't have bbox markers in its LaTeX. We need to:
1. Wrap the pattern with `\bbox[0px]{...}` to identify its location
2. Render that wrapped LaTeX to get spatial bounds
3. Use those bounds to find matching nodes in the original component

```
┌─────────────────────────────────────────────────────────────────┐
│              TEMP COMPONENT BOUNDS EXTRACTION                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Original: \tan(\theta) = ...                                   │
│                                                                 │
│  Wrapped:  \tan(\bbox[0px]{\theta}) = ...                       │
│                                                                 │
│  Temp component renders at same position:                       │
│  ┌──────────────────────────────────────┐                       │
│  │  tan( θ ) = sin( θ )/cos( θ )        │                       │
│  │       ↑         ↑         ↑          │                       │
│  │   [bounds1]  [bounds2]  [bounds3]    │  ← bbox regions       │
│  └──────────────────────────────────────┘                       │
│                                                                 │
│  bounds1 = { minX: 45, minY: 10, maxX: 55, maxY: 25 }           │
│                                                                 │
│  Original component at same position:                           │
│  ┌──────────────────────────────────────┐                       │
│  │  tan( θ ) = sin( θ )/cos( θ )        │                       │
│  │       ↑                              │                       │
│  │   nodePath: "root/g1/path3"          │  ← found by bounds    │
│  └──────────────────────────────────────┘                       │
│                                                                 │
│  Same spatial position → same coordinates → correct nodePaths   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Rewrite Animators

```
┌─────────────────────────────────────────────────────────────────┐
│                 REWRITE ANIMATOR CLASSES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CustomOrderTypeAnimator                                        │
│  │  - Disables selected strokes, then animates them             │
│  │  - Used by: WriteOnlyEffect, RewriteOnlyEffect               │
│  │                                                              │
│  ├── NonSelectionOrderTypeAnimator                              │
│  │   - Removes selected nodes from list                         │
│  │   - DISABLES removed nodes (for create mode)                 │
│  │   - Animates remaining nodes                                 │
│  │   - Used by: WriteWithoutEffect                              │
│  │                                                              │
│  └── RewriteNonSelectionAnimator                                │
│      - Removes selected nodes from list                         │
│      - Does NOT disable removed nodes (leaves them as-is)       │
│      - Animates remaining nodes                                 │
│      - Used by: RewriteWithoutEffect                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key distinction:**
- `NonSelectionOrderTypeAnimator`: Disables excluded nodes (correct for new components where everything should be hidden except what's animated)
- `RewriteNonSelectionAnimator`: Does NOT disable excluded nodes (correct for existing components where we shouldn't touch unrelated strokes)

### Rewrite Effect Classes

```
┌─────────────────────────────────────────────────────────────────┐
│                   REWRITE EFFECT CLASSES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RewriteOnlyEffect (extends BaseEffect)                         │
│  │  - show(): No-op (container already visible)                 │
│  │  - hide(): No-op (don't hide container)                      │
│  │  - doPlay(): rewriteSelectionOnlyAnimate()                   │
│  │  - Only animates selected strokes                            │
│  │                                                              │
│  RewriteWithoutEffect (extends BaseEffect)                      │
│      - show(): No-op (container already visible)                │
│      - hide(): No-op (don't hide container)                     │
│      - doPlay(): rewriteWithoutSelectionAnimate()               │
│      - Animates non-selected strokes                            │
│      - Does NOT disable selected strokes                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File References

- `src/mathtext/components/math-text-component.js` - Core component
- `src/mathtext/effects/write-effect.js` - WriteEffect
- `src/mathtext/effects/write-only-effect.js` - WriteOnlyEffect
- `src/mathtext/effects/write-without-effect.js` - WriteWithoutEffect
- `src/mathtext/effects/rewrite-only-effect.js` - RewriteOnlyEffect (existing components)
- `src/mathtext/effects/rewrite-without-effect.js` - RewriteWithoutEffect (existing components)
- `src/mathtext/utils/bbox-latex-wrapper.js` - wrapWithBBox utility
- `src/mathtext/utils/bounds-extractor.js` - BBox detection
- `src/mathtext/animator/custom-order-type-animator.js` - Selection animator
- `src/mathtext/animator/non-selection-order-type-animator.js` - Non-selection animator (create mode)
- `src/mathtext/animator/rewrite-non-selection-animator.js` - Non-selection animator (existing mode)
- `src/engine/commands/WriteCommand.js` - Write command
- `src/engine/commands/WriteOnlyCommand.js` - WriteOnly command (create mode)
- `src/engine/commands/WriteWithoutCommand.js` - WriteWithout command (create mode)
- `src/engine/commands/RewriteOnlyCommand.js` - RewriteOnly command (existing mode)
- `src/engine/commands/RewriteWithoutCommand.js` - RewriteWithout command (existing mode)
- `src/engine/controller/CommandEditorController.js` - Execution controller
