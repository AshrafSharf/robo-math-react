# Plane Intersection 3D Lesson

## Overview
This lesson visualizes the intersection of two planes in 3D space, demonstrating fundamental concepts in linear algebra and 3D geometry. Students can interactively adjust plane equations to see how planes intersect to form lines, are parallel, or are identical.

## Key Features

### Visual Elements
1. **Two Interactive Planes**
   - Plane 1: Orange/tan colored (COLORS.SURFACE_ORANGE)
   - Plane 2: Blue colored (COLORS.SURFACE_BLUE)
   - Size: 10x10 units to emphasize infinite extension
   - Opacity: 0.4 for semi-transparency

2. **Normal Vectors**
   - Color-matched to their respective planes
   - Thin arrows (thickness: 0.025) with cylinders for visibility
   - Origin positioned ON the plane surface
   - Length: 1.0 units for proportional appearance

3. **Intersection Line**
   - Red color (COLORS.RED) for high visibility
   - Thick line (linewidth: 20) using cylinder implementation
   - Length: 24 units total (±12 from center point)

4. **Labels**
   - Plane equations (e.g., "x = 2", "2x + y - z = 3")
   - Normal vector labels ("n₁", "n₂")
   - All labels use black text (#000000) with white background
   - Font size: 24px for 3D visibility

### Interactive Controls
Each plane has four steppers for the equation ax + by + cz = d:
- **A, B, C**: Coefficients (-5 to 5, step 0.1)
- **D**: Constant term (-5 to 5, step 0.1)

### Calculations Display
- Cross product: n₁ × n₂ = resulting vector
- Line direction: Normalized direction vector
- Result: "Planes Intersect in a Line" / "Parallel Planes" / "Identical Planes"

## Implementation Details

### Coordinate System Handling
All functions use **user coordinates** (mathematical convention):
- X-axis: Points right
- Y-axis: Points up
- Z-axis: Points toward viewer

Transformations to Three.js coordinates are handled internally by utility functions.

### Key Functions

#### `createPlaneVisualizations()`
Creates both planes with their normal vectors and labels:
- Uses `createPlaneView()` for plane geometry
- Uses `createArrowView()` for normal vectors with proper thickness
- Positions planes using `positionPlaneByEquation()`
- Adds equation and normal vector labels

#### `getVisiblePointOnPlane(planeEq)`
Calculates a point on the plane for normal vector placement:
- Finds point on plane closest to origin when d ≤ 2.5
- Uses axis-aligned points for larger d values
- Ensures numerical stability by choosing appropriate coordinate

#### `updateVisualization()`
Handles dynamic updates when plane equations change:
- Removes all existing visual elements properly
- Recreates planes, normal vectors, and labels
- Recalculates intersection line
- Updates all text displays

#### `createIntersectionVisualization()`
Calculates and displays the intersection:
- Computes cross product of normal vectors
- Checks for parallel planes (cross product ≈ 0)
- Creates thick red line along intersection direction

## Design Decisions

### Visual Clarity
1. **Color Consistency**: Normal vectors match plane colors to prevent confusion
2. **Size Balance**: Larger planes (10x10) emphasize infinite extension while maintaining viewport visibility
3. **Thickness Hierarchy**: 
   - Intersection line: Thick (linewidth 20)
   - Normal vectors: Thin (thickness 0.025)
   - Planes: Semi-transparent (opacity 0.4)

### Educational Value
1. **Real-time Feedback**: Immediate visual updates as equations change
2. **Clear Labeling**: All elements labeled with mathematical notation
3. **Calculation Display**: Shows the mathematical operations (cross product)
4. **Special Cases**: Handles parallel and identical planes gracefully

### Technical Robustness
1. **Coordinate Transformations**: All positions properly transformed between coordinate systems
2. **Dynamic Positioning**: Normal vectors stay on plane surface even with large D values
3. **Proper Cleanup**: All elements removed before recreation to prevent memory leaks
4. **Numerical Stability**: Careful handling of edge cases and small values

## Usage

### For Students
1. Adjust plane equations using the steppers
2. Observe how normal vectors change with plane orientation
3. See how the intersection line moves and rotates
4. Explore special cases (parallel planes, identical planes)

### For Educators
- Demonstrate that two non-parallel planes always intersect in a line
- Show relationship between normal vectors and plane orientation
- Illustrate cross product application in finding line direction
- Explore parallel and perpendicular plane configurations

## Technical Requirements
- Three.js for 3D rendering
- Common 3D utilities from `common-3d.js`
- Unified color system from `colors.js` (no more COLORS_3D aliases)
- Unified size presets from `sizes.js` (no more SIZE_PRESETS_3D aliases)
- FlowControlPanel for interactive controls
- Proper coordinate system transformation handling

## Files
- `plane_intersection_3d.js` - Main implementation
- `plane_intersection_3d.html` - Entry point
- `plane_intersection_3d_config.json` - Configuration and initial values