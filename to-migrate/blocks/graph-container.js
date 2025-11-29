import { PointPrimitiveShape } from '../script-shapes/point-primitive-shape.js';
import { LinePrimitiveShape } from '../script-shapes/line-primitive-shape.js';
import { VectorPrimitiveShape } from '../script-shapes/vector-primitive-shape.js';
import { ArrowPrimitiveShape } from '../script-shapes/arrow-primitive-shape.js';
import { PlotShape } from '../script-shapes/plot-shape.js';
import { ArcPrimitiveShape } from '../script-shapes/arc-primitive-shape.js';
import { CirclePrimitiveShape } from '../script-shapes/circle-primitive-shape.js';
import { EllipsePrimitiveShape } from '../script-shapes/ellipse-primitive-shape.js';
import { PolygonPrimitiveShape } from '../script-shapes/polygon-primitive-shape.js';
import { CurvePrimitiveShape } from '../script-shapes/curve-primitive-shape.js';
import { AnglePrimitiveShape } from '../script-shapes/angle-primitive-shape.js';
import { MeasurementIndicatorPrimitiveShape } from '../script-shapes/measurement-indicator-primitive-shape.js';
import { ZoomUtils } from '../utils/zoom-utils.js';
import { Tooltip } from '../ui/tooltip.js';

export class GraphContainer {

  constructor(graphComponent) {
    this.graphComponent = graphComponent;
  }

  point(x, y, radius = 4) {
    const pointPrimitiveShape = new PointPrimitiveShape([x, y], radius);
    this.addMathShape(pointPrimitiveShape);
    return pointPrimitiveShape;
  }

  line(x1, y1, x2, y2) {
    const linePrimitiveShape = new LinePrimitiveShape([x1, y1, x2, y2]);
    this.addMathShape(linePrimitiveShape);
    return linePrimitiveShape;
  }

  vector(x1, y1, x2, y2) {
    const vectorPrimitiveShape = new VectorPrimitiveShape([x1, y1, x2, y2]);
    this.addMathShape(vectorPrimitiveShape);
    return vectorPrimitiveShape;
  }

  arrow(x1, y1, x2, y2, angle = Math.PI, clockwise = true) {
    const arrowPrimitiveShape = new ArrowPrimitiveShape([x1, y1, x2, y2], angle, clockwise);
    this.addMathShape(arrowPrimitiveShape);
    return arrowPrimitiveShape;
  }

  plot(plotEquation, domainMin, domainMax) {
    const plotShape = new PlotShape(plotEquation, domainMin, domainMax);
    this.addMathShape(plotShape);
    return plotShape;
  }

  arc(start, end, rx, ry) {
    const arcPrimitiveShape = new ArcPrimitiveShape([start.x, start.y, end.x, end.y, rx, ry]);
    this.addMathShape(arcPrimitiveShape);
    return arcPrimitiveShape;
  }

  circle(originX, originY, radius, options = {}) {
    const circlePrimitiveShape = new CirclePrimitiveShape([originX, originY, radius], options);
    this.addMathShape(circlePrimitiveShape);
    return circlePrimitiveShape;
  }

  ellipse(originX, originY, rx, ry, options = {}) {
    const ellipsePrimitiveShape = new EllipsePrimitiveShape([originX, originY, rx, ry], options);
    this.addMathShape(ellipsePrimitiveShape);
    return ellipsePrimitiveShape;
  }

  label(x, y, mathContent) {
    // For now, create a simple label - need to implement LabelScriptShape
    console.log('Label not fully implemented yet:', mathContent, 'at', x, y);
    return null;
  }

  polygon(...args) {
    // Check if last argument is options object
    let modelCoordinates = args;
    let options = {};
    if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
      options = args[args.length - 1];
      modelCoordinates = args.slice(0, -1);
    }
    const polygonPrimitiveShape = new PolygonPrimitiveShape(modelCoordinates, options);
    this.addMathShape(polygonPrimitiveShape);
    return polygonPrimitiveShape;
  }

  //curveType: {'linear', 'step', 'step-before', 'step-after', 'basis', 'cardinal', 'monotone', 'catmull'}
  curve(curveType, ...modelCoordinates) {
    const curvePrimitiveShape = new CurvePrimitiveShape(modelCoordinates, curveType);
    this.addMathShape(curvePrimitiveShape);
    return curvePrimitiveShape;
  }

  angle(vertex, point1, point2, angleType = 'interior', options = {}) {
    // Just pass flat coordinates directly like vector does
    const coordinates = [
      vertex.x, vertex.y,
      point1.x, point1.y,
      point2.x, point2.y
    ];
    
    const anglePrimitiveShape = new AnglePrimitiveShape(coordinates, angleType, options);
    this.addMathShape(anglePrimitiveShape);
    return anglePrimitiveShape;
  }

  measurementIndicator(x1, y1, x2, y2, options = {}) {
    const measurementIndicatorPrimitiveShape = new MeasurementIndicatorPrimitiveShape([x1, y1, x2, y2], options);
    this.addMathShape(measurementIndicatorPrimitiveShape);
    return measurementIndicatorPrimitiveShape;
  }

  addMathShape(scriptShape) {
    this.graphComponent.addMathShape(scriptShape);
  }

  // Primary zoom method with object parameters
  zoomIn(options) {
    // Support both object style and backwards compatibility
    if (typeof options === 'object' && options.point) {
      // Object style: { point: {x, y}, scale: 0.5, duration: 0.5 }
      this.graphComponent.zoom(options);
    } else if (typeof options === 'object' && (options.x !== undefined || options.y !== undefined)) {
      // Simplified object with x,y directly: { x: 5, y: 7, scale: 0.5 }
      const { x, y, scale = 0.5, duration = 0.5, animate = true } = options;
      this.graphComponent.zoom({
        point: { x, y },
        scale,
        duration,
        animate
      });
    } else {
      throw new Error('zoomIn requires an object with point coordinates: { point: {x, y} } or { x, y }');
    }
    return this; // for chaining
  }

  // Reset zoom
  zoomOut(options = {}) {
    this.graphComponent.resetZoom(options);
    return this; // for chaining
  }

  // Get current zoom state
  getZoomState() {
    return this.graphComponent.getZoomState();
  }

  // Zoom to fit specific bounds
  zoomToFit(options = {}) {
    const {
      bounds,           // { x, y, width, height } in model coordinates
      padding = 0.1,    // padding factor (0.1 = 10% padding)
      duration = 0.5,
      animate = true
    } = options;

    if (!bounds) {
      throw new Error('zoomToFit requires bounds: { x, y, width, height }');
    }

    // Convert model bounds to view bounds
    const viewBounds = {
      x: this.graphComponent.graphSheet2D.toViewX(bounds.x),
      y: this.graphComponent.graphSheet2D.toViewY(bounds.y),
      width: this.graphComponent.graphSheet2D.toUIWidth(bounds.width),
      height: this.graphComponent.graphSheet2D.toUIHeight(bounds.height)
    };
    
    // Calculate zoom to fit these bounds
    const svg = this.graphComponent.d3SvgRoot.node();
    const currentViewBox = ZoomUtils.parseViewBox(svg.getAttribute('viewBox'));
    
    // Calculate scale to fit
    const scaleX = currentViewBox.width / (viewBounds.width * (1 + padding));
    const scaleY = currentViewBox.height / (viewBounds.height * (1 + padding));
    const scale = Math.min(scaleX, scaleY, 0.9); // Cap at 0.9 to avoid over-zoom
    
    // Zoom to center of bounds
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    this.zoomIn({
      point: { x: centerX, y: centerY },
      scale,
      duration,
      animate
    });
    
    return this;
  }

  // Zoom to a single shape
  zoomToShape(shape, options = {}) {
    if (!shape) {
      console.warn('No shape provided to zoomToShape');
      return this;
    }
    
    // Delegate to zoomToShapes with single shape
    return this.zoomToShapes([shape], options);
  }

  // Tooltip methods
  tooltip(shape, text, options) {
    if (!this._tooltip) {
      this._tooltip = new Tooltip(this);
    }
    this._tooltip.add(shape, text, options);
    return this; // chainable
  }

  tooltipAt(modelPoint, text, options) {
    if (!this._tooltip) {
      this._tooltip = new Tooltip(this);
    }
    return this._tooltip.addAt(modelPoint, text, options);
  }

  hideTooltip(shape) {
    if (this._tooltip) {
      this._tooltip.hide(shape);
    }
    return this;
  }

  showTooltip(shape) {
    if (this._tooltip) {
      this._tooltip.show(shape);
    }
    return this;
  }

  removeTooltip(shape) {
    if (this._tooltip) {
      this._tooltip.remove(shape);
    }
    return this;
  }

  clearTooltips() {
    if (this._tooltip) {
      this._tooltip.clear();
    }
    return this;
  }

  // Zoom to multiple shapes
  zoomToShapes(shapes, options = {}) {
    const {
      padding = 0.2,    // 20% padding by default
      duration = 0.5,
      animate = true
    } = options;

    if (!shapes || shapes.length === 0) {
      console.warn('No shapes provided to zoomToShapes');
      return this;
    }

    // Ensure shapes is an array
    const shapeArray = Array.isArray(shapes) ? shapes : [shapes];
    
    // Extract model coordinates from shapes
    const points = [];
    shapeArray.forEach(shape => {
      if (shape.modelCoordinates) {
        // For point shapes: [x, y]
        if (shape.modelCoordinates.length === 2) {
          points.push({
            x: shape.modelCoordinates[0],
            y: shape.modelCoordinates[1]
          });
        }
        // For other shapes, extract pairs of coordinates
        else {
          for (let i = 0; i < shape.modelCoordinates.length - 1; i += 2) {
            points.push({
              x: shape.modelCoordinates[i],
              y: shape.modelCoordinates[i + 1]
            });
          }
        }
      }
    });

    if (points.length === 0) {
      console.warn('No valid coordinates found in shapes');
      return this;
    }

    // Calculate bounding box
    const bounds = ZoomUtils.calculateBounds(points);
    
    // If it's a single point, create a small bounding box around it
    if (points.length === 1) {
      const point = points[0];
      const boxSize = 2; // Create a 2x2 box around the point in model coordinates
      bounds.x = point.x - boxSize / 2;
      bounds.y = point.y - boxSize / 2;
      bounds.width = boxSize;
      bounds.height = boxSize;
    }
    
    // Ensure minimum bounds size
    if (bounds.width < 0.1) bounds.width = 2;
    if (bounds.height < 0.1) bounds.height = 2;

    // Use zoomToFit with the calculated bounds
    return this.zoomToFit({
      bounds,
      padding,
      duration,
      animate
    });
  }
}