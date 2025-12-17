import { SVGScriptShape } from './svg-script-shape.js';
import { Bounds2 } from '../geom/Bounds2.js';
import { Point } from '../geom/Point.js';
import { isEmpty } from 'lodash';
import $ from 'jquery';
import { RoboEventManager } from '../events/robo-event-manager.js';
import { TweenablePath } from '../animator/tweenable-path.js';

export class GeomPrimitiveShape extends SVGScriptShape {
  constructor(modelCoordinates) {
    super(modelCoordinates);
    this.styleObj.fill = 'transparent';
  }

  doCreate() {
    this.shapeGroup = this.layer.group();
    this.primitiveShape = this.shapeGroup.path();
    this.generatePath();
    this.generatedSVGPath = this.primitiveShape;
    this.primitiveShape.attr(this.styleObj);
    // Don't disable stroke by default - only for animation
    // this.disableStroke();
  }

  getShapeContainers() {
    return [this.shapeGroup];
  }

  generatePath() {
    // Override in subclasses
  }

  /**
   * Generate SVG path string for given model coordinates.
   * Used by transform effects (rotate, translate) to animate the shape.
   * Override in subclasses that need special handling.
   * @param {number[]} coords - Model coordinates
   * @returns {string} SVG path d attribute
   */
  generatePathForCoordinates(coords) {
    // Default: convert to view coords and generate line path
    const viewCoords = this.getViewCoordinates(coords);
    if (viewCoords.length < 4) return '';
    let d = `M ${viewCoords[0]} ${viewCoords[1]}`;
    for (let i = 2; i < viewCoords.length; i += 2) {
      d += ` L ${viewCoords[i]} ${viewCoords[i + 1]}`;
    }
    return d;
  }

  /**
   * Get number of coordinate pairs in modelCoordinates.
   * Override for shapes with extra data (e.g., circle has radius).
   * @returns {number}
   */
  getCoordinatePairCount() {
    return Math.floor(this.modelCoordinates.length / 2);
  }

  doRenderEndState() {
    this.primitiveShape.attr(this.styleObj);
    this.shapeGroup.show();
  }

  renderWithAnimation(penStartPoint, completionHandler) {
    try {
      const shapeTweenCompletionhandler = () => {
        // Re-enable stroke after animation completes
        this.enableStroke();
        completionHandler();
      };

      const tweenablePath = new TweenablePath(this.primitiveShape.node);
      this.primitiveShape.show();
      this.disableStroke();
      this.setTweenSpeed(tweenablePath);
      tweenablePath.tween(
        shapeTweenCompletionhandler,
        penStartPoint,
        this.getPreCompletionHandler(),
        null // No text trace point
      );
    } catch (e) {
      console.log(e);
      completionHandler();
    }
  }

  getPreCompletionHandler() {
    return undefined;
  }

  setTweenSpeed(tweenablePath) {
    tweenablePath.setSlow();
  }

  getShapeType() {
    return 'primitive';
  }

  getStylableObjects() {
    return [this.primitiveShape];
  }

  getBounds() {
    return null;
  }

  disableStroke() {
    this.primitiveShape.attr('stroke-dasharray', '0,10000');
  }

  enableStroke() {
    this.primitiveShape.attr('stroke-dasharray', '0,0');
  }


  getTextPosition() {
    if (this.textModelPos) {
      const x = this.graphsheet2d.toViewX(this.textModelPos.x);
      const y = this.graphsheet2d.toViewY(this.textModelPos.y);
      return [x + this.offsetUIValues[0], y + this.offsetUIValues[1]];
    }
    return [0, 0];
  }
}