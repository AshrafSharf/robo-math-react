import { GeomPrimitiveShape } from './geom-primitive-shape.js';
import { PolygonPathGenerator } from '../path-generators/polygon-path-generator.js';
import { Point } from '../geom/Point.js';
import $ from 'jquery';
import { TweenablePath } from '../animator/tweenable-path.js';

export class VectorPrimitiveShape extends GeomPrimitiveShape {
  constructor(modelCoordinates) {
    super(modelCoordinates);
  }

  generatePath() {
    const coordinates = this.getViewCoordinates(this.modelCoordinates);
    const polygonPathGenerator = new PolygonPathGenerator();
    const pathStr = polygonPathGenerator.generate(coordinates);
    this.primitiveShape.attr('d', pathStr);
    this.addArrowToDefs();
  }

  getShapeType() {
    return 'vector';
  }

  doRenderEndState() {
    this.primitiveShape.attr(this.styleObj);
    this.shapeGroup.show();
    this.addArrowToDefs();  // Add arrow head for static rendering
  }

  renderWithAnimation(penStartPoint, completionHandler) {
    try {
      const shapeTweenCompletionhandler = () => {
        // Add arrow head at the very end, then complete
        this.addArrowToDefs();
        completionHandler();
      };

      // Don't show arrow during animation - only at the end
      const showArrowHandler = null;
      
      const tweenablePath = new TweenablePath(this.primitiveShape.node);
      this.removeArrowHead();
      this.primitiveShape.show();
      this.setTweenSpeed(tweenablePath);
      this.disableStroke();
      tweenablePath.tween(
        shapeTweenCompletionhandler, 
        penStartPoint, 
        showArrowHandler, 
        null // No text trace point
      );
    } catch (e) {
      console.log(e);
      completionHandler();
    }
  }

  disableStroke() {
    this.removeArrowHead();
    this.primitiveShape.attr('stroke-dasharray', '0,10000');
    this.primitiveShape.attr('marker-end', 'none');
  }

  addArrowToDefs() {
    const arrowId = this.getArrowId();
    this.removeArrowHead();
    const svgNode = this.svgRootD3Selection.node();
    const newArrowMarker = $(`#scriptArrowHead`, svgNode).clone();
    newArrowMarker.attr("id", arrowId);
    newArrowMarker.children().attr("stroke", `${this.styleObj.stroke}`);
    $("defs", svgNode).append(newArrowMarker);
    this.primitiveShape.attr(this.getMarkerPosition(), `url(#${arrowId})`);
  }

  removeArrowHead() {
    const arrowId = this.getArrowId();
    $(`#${arrowId}`, this.svgRootD3Selection.node()).remove();
  }

  getArrowId() {
    const arrowId = `${this.id}_arrowHead`;
    return arrowId;
  }

  setTweenSpeed(tweenablePath) {
    // Keep default speed
  }

  getMarkerPosition() {
    return 'marker-end';
  }

  getPreCompletionHandler() {
    return () => {
      this.addArrowToDefs();
    };
  }

  /**
   * Get the default rotation point for a vector
   * For vectors, this is the start point
   * @returns {Object} Start point {x, y} in model coordinates
   */
  getRotationCenter() {
    // Vector has [x1, y1, x2, y2] - return the start point
    return {
      x: this.modelCoordinates[0],
      y: this.modelCoordinates[1]
    };
  }
}