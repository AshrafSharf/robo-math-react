import { IdUtil } from '../shared/utils/id-util.js';
import { PenDef } from './pen-def.js';
import { RoboEventManager } from '../events/robo-event-manager.js';
import { PenEvent } from '../events/pen-event.js';
import { InLineSvgUtil } from '../blocks/in-line-svg-util.js';
import { Point } from '../geom/Point.js';

export class PenTracerImpl {
  constructor(parentDOM) {
    this.parentDOM = parentDOM;
    this.scaleFactor = 1;
    this.purePenTraceNode = null;
    this.penNibYOffSet = 5;
    this.penLayerSVGElement = null;
    this.penLayerSVGRoot = null;
    this.penLayerGroup = null;
    this.purePenMoveLayerGroup = null;
    this.lastVisitedTweenNode = null;
    this.unregisterPenEvent = null;
  }

  init() {
    this.createPenLayerDOM();
    this.createSVGLayers();

    // Register for pen position events (store unregister function for cleanup)
    this.unregisterPenEvent = RoboEventManager.register(PenEvent.POSITION_EVENT_NAME, (penEvent) => {
      this.updatePenCoordinates(penEvent.screenPoint);
    });
  }

  createPenLayerDOM() {
    const penLayerID = `penLayerSVG_${IdUtil.getID()}`;
    
    this.penLayerSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.penLayerSVGElement.id = penLayerID;
    this.penLayerSVGElement.setAttribute('class', 'penLayer');
    this.penLayerSVGElement.setAttribute('width', '100%');
    this.penLayerSVGElement.setAttribute('height', '100%');
    this.penLayerSVGElement.style.position = 'fixed';
    this.penLayerSVGElement.style.top = '0';
    this.penLayerSVGElement.style.left = '0';
    this.penLayerSVGElement.style.pointerEvents = 'none';
    this.penLayerSVGElement.style.zIndex = '10000';
    
    this.parentDOM.appendChild(this.penLayerSVGElement);
    
    // Add pen hand definition
    PenDef.addHandDefinition(this.penLayerSVGElement);
  }

  createSVGLayers() {
    this.penLayerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.penLayerGroup.id = 'penLayerGroup';
    this.penLayerSVGElement.appendChild(this.penLayerGroup);
    
    this.purePenMoveLayerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.purePenMoveLayerGroup.id = 'purePenMoveLayerGroup';
    this.penLayerSVGElement.appendChild(this.purePenMoveLayerGroup);
    
    // Create pure pen trace node
    this.purePenTraceNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.purePenTraceNode.setAttribute('id', 'purePenTraceNode');
    this.purePenTraceNode.setAttribute('stroke-width', '0');
    this.purePenTraceNode.setAttribute('fill', 'none');
    this.purePenTraceNode.setAttribute('stroke-dasharray', '0,1');
    this.purePenMoveLayerGroup.appendChild(this.purePenTraceNode);
  }

  setPenPureTraceNode(purePenTraceNode) {
    this.purePenTraceNode = purePenTraceNode;
  }

  getPenPureTraceNode() {
    return this.purePenTraceNode;
  }

  getPenOffsetRestPoint(x, y) {
    return new Point(x + 20, y + 20);
  }

  updatePenCoordinates(screenPoint) {
    if (!this.penLayerSVGElement) return;
    const handSel = this.penLayerSVGElement.querySelector('#hand');
    if (handSel && screenPoint) {
      const svgPoint = InLineSvgUtil.screenToSVG(this.penLayerSVGElement, screenPoint.x, screenPoint.y);
      const handBBox = handSel.getBBox();
      const yPos = svgPoint.y - handBBox.height - this.penNibYOffSet;
      handSel.setAttribute('transform', `translate(${svgPoint.x}, ${yPos})`);
    }
  }

  getCurrentPenPosition() {
    return new Point(200, 50); // TODO: implement actual position tracking
  }

  setScaleFactor(scaleFactor) {
    this.scaleFactor = scaleFactor;
  }

  getScaleFactor() {
    return this.scaleFactor;
  }

  hidePen() {
    const handSel = this.penLayerSVGElement.querySelector('#hand');
    if (handSel) {
      handSel.style.display = 'none';
    }
  }

  showPen() {
    const handSel = this.penLayerSVGElement.querySelector('#hand');
    if (handSel) {
      handSel.style.display = 'block';
    }
  }

  destroy() {
    // Unregister event listener
    if (this.unregisterPenEvent) {
      this.unregisterPenEvent();
      this.unregisterPenEvent = null;
    }
    // Remove DOM element
    if (this.penLayerSVGElement) {
      this.penLayerSVGElement.remove();
      this.penLayerSVGElement = null;
    }
    this.penLayerGroup = null;
    this.purePenMoveLayerGroup = null;
    this.purePenTraceNode = null;
  }
}