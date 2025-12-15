/**
 * PointCommand - Command for rendering a point
 *
 * Creates a point shape via diagram.point()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class PointCommand extends BaseCommand {
  /**
   * Create a point command
   * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
   * @param {Object} position - Point position {x, y}
   * @param {Object} options - Additional options {radius, fill}
   */
  constructor(graphExpression, position, options = {}) {
    super();
    this.graphExpression = graphExpression; // Resolved at init time
    this.graphContainer = null; // Set at init time
    this.position = position; // {x, y}
    this.radius = options.radius || 4;
    this.fill = options.fill !== undefined ? options.fill : true; // Points are filled by default
  }

  /**
   * Create point shape via diagram
   * @returns {Promise}
   */
  async doInit() {
    // Resolve grapher from expression at init time (after g2d command has run)
    if (!this.graphExpression) {
      const err = new Error(common_error_messages.GRAPH_REQUIRED('point'));
      err.expressionId = this.expressionId;
      throw err;
    }

    if (typeof this.graphExpression.getGrapher !== 'function') {
      const varName = this.graphExpression.variableName || 'first argument';
      const err = new Error(common_error_messages.INVALID_GRAPH_TYPE(varName));
      err.expressionId = this.expressionId;
      throw err;
    }

    this.graphContainer = this.graphExpression.getGrapher();
    if (!this.graphContainer) {
      const varName = this.graphExpression.variableName || 'graph';
      const err = new Error(common_error_messages.GRAPH_NOT_INITIALIZED(varName));
      err.expressionId = this.expressionId;
      throw err;
    }

    this.commandResult = this.diagram2d.point(
      this.graphContainer,
      this.position,
      this.color,
      {
        radius: this.radius,
        label: this.labelName,
        fill: this.fill
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
