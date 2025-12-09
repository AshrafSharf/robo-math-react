/**
 * PointCommand - Command for rendering a point
 *
 * Creates a point shape via diagram.point()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';

export class PointCommand extends BaseCommand {
  /**
   * Create a point command
   * @param {Object} graphContainer - The graph container (Grapher) to render on
   * @param {Object} position - Point position {x, y}
   * @param {Object} options - Additional options {radius}
   */
  constructor(graphContainer, position, options = {}) {
    super();
    this.graphContainer = graphContainer;
    this.position = position; // {x, y}
    this.radius = options.radius || 4;
  }

  /**
   * Create point shape via diagram
   * @returns {Promise}
   */
  async doInit() {
    const { diagram } = this.commandContext;

    this.commandResult = await diagram.point(
      this.graphContainer,
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

  /**
   * Replay animation on existing shape
   * @returns {Promise}
   */
  async playSingle() {
    if (!this.commandResult) return;

    // Reset shape to start state and replay animation
    this.commandResult.hide();
    const effect = new MathShapeEffect(this.commandResult);
    return effect.play();
  }
}
