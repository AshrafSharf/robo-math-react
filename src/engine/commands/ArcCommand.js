/**
 * ArcCommand - Command for rendering an arc
 *
 * Creates an arc shape via diagram.arc()
 *
 * Arc is defined by:
 *   - start point and end point
 *   - rx and ry (horizontal and vertical radii)
 *
 * Alternative: can be defined by center point, radius, and angles
 */
import { BaseCommand } from './BaseCommand.js';
import { MathShapeEffect } from '../../effects/shape-effects/math-shape-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class ArcCommand extends BaseCommand {
  /**
   * Create an arc command (endpoint-based)
   * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
   * @param {Object} startPoint - Start position {x, y}
   * @param {Object} endPoint - End position {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius (defaults to rx for circular arc)
   * @param {Object} options - Additional options {strokeWidth}
   */
  constructor(graphExpression, startPoint, endPoint, rx, ry = null, options = {}) {
    super();
    this.graphExpression = graphExpression; // Resolved at init time
    this.graphContainer = null; // Set at init time
    this.startPoint = startPoint; // {x, y}
    this.endPoint = endPoint;     // {x, y}
    this.rx = rx;
    this.ry = ry !== null ? ry : rx; // Default to circular arc
    this.strokeWidth = options.strokeWidth ?? 2;
  }

  /**
   * Create arc command from center, radius, and angles
   * @param {Object} graphExpression - The graph expression
   * @param {Object} center - Center position {x, y}
   * @param {number} radius - Arc radius
   * @param {number} startAngle - Start angle in degrees
   * @param {number} endAngle - End angle in degrees
   * @param {Object} options - Additional options
   * @returns {ArcCommand}
   */
  static fromCenterAngle(graphExpression, center, radius, startAngle, endAngle, options = {}) {
    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate start and end points
    const startPoint = {
      x: center.x + radius * Math.cos(startRad),
      y: center.y + radius * Math.sin(startRad)
    };
    const endPoint = {
      x: center.x + radius * Math.cos(endRad),
      y: center.y + radius * Math.sin(endRad)
    };

    const cmd = new ArcCommand(graphExpression, startPoint, endPoint, radius, radius, options);
    cmd.center = center;
    cmd.startAngle = startAngle;
    cmd.endAngle = endAngle;
    return cmd;
  }

  /**
   * Create arc shape via diagram
   * @returns {Promise}
   */
  async doInit() {
    // Resolve grapher from expression at init time (after g2d command has run)
    if (!this.graphExpression) {
      const err = new Error(common_error_messages.GRAPH_REQUIRED('arc'));
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
      label: this.labelName
    };

    options.strokeWidth = this.strokeWidth;

    this.commandResult = this.diagram2d.arc(
      this.graphContainer,
      this.startPoint,
      this.endPoint,
      this.rx,
      this.ry,
      this.color,
      options
    );
  }

  /**
   * Get label position at midpoint of arc
   * @returns {{x: number, y: number}}
   */
  getLabelPosition() {
    // Simple midpoint approximation
    // For more accurate positioning, would need to calculate arc midpoint
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
   * Get horizontal radius
   * @returns {number}
   */
  getRx() {
    return this.rx;
  }

  /**
   * Get vertical radius
   * @returns {number}
   */
  getRy() {
    return this.ry;
  }

  /**
   * Check if arc is circular (rx === ry)
   * @returns {boolean}
   */
  isCircular() {
    return this.rx === this.ry;
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
