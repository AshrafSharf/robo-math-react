import { CustomOrderTypeAnimator } from "./custom-order-type-animator.js";
import { MathNodeCalculator } from "./math-node-calculator.js";

export class NonSelectionOrderTypeAnimator extends CustomOrderTypeAnimator {
    reOrderTweenableNodes(tweenableNodes) {
        const mathNodeCalculator = new MathNodeCalculator();
        let availableTweenableNodes = [].concat(tweenableNodes);
        this.selectionUnits.forEach((selectionUnit) => {
            availableTweenableNodes = mathNodeCalculator.removeMatchingNodes(selectionUnit, availableTweenableNodes);
        });
        return availableTweenableNodes;
    }
}
