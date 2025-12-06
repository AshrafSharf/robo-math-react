/**
 * PointCommand - Command for rendering a point
 *
 * Creates a point shape via diagram.point()
 */
import { BaseCommand } from './BaseCommand.js';

export class PointCommand extends BaseCommand {
  /**
   * Create a point command
   * @param {Object} position - Point position {x, y}
   * @param {Object} options - Additional options {radius}
   */
  constructor(position, options = {}) {
    super();
    this.position = position; // {x, y}
    this.radius = options.radius || 4;
  }

  /**
   * Create point shape via diagram
   */
  doInit() {
    const { diagram, graphContainer } = this.commandContext;

    this.shape = diagram.point(
      graphContainer,
      this.position,
      this.color,
      {
        radius: this.radius,
        label: this.labelName
      }
    );
  }

  /**
   * Get label position at point location
   * @returns {{x: number, y: number}}
   */
  getLabelPosition() {
    return {
      x: this.position.x,
      y: this.position.y
    };
  }

  /**
   * Get the point position
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    return this.position;
  }
}
