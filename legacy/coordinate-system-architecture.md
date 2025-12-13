# Coordinate System Architecture

This document explains how the 3D vector generator abstracts the coordinate system, hiding Three.js internals from lesson implementations.

## Overview

The project uses a **Left-Handed System (LHS)** mathematical coordinate system:
- **X-axis**: Right
- **Y-axis**: Forward
- **Z-axis**: Up

Three.js uses a different coordinate system internally. The `lhs_transform.js` module handles all conversions, and the `Diagram` class wraps everything so lessons never need to think about Three.js coordinates.

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│              Lesson Code                     │
│   (uses mathematical LHS coordinates)        │
├─────────────────────────────────────────────┤
│           Diagram / AnimatedDiagram          │
│   (public API - accepts plain {x,y,z})       │
├─────────────────────────────────────────────┤
│           LHS Primitives                     │
│   lhs_line.js, lhs_point.js, lhs_vector.js  │
│   (internal - calls transformToThreeJS)      │
├─────────────────────────────────────────────┤
│           lhs_transform.js                   │
│   (coordinate conversion layer)              │
├─────────────────────────────────────────────┤
│              Three.js                        │
│   (rendering engine)                         │
└─────────────────────────────────────────────┘
```

## Key Files

### 1. Coordinate Transformation
**File:** `common/js/lhs/lhs_transform.js`

Contains two functions:

```javascript
// Mathematical(X,Y,Z) -> Three.js(-Y,Z,-X)
export function transformToThreeJS(mathCoords) {
    return new THREE.Vector3(-mathCoords.y, mathCoords.z, -mathCoords.x);
}

// Three.js(X,Y,Z) -> Mathematical(-Z,-X,Y)
export function transformFromThreeJS(threeCoords) {
    return {
        x: -threeCoords.z,
        y: -threeCoords.x,
        z: threeCoords.y
    };
}
```

**Mapping breakdown:**
| Mathematical | Three.js |
|--------------|----------|
| X (right)    | -Z       |
| Y (forward)  | -X       |
| Z (up)       | Y        |

### 2. Coordinate System Setup
**File:** `common/js/lhs/lhs_coordinate_system.js`

Two main exports:

- **`setupCoordinateSystem(scene, options)`** (line 17)
  Main entry point that sets up:
  - OrthographicCamera
  - OrbitControls
  - Axes, grid, tick marks, labels
  - Lighting (basic or phong profile)

- **`coordinateSystem(scene, options)`** (line 130)
  Creates the visual coordinate system:
  - X, Y, Z axes as 3D lines
  - Grid on XY plane
  - Tick marks and numeric labels
  - Axis labels (X, Y, Z)

### 3. LHS Primitives
Located in `common/js/lhs/`:

| File | Purpose |
|------|---------|
| `lhs_point.js` | Creates 3D point spheres |
| `lhs_line.js` | Creates 3D lines (thick cylinder or thin) |
| `lhs_vector.js` | Creates vectors with arrowheads |
| `lhs_plane.js` | Creates plane surfaces |
| `lhs_label.js` | Creates text labels |
| `lhs_angle_arc.js` | Creates angle arcs |
| `lhs_polygon.js` | Creates filled polygons |

Each primitive:
1. Accepts mathematical coordinates as plain `{x, y, z}` objects
2. Internally calls `transformToThreeJS()` to convert coordinates
3. Returns a Three.js object for scene management

### 4. Diagram Class
**File:** `common/js/diagram.js`

The public API that lessons use. Wraps all LHS primitives:

```javascript
const diagram = new Diagram(scene);

// All methods accept plain {x, y, z} objects - never Three.js objects
diagram.point3d({x: 1, y: 2, z: 3}, 'A', 'red');
diagram.vector({x: 0, y: 0, z: 0}, {x: 3, y: 4, z: 0}, 'v', 'blue');
diagram.line({x: 0, y: 0, z: 0}, {x: 5, y: 5, z: 5}, 'blue');
```

## How Lessons Use This

Lessons work entirely in mathematical coordinates:

```javascript
import { setupCoordinateSystem } from '../common/js/lhs/lhs_coordinate_system.js';
import { Diagram } from '../common/js/diagram.js';

export function render(scene) {
    // Set up the coordinate system (handles Three.js camera, lighting, etc.)
    setupCoordinateSystem(scene, {
        axesRange: 10,
        cameraPosition: { x: -15, y: 12, z: -15 }
    });

    const diagram = new Diagram(scene);

    // Work in pure mathematical coordinates
    const pointA = {x: 2, y: 3, z: 4};
    const pointB = {x: 5, y: 1, z: 2};

    diagram.point3d(pointA, 'A', 'red');
    diagram.point3d(pointB, 'B', 'blue');
    diagram.line(pointA, pointB, 'green');
}
```

The lesson author never needs to:
- Import Three.js directly
- Think about coordinate conversions
- Manage Three.js objects or materials

## Why This Architecture?

1. **Mathematical correctness**: Lessons use standard math notation where Z is up
2. **Abstraction**: Implementation details hidden from lesson authors
3. **Consistency**: All lessons use the same coordinate conventions
4. **Maintainability**: Coordinate logic centralized in one transform file
