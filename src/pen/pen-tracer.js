import { IdUtil } from '../shared/utils/id-util.js';
import { PenDef } from './pen-def.js';
import { RoboEventManager } from '../events/robo-event-manager.js';
import { PenEvent } from '../events/pen-event.js';
import { InLineSvgUtil } from '../blocks/in-line-svg-util.js';
import { Point } from '../geom/Point.js';
import { GeomUtil } from '../geom/GeomUtil.js';
import { TweenMax, Power2 } from 'gsap';
import * as THREE from 'three';

export class PenTracer {
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
    this.lastScreenPosition = null;
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

  // === Core emission ===

  /**
   * Emit pen position and update visual
   * @param {Point} screenPoint - Screen coordinates
   */
  emit(screenPoint) {
    this.lastScreenPosition = screenPoint;
    this.updatePenCoordinates(screenPoint);
  }

  // === 2D helpers ===

  /**
   * Emit pen position from SVG local coordinates
   * @param {SVGElement} svgElement - The SVG root element
   * @param {{x,y}} localPoint - Local SVG coordinates
   * @param {number} scaleFactor - Scale factor (default uses instance scaleFactor)
   */
  emitFromSVG(svgElement, localPoint, scaleFactor = this.scaleFactor) {
    const screen = this.svgToScreen(svgElement, localPoint, scaleFactor);
    this.emit(screen);
  }

  /**
   * Convert SVG local coordinates to screen coordinates
   * @param {SVGElement} svgElement - The SVG root element
   * @param {{x,y}} localPoint - Local SVG coordinates
   * @param {number} scaleFactor - Scale factor
   * @returns {Point} Screen coordinates
   */
  svgToScreen(svgElement, localPoint, scaleFactor = 1) {
    const rect = svgElement.getBoundingClientRect();
    return new Point(
      rect.left + localPoint.x * scaleFactor,
      rect.top + localPoint.y * scaleFactor
    );
  }

  // === 3D helpers ===

  /**
   * Emit pen position from 3D world coordinates
   * @param {THREE.Vector3} worldPosition - World position
   * @param {THREE.Camera} camera - The camera
   * @param {HTMLElement} canvas - The renderer canvas
   */
  emitFromWorld3D(worldPosition, camera, canvas) {
    const screen = this.worldToScreen(worldPosition, camera, canvas);
    this.emit(screen);
  }

  /**
   * Emit interpolated position along a 3D line
   * @param {THREE.Vector3} start - Start position
   * @param {THREE.Vector3} end - End position
   * @param {number} ratio - Progress ratio (0-1)
   * @param {THREE.Camera} camera - The camera
   * @param {HTMLElement} canvas - The renderer canvas
   */
  emitInterpolated3D(start, end, ratio, camera, canvas) {
    const pos = new THREE.Vector3().lerpVectors(start, end, ratio);
    this.emitFromWorld3D(pos, camera, canvas);
  }

  /**
   * Convert 3D world position to screen coordinates
   * @param {THREE.Vector3} worldPosition - World position
   * @param {THREE.Camera} camera - The camera
   * @param {HTMLElement} canvas - The renderer canvas
   * @returns {Point} Screen coordinates
   */
  worldToScreen(worldPosition, camera, canvas) {
    const vector = worldPosition.clone().project(camera);
    const x = vector.x * (canvas.clientWidth / 2) + (canvas.clientWidth / 2);
    const y = -vector.y * (canvas.clientHeight / 2) + (canvas.clientHeight / 2);
    const rect = canvas.getBoundingClientRect();
    return new Point(rect.left + x, rect.top + y);
  }

  // === Movement ===

  /**
   * Animate pen from last position to target screen position
   * @param {Point} targetScreenPoint - Target screen coordinates
   * @param {Function} onComplete - Callback when movement completes
   * @returns {Object|null} GSAP tween object or null if no animation needed
   */
  moveTo(targetScreenPoint, onComplete) {
    if (!this.lastScreenPosition) {
      this.emit(targetScreenPoint);
      if (onComplete) onComplete();
      return null;
    }

    const distance = Point.distance(this.lastScreenPosition, targetScreenPoint);
    const duration = this.durationByDistance(distance);

    const startX = this.lastScreenPosition.x;
    const startY = this.lastScreenPosition.y;
    const animData = { x: startX, y: startY };

    return TweenMax.to(animData, duration, {
      x: targetScreenPoint.x,
      y: targetScreenPoint.y,
      ease: Power2.easeInOut,
      onUpdate: () => {
        const currentPoint = new Point(animData.x, animData.y);
        this.emit(currentPoint);
      },
      onComplete: () => {
        this.lastScreenPosition = targetScreenPoint;
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Animate pen from last position to 3D world position
   * @param {THREE.Vector3} worldPosition - Target world position
   * @param {THREE.Camera} camera - The camera
   * @param {HTMLElement} canvas - The renderer canvas
   * @param {Function} onComplete - Callback when movement completes
   * @returns {Object|null} GSAP tween object
   */
  moveToWorld3D(worldPosition, camera, canvas, onComplete) {
    const targetScreen = this.worldToScreen(worldPosition, camera, canvas);
    return this.moveTo(targetScreen, onComplete);
  }

  /**
   * Calculate animation duration based on distance
   * @param {number} distance - Distance in pixels
   * @returns {number} Duration in seconds
   */
  durationByDistance(distance) {
    const minDistance = 50;
    const maxDistance = 1000;
    const minTime = 0.3;
    const maxTime = 2;
    return GeomUtil.map(distance, minDistance, maxDistance, minTime, maxTime);
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