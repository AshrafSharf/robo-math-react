/**
 * LineCommand - Command for rendering a line
 *
 * Creates a line shape via diagram.line()
 */
import { BaseCommand } from './BaseCommand.js';

export class LineCommand extends BaseCommand {
  /**
   * Create a line command
   * @param {Object} startPoint - Start position {x, y}
   * @param {Object} endPoint - End position {x, y}
   * @param {Object} options - Additional options {strokeWidth, fill}
   */
  constructor(startPoint, endPoint, options = {}) {
    super();
    this.startPoint = startPoint; // {x, y}
    this.endPoint = endPoint;     // {x, y}
    this.strokeWidth = options.strokeWidth || null;
    this.fill = options.fill || null;
  }

  /**
   * Create line shape via diagram
   */
  doInit() {
    const { diagram, graphContainer } = this.commandContext;

    const options = {
      label: this.labelName
    };

    if (this.strokeWidth) {
      options.strokeWidth = this.strokeWidth;
    }
    if (this.fill) {
      options.fill = this.fill;
    }

    this.shape = diagram.line(
      graphContainer,
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
