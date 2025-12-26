# Modularized 3D Common Utilities

This directory contains the modularized version of the 3D utilities previously in `common-3d.js`. The code has been split into logical modules for better organization and maintainability.

## Module Structure

### Core Modules

- **`core-3d.js`** - Core constants, coordinate transformations
  - `transformToThreeJS()` / `transformFromThreeJS()` - Coordinate system conversions
  - Note: COLORS and SIZES are now unified and imported from parent directory

- **`basic-geometry-3d.js`** - Basic geometric primitives and coordinate axes
  - `createAxesView()` - Creates 3D coordinate axes with labels and grid
  - `createNormalVectorThroughPlaneEquation()` - Creates normal vectors from plane equations

### Visualization Modules

- **`primitives-3d.js`** - Basic 3D primitive creation
  - `createArrowView()` - Creates arrow helpers with proper thickness
  - `createLineView()` - Creates lines with cylinder option for thick lines
  - `createPolylineView()` - Creates connected line segments
  - `createCurveView()` - Creates parametric curves as tubes
  - `createParametricCurve()` - Creates parametric curves as lines

- **`vectors-3d.js`** - Vector-specific visualizations
  - `createVectorView()` - Creates vectors with labels and optional controls
  - `createVectorWithLabel()` - Backward compatibility wrapper
  - `createPointView()` - Creates labeled points as spheres

- **`angles-3d.js`** - Angle visualization utilities
  - `createVectorAngleView()` - Angle between two vectors
  - `createVectorPlaneAngleView()` - Angle between vector and plane
  - `createPlaneAngleView()` - Angle between two planes
  - `createLineAngleView()` - Angle between two lines
  - `createVectorCoordinatePlaneAngleView()` - Vector to coordinate plane angles
  - `createVectorAxisAngleView()` - Vector to axis angles

- **`surfaces-3d.js`** - Surface creation and visualization
  - `createSurfaceView()` - Creates surfaces from z = f(x,y) functions
  - `createParametricSurfaceView()` - Creates parametric surfaces
  - `createTangentPlaneView()` - Creates tangent planes with partial derivatives
  - `createParametricSurface()` - Legacy parametric surface function

- **`shapes-2d-3d.js`** - 2D shapes and cross-sections in 3D space
  - `createPolygonView()` - Creates 3D polygons with proper triangulation
  - `createCrossSectionShape()` - Creates generic 2D shapes as cross-sections
  - `createCircleOutline()` - Creates circle outlines in 3D
  - `createCurveOutline()` - Creates curve outlines from parametric functions

### Support Modules

- **`labels-3d.js`** - Text and label creation
  - `createLabel()` - Creates sprite-based labels (main function)
  - `createTextLabel()` - Creates 3D text geometry labels
  - `loadFont()` - Loads fonts for 3D text
  - Label creation with LaTeX support for mathematical notation

- **`interactive-3d.js`** - Interactive features and coordinate projections
  - `projectionSystem` - Global system for coordinate projections
  - `addInteractiveObject()` - Makes objects clickable with projections
  - `removeInteractiveObject()` - Removes interactive behavior
  - `clearInteractiveObjects()` - Clears all interactive objects

- **`control-panel-3d.js`** - Control panel utilities
  - `updateControlPanel()` - Updates panel with MathJax rendering
  - `createCoordinateDisplay()` - Creates dynamic coordinate displays
  - `createVectorControls()` - Creates interactive vector sliders
  - `updateVectorSliders()` - Updates slider values
  - `createInteractiveVector()` - Backward compatibility function

- **`colormaps-3d.js`** - Color mapping functions
  - `viridisColor()`, `plasmaColor()`, `coolwarmColor()` - Standard colormaps
  - `rainbowColor()`, `grayscaleColor()`, `redBlueColor()`, `heatColor()` - Additional colormaps
  - `getColormap()` - Gets colormap by name
  - `applyColormap()` - Applies colormap to normalized values

## Usage

### Import Everything
```javascript
import * as Common3D from '../common/js/3d/index.js';
// Or for backward compatibility:
import * as Common3D from '../common/js/common-3d.js';
```

### Import Specific Modules
```javascript
import { createAxesView, createVectorView } from '../common/js/3d/index.js';
import { COLORS, SIZES } from '../common/js/colors.js';  // Unified colors and sizes
```

### Import Individual Modules
```javascript
import { createSurfaceView } from '../common/js/3d/surfaces-3d.js';
import { createVectorAngleView } from '../common/js/3d/angles-3d.js';
```

## Migration Notes

1. **No Breaking Changes**: All existing code using `common-3d.js` will continue to work
2. **Better Tree Shaking**: Individual module imports reduce bundle size
3. **Clearer Organization**: Functions are grouped by purpose
4. **Easier Testing**: Each module can be tested independently

## Color Guidelines (Unified System)

All lessons now use the unified color system from `/src/common/js/colors.js`:
- **Points**: Use `COLORS.BLUE` as primary color
- **Lines/Vectors**: Use `COLORS.RED` as primary color  
- **Secondary elements**: Use `COLORS.YELLOW` for moving/highlighted points
- **Special points**: Use `COLORS.GREEN` for intersections
- **Surfaces**: Use `COLORS.SURFACE_BLUE`, `COLORS.SURFACE_ORANGE`, etc.
- **Labels**: Always use `COLORS.BLACK` (#000000) for all text labels
- **Never use black for lines** - poor contrast against dark backgrounds

Note: No more COLORS_3D alias - all lessons use the same COLORS object

## Coordinate System

The 3D system uses a custom coordinate mapping:
- **X-axis** (red): Points toward the screen (Three.js -Z)
- **Y-axis** (green): Points to the right (Three.js -X)
- **Z-axis** (blue): Points upward (Three.js +Y)

Use `transformToThreeJS()` and `transformFromThreeJS()` to convert between coordinate systems.