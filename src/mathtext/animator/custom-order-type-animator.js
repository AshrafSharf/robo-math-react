import { MathNodeAnimator } from "./math-node-animator.js";
import { TimelineMax } from 'gsap';
import { MathTimeLine } from '../../animator/math-time-line.js';
import { AnimationSpeedManager } from '../animation-speed-manager.js';

export class CustomOrderTypeAnimator extends MathNodeAnimator {
    constructor(initialStartPoint, selectionUnits, autoComplete) {
        super(initialStartPoint);
        this.selectionUnits = selectionUnits;
        this.autoComplete = autoComplete;
    }

    // Override animateType to hide only the selected nodes, not all nodes
    animateType(mathGraphNode, strokeColor, completionHandler) {
        try {
            const timeLineMax = new TimelineMax();
            timeLineMax.eventCallback('onComplete', () => {
                completionHandler();
            });

            // Get the nodes to animate (only the selected ones)
            const tweenableNodes = this.getTweenableNodes(mathGraphNode);

            // Hide ONLY the nodes we're about to animate, not everything
            tweenableNodes.forEach((tweenableNode) => {
                tweenableNode.disableStroke();
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

    getTweenableNodes(mathGraphNode) {
        const tweenableNodes = [];
        mathGraphNode.collectTweenNodes(tweenableNodes);
        return this.reOrderTweenableNodes(tweenableNodes, this.selectionUnits, this.autoComplete);
    }
}
