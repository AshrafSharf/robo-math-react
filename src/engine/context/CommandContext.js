/**
 * CommandContext - Execution context for commands
 *
 * Contains all dependencies needed for command execution:
 *   - diagram: Diagram or AnimatedDiagram instance for shape creation
 *   - graphContainer: Grapher instance for the current graph
 *   - expressionContext: ExpressionContext for variable resolution
 *
 * Commands receive this context during init() and use it to create shapes.
 * The diagram handles animation mode internally.
 */
export class CommandContext {
  /**
   * Create a command context
   *
   * @param {Diagram|AnimatedDiagram} diagram - Diagram for shape creation
   * @param {Grapher} graphContainer - Graph container for shape placement
   * @param {ExpressionContext} expressionContext - Context for variable resolution
   */
  constructor(diagram, graphContainer, expressionContext = null) {
    this.diagram = diagram;
    this.graphContainer = graphContainer;
    this.expressionContext = expressionContext;

    // Optional: track created shapes for cleanup
    this.shapes = [];
  }

  /**
   * Register a shape created by a command
   * @param {Shape} shape
   */
  registerShape(shape) {
    if (shape) {
      this.shapes.push(shape);
    }
  }

  /**
   * Clear all registered shapes
   */
  clearShapes() {
    this.shapes = [];
  }

  /**
   * Get all registered shapes
   * @returns {Shape[]}
   */
  getShapes() {
    return this.shapes;
  }

  /**
   * Check if diagram is in animated mode
   * @returns {boolean}
   */
  isAnimated() {
    return this.diagram && this.diagram.animateMode === true;
  }

  /**
   * Get a variable from expression context
   * @param {string} name - Variable name
   * @returns {*} Variable value or undefined
   */
  getVariable(name) {
    if (this.expressionContext) {
      return this.expressionContext.getReference(name);
    }
    return undefined;
  }

  /**
   * Set a variable in expression context
   * @param {string} name - Variable name
   * @param {*} value - Variable value
   */
  setVariable(name, value) {
    if (this.expressionContext) {
      this.expressionContext.addReference(name, value);
    }
  }
}
