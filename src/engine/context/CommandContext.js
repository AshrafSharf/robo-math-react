/**
 * CommandContext - Shared state for command execution
 *
 * Contains:
 *   - shapeRegistry: variableName -> rendered shape lookup
 *   - layoutMapper: logical to pixel coordinate mapper
 *   - canvasSection: DOM element for rendering
 *   - pen: global PenTracer instance
 */
export class CommandContext {
  constructor(layoutMapper = null, canvasSection = null, pen = null) {
    // Shape registry: variableName -> rendered shape (commandResult)
    // Used by commands like RotateCommand to look up previously created shapes
    this.shapeRegistry = {};

    // Command registry: variableName -> command instance
    // Used by ParallelCommand to look up commands for parallel playback
    this.commandRegistry = {};

    // Layout dependencies for 3D graph creation
    this.layoutMapper = layoutMapper;
    this.canvasSection = canvasSection;

    // Global pen tracer for animations
    this.pen = pen;

    // Annotation layer SVG for drawing overlays (e.g., surround rectangles)
    this.annotationLayer = null;
  }
}
