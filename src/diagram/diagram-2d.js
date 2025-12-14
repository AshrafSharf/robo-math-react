/**
 * Diagram2d - Single diagram class for creating shapes
 *
 * Shapes are created and shown immediately.
 * Commands handle animation via effects when needed.
 */

import { BaseDiagram2d } from './base-diagram-2d.js';
import { WriteEffect } from '../mathtext/effects/write-effect.js';
import { MathTextRectEffect } from '../effects/math-text-rect-effect.js';
import { DEFAULT_SHAPE_COLORS } from './style_helper.js';

export class Diagram2d extends BaseDiagram2d {
  constructor(coordinateMapper, canvasSection, roboCanvas, options = {}) {
    super(coordinateMapper, canvasSection, roboCanvas, options);
  }

  // ============= SHAPE CREATION METHODS =============

  /**
   * Create a point
   */
  point(graphContainer, position, color = 'red', options = {}) {
    const shape = this._createPoint(graphContainer, position, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a vector
   */
  vector(graphContainer, start, end, color = 'red', options = {}) {
    const shape = this._createVector(graphContainer, start, end, color, options);
    shape.primitiveShape.attr('fill', null);
    shape.start = { x: start.x, y: start.y };
    shape.end = { x: end.x, y: end.y };
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a dashed vector
   */
  dashedVector(graphContainer, start, end, color = 'red', options = {}) {
    const shape = this._createDashedVector(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a line segment
   */
  line(graphContainer, start, end, color = 'black', options = {}) {
    const shape = this._createLine(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a measurement indicator
   */
  measurementIndicator(graphContainer, start, end, color = 'black', options = {}) {
    const shape = this._createMeasurementIndicator(graphContainer, start, end, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a function plot from a callback function
   */
  plotFunction(graphContainer, func, domainMin, domainMax, color = 'green', options = {}) {
    const shape = this._createPlotFunction(graphContainer, func, domainMin, domainMax, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a plot from expression string with variable scope
   * @param {Object} graphContainer - The graph container
   * @param {string} expression - Math expression like "a*x^2 + b"
   * @param {number} domainMin - Minimum x value
   * @param {number} domainMax - Maximum x value
   * @param {Object} scope - Variable values like {a: 2, b: 3}
   * @param {string} color - Plot color
   * @param {Object} options - Additional options
   */
  plot(graphContainer, expression, domainMin, domainMax, scope = {}, color = 'green', options = {}) {
    const { variable = 'x', ...plotOptions } = options;
    const shape = this._createPlotFromExpression(
      graphContainer, expression, variable, scope,
      domainMin, domainMax, color, plotOptions
    );
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a parametric plot
   */
  parametricPlot(graphContainer, xFunction, yFunction, tMin, tMax, color = 'blue', options = {}) {
    const shape = this._createParametricPlot(graphContainer, xFunction, yFunction, tMin, tMax, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a circle
   */
  circle(graphContainer, center, radius, color = 'blue', options = {}) {
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    const shape = this._createCircle(graphContainer, center, radius, shapeOptions.stroke, shapeOptions);
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create an ellipse
   */
  ellipse(graphContainer, center, rx, ry, color = 'red', options = {}) {
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    const shape = this._createEllipse(graphContainer, center, rx, ry, shapeOptions.stroke, shapeOptions);
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create an arc
   */
  arc(graphContainer, start, end, rx, ry, color = 'green', options = {}) {
    const shape = this._createArc(graphContainer, start, end, rx, ry, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a polygon
   */
  polygon(graphContainer, vertices, color = 'orange', options = {}) {
    const shapeOptions = {
      ...options,
      stroke: options.stroke || color,
      fill: options.fill || color
    };
    const shape = this._createPolygon(graphContainer, vertices, shapeOptions.stroke, shapeOptions);
    if (shapeOptions.fill) shape.fill(this.parseColor(shapeOptions.fill));
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a curve
   */
  curve(graphContainer, type, points, color = 'violet', options = {}) {
    const shape = this._createCurve(graphContainer, type, points, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a curved arrow
   */
  arrow(graphContainer, start, end, color = 'red', options = {}) {
    const shape = this._createArrow(graphContainer, start, end, color, options);
    shape.primitiveShape.attr('fill', null);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create an angle
   */
  angle(graphContainer, vertex, point1, point2, angleType = 'interior', options = {}) {
    const color = options.color || options.stroke || DEFAULT_SHAPE_COLORS.angle;
    const shape = this._createAngle(graphContainer, vertex, point1, point2, angleType, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a LaTeX text rendered as SVG
   */
  texToSvg(graphContainer, position, latexString, color = 'black', options = {}) {
    const shape = this._createTexToSvg(graphContainer, position, latexString, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a label at a specific point
   */
  labelOnPoint(graphContainer, point, latexString, color = 'black', options = {}) {
    const shape = this._createLabelOnPoint(graphContainer, point, latexString, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a label between two points
   */
  labelBetweenPoints(graphContainer, start, end, latexString, color = 'black', options = {}) {
    const shape = this._createLabelBetweenPoints(graphContainer, start, end, latexString, color, options);
    shape.renderEndState();
    shape.show();
    this.objects.push(shape);
    return shape;
  }

  /**
   * Create a MathTextComponent label on a grapher
   */
  label(graphContainer, position, latexString, color = 'black', options = {}) {
    const mathComponent = this._createLabel(graphContainer, position, latexString, color, options);
    mathComponent.show();
    mathComponent.enableStroke();
    return mathComponent;
  }

  /**
   * Create a label for an angle shape
   */
  angleLabel(graphContainer, angleShape, latexString, color = 'black', options = {}) {
    const viewCenter = angleShape.getAngleCenter();
    if (!viewCenter) {
      console.error('Error: Could not get angle center from shape');
      return null;
    }

    let finalViewX = viewCenter.x;
    let finalViewY = viewCenter.y;

    const offsetDistance = options.offsetInView || 0;
    if (offsetDistance !== 0) {
      finalViewY = viewCenter.y - offsetDistance;
    }

    const modelX = graphContainer.graphSheet2D.toModelX(finalViewX);
    const modelY = graphContainer.graphSheet2D.toModelY(finalViewY);

    return this.labelOnPoint(graphContainer, { x: modelX, y: modelY }, latexString, color, options);
  }

  /**
   * Draw a rectangle around a bbox section
   */
  annotateSectionRect(mathTextComponent, sectionIndex, options = {}) {
    const shape = this._createAnnotateSectionRect(mathTextComponent, sectionIndex, options);
    if (!shape) {
      return null;
    }
    shape.renderEndState();
    return shape;
  }

  // ============= CLEANUP =============

  destroy() {
    super.destroy();
  }
}
