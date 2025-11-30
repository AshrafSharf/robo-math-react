import { TimelineMax } from 'gsap';
import { Point } from '../../geom/Point.js';
import { MathNodeGraph } from './math-node-graph.js';
import { TweenableNode } from './tweenable-node.js';
import { MathTimeLine } from '../../animator/math-time-line.js';
import { PenMovementAnimator } from '../../animator/pen-movement-animator.js';
import { MathNodeCalculator } from './math-node-calculator.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';
import { AnimationSpeedManager } from '../animation-speed-manager.js';

export class MathNodeAnimator extends MathNodeCalculator {
  constructor(initialStartPoint) {
    super();
    this.initialStartPoint = initialStartPoint;
  }

  animateType(mathGraphNode, strokeColor, completionHandler) {
    try {
      this.disableAllNodes(mathGraphNode);
      const timeLineMax = new TimelineMax();
      timeLineMax.eventCallback('onComplete', () => {
        completionHandler();
      });
      const tweenableNodes = this.getTweenableNodes(mathGraphNode);
      tweenableNodes.forEach((tweenableNode) => {
        tweenableNode.setStroke(strokeColor);
      });
      const mathTimeLine = new MathTimeLine(timeLineMax);

      // Apply global speed multiplier to entire timeline (scales all tweens uniformly)
      timeLineMax.timeScale(AnimationSpeedManager.getSpeedMultiplier());

      this.animateNodePaths(this.initialStartPoint, tweenableNodes, mathTimeLine);
      timeLineMax.play();
    } catch (e) {
      console.log(e);
      completionHandler();
    }
  }

  fadeIn(mathGraphNode, strokeColor, completionHandler) {
    try {
      const timeLineMax = new TimelineMax();
      timeLineMax.eventCallback('onComplete', () => {
        completionHandler();
      });
      const tweenableNodes = this.getTweenableNodes(mathGraphNode);
      tweenableNodes.forEach((tweenableNode) => {
        tweenableNode.enableStroke();
      });
      timeLineMax.fromTo(this.getSVGNodesFromTweenableNodes(tweenableNodes), 1, {autoAlpha: 0}, {autoAlpha: 1});
      timeLineMax.play();
    } catch (e) {
      console.log(e);
      completionHandler();
    }
  }

  fadeOut(mathGraphNode, completionHandler) {
    try {
      const timeLineMax = new TimelineMax();
      timeLineMax.eventCallback('onComplete', () => {
        completionHandler();
      });
      const tweenableNodes = this.getTweenableNodes(mathGraphNode);
      tweenableNodes.forEach((tweenableNode) => {
        tweenableNode.enableStroke();
      });
      timeLineMax.fromTo(this.getSVGNodesFromTweenableNodes(tweenableNodes), 1, {autoAlpha: 1}, {autoAlpha: 0});
      timeLineMax.play();
    } catch (e) {
      console.log(e);
      completionHandler();
    }
  }

  getSVGNodesFromTweenableNodes(tweenableNodes) {
    return tweenableNodes.map((tweenableNode) => {
      return tweenableNode.getSVGNode();
    });
  }

  disableAllNodes(mathGraphNode) {
    mathGraphNode.disableStroke();
  }

  animateNodePaths(startPoint, tweenableNodes, mathTimeLine) {
    const penMovementAnimator = new PenMovementAnimator();

    function liveLastPoint(tweenableNode) {
      return () => {
        return tweenableNode.getLastPoint();
      };
    }

    function liveCurrentEndPoint(tweenableNode) {
      return () => {
        return tweenableNode.getStartPoint();
      };
    }

    let lastVisitedPoint = startPoint;
    let isFirstNode = true;

    tweenableNodes.forEach((tweenableNode) => {
      let currentTweenNode = tweenableNode;
      let lastVisitedTweenNode = RoboEventManager.getLastVisitedTween();

      if (lastVisitedTweenNode) {
        penMovementAnimator.addPenTweenDynamicHandler(liveLastPoint(lastVisitedTweenNode), liveCurrentEndPoint(currentTweenNode), mathTimeLine);
      } else if (isFirstNode) {
        // No previous tween - animate from startPoint to first node
        penMovementAnimator.addPenTween(startPoint, tweenableNode.getStartPoint(), mathTimeLine);
      }

      isFirstNode = false;
      tweenableNode.buildPathDrawingTimeLine(mathTimeLine);
      lastVisitedPoint = tweenableNode.getLastPoint();
      RoboEventManager.setLastVisitedTween(tweenableNode);
    });

    let offSetPoint = mathTimeLine.getPenOffsetRestPoint(lastVisitedPoint.x, lastVisitedPoint.y);
    penMovementAnimator.addPenTween(lastVisitedPoint, offSetPoint, mathTimeLine);
  }

  hide(mathGraphNode) {
    const tweenableNodes = this.getTweenableNodes(mathGraphNode);
    tweenableNodes.forEach((tweenableNode) => {
      tweenableNode.disableStroke();
    });
  }
}