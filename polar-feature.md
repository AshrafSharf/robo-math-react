# Polar Coordinates Feature (p2d) - Implementation Plan

## Phase 1 Complete - G2D Scale Types

## Phase 2 Complete - Polar Coordinates (p2d)

### Completed Changes:

1. **expressionOptionsSchema.js** - Added new g2d options:
   - `xScaleType`, `xLogBase`, `xPiMultiplier`
   - `yScaleType`, `yLogBase`, `yPiMultiplier`
   - Plus p2d schema for polar coordinates

2. **G2DOptionsPanel.jsx** - Redesigned with compact X-Axis and Y-Axis sections:
   - Scale type dropdown (linear/log/pi)
   - Log Base dropdown (10/e/2) - disabled unless log scale
   - Pi Interval dropdown (2π/π/π/2/π/4) - disabled unless pi scale

3. **graph-scales.js** - Updated scale builders:
   - `XLogScale`/`YLogScale` now accept base parameter
   - Added `getXScaleBuilder`/`getYScaleBuilder` helper functions

4. **cartesian-grid.js** - New tick generation and formatting:
   - `generatePiTicks()` - Generate ticks at π multiples
   - `generateLogTicks()` - Generate ticks at powers of base
   - `calculateLinearStep()` - Smart step calculation
   - `toSuperscript()` - Convert numbers to superscript (10², e³)
   - Pi labels: π, 2π, π/2, -3π/4, etc.
   - Log labels: 10², e³, 2⁴, etc.

5. **Create2DGraphCommand.js** - Added scale type options:
   - `xScaleType`, `yScaleType`
   - `xLogBase`, `yLogBase`
   - `xPiMultiplier`, `yPiMultiplier`

6. **ExpressionPipelineService.js** - Updated for new options:
   - Added `p2d` to EXPRESSION_TYPE_MAP
   - Pass new scale options to command creation

---

## Phase 2 Implementation - Polar Coordinates (p2d)

### Files Created:

#### 1. `src/geom/graphing/polar-grid.js`
Renders polar coordinate grid with:
- Concentric circles for r values
- Radial lines for θ values
- Angle labels (0, π/6, π/3, π/2, etc.)

```javascript
class PolarGrid extends BaseGrid {
  constructor(svgGroup, width, height, options) {
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.maxRadius = Math.min(width, height) / 2;
  }

  toViewX(r, theta) {
    return this.centerX + this.rScale(r) * Math.cos(theta);
  }

  toViewY(r, theta) {
    return this.centerY - this.rScale(r) * Math.sin(theta);
  }

  renderGrid() {
    // Concentric circles
    // Radial lines
  }
}
```

#### 2. `src/geom/graphing/graphsheet-polar.js`
Wrapper for polar grid, similar to Graphsheet2d but for polar coordinates.

#### 3. `src/engine/expression-parser/expressions/Polar2DExpression.js`
```javascript
// Syntax: p2d(row1, col1, row2, col2, [rMax, thetaMin, thetaMax, showGrid])
// Default: rMax=10, thetaMin=0, thetaMax=2π

class Polar2DExpression extends AbstractNonArithmeticExpression {
  static NAME = 'p2d';

  resolve(context) {
    // Extract bounds and optional parameters
  }

  toCommand(options) {
    return new CreatePolar2DGraphCommand(...);
  }
}
```

#### 4. `src/engine/commands/CreatePolar2DGraphCommand.js`
Similar to Create2DGraphCommand but creates polar grid.

#### 5. `src/components/CommandEditor/components/SettingsPanel/panels/P2DOptionsPanel.jsx`
Options panel for polar graph settings:
- Show Grid checkbox
- Max Radius input
- Radial Lines count
- Concentric Circles count
- Show Angle Labels checkbox

### Files Updated:

#### 1. `src/engine/expression-parser/core/IntrepreterFunctionTable.js`
- Imported `Polar2DExpression`
- Added `registerMultiArg('p2d', Polar2DExpression)`

#### 2. `src/components/CommandEditor/utils/expressionTypeDetector.js`
- Added 'p2d' to typeMap and displayNames

#### 3. `src/components/CommandEditor/components/SettingsPanel/tabs/ExpressionOptionsTab.jsx`
- Imported `P2DOptionsPanel`
- Added to `PANEL_MAP`

#### 4. `src/diagram/base-diagram-2d.js`
- Imported `PolarGrapher`
- Added `polarGraphContainer()` method

#### 5. `src/components/CommandEditor/CommandEditor.css`
- Added `.polar-settings-row` styles

---

## P2D Options Schema (already added)

```javascript
p2d: {
  showGrid: { type: 'checkbox', default: true, label: 'Show Grid' },
  rMax: { type: 'number', min: 1, max: 100, default: 10, label: 'Max Radius' },
  radialLines: { type: 'number', min: 4, max: 24, default: 12, label: 'Radial Lines' },
  concentricCircles: { type: 'number', min: 2, max: 20, default: 5, label: 'Circles' },
  angleLabels: { type: 'checkbox', default: true, label: 'Show Angle Labels' },
}
```

---

## Model to View Conversion (Polar)

- **Input:** (r, θ) polar coordinates
- **Output:** (x, y) Cartesian for SVG rendering
- **Formulas:**
  - x = centerX + r * cos(θ)
  - y = centerY - r * sin(θ)  *(inverted for SVG)*

---

## Default Values

- **Angle range:** 0 to 2π (per user preference)
- **Max radius:** 10
- **Radial lines:** 12 (every 30° or π/6)
- **Concentric circles:** 5
