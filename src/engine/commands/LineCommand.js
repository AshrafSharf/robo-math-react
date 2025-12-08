/**
 * LineCommand - Command for rendering a line
 *
 * Creates a line shape via diagram.line()
 */
import { BaseCommand } from './BaseCommand.js';

export class LineCommand extends BaseCommand {
  /**
   * Create a line command
   * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
   * @param {Object} startPoint - Start position {x, y}
   * @param {Object} endPoint - End position {x, y}
   * @param {Object} options - Additional options {strokeWidth, fill}
   */
  constructor(graphExpression, startPoint, endPoint, options = {}) {
    super();
    this.graphExpression = graphExpression; // Resolved at init time
    this.graphContainer = null; // Set at init time
    this.startPoint = startPoint; // {x, y}
    this.endPoint = endPoint;     // {x, y}
    this.strokeWidth = options.strokeWidth || null;
    this.fill = options.fill || null;
  }

  /**
   * Create line shape via diagram
   */
  doInit() {
    const { diagram } = this.commandContext;

    // Resolve grapher from expression at init time (after g2d command has run)
    if (!this.graphExpression) {
      const err = new Error('Line requires a graph container as first argument. Use: line(g, x1, y1, x2, y2)');
      err.expressionId = this.expressionId;
      throw err;
    }

    if (typeof this.graphExpression.getGrapher !== 'function') {
      const err = new Error('First argument must be a graph variable (from g2d)');
      err.expressionId = this.expressionId;
      throw err;
    }

    this.graphContainer = this.graphExpression.getGrapher();
    if (!this.graphContainer) {
      const err = new Error('Graph container not initialized. Ensure g2d() is called before line()');
      err.expressionId = this.expressionId;
      throw err;
    }

    const options = {
      label: this.labelName
    };

    if (this.strokeWidth) {
      options.strokeWidth = this.strokeWidth;
    }
    if (this.fill) {
      options.fill = this.fill;
    }

    this.commandResult = diagram.line(
      this.graphContainer,
      this.startPoint,
      this.endPoint,
      this.color,
      options
    );
  }

  /**
   * Get label position at midpoint of line
   * @returns {{x: number, y: number}}
   */
  getLabelPosition() {
    return {
      x: (this.startPoint.x + this.endPoint.x) / 2,
      y: (this.startPoint.y + this.endPoint.y) / 2
    };
  }

  /**
   * Get start point
   * @returns {{x: number, y: number}}
   */
  getStartPoint() {
    return this.startPoint;
  }

  /**
   * Get end point
   * @returns {{x: number, y: number}}
   */
  getEndPoint() {
    return this.endPoint;
  }

  /**
   * Get line length
   * @returns {number}
   */
  getLength() {
    const dx = this.endPoint.x - this.startPoint.x;
    const dy = this.endPoint.y - this.startPoint.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
