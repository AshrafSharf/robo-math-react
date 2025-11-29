# LaTeX Box Exclusion System: Complete Technical Guide

## Table of Contents
1. [Overview](#overview)
2. [The Problem](#the-problem)
3. [The Solution](#the-solution)
4. [Technical Implementation](#technical-implementation)
5. [Complete Flow](#complete-flow)
6. [Code Examples](#code-examples)
7. [Architecture Diagrams](#architecture-diagrams)

---

## Overview

The LaTeX Box Exclusion System enables **selective animation** of mathematical expressions by using LaTeX `\fbox{}` commands as invisible markers. Content wrapped in `\fbox{}` can be excluded from initial rendering and animated separately, creating dramatic reveal effects.

### Key Concept
```
Input:   \fbox{3}x^2 + \fbox{6}x + \fbox{-9} = 0

Visual:  [invisible box around 3]  [invisible box around 6]  [invisible box around -9]

Effect:  First animate: x^2 + x + = 0
         Then reveal:   3, 6, -9 (one by one or together)
```

---

## The Problem

**Goal**: Animate only specific parts of a math expression while hiding others.

**Challenge**: How do we:
1. Mark which parts to exclude?
2. Calculate boundaries of those parts?
3. Map boundaries to renderable SVG paths?
4. Filter animation sequences based on those paths?

**Traditional Approach Limitations**:
- Manual SVG path selection → tedious and error-prone
- Hard-coded coordinates → breaks when expression changes
- ID-based selection → fragile across re-renders

---

## The Solution

Use LaTeX `\fbox{}` as semantic markers that:
1. ✅ Are part of standard LaTeX syntax (author-friendly)
2. ✅ Render as detectable SVG patterns (4 path elements)
3. ✅ Define precise boundaries around content
4. ✅ Can be automatically removed after detection (invisible)

### ASCII Visualization

```
LaTeX Expression:
    \fbox{3}x^2 + \fbox{6}x + \fbox{-9} = 0

MathJax Renders To SVG:
    ┌───┐                 ┌───┐                 ┌────┐
    │ 3 │ x² +            │ 6 │ x +             │ -9 │ = 0
    └───┘                 └───┘                 └────┘
     ▲                      ▲                     ▲
     │                      │                     │
  4 paths               4 paths               4 paths
  forming box          forming box          forming box

System Detects Boxes:
    Bounds₁ = {x: 10, y: 5, width: 20, height: 30}    → contains "3"
    Bounds₂ = {x: 80, y: 5, width: 20, height: 30}    → contains "6"
    Bounds₃ = {x: 150, y: 5, width: 30, height: 30}   → contains "-9"

Convert to Selection Units:
    SelectionUnit₁.fragmentPaths = ["1.2.1.1.1"]       → node path for "3"
    SelectionUnit₂.fragmentPaths = ["1.4.1.1.1"]       → node path for "6"
    SelectionUnit₃.fragmentPaths = ["1.6.1.1.1"]       → node path for "-9"

Animation Control:
    writeWithout([SelectionUnit₂]) → Animates: 3x² + x + -9 = 0
                                                     ▲
                                                     └─ "6" is excluded!
```

---

## Technical Implementation

### Phase 1: Box Detection

**File**: `src/blocks/bounds-extractor.js:10-34`

```javascript
static extractFBoxBoundsDescriptors(svgDocument$) {
    const boundsList = [];
    const gTags = svgDocument.querySelectorAll('g');

    Array.from(gTags).forEach(g => {
        const pathChildren = Array.from(g.children).filter(node => node.tagName === 'path');
        const requiredValues = ['hline', 'vline', 'hline', 'vline'];

        // Check if this group has exactly 4 paths with the right meta attributes
        const hasValidHighlightSection = pathChildren.length === 4 &&
            pathChildren.every((child, index) => {
                const metaAttr = child.getAttribute('meta');
                return metaAttr !== null && metaAttr === requiredValues[index];
            });

        if (hasValidHighlightSection) {
            // Combine the 4 paths into a single bounding box
            const bounds2 = this.combinePathsAndGetBBox(pathChildren);
            boundsList.push(bounds2);
        }
    });

    return boundsList;
}
```

**What `\fbox{}` Renders As**:

```
SVG Structure for \fbox{3}:

<g>
  <path meta="hline" d="M 10 5 L 30 5"/>      ← Top horizontal line
  <path meta="vline" d="M 10 5 L 10 35"/>     ← Left vertical line
  <path meta="hline" d="M 10 35 L 30 35"/>    ← Bottom horizontal line
  <path meta="vline" d="M 30 5 L 30 35"/>     ← Right vertical line
  <path d="...">3</path>                      ← The actual "3" character
</g>

ASCII Representation:

    (10,5)────────────(30,5)        ← Top hline
       │                 │
       │        3        │          ← Content
       │                 │
    (10,35)───────────(30,35)       ← Bottom hline

    │                 │
    └─ vline         └─ vline
```

**Box Path Removal**: Line 120 removes the 4 box paths from DOM:
```javascript
paths.forEach(path => path.parentNode.removeChild(path));
```

Result: Visual box disappears, but we've captured its bounds!

---

### Phase 2: Bounds → Selection Units

**File**: `src/mathtext/animator/math-node-graph.js:148-162`

```javascript
collectSelectionUnits(boundsInCTMCoordinates, selectionUnit) {
    const svgNode = $(`#${this.elementId}`)[0];
    const nodeBounds = BoundsExtractor.getBoundsInCTMUnits(svgNode);

    if (this.isElementDrawable(this.cherrioElement)) {
        // Check if this node's bounds fall inside the fbox bounds
        const canBeIncluded = boundsInCTMCoordinates.containsBounds(nodeBounds);
        if (canBeIncluded) {
            selectionUnit.addFragment(this.nodePath);  // Add node path like "1.4.1.1.1"
        }
    }

    // Recursively check all children
    this.children.forEach((mathNodeGroup) => {
        mathNodeGroup.collectSelectionUnits(boundsInCTMCoordinates, selectionUnit);
    });
}
```

**Node Path Hierarchy**:

```
Math Expression Tree (simplified):

                    root (1)
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    term₁ (1.2)   plus (1.3)   term₂ (1.4)
        │                           │
    ┌───┴───┐                   ┌───┴───┐
  coef   var²                 coef   var
  (1.2.1) (1.2.2)            (1.4.1) (1.4.2)
    │                           │
   "3"                         "6"
(1.2.1.1.1)                 (1.4.1.1.1)  ← This is the node path!

ASCII Tree View:

1                                    (root)
├── 1.2                              (3x²)
│   ├── 1.2.1                        (coefficient group)
│   │   └── 1.2.1.1.1                "3" ← TARGET!
│   └── 1.2.2                        (x²)
│       └── 1.2.2.1.1                "x"
│       └── 1.2.2.2.1                "2"
├── 1.3                              (+)
├── 1.4                              (6x)
│   ├── 1.4.1                        (coefficient group)
│   │   └── 1.4.1.1.1                "6" ← TARGET!
│   └── 1.4.2                        (x)
└── 1.5                              (...)
```

**Bounds Containment Check**:

```
FBox Bounds: {x: 78, y: 3, width: 22, height: 32}

For each node in tree:
    Node "6" bounds: {x: 80, y: 5, width: 18, height: 28}

    Is (80,5,18,28) inside (78,3,22,32)?

    Check:
        80 >= 78         ✓
        5 >= 3           ✓
        80+18 <= 78+22   ✓ (98 <= 100)
        5+28 <= 3+32     ✓ (33 <= 35)

    Result: YES! Add "1.4.1.1.1" to selection unit
```

---

### Phase 3: Node Path Exclusion

**File**: `src/mathtext/animator/math-node-calculator.js:11-27`

```javascript
removeMatchingNodes(selectionUnit, tweenableNodes) {
    const remainingNodes = [].concat(tweenableNodes);
    const fragmentPaths = selectionUnit.fragmentPaths;  // e.g., ["1.4.1.1.1"]

    fragmentPaths.forEach((fragmentPath) => {
        tweenableNodes.forEach((tweenableNode) => {
            if (tweenableNode.getNodePath() == fragmentPath) {
                const removedNodes = remove(remainingNodes, tweenableNode);
                removedNodes.forEach((removedNode) => {
                    removedNode.disableStroke();  // Make invisible
                });
            }
        });
    });

    return remainingNodes;
}
```

**Visual Filter Process**:

```
All Tweenable Nodes (before filtering):
    ["1.2.1.1.1", "1.2.2.1.1", "1.2.2.2.1", "1.3.1.1", "1.4.1.1.1", "1.4.2.1.1", ...]
       │            │            │            │         │            │
       "3"          "x"          "²"          "+"       "6"          "x"

Selection Unit Fragment Paths:
    ["1.4.1.1.1"]  ← This is what we want to exclude
          │
          "6"

Filter Algorithm:
    For each node in All Tweenable Nodes:
        if node.path == "1.4.1.1.1":
            remove from list
            call node.disableStroke()

Remaining Nodes (after filtering):
    ["1.2.1.1.1", "1.2.2.1.1", "1.2.2.2.1", "1.3.1.1", "1.4.2.1.1", ...]
       │            │            │            │         │
       "3"          "x"          "²"          "+"       "x"

    Notice: "6" (1.4.1.1.1) is gone!
```

**Stroke Disable Mechanism**:

```javascript
disableStroke() {
    // SVG technique: Set dash array to show nothing
    $("path", this.element).attr('stroke-dasharray', '0,10000');
    //                                                  │   │
    //                                                  │   └─ 10000px gap
    //                                                  └─ 0px dash
    // Result: Invisible stroke!
}
```

---

### Phase 4: Animation Effects

**File**: `src/effects/write-without-effect.js:19-30`

```javascript
doPlay(playContext) {
    const localHandler = (e) => {
        this.scheduleComplete();
        playContext.onComplete(e);
    };

    // First, disable all strokes to start fresh
    this.mathComponent.disableStroke();

    // Write everything except the selections
    this.mathComponent.writeWithoutSelectionAnimate(this.selectionUnits, localHandler);
}
```

**Animator**: `src/mathtext/animator/non-selection-order-type-animator.js:5-12`

```javascript
reOrderTweenableNodes(tweenableNodes) {
    const mathNodeCalculator = new MathNodeCalculator();
    let availableTweenableNodes = [].concat(tweenableNodes);

    this.selectionUnits.forEach((selectionUnit) => {
        availableTweenableNodes = mathNodeCalculator.removeMatchingNodes(
            selectionUnit,
            availableTweenableNodes
        );
    });

    return availableTweenableNodes;
}
```

---

## Complete Flow

### ASCII Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Author Writes LaTeX                                        │
│  ────────────────────────────────────────────────────────────────   │
│  Input: \fbox{3}x^2 + \fbox{6}x + \fbox{-9} = 0                    │
│         └──┬──┘       └──┬──┘       └───┬───┘                      │
│            │              │               │                          │
│         Box marker    Box marker     Box marker                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: MathJax Renders to SVG                                     │
│  ────────────────────────────────────────────────────────────────   │
│  <g id="box1">                                                      │
│    <path meta="hline" d="M 10 5 L 30 5"/>                          │
│    <path meta="vline" d="M 10 5 L 10 35"/>                         │
│    <path meta="hline" d="M 10 35 L 30 35"/>                        │
│    <path meta="vline" d="M 30 5 L 30 35"/>                         │
│    <path id="1.2.1.1.1" d="...">3</path>  ← Content inside         │
│  </g>                                                               │
│  ... (similar for other fboxes) ...                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Detect FBox Patterns (BoundsExtractor)                    │
│  ────────────────────────────────────────────────────────────────   │
│  Scan for: <g> with 4 paths matching ['hline','vline','hline',     │
│            'vline']                                                 │
│                                                                     │
│  Found 3 boxes:                                                     │
│    Box 1: {x:10,  y:5,  width:20, height:30} → Remove 4 paths     │
│    Box 2: {x:80,  y:5,  width:20, height:30} → Remove 4 paths     │
│    Box 3: {x:150, y:5,  width:30, height:30} → Remove 4 paths     │
│                                                                     │
│  Result: boundsList = [Bounds2₁, Bounds2₂, Bounds2₃]              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Assign Node Paths (MathNodeGraph)                         │
│  ────────────────────────────────────────────────────────────────   │
│  Traverse SVG tree depth-first, assign hierarchical paths:          │
│                                                                     │
│  <g nodepath="1">                                                   │
│    <g nodepath="1.2">           (first term: 3x²)                  │
│      <g nodepath="1.2.1">       (coefficient)                      │
│        <path nodepath="1.2.1.1.1" d="...">3</path>                │
│      </g>                                                           │
│      <g nodepath="1.2.2">       (x²)                               │
│        <path nodepath="1.2.2.1.1" d="...">x</path>                │
│        <path nodepath="1.2.2.2.1" d="...">2</path>                │
│      </g>                                                           │
│    </g>                                                             │
│    <g nodepath="1.3">           (+)                                │
│    <g nodepath="1.4">           (6x)                               │
│      <g nodepath="1.4.1">                                          │
│        <path nodepath="1.4.1.1.1" d="...">6</path>  ← TARGET!     │
│      </g>                                                           │
│      <g nodepath="1.4.2">                                          │
│        <path nodepath="1.4.2.1.1" d="...">x</path>                │
│      </g>                                                           │
│    </g>                                                             │
│    ...                                                              │
│  </g>                                                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Convert Bounds → Selection Units                          │
│  ────────────────────────────────────────────────────────────────   │
│  For each bound in boundsList:                                     │
│    1. Create SelectionUnit()                                       │
│    2. Walk SVG tree                                                │
│    3. For each node, check if its bounds ⊆ fbox bounds            │
│    4. If yes, add node.path to SelectionUnit.fragmentPaths         │
│                                                                     │
│  Box 1 (10,5,20,30):                                               │
│    Check node "1.2.1.1.1" bounds (12,7,16,26)                     │
│    12≥10, 7≥5, 12+16≤10+20, 7+26≤5+30 → ✓ CONTAINED              │
│    → SelectionUnit₁.fragmentPaths = ["1.2.1.1.1"]                 │
│                                                                     │
│  Box 2 (80,5,20,30):                                               │
│    → SelectionUnit₂.fragmentPaths = ["1.4.1.1.1"]                 │
│                                                                     │
│  Box 3 (150,5,30,30):                                              │
│    → SelectionUnit₃.fragmentPaths = ["1.6.1.1.1", "1.6.1.1.2"]    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Use Selection Units in Animations                         │
│  ────────────────────────────────────────────────────────────────   │
│  Example: writeWithout([SelectionUnit₂])                           │
│                                                                     │
│  All Tweenables: [1.2.1.1.1, 1.2.2.1.1, 1.2.2.2.1, 1.3.1.1,       │
│                   1.4.1.1.1, 1.4.2.1.1, 1.5.1.1, ...]             │
│                   └─"3"─┘   └─"x"─┘   └─"²"─┘   └"+"┘            │
│                             └──"6"──┘  └─"x"─┘                     │
│                                                                     │
│  SelectionUnit₂.fragmentPaths = ["1.4.1.1.1"]                      │
│                                                                     │
│  Filter: Remove any node where path == "1.4.1.1.1"                 │
│                                                                     │
│  Remaining:      [1.2.1.1.1, 1.2.2.1.1, 1.2.2.2.1, 1.3.1.1,       │
│                   1.4.2.1.1, 1.5.1.1, ...]                        │
│                   └─"3"─┘   └─"x"─┘   └─"²"─┘   └"+"┘            │
│                             └─"x"─┘                                │
│                                                                     │
│  Also: Call disableStroke() on node "1.4.1.1.1" → Makes "6"       │
│        invisible                                                   │
│                                                                     │
│  Animation Result: Draw "3x² + x + -9 = 0"                         │
│                         (without the "6")                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Reveal Excluded Content (Optional)                        │
│  ────────────────────────────────────────────────────────────────   │
│  writeOnly([SelectionUnit₂])                                       │
│                                                                     │
│  Filtered:       [1.4.1.1.1]  ← Only this node                    │
│                   └──"6"──┘                                        │
│                                                                     │
│  Animation Result: Draw just "6" in the gap                        │
│                                                                     │
│  Final Visual: 3x² + 6x + -9 = 0  (complete!)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Code Examples

### Example 1: Exclude Single Coefficient

**LaTeX Input**:
```latex
\fbox{3}x^2 + 6x + 9 = 0
```

**JavaScript**:
```javascript
import { CanvasContainer } from './src/blocks/canvas-container.js';

const canvasContainer = new CanvasContainer(parentElement);
const components = canvasContainer.componentBuilder();
const effects = canvasContainer.effectsBuilder();

// Create math text
const mathStr = `\\fbox{3}x^2 + 6x + 9 = 0`;
const mathText = components.mathText(mathStr, {left: 100, top: 100});
mathText.stroke("blue").fontSize(32).render();

// Get fbox bounds
const fboxBounds = mathText.getFBoxHighlightBounds();
//  → [Bounds2{x:10, y:5, width:20, height:30}]

// Convert to selection unit
const selectionUnit = mathText.selectionUnitFromBounds(fboxBounds[0]);
//  → SelectionUnit{ fragmentPaths: ["1.2.1.1.1"] }

// Create animation sequence
const sequence = effects.sequenceEffect();

// Write everything except "3"
sequence.add(mathText.writeWithout([selectionUnit]));
//  → Animates: "x² + 6x + 9 = 0"

// Pause for effect
sequence.add(effects.delay(1000));

// Reveal "3"
sequence.add(mathText.writeOnly([selectionUnit]));
//  → Animates: "3" appears in front of x²

// Play the sequence
sequence.play();
```

**Visual Timeline**:
```
t=0s     Start
t=0-2s   Draw "x² + 6x + 9 = 0"    (missing the coefficient!)
t=2-3s   Pause (gap visible where 3 should be)
t=3-4s   Draw "3" in the gap
t=4s     Complete: "3x² + 6x + 9 = 0"
```

---

### Example 2: Multiple Exclusions

**LaTeX Input**:
```latex
\fbox{a}x^2 + \fbox{b}x + \fbox{c} = 0
```

**JavaScript**:
```javascript
const mathStr = `\\fbox{a}x^2 + \\fbox{b}x + \\fbox{c} = 0`;
const mathText = components.mathText(mathStr, {left: 100, top: 100});
mathText.stroke("blue").fontSize(32).render();

// Get all three fbox bounds
const fboxBounds = mathText.getFBoxHighlightBounds();
//  → [Bounds2₁, Bounds2₂, Bounds2₃]
//      for "a"    "b"    "c"

// Convert all to selection units
const selectionUnits = fboxBounds.map(bounds =>
    mathText.selectionUnitFromBounds(bounds)
);
//  → [SelectionUnit₁, SelectionUnit₂, SelectionUnit₃]
//    { ["1.2.1.1.1"] }, { ["1.4.1.1.1"] }, { ["1.6.1.1.1"] }

const sequence = effects.sequenceEffect();

// Show structure first (x² + x + = 0)
sequence.add(mathText.writeWithout(selectionUnits));

// Reveal coefficients one by one
sequence.add(effects.delay(500));
sequence.add(mathText.writeOnly([selectionUnits[0]]));  // "a"

sequence.add(effects.delay(500));
sequence.add(mathText.writeOnly([selectionUnits[1]]));  // "b"

sequence.add(effects.delay(500));
sequence.add(mathText.writeOnly([selectionUnits[2]]));  // "c"

sequence.play();
```

**Visual Timeline**:
```
t=0s      Start
t=0-2s    Draw "x² + x + = 0"
t=2-2.5s  Pause
t=2.5-3s  Draw "a" → "ax² + x + = 0"
t=3-3.5s  Pause
t=3.5-4s  Draw "b" → "ax² + bx + = 0"
t=4-4.5s  Pause
t=4.5-5s  Draw "c" → "ax² + bx + c = 0"
```

---

### Example 3: Nested Expressions

**LaTeX Input**:
```latex
\frac{\fbox{numerator}}{denominator}
```

**JavaScript**:
```javascript
const mathStr = `\\frac{\\fbox{2x + 3}}{x - 1}`;
const mathText = components.mathText(mathStr, {left: 100, top: 100});
mathText.stroke("black").fontSize(40).render();

const fboxBounds = mathText.getFBoxHighlightBounds();
const numeratorSelection = mathText.selectionUnitFromBounds(fboxBounds[0]);

const sequence = effects.sequenceEffect();

// Draw denominator and fraction bar first
sequence.add(mathText.writeWithout([numeratorSelection]));
//  → Shows: ─────
//           x - 1

sequence.add(effects.delay(1000));

// Fill in numerator
sequence.add(mathText.writeOnly([numeratorSelection]));
//  → Shows: 2x + 3
//           ───────
//           x - 1

sequence.play();
```

---

### Example 4: Complex Expression with Multiple Regions

**LaTeX Input**:
```latex
\int_{0}^{\fbox{\infty}} \fbox{e^{-x^2}} dx = \fbox{\sqrt{\pi}}
```

**JavaScript**:
```javascript
const mathStr = `\\int_{0}^{\\fbox{\\infty}} \\fbox{e^{-x^2}} dx = \\fbox{\\sqrt{\\pi}}`;
const mathText = components.mathText(mathStr, {left: 50, top: 100});
mathText.stroke("purple").fontSize(36).render();

const fboxBounds = mathText.getFBoxHighlightBounds();
//  → [Bounds₁, Bounds₂, Bounds₃]
//      ∞      e^(-x²)   √π

const [upperLimitSU, integrandSU, resultSU] = fboxBounds.map(b =>
    mathText.selectionUnitFromBounds(b)
);

const sequence = effects.sequenceEffect();

// Show integral structure
sequence.add(mathText.writeWithout([upperLimitSU, integrandSU, resultSU]));
//  → ∫₀ __ dx = __

sequence.add(effects.delay(800));

// Fill in upper limit
sequence.add(mathText.writeOnly([upperLimitSU]));
//  → ∫₀^∞ __ dx = __

sequence.add(effects.delay(800));

// Fill in integrand
sequence.add(mathText.writeOnly([integrandSU]));
//  → ∫₀^∞ e^(-x²) dx = __

sequence.add(effects.delay(800));

// Reveal answer
sequence.add(mathText.writeOnly([resultSU]));
//  → ∫₀^∞ e^(-x²) dx = √π

sequence.play();
```

---

## Architecture Diagrams

### Class Interaction Diagram

```
┌─────────────────────┐
│  MathTextComponent  │
│  ─────────────────  │
│  + renderMath()     │───┐
│  + getFBoxBounds()  │   │
│  + writeWithout()   │   │
│  + writeOnly()      │   │
└─────────────────────┘   │
           │              │
           │ uses         │ calls
           ↓              │
┌─────────────────────┐   │
│  BoundsExtractor    │←──┘
│  ─────────────────  │
│  + extractFBox      │     Detects box patterns in SVG
│    BoundsDescriptors│     Returns Bounds2 array
└─────────────────────┘
           │
           │ returns Bounds2[]
           ↓
┌─────────────────────┐
│   MathNodeGraph     │
│  ─────────────────  │
│  + assignNodePath() │     Assigns hierarchical paths (1.2.3.1)
│  + collectSelection │     Maps Bounds2 → node paths
│    Units()          │
└─────────────────────┘
           │
           │ creates
           ↓
┌─────────────────────┐
│   SelectionUnit     │
│  ─────────────────  │
│  fragmentPaths: []  │     ["1.4.1.1.1", "1.4.1.1.2"]
│  + addFragment()    │
│  + containsFragment()│
└─────────────────────┘
           │
           │ used by
           ↓
┌─────────────────────┐
│ MathNodeCalculator  │
│  ─────────────────  │
│  + excludeTween     │     Filters nodes by fragmentPaths
│    Nodes()          │
│  + includeTween     │
│    Nodes()          │
└─────────────────────┘
           │
           │ filters
           ↓
┌─────────────────────┐
│  TweenableNode[]    │     Final list of nodes to animate
│  ─────────────────  │
│  - nodePath         │
│  - svgElement       │
│  + enableStroke()   │
│  + disableStroke()  │
└─────────────────────┘
           │
           │ animated by
           ↓
┌─────────────────────┐
│ NonSelectionOrder   │
│ TypeAnimator        │
│  ─────────────────  │
│  + reOrderTweenable │     Animates filtered nodes
│    Nodes()          │
└─────────────────────┘
```

### Data Flow Diagram

```
  LaTeX String
  ────────────
  \fbox{3}x^2
       │
       ↓
┌──────────────┐
│  MathJax     │  Converts LaTeX → SVG
│  Processor   │
└──────────────┘
       │
       ↓ SVG with <g><path meta="hline">...
       │
┌──────────────┐
│  Bounds      │  Finds box patterns → Bounds2[]
│  Extractor   │  Removes box paths from DOM
└──────────────┘
       │
       ↓ [{x:10,y:5,w:20,h:30}]
       │
┌──────────────┐
│  Math Node   │  Assigns node paths to SVG elements
│  Graph       │  Maps Bounds2 → SelectionUnit
└──────────────┘
       │
       ↓ SelectionUnit{fragmentPaths:["1.2.1.1.1"]}
       │
┌──────────────┐
│  Math Node   │  Filters all nodes by fragmentPaths
│  Calculator  │
└──────────────┘
       │
       ↓ TweenableNode[] (filtered)
       │
┌──────────────┐
│  Animator    │  Draws filtered nodes with pen
└──────────────┘
       │
       ↓
   Visual Output
```

### State Transition Diagram

```
┌───────────────┐
│  All Strokes  │  Initial state after rendering
│   Disabled    │  stroke-dasharray: 0,10000
└───────────────┘
       │
       │ writeWithout([selUnit])
       ↓
┌───────────────┐
│  Excluded     │  Nodes in selUnit stay invisible
│  Nodes Stay   │  Other nodes: stroke-dasharray animated 0,10000 → 0,0
│  Invisible    │
└───────────────┘
       │
       │ writeOnly([selUnit])
       ↓
┌───────────────┐
│  Excluded     │  Nodes in selUnit: stroke-dasharray animated 0,10000 → 0,0
│  Nodes Reveal │  Other nodes stay visible
└───────────────┘
       │
       ↓
┌───────────────┐
│  All Visible  │  All strokes: stroke-dasharray: 0,0
└───────────────┘
```

---

## Performance Considerations

### Time Complexity

```
Operation                           Complexity    Notes
─────────────────────────────────────────────────────────────────
extractFBoxBoundsDescriptors        O(n)          n = # of <g> tags
assignNodePath                      O(m)          m = # of SVG elements
collectSelectionUnits               O(m)          Traverse tree once
removeMatchingNodes                 O(k × p)      k = # fragments, p = # paths
─────────────────────────────────────────────────────────────────
Total                               O(n + 2m + kp)
```

For typical equations (50-200 SVG elements), this runs in <10ms.

### Space Complexity

```
Data Structure               Size          Notes
───────────────────────────────────────────────────────────────
Bounds2 array                O(b)          b = # of fboxes
SelectionUnit.fragmentPaths  O(f)          f = # of fragments per box
TweenableNode array          O(m)          m = # of SVG paths
───────────────────────────────────────────────────────────────
Total                        O(b + f + m)
```

Memory footprint: ~1-5KB per equation.

---

## Edge Cases

### Empty FBox

**Input**: `\fbox{}`

**Behavior**:
- MathJax renders 4 box paths with minimal spacing
- BoundsExtractor detects valid box pattern
- collectSelectionUnits finds no content inside bounds
- SelectionUnit has empty fragmentPaths
- writeWithout has no effect (nothing to exclude)

**ASCII**:
```
┌┐   ← 4 paths form empty box
└┘
```

---

### Nested FBoxes

**Input**: `\fbox{\fbox{x}}`

**Behavior**:
- Two sets of 4 paths created (8 total box paths)
- BoundsExtractor finds 2 separate Bounds2 objects:
  - Outer box: {x:10, y:5, width:40, height:35}
  - Inner box: {x:15, y:10, width:20, height:25}
- Both contain the same "x" node (1.2.1.1.1)
- Two SelectionUnits with identical fragmentPaths

**ASCII**:
```
┌──────────┐
│  ┌────┐  │
│  │ x  │  │  ← Inner fbox
│  └────┘  │
└──────────┘   ← Outer fbox
```

**Recommendation**: Avoid nested fboxes; use only one marker per content.

---

### Overlapping FBoxes

**Input**: `\fbox{ab}\fbox{bc}`

**Behavior**:
- If boxes visually overlap:
  - Box 1 contains: "a", "b"
  - Box 2 contains: "b", "c"
- "b" appears in both SelectionUnits
- writeWithout([selUnit1, selUnit2]) will exclude "a", "b", "c"

**ASCII**:
```
┌────┐
│ ab │bc│
└────┴──┘
   ↑
   └─ "b" is in both boxes!
```

**Recommendation**: Ensure fboxes don't overlap.

---

## Debugging Tips

### Enable Logging

```javascript
// In bounds-box-selection.js
console.log('=== FBOX BOUNDS DETECTION ===');
console.log('Total fbox elements found:', highlightBoundsList.length);

highlightBoundsList.forEach((bounds, index) => {
    console.log(`FBox ${index + 1}:`, bounds);
    const selUnit = mathText.selectionUnitFromBounds(bounds);
    console.log('  Fragment paths:', selUnit.fragmentPaths);
});
```

### Visualize Bounds

```javascript
// Show boxes on screen temporarily
highlightBoundsList.forEach((bounds, index) => {
    setTimeout(() => {
        mathText.showHighLightBounds(bounds);  // Draws red rectangle
    }, index * 1000);
});
```

### Inspect Node Paths

```javascript
// Get all node paths in equation
import { MathNodeCalculator } from './src/mathtext/animator/math-node-calculator.js';

const calculator = new MathNodeCalculator();
const allNodes = calculator.getTweenableNodes(mathComponent.mathGraphNode);
console.log('All node paths:', allNodes.map(n => n.getNodePath()));
//  → ["1.2.1.1.1", "1.2.2.1.1", "1.3.1.1", ...]
```

### Verify Exclusion

```javascript
// Check what remains after exclusion
const remainingNodes = calculator.excludeTweenNodes(mathGraphNode, [selectionUnit]);
console.log('Remaining after exclusion:', remainingNodes.map(n => n.getNodePath()));

// Verify expected path was removed
const wasExcluded = !remainingNodes.some(n => n.getNodePath() === '1.4.1.1.1');
console.log('Path 1.4.1.1.1 excluded?', wasExcluded);  // Should be true
```

---

## Limitations

1. **FBox artifacts**: If box paths aren't properly removed, visible boxes appear around content
   - **Fix**: Ensure `combinePathsAndGetBBox` calls `path.parentNode.removeChild(path)`

2. **CTM coordinate mismatch**: Scaling/transforms can cause bounds containment failures
   - **Fix**: Always use `getBoundsInCTMUnits` instead of `getBBox`

3. **Multi-line expressions**: FBox may not work correctly with line breaks
   - **Workaround**: Use separate fboxes per line

4. **Spacing changes**: Removing box paths can affect equation spacing
   - **Status**: Minor issue, usually not noticeable

---

## Alternative Markers

Besides `\fbox`, the system supports:

### Semicolon Markers

```latex
\overset{\text{;;;;;;;}}{\underset{\text{;;;;;;;}}{\frac{c}{d} + e^f}}
```

Uses semicolons as invisible markers (detected by `meta="MJMAIN-3B"`).

**File**: `src/blocks/bounds-extractor.js:36-60`

```javascript
static extractOverSetUnderSetBoundsDescriptors(svgDocument$, metaCharacterToCheck) {
    // Find groups where all paths have meta="MJMAIN-3B" (semicolon)
    const hasValidHighlightSection = pathChildren.every((child) => {
        const metaAttr = child.getAttribute('meta');
        return metaAttr === metaCharacterToCheck;
    });
}
```

**Usage**:
```javascript
const semiColonBounds = mathText.getSemicolonHighlightBounds();
const selUnit = mathText.selectionUnitFromBounds(semiColonBounds[0]);
```

---

## Conclusion

The LaTeX Box Exclusion System provides:

✅ **Semantic marking** via standard LaTeX (`\fbox`)
✅ **Automatic detection** of box patterns in SVG
✅ **Hierarchical addressing** with node paths
✅ **Precise filtering** of animation sequences
✅ **Flexible composition** of multiple exclusions

This enables dramatic reveal effects, progressive disclosure of equations, and attention-focused animations—all controlled through simple LaTeX markup.

---

## References

**Key Files**:
- `src/blocks/bounds-extractor.js` - Box pattern detection
- `src/mathtext/animator/math-node-graph.js` - Node path assignment
- `src/mathtext/animator/math-node-calculator.js` - Path filtering
- `src/effects/write-without-effect.js` - Exclusion effect
- `bounds-box-selection.js` - Example usage
- `docs/node-path-selection-unit.md` - Original documentation

**Related Concepts**:
- SVG Path Animation (stroke-dasharray technique)
- CTM (Current Transformation Matrix) coordinates
- Tree traversal and hierarchical addressing
- Bounds containment algorithms
