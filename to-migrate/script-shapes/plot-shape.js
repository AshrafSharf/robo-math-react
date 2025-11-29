import { MathScriptShape } from './math-script-shape.js';
import { Bounds2 } from '../geom/Bounds2.js';
import { GraphEvaluator } from '../geom/graphing/graph-evaluator.js';
import { Point } from '../geom/Point.js';
import { PolygonPathGenerator } from '../path-generators/polygon-path-generator.js';
import { TweenablePath } from '../animator/tweenable-path.js';

export class PlotShape extends MathScriptShape {
  constructor(plotFunction, domainMin, domainMax) {
    super([]);
    // plotFunction should be a function callback, not a string
    if (typeof plotFunction !== 'function') {
      throw new Error('PlotShape expects a function callback, not a string expression');
    }
    this.plotFunction = plotFunction;
    this.domainMin = domainMin;
    this.domainMax = domainMax;
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
    const plotFunction = this.plotFunction;
    const [xModelMin, xModelMax] = this.getModelXEndPoints();
    const screenWidth = this.graphsheet2d.getUIWidth();

    const graphEvaluator = new GraphEvaluator();
    this.modelCoordinates = graphEvaluator.eval(
      plotFunction, 
      0, 
      screenWidth + 1, 
      1, 
      xModelMin, 
      xModelMax, 
      (viewX) => {
        return this.graphsheet2d.toModelX(viewX);
      }
    );
  }

  getModelXEndPoints() {
    return [this.domainMin, this.domainMax];
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
    return `c-line-${this.id}`;
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
    return 'plot';
  }

  getStylableObjects() {
    return [this.plotShape];
  }

  getBounds() {
    const viewCoordinates = this.getViewCoordinates(this.modelCoordinates);
    if (viewCoordinates.length === 4) {
      return Bounds2.rect(
        viewCoordinates[0], 
        viewCoordinates[1], 
        Math.max(1, viewCoordinates[2] - viewCoordinates[0]),
        Math.max(1, viewCoordinates[3] - viewCoordinates[1])
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