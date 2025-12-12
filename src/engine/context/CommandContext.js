/**
 * CommandContext - Shared state for command execution
 *
 * Contains:
 *   - shapeRegistry: variableName -> rendered shape lookup
 */
export class CommandContext {
  constructor() {
    // Shape registry: variableName -> rendered shape (commandResult)
    // Used by commands like RotateCommand to look up previously created shapes
    this.shapeRegistry = {};
  }
}
