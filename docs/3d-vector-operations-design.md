# 3D Vector Operations - Design & Implementation

## Overview

This document outlines the design and implementation approach for adding 3D versions of 2D vector operations to RoboMath.

---

## Current State

### Existing 2D Vector Operations (12 total)

| Operation | Description | Animation | Line/Vector Support |
|-----------|-------------|-----------|---------------------|
| `forward` | Shift forward along direction | Yes (TranslateEffect) | Both |
| `backward` | Shift backward (opposite) | Yes (TranslateEffect) | Both |
| `perpshift` | Shift perpendicular | Yes (TranslateEffect) | Both |
| `reverse` | Reverse direction at new point | No | Both |
| `perp` | Perpendicular through point | No | Both |
| `pll` | Parallel through point | No | Both |
| `vecsum` | Vector addition result | No | Both |
| `vecdiff` | Vector subtraction result | No | Both |
| `vecproject` | Project onto vector | No | Both |
| `chain` | Tail-to-tip positioning | Yes (TranslateEffect) | Both |
| `placeat` | Copy to new position | No | Both |
| `decompose` | Decompose into components | No | Vector only |

### Existing 3D Vector Operations (4 total)

| Operation | Description | Animation | Line/Vector Support |
|-----------|-------------|-----------|---------------------|
| `forward3d` | Slide forward | Yes (GSAP) | Vector only |
| `backward3d` | Slide backward | Yes (GSAP) | Vector only |
| `shiftTo3d` | Shift to new position | Yes (GSAP) | Vector only |
| `reverse3d` | Reverse direction | No | Vector only |

---

## Implementation Summary

### New 3D Operations: 9 Expression-Command Pairs

| # | Operation | Animation | Line3D Support |
|---|-----------|-----------|----------------|
| 1 | `pll3d` | No | Yes |
| 2 | `perp3d` | No | Yes |
| 3 | `perpshift3d` | Yes (GSAP) | Yes |
| 4 | `vecsum3d` | No | Yes |
| 5 | `vecdiff3d` | No | Yes |
| 6 | `vecproject3d` | No | Yes |
| 7 | `chain3d` | Yes (GSAP) | Yes |
| 8 | `placeat3d` | No | Yes |
| 9 | `decompose3d` | No | Vector only |

### Updates to Existing Operations: 4

| Operation | Change Required |
|-----------|-----------------|
| `forward3d` | Add line3d support |
| `backward3d` | Add line3d support |
| `shiftTo3d` | Add line3d support |
| `reverse3d` | Add line3d support |

---

## Detailed Design

### 1. `pll3d` - Parallel Through Point

**Syntax:**
```
pll3d(vec/line, point)
pll3d(vec/line, point, length)
```

**Behavior:**
- Creates a parallel vector/line through the given point
- Same direction as reference, centered at point
- Optional length parameter (defaults to reference length)

**Implementation Notes:**
- Straightforward: compute direction, place at new point
- Returns `vector3d` if input is `vector3d`, `line3d` if input is `line3d`

**Files:**
- `src/engine/expression-parser/expressions/3d/PLL3DExpression.js`
- `src/engine/commands/3d/PLL3DCommand.js`

---

### 2. `perp3d` - Perpendicular Through Point

**Syntax:**
```
perp3d(vec/line, point, axisVec)
perp3d(vec/line, point, axisVec, length)
```

**Behavior:**
- Creates perpendicular using cross product: `perpDir = normalize(cross(vecDir, axisDir))`
- The axis vector defines which perpendicular plane to use
- Centered at the given point

**Implementation Notes:**
- 3D perpendicular is ambiguous (infinite directions)
- User provides `axisVec` to resolve ambiguity
- Cross product gives unique perpendicular direction

**Math:**
```javascript
const vecDir = normalize(vectorEnd - vectorStart);
const axisDir = normalize(axisEnd - axisStart);
const perpDir = normalize(cross(vecDir, axisDir));
// Create line/vector at point with perpDir
```

**Files:**
- `src/engine/expression-parser/expressions/3d/Perp3DExpression.js`
- `src/engine/commands/3d/Perp3DCommand.js`

---

### 3. `perpshift3d` - Perpendicular Shift (Animated)

**Syntax:**
```
perpshift3d(vec, distance, axisVec)
```

**Behavior:**
- Shifts vector perpendicular to its direction
- Uses axis vector to determine perpendicular direction (cross product)
- Animates the shift using GSAP

**Implementation Notes:**
- Similar to `forward3d` but offset is perpendicular
- Uses `animateVectorSlide` for animation
- Perpendicular direction: `perpDir = normalize(cross(vecDir, axisDir))`

**Math:**
```javascript
const vecDir = normalize(vectorEnd - vectorStart);
const axisDir = normalize(axisEnd - axisStart);
const perpDir = normalize(cross(vecDir, axisDir));
const offset = {
    x: perpDir.x * distance,
    y: perpDir.y * distance,
    z: perpDir.z * distance
};
```

**Files:**
- `src/engine/expression-parser/expressions/3d/PerpShift3DExpression.js`
- `src/engine/commands/3d/PerpShift3DCommand.js`

---

### 4. `vecsum3d` - Vector Addition

**Syntax:**
```
vecsum3d(vecA, vecB)
vecsum3d(vecA, vecB, point)
vecsum3d(vecA, vecB, x, y, z)
```

**Behavior:**
- Returns the mathematical sum `a + b` as a vector
- Optional starting point (defaults to origin)

**Implementation Notes:**
- Pure vector math: `result = vecA + vecB`
- No animation, creates static vector

**Math:**
```javascript
const aVec = { x: aEnd.x - aStart.x, y: aEnd.y - aStart.y, z: aEnd.z - aStart.z };
const bVec = { x: bEnd.x - bStart.x, y: bEnd.y - bStart.y, z: bEnd.z - bStart.z };
const resultVec = { x: aVec.x + bVec.x, y: aVec.y + bVec.y, z: aVec.z + bVec.z };
// Place at startPoint or origin
```

**Files:**
- `src/engine/expression-parser/expressions/3d/VecSum3DExpression.js`
- `src/engine/commands/3d/VecSum3DCommand.js`

---

### 5. `vecdiff3d` - Vector Subtraction

**Syntax:**
```
vecdiff3d(vecA, vecB)
vecdiff3d(vecA, vecB, point)
vecdiff3d(vecA, vecB, x, y, z)
```

**Behavior:**
- Returns the mathematical difference `a - b` as a vector
- Optional starting point (defaults to origin)

**Implementation Notes:**
- Similar to `vecsum3d` but subtracts

**Math:**
```javascript
const resultVec = { x: aVec.x - bVec.x, y: aVec.y - bVec.y, z: aVec.z - bVec.z };
```

**Files:**
- `src/engine/expression-parser/expressions/3d/VecDiff3DExpression.js`
- `src/engine/commands/3d/VecDiff3DCommand.js`

---

### 6. `vecproject3d` - Vector Projection

**Syntax:**
```
vecproject3d(vecToProject, vecTarget)
```

**Behavior:**
- Projects `vecToProject` onto `vecTarget`
- Returns the projection vector

**Implementation Notes:**
- Standard vector projection formula

**Math:**
```javascript
// proj_b(a) = ((a · b) / (b · b)) * b
const a = toVec(vecToProject);
const b = toVec(vecTarget);
const scalar = dot(a, b) / dot(b, b);
const projection = { x: b.x * scalar, y: b.y * scalar, z: b.z * scalar };
```

**Files:**
- `src/engine/expression-parser/expressions/3d/VecProject3DExpression.js`
- `src/engine/commands/3d/VecProject3DCommand.js`

---

### 7. `chain3d` - Tail-to-Tip Positioning (Animated)

**Syntax:**
```
chain3d(vecA, vecB)
```

**Behavior:**
- Positions `vecB`'s tail at `vecA`'s tip
- Animates `vecB` sliding to the new position
- Useful for vector addition visualization

**Implementation Notes:**
- Compute translation: `offset = vecA.end - vecB.start`
- Use `animateVectorSlide` for animation

**Math:**
```javascript
const dx = aEnd.x - bStart.x;
const dy = aEnd.y - bStart.y;
const dz = aEnd.z - bStart.z;
const newBStart = aEnd;
const newBEnd = { x: bEnd.x + dx, y: bEnd.y + dy, z: bEnd.z + dz };
```

**Files:**
- `src/engine/expression-parser/expressions/3d/Chain3DExpression.js`
- `src/engine/commands/3d/Chain3DCommand.js`

---

### 8. `placeat3d` - Copy to New Position

**Syntax:**
```
placeat3d(vec, point)
placeat3d(vec, x, y, z)
```

**Behavior:**
- Copies vector to start at new position
- Maintains direction and magnitude

**Implementation Notes:**
- Compute vector displacement, apply to new start point
- No animation (static creation)

**Math:**
```javascript
const vecDisplacement = { x: end.x - start.x, y: end.y - start.y, z: end.z - start.z };
const newEnd = {
    x: newStart.x + vecDisplacement.x,
    y: newStart.y + vecDisplacement.y,
    z: newStart.z + vecDisplacement.z
};
```

**Files:**
- `src/engine/expression-parser/expressions/3d/PlaceAt3DExpression.js`
- `src/engine/commands/3d/PlaceAt3DCommand.js`

---

### 9. `decompose3d` - Decompose to Components

**Syntax:**
```
decompose3d(vec)
```

**Behavior:**
- Decomposes vector into x, y, z component vectors
- Returns array of 3 vectors along each axis

**Implementation Notes:**
- Creates 3 separate vectors
- Each aligned with an axis (x, y, z)
- All start at the original vector's start point

**Math:**
```javascript
const vec = { x: end.x - start.x, y: end.y - start.y, z: end.z - start.z };
const xComponent = { start: start, end: { x: start.x + vec.x, y: start.y, z: start.z } };
const yComponent = { start: start, end: { x: start.x, y: start.y + vec.y, z: start.z } };
const zComponent = { start: start, end: { x: start.x, y: start.y, z: start.z + vec.z } };
```

**Files:**
- `src/engine/expression-parser/expressions/3d/Decompose3DExpression.js`
- `src/engine/commands/3d/Decompose3DCommand.js`

---

## Updates to Existing Operations

### Adding line3d Support

For `forward3d`, `backward3d`, `shiftTo3d`, and `reverse3d`:

**Changes to Expression:**
```javascript
// Add input type detection
this.inputType = sourceExpr.getName() === 'line3d' ? 'line' : 'vec';
```

**Changes to Command:**
```javascript
// Create appropriate shape based on input type
if (this.inputType === 'line') {
    this.shape = this.graphContainer.diagram3d.line3d(start, end, '', color);
} else {
    this.shape = this.graphContainer.diagram3d.vector(start, end, '', color);
}
```

---

## Architecture Patterns

Based on existing patterns in the codebase, there are **two architecture approaches**:

### Pattern 1: Simple Static Operations (Line3D/Vector3D style)

For simple operations that:
- Create a single shape
- Don't need complex animation
- Have straightforward input/output

**Expression:**
```javascript
export class New3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'newop3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.coordinates = [];
        this.graphExpression = null;
        this.inputType = 'vec'; // 'vec' or 'line'
    }

    resolve(context) {
        // 1. Resolve all subexpressions
        // 2. Get graph from first shape argument
        // 3. Detect input type (vector3d vs line3d)
        // 4. Compute result coordinates
    }

    toCommand(options = {}) {
        const pts = this.getLinePoints();
        if (this.inputType === 'line') {
            return new Line3DCommand(this.graphExpression, pts[0], pts[1], mergedOpts);
        }
        return new Vector3DCommand(this.graphExpression, pts[0], pts[1], mergedOpts);
    }
}
```

**Command:** Reuse existing `Line3DCommand` or `Vector3DCommand` directly.

**Use for:** `pll3d`, `vecsum3d`, `vecdiff3d`, `vecproject3d`, `placeat3d`

---

### Pattern 2: Handler Pattern (Rotate3D style)

For complex operations that:
- Support multiple shape types (vector3d, line3d, point3d)
- Need animation with shape-specific logic
- May support multi-shape mode

**Handler Interface:**
```javascript
// src/3d/common/<operation>-handlers/<shape>_handler.js
export const vectorSlideHandler = {
    // Extract points from expression
    getPoints(expression) {
        const coords = expression.getVariableAtomicValues();
        return [
            { x: coords[0], y: coords[1], z: coords[2] },
            { x: coords[3], y: coords[4], z: coords[5] }
        ];
    },

    // Compute transformed state at current animation progress
    getTransformedState(originalPoints, params, progress) {
        // Calculate interpolated position
        return { start, end };
    },

    // Create shape from state
    createShape(diagram3d, state, options = {}) {
        return diagram3d.vector(state.start, state.end, '', options.color, vectorOptions);
    },

    getGeometryType() { return 'vector3d'; }
};
```

**Expression with Handler Registry:**
```javascript
import { vectorSlideHandler } from '../../../../3d/common/slide-handlers/vector_slide_handler.js';
import { lineSlideHandler } from '../../../../3d/common/slide-handlers/line_slide_handler.js';

const SLIDE_HANDLERS = {
    'vector3d': vectorSlideHandler,
    'line3d': lineSlideHandler
};

export class PerpShift3DExpression extends AbstractNonArithmeticExpression {
    resolve(context) {
        // ...
        const shapeType = this.shapeExpression.getGeometryType?.() || this.shapeExpression.getName();
        this.handler = SLIDE_HANDLERS[shapeType];
        if (!this.handler) {
            this.dispatchError(`perpshift3d() does not support: ${shapeType}`);
        }
        this.originalPoints = this.handler.getPoints(this.shapeExpression);
        // ...
    }

    toCommand(options = {}) {
        return new PerpShift3DCommand(
            this.shapeExpression,
            this.originalShapeVarName,
            this.offset,
            this.handler,
            this.originalPoints,
            this.shiftedPoints,
            options
        );
    }
}
```

**Command with Animation:**
```javascript
export class PerpShift3DCommand extends Base3DCommand {
    async play() {
        const scene = this.graphContainer.getScene();

        const getState = (progress) => {
            return this.handler.getTransformedState(
                this.originalPoints, this.offset, progress
            );
        };

        const createShape = (state) => {
            return this.handler.createShape(diagram3d, state, styleOptions);
        };

        return new Promise((resolve) => {
            animateVectorSlide(/* ... */);
        });
    }
}
```

**Use for:** `perpshift3d`, `chain3d` (animated operations with line3d/vector3d support)

---

### Pattern 3: Axis-Based Operations (Rotate3D style)

For operations requiring an axis parameter:

```javascript
// Find axis from args (last args could be vector or 3 numbers)
_findAxis(context) {
    const len = this.subExpressions.length;
    const lastExpr = this._getResolvedExpression(context, this.subExpressions[len - 1]);
    const lastValues = lastExpr.getVariableAtomicValues();

    // If last arg has 6 values, it's a vector (use direction)
    if (lastValues.length >= 6) {
        return {
            x: lastValues[3] - lastValues[0],
            y: lastValues[4] - lastValues[1],
            z: lastValues[5] - lastValues[2]
        };
    }

    // If last 3 args are numbers (ax, ay, az)
    // ... similar to Rotate3DExpression._findAngleAndAxis()
}
```

**Use for:** `perp3d`, `perpshift3d`

---

## File Structure

```
src/engine/expression-parser/expressions/3d/
├── Chain3DExpression.js          (NEW)
├── Decompose3DExpression.js      (NEW)
├── PerpShift3DExpression.js      (NEW)
├── Perp3DExpression.js           (NEW)
├── PlaceAt3DExpression.js        (NEW)
├── PLL3DExpression.js            (NEW)
├── VecDiff3DExpression.js        (NEW)
├── VecProject3DExpression.js     (NEW)
├── VecSum3DExpression.js         (NEW)
├── Forward3DExpression.js        (UPDATE - add line3d support)
├── Backward3DExpression.js       (UPDATE - add line3d support)
├── Move3DExpression.js           (UPDATE - add line3d support)
└── Reverse3DExpression.js        (UPDATE - add line3d support)

src/engine/commands/3d/
├── Chain3DCommand.js             (NEW)
├── Decompose3DCommand.js         (NEW)
├── PerpShift3DCommand.js         (NEW)
├── Perp3DCommand.js              (NEW)
├── PlaceAt3DCommand.js           (NEW)
├── PLL3DCommand.js               (NEW)
├── VecDiff3DCommand.js           (NEW)
├── VecProject3DCommand.js        (NEW)
├── VecSum3DCommand.js            (NEW)
├── Forward3DCommand.js           (UPDATE - add line3d support)
├── Backward3DCommand.js          (UPDATE - add line3d support)
├── Move3DCommand.js              (UPDATE - add line3d support)
└── Reverse3DCommand.js           (UPDATE - add line3d support)

src/3d/common/slide-handlers/                  (NEW DIRECTORY)
├── vector_slide_handler.js       (NEW - for perpshift3d, chain3d vector animation)
└── line_slide_handler.js         (NEW - for perpshift3d, chain3d line animation)
```

---

## Registration

Add to `src/engine/expression-parser/core/IntrepreterFunctionTable.js`:

```javascript
// 3D vector operations (new)
registerMultiArg('pll3d', PLL3DExpression);
registerMultiArg('perp3d', Perp3DExpression);
registerMultiArg('perpshift3d', PerpShift3DExpression);
registerMultiArg('vecsum3d', VecSum3DExpression);
registerMultiArg('vecdiff3d', VecDiff3DExpression);
registerMultiArg('vecproject3d', VecProject3DExpression);
registerMultiArg('chain3d', Chain3DExpression);
registerMultiArg('placeat3d', PlaceAt3DExpression);
registerMultiArg('decompose3d', Decompose3DExpression);
```

---

## Implementation Order

### Phase 1: Static Operations (no animation, simpler)
1. `pll3d` - simplest, just direction copy
2. `placeat3d` - simple copy with translation
3. `vecsum3d` - basic vector math
4. `vecdiff3d` - basic vector math
5. `vecproject3d` - projection formula
6. `perp3d` - requires cross product
7. `decompose3d` - creates multiple vectors

### Phase 2: Animated Operations
8. `chain3d` - uses `animateVectorSlide`
9. `perpshift3d` - uses `animateVectorSlide` with perpendicular offset

### Phase 3: Update Existing Operations
10. `forward3d` - add line3d support
11. `backward3d` - add line3d support
12. `shiftTo3d` - add line3d support
13. `reverse3d` - add line3d support

---

## Utility Functions Needed

Consider adding to a 3D vector utility module:

```javascript
// src/geom/Vector3DUtil.js (if needed)

export class Vector3DUtil {
    static cross(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    static dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static normalize(v) {
        const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
    }

    static add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    }

    static subtract(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    }

    static scale(v, s) {
        return { x: v.x * s, y: v.y * s, z: v.z * s };
    }
}
```

---

## File Count Summary

| Category | New Files | Updated Files |
|----------|-----------|---------------|
| Expressions | 9 | 4 |
| Commands | 9 | 4 |
| Handlers (slide-handlers/) | 2 | 0 |
| Function Table | 0 | 1 |
| **Total** | **20** | **9** |

**Grand Total: 29 files**
