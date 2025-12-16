import { CustomOrderTypeAnimator } from "./custom-order-type-animator.js";
import { remove } from 'lodash';

/**
 * Animator for rewrite-without: animates everything EXCEPT selection units.
 *
 * Key difference from NonSelectionOrderTypeAnimator:
 * - Does NOT disable the excluded nodes (leaves them untouched)
 * - Only removes them from the animation list
 */
export class RewriteNonSelectionAnimator extends CustomOrderTypeAnimator {
    reOrderTweenableNodes(tweenableNodes) {
        let availableNodes = [].concat(tweenableNodes);

        // Remove selection units from list WITHOUT disabling them
        this.selectionUnits.forEach((selectionUnit) => {
            const fragmentPaths = selectionUnit.fragmentPaths;
            fragmentPaths.forEach((fragmentPath) => {
                remove(availableNodes, (node) => node.getNodePath() == fragmentPath);
            });
        });

        return availableNodes;
    }
}
