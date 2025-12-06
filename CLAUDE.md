# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Robo Math is a browser-based math visualization application built with React 19 and Vite. It renders animated mathematical equations and graphs using SVG, with pen-tracing animations for educational presentations.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:3333
npm run build        # Production build
npm run preview      # Preview production build
npm run test:expressions  # Run expression parser tests
```

## Architecture

### Core System Flow

```
App.jsx → RoboCanvas → Diagram/AnimatedDiagram → Grapher/MathTextComponent
```

**RoboCanvas** (`src/RoboCanvas.js`): Main canvas controller with Jupyter-notebook style layout. Creates an infinite vertical scroll area with logical coordinate system (8 columns × 200 rows). Supports both static and animated modes via `useStaticDiagram()` / `useAnimatedDiagram()`.

**Diagram** (`src/diagram/diagram.js`): Base class providing static rendering API for shapes (point, line, circle, vector, polygon, angle, etc.) and math text. All methods take a graphContainer as first parameter.

**AnimatedDiagram** (`src/diagram/animated-diagram.js`): Extends Diagram with animation support. Shapes are animated via effect classes when created. Supports generator-based step navigation (`next()`, `previous()`, `goTo(step)`).

### Key Components

**Grapher** (`src/blocks/grapher.js`): SVG-based graph container. Creates coordinate grids, handles shape rendering, transforms between model and view coordinates via `Graphsheet2d`. Each graph container is independent and positioned using logical coordinates.

**MathTextComponent** (`src/mathtext/components/math-text-component.js`): Renders LaTeX as SVG paths using MathJax. Supports pen-tracing animations via `WriteEffect`. Uses `\bbox[0px]{...}` LaTeX syntax to mark sections for selective animation (`writeOnlyBBox`, `writeWithoutBBox`).

### Animation System

Effects are in `src/effects/` and follow this pattern:
- `BaseEffect` - Abstract base class
- Shape effects: `MathShapeEffect`, `TexToSVGShapeEffect` - Draw SVG paths progressively
- Write effects: `WriteEffect` - Pen animation for math text
- Transform effects: `ZoomEffect`, `PanEffect`, `MoveVectorEffect`, `ReverseVectorEffect`

Animation speed is controlled globally via `AnimationSpeedManager`.

### Expression Parser & Command System

Located at `src/engine/`. Core flow:

```
String → Parser → AST → evalExpression() → Expression → resolve(context) → toCommand() → Command
```

**Expression Lifecycle:**
1. `parse(string)` → AST (abstract syntax tree)
2. `interpreter.evalExpression(ast)` → Expression object (PointExpression, LineExpression, etc.)
3. `expression.resolve(context)` → Resolves variables, computes values
4. `expression.toCommand()` → Creates Command for rendering

**Context is Bidirectional:**
```
A = point(3, 4)     →  AssignmentExpression.resolve() writes to context
line(A, point(6,8)) →  VariableReferenceExpression.resolve() reads from context
```
Order matters - expressions must resolve sequentially for dependencies.

**Command Lifecycle:**
1. `command.init(commandContext)` → Creates shapes via Diagram
2. `command.play()` → Plays effect (Diagram handles animation mode)
3. `command.directPlay()` → Instant render, no animation

**Key Files:**
- `src/engine/expression-parser/core/ExpressionInterpreter.js` - Evaluates AST to Expression
- `src/engine/expression-parser/core/ExpressionContext.js` - Variable storage
- `src/engine/commands/BaseCommand.js` - Abstract command base
- `src/engine/context/CommandExecutor.js` - Orchestrates playback

**Parser Note:** `compass-parser.js` is generated from PEG.js grammar - do NOT edit directly

**expTable Keys:** The keys in `ExpressionInterpreter.expTable` match AST node names from the parser, not literal operator characters. For example, `a = 5` produces `{ name: 'assignment', ... }`, so the key is `'assignment'`. Arithmetic operators (`+`, `-`, `*`, `/`, `^`) are exceptions where the parser outputs literal symbols as node names.

### Geometry Utilities

- `src/geom/`: Point, Vector2, Bounds2, GeomUtil classes
- `src/geom/graphing/`: Graphsheet2d, CartesianGrid, graph scales
- `src/path-generators/`: SVG path generation for various shapes (arc, circle, curve, polygon, etc.)

### Script Shapes

`src/script-shapes/` contains shape primitives that:
1. Store model coordinates
2. Generate SVG paths via path generators
3. Handle view coordinate transformation
4. Support stroke/fill styling and animations

## Coordinate Systems

- **Logical coordinates**: Grid-based positioning (col, row) for layout
- **Model coordinates**: Mathematical coordinates (x, y) within a graph
- **View coordinates**: Pixel coordinates in SVG

`LogicalCoordinateMapper` converts logical → pixel coordinates for component placement.
`Graphsheet2d` converts model ↔ view coordinates within graphs.

## Plugin Initialization

`main.jsx` initializes plugins (MathJax, GSAP) before React renders. The loading screen displays until initialization completes.

## Key Files

- `src/App.jsx`: Main React component, UI controls
- `src/RoboCanvas.js`: Canvas system with static/animated diagram switching
- `src/diagram/diagram.js`: Static rendering API
- `src/diagram/animated-diagram.js`: Animated rendering with effects
- `src/blocks/grapher.js`: SVG graph container
- `src/mathtext/components/math-text-component.js`: LaTeX rendering
