import { Linear, TimelineMax } from 'gsap';
import { PathInterpolator } from '../../path-generators/path-interpolator.js';
import { GeomUtil } from '../../geom/GeomUtil.js';
import { Point } from '../../geom/Point.js';
import $ from '../utils/dom-query.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

export class TweenableNode {
  constructor(mathNodeGraph) {
    this.mathNodeGraph = mathNodeGraph;
    this.maxDurationInSecs = 0.35;
    this.minDurationInSecs = 0.15;
    this.maxPathLength = 1000;
    this.minPathLength = 100;
    
    const elementId = this.mathNodeGraph.elementId;
    this.pathNode = $(`#${elementId}`)[0];
    this.svgRootElement = this.pathNode.ownerSVGElement;
    this.pathInterPolator = new PathInterpolator(this.pathNode);
  }

  buildPathDrawingTimeLine(mathTimeLine) {
    const elementId = this.mathNodeGraph.elementId;
    $(`#${elementId}`).attr({
      'stroke-dasharray': '0,100000',
      'stroke': this.strokeColor
    });
    
    const pathLength = this.pathInterPolator.getLength();
    const durationInsecs = GeomUtil.map(
      pathLength,
      this.minPathLength,
      this.maxPathLength,
      this.minDurationInSecs,
      this.maxDurationInSecs
    );

    const timeLineMax = mathTimeLine.timeLineMax;
    timeLineMax.to(`#${elementId}`, durationInsecs, {
      drawSVG: true, 
      ease: Linear.easeNone, 
      onUpdate: (e) => {
        const ratio = e.ratio;
        const svgPoint = this.getScreenPoint(ratio);
        mathTimeLine.updatePenCoordinates(svgPoint);
      },
      onUpdateParams: ["{self}"],
      clearProps: "all"
    });
  }

  getSVGPosition() {
    const rect = this.svgRootElement.getBoundingClientRect();
    return {
      left: rect.x,
      top: rect.y
    };
  }

  getScreenPoint(ratio) {
    const svgPos = this.svgRootElement.getBoundingClientRect();
    const refPoint = this.pathInterPolator.getLocalSVGValue(ratio);
    refPoint.x = svgPos.left + refPoint.x * RoboEventManager.getScaleFactor();
    refPoint.y = svgPos.top + refPoint.y * RoboEventManager.getScaleFactor();
    return new Point(refPoint.x, refPoint.y);
  }

  getStartPoint() {
    return this.getScreenPoint(0);
  }

  getLastPoint() {
    return this.getScreenPoint(1);
  }

  getNodePath() {
    return this.mathNodeGraph.nodePath;
  }

  disableStroke() {
    const elementId = this.mathNodeGraph.elementId;
    $(`#${elementId}`).attr('stroke-dasharray', '0,100000');
    $(`#${elementId}`).css('stroke-dasharray', '0,100000');
  }

  enableStroke() {
    const elementId = this.mathNodeGraph.elementId;
    $(`#${elementId}`).attr('stroke-dasharray', '0,0');
    $(`#${elementId}`).css('stroke-dasharray', '0,0');
  }

  setStroke(strokeColor) {
    const elementId = this.mathNodeGraph.elementId;
    this.strokeColor = strokeColor;
    $(`#${elementId}`).attr('stroke', strokeColor);
    $(`#${elementId}`).css('stroke', strokeColor);
  }

  getSVGNode() {
    return this.pathNode;
  }
}