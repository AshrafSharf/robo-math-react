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

export class ArcCommand extends BaseCommand {
  /**
   * Create an arc command (endpoint-based)
   * @param {Object} startPoint - Start position {x, y}
   * @param {Object} endPoint - End position {x, y}
   * @param {number} rx - Horizontal radius
   * @param {number} ry - Vertical radius (defaults to rx for circular arc)
   * @param {Object} options - Additional options {strokeWidth}
   */
  constructor(startPoint, endPoint, rx, ry = null, options = {}) {
    super();
    this.startPoint = startPoint; // {x, y}
    this.endPoint = endPoint;     // {x, y}
    this.rx = rx;
    this.ry = ry !== null ? ry : rx; // Default to circular arc
    this.strokeWidth = options.strokeWidth || null;
  }

  /**
   * Create arc command from center, radius, and angles
   * @param {Object} center - Center position {x, y}
   * @param {number} radius - Arc radius
   * @param {number} startAngle - Start angle in degrees
   * @param {number} endAngle - End angle in degrees
   * @param {Object} options - Additional options
   * @returns {ArcCommand}
   */
  static fromCenterAngle(center, radius, startAngle, endAngle, options = {}) {
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

    const cmd = new ArcCommand(startPoint, endPoint, radius, radius, options);
    cmd.center = center;
    cmd.startAngle = startAngle;
    cmd.endAngle = endAngle;
    return cmd;
  }

  /**
   * Create arc shape via diagram
   */
  doInit() {
    const { diagram, graphContainer } = this.commandContext;

    const options = {
      label: this.labelName
    };

    if (this.strokeWidth) {
      options.strokeWidth = this.strokeWidth;
    }

    this.shape = diagram.arc(
      graphContainer,
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
}
