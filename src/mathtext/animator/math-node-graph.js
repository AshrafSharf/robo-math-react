import { TweenableNode } from './tweenable-node.js';
import { Point } from '../../geom/Point.js';
import { Bounds2 } from '../../geom/Bounds2.js';
import { NodeRenderOrderHeurestics } from './node-render-order-heurestics.js';
import { BoundsExtractor } from '../utils/bounds-extractor.js';
import cheerio from 'cheerio-standalone';
import $ from '../utils/dom-query.js';

export class MathNodeGraph {
  static drawableElements = ['path', 'rect', 'line'];
  
  constructor(id, type, cherrioElement, mathAnimatorFactory, strokeColor) {
    this.elementId = id;
    this.type = type;
    this.cherrioElement = cherrioElement;
    this.mathAnimatorFactory = mathAnimatorFactory;
    this.strokeColor = strokeColor;
    this.children = [];
    this.nodePath = '';
    
    this.cherrioElement.attr('id', this.elementId);
    this.cherrioElement.attr('stroke', this.strokeColor);
  }

  enableStroke() {
    $(`#${this.elementId}`).attr('stroke-dasharray', '0,0');
    $(`#${this.elementId}`).css('stroke-dasharray', '0,0');
    $(`#${this.elementId}`).css('opacity', 1);
    this.children.forEach((child) => {
      child.enableStroke();
    });
  }

  setStroke(strokeColor) {
    this.strokeColor = strokeColor;
  }

  getStroke() {
    return this.strokeColor;
  }

  disableStroke() {
    $(`#${this.elementId}`).attr('stroke-dasharray', '0,10000');
    $(`#${this.elementId}`).css('stroke-dasharray', '0,10000');
    this.children.forEach((child) => {
      child.disableStroke();
    });
  }

  collectTweenNodes(tweenableNodes) {
    if (this.isElementDrawable(this.cherrioElement)) {
      tweenableNodes.push(new TweenableNode(this));
    }

    this.children.forEach((child) => {
      child.collectTweenNodes(tweenableNodes);
    });
  }

  getLastTracePoint() {
    const tweenableNodes = [];
    this.collectTweenNodes(tweenableNodes);
    return tweenableNodes[tweenableNodes.length - 1].getLastPoint();
  }

  getStartTracePoint() {
    const tweenableNodes = [];
    this.collectTweenNodes(tweenableNodes);
    return tweenableNodes[0].getStartPoint();
  }

  process(parentId, strokeColor) {
    this.cherrioElement.children().each((i, element) => {
      if (cheerio(element).attr('meta')) {
        const elementId = parentId + "-" + i;
        let mathGraphNode = this.mathAnimatorFactory.getAnimatorNode(elementId, cheerio(element), strokeColor);
        this.addChild(mathGraphNode);
        mathGraphNode.process(elementId, strokeColor);
      }
    });
  }

  assignNodePath(nodeAssigner) {
    nodeAssigner.incrementDepth();
    this.cherrioElement.attr('nodepath', this.nodePath);
    this.children.forEach((mathNodeGroup) => {
      nodeAssigner.incrementPath();
      mathNodeGroup.nodePath = nodeAssigner.getPathAsString();
      mathNodeGroup.assignNodePath(nodeAssigner);
    });
    nodeAssigner.decrementDepth();
  }

  collectIntoMap(nodePathMap) {
    if (!(this.nodePath === 'root')) {
      nodePathMap[this.nodePath] = this;
    }
    this.children.forEach((child) => {
      child.collectIntoMap(nodePathMap);
    });
  }

  orderNodePathByRenderHeuristics(heuristic) {
    heuristic.processNodePaths(this);
  }

  addChild(mathNodeGroup) {
    this.children.push(mathNodeGroup);
  }

  isElementDrawable(element) {
    const elementType = element[0].name || element[0].tagName;
    return MathNodeGraph.drawableElements.indexOf(elementType) !== -1;
  }

  reOrder() {
    NodeRenderOrderHeurestics.reOrder(this);
    this.children.forEach((mathNodeGroup) => {
      mathNodeGroup.reOrder();
    });
  }

  getAllBounds() {
    const bounds = [];
    this.collectBounds(bounds);
    return bounds;
  }

  collectBounds(bounds) {
    if (this.isElementDrawable(this.cherrioElement)) {
      const element = document.getElementById(this.elementId);
      if (element && element.getBBox) {
        const bbox = element.getBBox();
        bounds.push({
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height
        });
      }
    }
    
    this.children.forEach((child) => {
      child.collectBounds(bounds);
    });
  }

  collectSelectionUnits(boundsInCTMCoordinates, selectionUnit) {
    const svgNode = $(`#${this.elementId}`)[0];
    if (!svgNode) return;
    const nodeBounds = BoundsExtractor.getBoundsInCTMUnits(svgNode);
    if (this.isElementDrawable(this.cherrioElement)) {
      const canBeIncluded = boundsInCTMCoordinates.containsBounds(nodeBounds);
      if (canBeIncluded) {
        selectionUnit.addFragment(this.nodePath);
      }
    }

    this.children.forEach((mathNodeGroup) => {
      mathNodeGroup.collectSelectionUnits(boundsInCTMCoordinates, selectionUnit);
    });
  }

  boundsIntersect(bbox1, bbox2) {
    return !(bbox1.x + bbox1.width < bbox2.x || 
             bbox2.x + bbox2.width < bbox1.x || 
             bbox1.y + bbox1.height < bbox2.y || 
             bbox2.y + bbox2.height < bbox1.y);
  }

  updateStrokeColor(strokeColor) {
    this.strokeColor = strokeColor;
    const svgNode = $(`#${this.elementId}`)[0];
    if (svgNode) {
      $(svgNode).attr('stroke', this.strokeColor);
      $(svgNode).css('stroke', this.strokeColor);
    }
    this.children.forEach((child) => {
      child.updateStrokeColor(strokeColor);
    });
  }

  updateInclusionBounds(existingBounds, selectionUnit) {
    const nodeBounds = this.getElementBounds();
    if (selectionUnit.containsFragment(this.nodePath)) {
      if (!existingBounds) {
        existingBounds = nodeBounds;
      } else {
        existingBounds = existingBounds.union(nodeBounds);
      }
    }

    this.children.forEach((mathNodeGroup) => {
      existingBounds = mathNodeGroup.updateInclusionBounds(existingBounds, selectionUnit);
    });

    return existingBounds;
  }

  getElementBounds() {
    const svgNode = $(`#${this.elementId}`)[0];
    if (!svgNode) return Bounds2.NOTHING;
    const bbox = svgNode.getBoundingClientRect();
    const nodeBounds = Bounds2.rect(bbox.x, bbox.y, bbox.width, bbox.height);
    return nodeBounds;
  }

  collectNodesBySelectionUnit(nodes$, selectionUnits) {
    selectionUnits.forEach((selectionUnit) => {
      if (selectionUnit.containsFragment(this.nodePath)) {
        const svgNode$ = $(`#${this.elementId}`);
        nodes$.push(svgNode$);
      }
    });
    this.children.forEach((mathNodeGroup) => {
      mathNodeGroup.collectNodesBySelectionUnit(nodes$, selectionUnits);
    });
  }
}