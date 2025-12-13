/**
 * CommandContext - Shared state for command execution
 *
 * Contains:
 *   - shapeRegistry: variableName -> rendered shape lookup
 *   - layoutMapper: logical to pixel coordinate mapper
 *   - canvasSection: DOM element for rendering
 */
export class CommandContext {
  constructor(layoutMapper = null, canvasSection = null) {
    // Shape registry: variableName -> rendered shape (commandResult)
    // Used by commands like RotateCommand to look up previously created shapes
    this.shapeRegistry = {};

    // Layout dependencies for 3D graph creation
    this.layoutMapper = layoutMapper;
    this.canvasSection = canvasSection;
  }
}
