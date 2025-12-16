import { SVGScriptShape } from './svg-script-shape.js';
import { Bounds2 } from '../geom/Bounds2.js';
import { Point } from '../geom/Point.js';
import { PolygonPathGenerator } from '../path-generators/polygon-path-generator.js';
import { TweenablePath } from '../animator/tweenable-path.js';

export class ParametricPlotShape extends SVGScriptShape {
  constructor(xFunction, yFunction, tMin, tMax) {
    super([]);
    // xFunction and yFunction should be function callbacks, not strings
    if (typeof xFunction !== 'function') {
      throw new Error('ParametricPlotShape expects xFunction to be a function callback, not a string expression');
    }
    if (typeof yFunction !== 'function') {
      throw new Error('ParametricPlotShape expects yFunction to be a function callback, not a string expression');
    }
    this.xFunction = xFunction;
    this.yFunction = yFunction;
    this.tMin = tMin;
    this.tMax = tMax;
    this.styleObj.fill = 'transparent';
  }

  doCreate() {
    this.shapeGroup = this.layer.group();
    this.plotShape = this.shapeGroup.path();
    this.generatedSVGPath = this.plotShape;
    this.generateModelCoordinates();
    this.toPathData();
    this.styleObj['stroke-width'] = 2;
    this.plotShape.attr(this.styleObj);
  }

  generateModelCoordinates() {
    const xFunction = this.xFunction;
    const yFunction = this.yFunction;
    
    // Generate points along the parametric curve
    const numPoints = 1000; // High resolution for smooth curves
    const tStep = (this.tMax - this.tMin) / (numPoints - 1);
    
    this.modelCoordinates = [];
    
    for (let i = 0; i < numPoints; i++) {
      const t = this.tMin + i * tStep;
      try {
        const x = xFunction(t);
        const y = yFunction(t);
        
        // Only add point if both coordinates are finite
        if (isFinite(x) && isFinite(y)) {
          this.modelCoordinates.push(x, y);
        }
      } catch (e) {
        // Skip points where function evaluation fails
        continue;
      }
    }
  }

  getModelXEndPoints() {
    // For parametric plots, we need to evaluate the range
    const numSamples = 100;
    const tStep = (this.tMax - this.tMin) / (numSamples - 1);
    let xMin = Infinity;
    let xMax = -Infinity;
    
    for (let i = 0; i < numSamples; i++) {
      const t = this.tMin + i * tStep;
      try {
        const x = this.xFunction(t);
        if (isFinite(x)) {
          xMin = Math.min(xMin, x);
          xMax = Math.max(xMax, x);
        }
      } catch (e) {
        // Skip points where function evaluation fails
        continue;
      }
    }
    
    return [xMin, xMax];
  }

  getXUIPoints(xMin, xMax) {
    return [this.graphsheet2d.toViewX(xMin), this.graphsheet2d.toViewX(xMax)];
  }

  getShapeContainers() {
    return [this.shapeGroup];
  }

  toPathData() {
    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    const polygonPathGenerator = new PolygonPathGenerator();
    const pathStr = polygonPathGenerator.generate(coordinates);
    this.plotShape.attr('d', pathStr);
    this.plotShape.attr('id', `${this.getLinePathId()}`);
    this.plotShape.style('shape-rendering', 'auto');
    this.pathLength = this.plotShape.node.getTotalLength();
  }

  getLinePathId() {
    return `c-parametric-line-${this.id}`;
  }

  doRenderEndState() {
    this.shapeGroup.show();
    this.enableStroke();
  }

  renderWithAnimation(penStartPoint, completionHandler) {
    try {
      const tweenablePath = new TweenablePath(this.plotShape.node);
      this.plotShape.show();
      this.disableStroke();
      tweenablePath.setSlow();
      tweenablePath.tween(completionHandler, penStartPoint);
    } catch (e) {
      console.log(e);
      completionHandler(e);
    }
  }

  doRemove() {
    // Clean up if needed
  }

  getShapeType() {
    return 'parametric-plot';
  }

  getStylableObjects() {
    return [this.plotShape];
  }

  getBounds() {
    const viewCoordinates = this.getViewCoordinates(this.modelCoordinates);
    if (viewCoordinates.length >= 4) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      
      for (let i = 0; i < viewCoordinates.length; i += 2) {
        minX = Math.min(minX, viewCoordinates[i]);
        maxX = Math.max(maxX, viewCoordinates[i]);
        minY = Math.min(minY, viewCoordinates[i + 1]);
        maxY = Math.max(maxY, viewCoordinates[i + 1]);
      }
      
      return Bounds2.rect(
        minX,
        minY,
        Math.max(1, maxX - minX),
        Math.max(1, maxY - minY)
      );
    }
    return null;
  }

  updateTextPosition() {
    // Override if needed
  }

  disableStroke() {
    this.plotShape.attr('stroke-dasharray', '0,10000');
  }

  enableStroke() {
    this.plotShape.attr('stroke-dasharray', '0,0');
  }
}