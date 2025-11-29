import { CustomOrderTypeAnimator } from "./custom-order-type-animator.js";
export class PlaySelectionAnimator extends CustomOrderTypeAnimator {
    disableAllNodes(mathGraphNode) {
        // Disable all nodes - implementation to be added if needed
    }
    
    hide(mathGraphNode) {
        // Hide selection units - implementation to be added if needed
        this.disableAllNodes(mathGraphNode);
    }
}
