import { Linear, TimelineMax, TweenMax } from 'gsap';
import { PathInterpolator } from '../path-generators/path-interpolator.js';
import { GeomUtil } from '../geom/GeomUtil.js';
import { Point } from '../geom/Point.js';
import { MathTimeLine } from './math-time-line.js';
import { PenMovementAnimator } from './pen-movement-animator.js';
import { RoboEventManager } from '../events/robo-event-manager.js';

export class TweenablePath {
  constructor(pathNode) {
    this.pathNode = pathNode;
    this.maxDurationInSecs = 2;
    this.minDurationInSecs = 1;
    this.maxPathLength = 1000;
    this.minPathLength = 100;
    
    this.svgRootElement = this.pathNode.ownerSVGElement;
    this.pathInterPolator = new PathInterpolator(this.pathNode);
    
    TweenMax.set(this.pathNode, {
      'stroke-dasharray': '0,100000',
    });
  }

  tween(completionHandler, penStartPoint, preCompletionHandler, penEndPoint) {
    try {
      const timeLineMax = new TimelineMax();
      timeLineMax.eventCallback('onComplete', () => {
        completionHandler();
      });
      
      const mathTimeLine = new MathTimeLine(timeLineMax);
      const pathLength = this.pathInterPolator.getLength();
      const durationInsecs = GeomUtil.map(
        pathLength, 
        this.minPathLength, 
        this.maxPathLength, 
        this.minDurationInSecs, 
        this.maxDurationInSecs
      );

      const penMovementAnimator = new PenMovementAnimator();
      penMovementAnimator.addPenTween(penStartPoint, this.getStartPoint(), mathTimeLine);

      timeLineMax.to(this.pathNode, durationInsecs, {
        drawSVG: true, 
        ease: Linear.easeNone, 
        onUpdate: (e) => {
          const ratio = e.ratio;
          const svgPoint = this.getScreenPointByRatio(ratio);
          mathTimeLine.updatePenCoordinates(svgPoint);
        },
        onUpdateParams: ["{self}"]
      });

      const lastPoint = this.getLastPoint();
      const restPoint = penEndPoint ? penEndPoint : mathTimeLine.getPenOffsetRestPoint(lastPoint.x, lastPoint.y);
      penMovementAnimator.addPenTween(lastPoint, restPoint, mathTimeLine, preCompletionHandler);
      timeLineMax.play();

    } catch (e) {
      console.log(e);
      completionHandler();
    }
  }

  tweenWithoutPen(completionHandler) {
    try {
      const timeLineMax = new TimelineMax();
      timeLineMax.eventCallback('onComplete', () => {
        completionHandler();
      });

      const pathLength = this.pathInterPolator.getLength();
      const durationInsecs = GeomUtil.map(
        pathLength, 
        this.minPathLength, 
        this.maxPathLength, 
        this.minDurationInSecs, 
        this.maxDurationInSecs
      );
      
      timeLineMax.to(this.pathNode, durationInsecs, {
        drawSVG: true, 
        ease: Linear.easeNone,
        onUpdateParams: ["{self}"]
      });

      timeLineMax.play();

    } catch (e) {
      console.log(e);
      completionHandler();
    }
  }

  getScreenPointByRatio(ratio) {
    const svgPos = this.svgRootElement.getBoundingClientRect();
    const refPoint = this.pathInterPolator.getLocalSVGValue(ratio);
    const transX = svgPos.left + refPoint.x * RoboEventManager.getScaleFactor();
    const transY = svgPos.top + refPoint.y * RoboEventManager.getScaleFactor();
    return new Point(transX, transY);
  }

  getStartPoint() {
    return this.getScreenPointByRatio(0);
  }

  getLastPoint() {
    return this.getScreenPointByRatio(1);
  }

  setMinDuration(minDuration) {
    this.minDurationInSecs = minDuration;
  }

  setMaxDuration(maxDuration) {
    this.maxDurationInSecs = maxDuration;
  }

  setSlow() {
    this.minDurationInSecs = 2;
    this.maxDurationInSecs = 5;
  }

  setFast() {
    this.minDurationInSecs = 0.5;
    this.maxDurationInSecs = 0.8;
  }
}