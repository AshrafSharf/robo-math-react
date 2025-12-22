# Plane Creation & Animation Methods - Complete Analysis

Based on thorough analysis of all lesson folders and common APIs in the 3D Vector Generator codebase.

---

## 1. Diagram Class (High-Level API) - 2 methods

| Method | File | Description |
|--------|------|-------------|
| `planeByPointAndNormal(point, normal, label, color, options)` | `src/common/js/diagram.js:196` | Creates plane from a point and normal vector |
| `planeByThreePoints(p1, p2, p3, label, color, options)` | `src/common/js/diagram.js:226` | Creates plane through 3 points (delegates to planeByPointAndNormal) |

**Usage Example:**
```javascript
diagram.planeByPointAndNormal(
    {x: 0, y: 0, z: 5},      // point on plane
    {x: 1, y: -1, z: 1},     // normal vector
    'P',                      // label
    'cyan',                   // color
    { size: 12, opacity: 0.3 }
);
```

---

## 2. AnimatedDiagram Class (Animated High-Level API) - 2 methods

| Method | File | Description |
|--------|------|-------------|
| `planeByPointAndNormal(point, normal, label, color, options)` | `src/common/js/animated_diagram.js:344` | Animated plane with parametric sweep |
| `planeByThreePoints(p1, p2, p3, label, color, options)` | `src/common/js/animated_diagram.js:383` | Animated plane through 3 points |

**Additional Options for Animation:**
- `sweepDirection`: `'horizontal'` | `'vertical'` | `'diagonal'` | `'radial'`
- `animationDuration`: Duration in seconds

---

## 3. Low-Level lhs_plane.js Functions - 3 methods

| Method | File | Description |
|--------|------|-------------|
| `plane(center, normal, options)` | `src/common/js/lhs/lhs_plane.js:16` | Base plane creation from center and normal |
| `planeFromEquation(a, b, c, d, options)` | `src/common/js/lhs/lhs_plane.js:76` | Plane from equation coefficients `ax + by + cz + d = 0` |
| `planeFromThreePoints(p1, p2, p3, options)` | `src/common/js/lhs/lhs_plane.js:139` | Plane from 3 points (centers at centroid) |

**Note:** These are internal functions. Lessons should use Diagram class methods instead.

---

## 4. Tangent Plane Functions - 3 methods

| Method | File | Description |
|--------|------|-------------|
| `tangentPlane(point, partials, options)` | `src/common/js/lhs/lhs_tangent_plane.js:23` | Tangent plane from point and partial derivatives `{dfdx, dfdy}` |
| `tangentPlaneFromFunction(surfaceFunction, point, options)` | `src/common/js/lhs/lhs_tangent_plane.js:164` | Tangent plane with numerical derivative calculation |
| `tangentPlaneAnalytical(point, partialX, partialY, options)` | `src/common/js/lhs/lhs_tangent_plane.js:190` | Tangent plane with analytical partial derivative functions |

**Usage Example:**
```javascript
// From a surface function z = f(x, y)
tangentPlaneFromFunction(
    (x, y) => x*x + y*y,  // surface function
    {x: 1, y: 1},         // point (z calculated automatically)
    { size: 2, color: 0xffaa44 }
);
```

---

## 5. Plane Animator Functions - 5 animation methods

| Method | File | Description |
|--------|------|-------------|
| `animatePlaneParametricSweep(planeMesh, options)` | `src/common/js/animator/lhs_plane_animator.js:16` | Sweep animation with 4 directions |
| `animatePlaneScale(planeMesh, options)` | `src/common/js/animator/lhs_plane_animator.js:154` | Scale animation from 0 to full size |
| `animatePlaneRotation(planeMesh, options)` | `src/common/js/animator/lhs_plane_animator.js:210` | Rotation animation around axis |
| `animatePlaneMaterial(planeMesh, options)` | `src/common/js/animator/lhs_plane_animator.js:255` | Opacity and color animation |
| `fadeInPlane(planeMesh, options)` | `src/common/js/animator/lhs_plane_animator.js:305` | Simple opacity fade-in |

**Sweep Directions:**
- `'horizontal'` - Sweeps left to right
- `'vertical'` - Sweeps bottom to top
- `'diagonal'` - Sweeps diagonally from corner
- `'radial'` - Grows from center outward

---

## 6. Planar Shape Methods (Related) - 2 methods

| Method | File | Description |
|--------|------|-------------|
| `polygon(vertices, label, color, options)` | `src/common/js/diagram.js:242` | Arbitrary polygon from vertices (creates planar surface) |
| `parallelogram(origin, v1End, v2End, label, color, options)` | `src/common/js/diagram.js:278` | Parallelogram from two coterminal vectors |

**Usage Example:**
```javascript
// Create a triangle
diagram.polygon([
    {x: 0, y: 0, z: 0},
    {x: 3, y: 0, z: 0},
    {x: 1.5, y: 2, z: 0}
], '', 'blue', { opacity: 0.5 });

// Create a parallelogram
diagram.parallelogram(
    {x: 0, y: 0, z: 0},  // origin
    {x: 3, y: 0, z: 0},  // end of first vector
    {x: 1, y: 2, z: 0},  // end of second vector
    '', 'green', { opacity: 0.5 }
);
```

---

## Summary Table

| Category | Count | Methods |
|----------|-------|---------|
| **Diagram (High-Level)** | 2 | planeByPointAndNormal, planeByThreePoints |
| **AnimatedDiagram** | 2 | planeByPointAndNormal, planeByThreePoints (animated) |
| **Low-Level (lhs_plane.js)** | 3 | plane, planeFromEquation, planeFromThreePoints |
| **Tangent Planes** | 3 | tangentPlane, tangentPlaneFromFunction, tangentPlaneAnalytical |
| **Animators** | 5 | parametricSweep, scale, rotation, material, fadeIn |
| **Planar Shapes** | 2 | polygon, parallelogram |

---

## Total: 17 Distinct Plane-Related Methods

- **7 plane creation methods** (excluding animators)
- **5 animation methods**
- **2 planar shape creation methods** (polygon, parallelogram)
- **+ 4 sweep direction variants** for parametric sweep animation

---

## Common Options for All Plane Methods

```javascript
{
    size: 12,           // Plane square dimensions (default: 12)
    opacity: 0.5,       // Transparency 0-1 (default: 0.5)
    color: 0x00ffff,    // Color as hex or string
    doubleSided: true,  // Visible from both sides
    wireframe: false    // Show as wireframe
}
```

## Lessons Using Planes

Found in these lesson folders:
- `distance-point-plane`
- `image-point-plane`
- `distance-two-parallel-planes`
- `plane_intersection_3d`
- `angle-between-line-plane`
- `plane-normal-distance-from-origin`
- `lines-co-planarity`
- `plane-equation-intersection`
- `condition-line-on-plane`
- `meeting-point-line-plane`
- `angle-between-planes`
- `intercept-form-plane-equation`
- `plane-between-three-points`
