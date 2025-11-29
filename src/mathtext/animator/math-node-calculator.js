import { remove } from 'lodash';
import { Bounds2 } from '../../geom/Bounds2.js';

export class MathNodeCalculator {
  getTweenableNodes(mathGraphNode) {
    const tweenableNodes = [];
    mathGraphNode.collectTweenNodes(tweenableNodes);
    return tweenableNodes;
  }

  removeMatchingNodes(selectionUnit, tweenableNodes) {
    const remainingNodes = [].concat(tweenableNodes);
    const fragmentPaths = selectionUnit.fragmentPaths;
    
    fragmentPaths.forEach((fragmentPath) => {
      tweenableNodes.forEach((tweenableNode) => {
        if (tweenableNode.getNodePath() == fragmentPath) {
          const removedNodes = remove(remainingNodes, tweenableNode);
          removedNodes.forEach((removedNode) => {
            removedNode.disableStroke();
          });
        }
      });
    });
    
    return remainingNodes;
  }

  reOrderTweenableNodes(tweenableNodes, selectionUnits, autoComplete) {
    const availableTweenableNodes = [].concat(tweenableNodes);
    const sortedTweenableNodes = [];

    selectionUnits.forEach((selectionUnit) => {
      const selectedNodes = this.collectTweenableNodes(selectionUnit, availableTweenableNodes);
      sortedTweenableNodes.push(...selectedNodes);
    });

    if (autoComplete) {
      sortedTweenableNodes.push(...availableTweenableNodes);
    }
    
    return sortedTweenableNodes;
  }

  collectTweenableNodes(selectionUnit, tweenableNodes) {
    const mappedNodes = [];
    const fragmentPaths = selectionUnit.fragmentPaths;
    
    fragmentPaths.forEach((fragmentPath) => {
      const matchedNode = remove(tweenableNodes, (tweenableNode) => {
        return tweenableNode.getNodePath() == fragmentPath;
      });
      
      if (matchedNode.length) {
        mappedNodes.push(...matchedNode);
      }
    });
    
    return mappedNodes;
  }

  excludeTweenNodes(mathGraphNode, selectionUnits) {
    const tweenableNodes = [];
    mathGraphNode.collectTweenNodes(tweenableNodes);
    let availableTweenableNodes = [].concat(tweenableNodes);
    
    selectionUnits.forEach((selectionUnit) => {
      availableTweenableNodes = this.removeMatchingNodes(selectionUnit, availableTweenableNodes);
    });
    
    return availableTweenableNodes;
  }
  
  includeTweenNodes(mathGraphNode, selectionUnits, autoComplete = false) {
    const tweenableNodes = [];
    mathGraphNode.collectTweenNodes(tweenableNodes);
    return this.reOrderTweenableNodes(tweenableNodes, selectionUnits, autoComplete);
  }

  getScreenBounds(tweenableNodes, selectionUnit) {
    const pt = tweenableNodes[0].getStartPoint();
    const bounds2 = Bounds2.point(pt.x, pt.y);
    
    tweenableNodes.forEach((tweenableNode) => {
      const pt = tweenableNode.getStartPoint();
      bounds2.addCoordinates(pt.x, pt.y);
    });
    
    bounds2.dilate(10);
    return bounds2;
  }
}