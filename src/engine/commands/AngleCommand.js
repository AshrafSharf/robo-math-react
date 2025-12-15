/**
 * AngleCommand - Command for rendering an angle
 *
 * Creates an angle shape via diagram.angle()
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class AngleCommand extends BaseCommand {
  /**
   * Create an angle command
   * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
   * @param {Object} vertex - Vertex point {x, y}
   * @param {Object} point1 - First ray endpoint {x, y}
   * @param {Object} point2 - Second ray endpoint {x, y}
   * @param {string} angleType - Type of angle ('interior', 'exterior-first', 'exterior-second', 'reflex', 'right', 'opposite')
   * @param {Object} options - Additional options {radius, strokeWidth, fill, fillOpacity, showArc}
   */
  constructor(graphExpression, vertex, point1, point2, angleType, options = {}) {
    super();
    this.graphExpression = graphExpression;
    this.graphContainer = null;
    this.vertex = vertex;
    this.point1 = point1;
    this.point2 = point2;
    this.angleType = angleType;
    this.radius = options.radius || 0.8;
    this.strokeWidth = options.strokeWidth || null;
    this.fill = options.fill || null;
    this.fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : null;
    this.showArc = options.showArc !== undefined ? options.showArc : true;
  }

  /**
   * Create angle shape via diagram
   * @returns {Promise}
   */
  async doInit() {
    // Resolve grapher from expression at init time
    if (!this.graphExpression) {
      const err = new Error(common_error_messages.GRAPH_REQUIRED('angle'));
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

    const options = {
      radius: this.radius,
      label: this.labelName
    };

    if (this.strokeWidth) {
      options.strokeWidth = this.strokeWidth;
    }
    if (this.fill) {
      options.fill = this.fill;
    }
    if (this.fillOpacity !== null) {
      options.fillOpacity = this.fillOpacity;
    }
    if (this.showArc !== undefined) {
      options.showArc = this.showArc;
    }

    this.commandResult = this.diagram2d.angle(
      this.graphContainer,
      this.vertex,
      this.point1,
      this.point2,
      this.angleType,
      options
    );
  }

  /**
   * Get label position at angle center
   * @returns {{x: number, y: number}}
   */
  getLabelPosition() {
    // Return vertex as label position (angle center is computed by the shape)
    return this.vertex;
  }

  /**
   * Get vertex point
   * @returns {{x: number, y: number}}
   */
  getVertex() {
    return this.vertex;
  }

  /**
   * Get first ray endpoint
   * @returns {{x: number, y: number}}
   */
  getPoint1() {
    return this.point1;
  }

  /**
   * Get second ray endpoint
   * @returns {{x: number, y: number}}
   */
  getPoint2() {
    return this.point2;
  }

  /**
   * Get angle type
   * @returns {string}
   */
  getAngleType() {
    return this.angleType;
  }

  /**
   * Replay animation on existing shape
   * @returns {Promise}
   */
  async playSingle() {
    if (!this.commandResult) return;

    this.commandResult.hide();
    const effect = new MathShapeEffect(this.commandResult);
    return effect.play();
  }
}
