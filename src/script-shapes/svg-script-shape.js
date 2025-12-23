import { Bounds2 } from '../geom/Bounds2.js';
import { ScriptShapeHighlighter } from './script-shape-highlighter.js';
import { BaseStylableSubject } from './base-stylable-subject.js';
import { IdUtil } from '../utils/id-util.js';
import { TexToSVGShapeEffect } from '../effects/shape-effects/tex-to-svg-shape-effect.js';
import { ShapeDrawEffect } from '../effects/shape-effects/shape-draw-effect.js';
import { TweenMax } from 'gsap';
import SVG from 'svg.js';

const svgFunc = SVG;

export class SVGScriptShape extends BaseStylableSubject {
  constructor(modelCoordinates) {
    super();
    this.modelCoordinates = modelCoordinates;
    this.offsetUIValues = [0, 0];
    // No default styles - caller must specify all styling
    this.styleObj = {};
    this.id = `${this.getShapeType()}_${IdUtil.getID()}`;
  }

  setModelCoordinates(coords) {
    this.modelCoordinates = coords;
  }

  create() {
    this.doCreate();
    // Don't show immediately - let the effect control visibility
  }

  getFontWeight() {
    return this.styleObj['font-weight'] ? this.styleObj['font-weight'] : 'normal';
  }

  doCreate() {
    // Override in subclasses
  }

  renderEndState() {
    this.doRenderEndState();
  }

  renderWithAnimation(penStartPoint, completionHandler) {
    // Override in subclasses
  }

  remove() {
    this.shapeGroup.remove();
  }

  setStyle(newStyleObj) {
    this.styleObj = Object.assign(this.styleObj, newStyleObj);
    const updatedStyle = this.styleObj;
    this.getStylableObjects().forEach((stylableObj) => {
      stylableObj.attr(updatedStyle);
    });
  }

  doRenderEndState() {
    // Override in subclasses
  }

  doRemove() {
    // Override in subclasses
  }

  getShapeType() {
    return "none";
  }

  setRenderingContent(svgRootD3, layers, grid) {
    this.svgRootD3Selection = svgRootD3;
    this.layer = this.selectLayer(layers);
    this.graphsheet2d = grid;
  }

  selectLayer(layers) {
    return layers.shapes;
  }

  getStylableObjects() {
    return [];
  }

  show() {
    this.shapeGroup.show();
  }

  hide() {
    this.shapeGroup.hide();
  }

  enableStroke() {
    // Override in subclasses
  }

  disableStroke() {
    // Override in subclasses
  }

  animateHighLight(color, callback, duration = 1) {
    callback();
  }

  getTextContent() {
    return this.textContent;
  }

  getShapeContainers() {
    return [];
  }

  highLight(color) {
    // Override in subclasses
  }

  getBounds() {
    return null;
  }

  getElementWidth() {
    const bbox = this.shapeGroup.node.getBoundingClientRect();
    return bbox.width;
  }

  getElementHeight() {
    const bbox = this.shapeGroup.node.getBoundingClientRect();
    return bbox.height;
  }

  getObjectHighLightModel(objectHighlightLayer) {
    return new ScriptShapeHighlighter(this, objectHighlightLayer);
  }

  stroke(value) {
    this.setStyle({ 'stroke': value });
    this.renderEndState();
    return this;
  }

  strokeWidth(value) {
    this.setStyle({ 'stroke-width': value });
    this.renderEndState();
    return this;
  }

  strokeOpacity(value) {
    this.setStyle({ 'stroke-opacity': value });
    this.renderEndState();
    return this;
  }

  fillOpacity(value) {
    this.setStyle({ 'fill-opacity': value });
    this.renderEndState();
    return this;
  }

  fill(value) {
    this.setStyle({ 'fill': value });
    this.renderEndState();
    return this;
  }

  fontSize(value) {
    this.setStyle({ 'size': value });
    this.renderEndState();
    return this;
  }

  /**
   * Creates a TexToSVGShapeEffect for pen animation
   * @returns {TexToSVGShapeEffect} The effect that can be played
   */
  write() {
    console.log('Creating write effect for:', this.getShapeType());
    return new TexToSVGShapeEffect(this);
  }
  
  /**
   * Creates a ShapeDrawEffect for non-pen animation
   * @returns {ShapeDrawEffect} The effect that can be played
   */
  draw() {
    console.log('Creating draw effect for:', this.getShapeType());
    return new ShapeDrawEffect(this);
  }

  getViewCoordinates(modelCoordinates) {
    const coordinates = [];
    for (let i = 0; i < modelCoordinates.length; i += 2) {
      const modelX = modelCoordinates[i];
      const modelY = modelCoordinates[i + 1];
      const x = this.graphsheet2d.toViewX(modelX);
      const y = this.graphsheet2d.toViewY(modelY);
      coordinates.push(x);
      coordinates.push(y);
    }
    return coordinates;
  }

  /**
   * Generate SVG path string for given model coordinates.
   * Used by transform effects (rotate, translate) to animate the shape.
   * Override in subclasses that need special handling.
   * @param {number[]} coords - Model coordinates
   * @returns {string} SVG path d attribute
   */
  generatePathForCoordinates(coords) {
    // Default: convert to view coords and generate line path
    const viewCoords = this.getViewCoordinates(coords);
    if (viewCoords.length < 4) return '';
    let d = `M ${viewCoords[0]} ${viewCoords[1]}`;
    for (let i = 2; i < viewCoords.length; i += 2) {
      d += ` L ${viewCoords[i]} ${viewCoords[i + 1]}`;
    }
    return d;
  }

  /**
   * Get number of coordinate pairs in modelCoordinates.
   * Override for shapes with extra data (e.g., circle has radius).
   * @returns {number}
   */
  getCoordinatePairCount() {
    return Math.floor(this.modelCoordinates.length / 2);
  }

  /**
   * Translate the shape by a delta amount
   * @param {number} dx - Delta x in model coordinates
   * @param {number} dy - Delta y in model coordinates
   * @param {number} duration - Animation duration in seconds (optional, for animated version)
   * @returns {SVGScriptShape} Returns this for method chaining
   */
  translate(dx, dy, duration = 0) {
    // Update all x,y coordinate pairs in modelCoordinates
    for (let i = 0; i < this.modelCoordinates.length; i += 2) {
      this.modelCoordinates[i] += dx;     // x coordinate
      this.modelCoordinates[i + 1] += dy; // y coordinate
    }
    
    if (duration > 0 && this.shapeGroup) {
      // Animated translation using GSAP transform
      const viewDx = this.graphsheet2d ? this.graphsheet2d.toUIWidth(dx) : dx * 50;
      const viewDy = this.graphsheet2d ? this.graphsheet2d.toUIHeight(-dy) : -dy * 50;
      
      TweenMax.to(this.shapeGroup.node, duration, {
        x: `+=${viewDx}`,
        y: `+=${viewDy}`,
        ease: 'Power2.easeInOut'
      });
    } else {
      // Instant translation - regenerate the path
      if (this.generatePath) {
        this.generatePath();
      }
    }
    
    return this;
  }

  /**
   * Translate the shape to a specific target point
   * @param {Object} targetPoint - Target position {x, y} in model coordinates
   * @param {number} duration - Animation duration in seconds (optional, for animated version)
   * @returns {SVGScriptShape} Returns this for method chaining
   */
  translateTo(targetPoint, duration = 0) {
    // Calculate current reference point (default: first coordinate pair)
    const referencePoint = { 
      x: this.modelCoordinates[0], 
      y: this.modelCoordinates[1] 
    };
    
    // Calculate delta to move reference point to target
    const dx = targetPoint.x - referencePoint.x;
    const dy = targetPoint.y - referencePoint.y;
    
    // Use translate method to move
    return this.translate(dx, dy, duration);
  }

  /**
   * Rotate the shape about a point
   * @param {number} angleInDegrees - Rotation angle in degrees (positive = counterclockwise)
   * @param {Object} center - Center of rotation {x, y} in model coordinates
   * @param {number} duration - Animation duration in seconds (optional, for animated version)
   * @returns {SVGScriptShape} Returns this for method chaining
   */
  rotateAbout(angleInDegrees, center, duration = 0) {
    if (duration > 0 && this.shapeGroup) {
      // Store original coordinates for animation
      const originalCoords = [...this.modelCoordinates];
      
      // Animate the angle from 0 to target angle
      const animData = { angle: 0 };
      
      TweenMax.to(animData, duration, {
        angle: angleInDegrees,
        ease: 'Power2.easeInOut',
        onUpdate: () => {
          // Calculate rotation for current angle
          const currentAngleRadians = (animData.angle * Math.PI) / 180;
          const cos = Math.cos(currentAngleRadians);
          const sin = Math.sin(currentAngleRadians);
          
          // Apply rotation to original coordinates
          for (let i = 0; i < originalCoords.length; i += 2) {
            const x = originalCoords[i];
            const y = originalCoords[i + 1];
            
            // Translate to origin (relative to center)
            const dx = x - center.x;
            const dy = y - center.y;
            
            // Apply rotation
            const rotatedX = dx * cos - dy * sin;
            const rotatedY = dx * sin + dy * cos;
            
            // Translate back and update model coordinates
            this.modelCoordinates[i] = rotatedX + center.x;
            this.modelCoordinates[i + 1] = rotatedY + center.y;
          }
          
          // Regenerate path on each frame
          if (this.generatePath) {
            this.generatePath();
          }
        }
      });
    } else {
      // Instant rotation - update coordinates and regenerate
      // Positive angle should be counterclockwise (mathematical convention)
      const angleInRadians = (angleInDegrees * Math.PI) / 180;
      const cos = Math.cos(angleInRadians);
      const sin = Math.sin(angleInRadians);
      
      for (let i = 0; i < this.modelCoordinates.length; i += 2) {
        const x = this.modelCoordinates[i];
        const y = this.modelCoordinates[i + 1];
        
        // Translate to origin (relative to center)
        const dx = x - center.x;
        const dy = y - center.y;
        
        // Apply rotation
        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;
        
        // Translate back
        this.modelCoordinates[i] = rotatedX + center.x;
        this.modelCoordinates[i + 1] = rotatedY + center.y;
      }
      
      if (this.generatePath) {
        this.generatePath();
      }
    }
    
    return this;
  }

  /**
   * Get the default rotation point for this shape
   * Override in subclasses to customize the default rotation center
   * @returns {Object} Default rotation center {x, y} in model coordinates
   */
  getRotationCenter() {
    // Default: calculate centroid (average of all points)
    let centerX = 0;
    let centerY = 0;
    let pointCount = this.modelCoordinates.length / 2;
    
    for (let i = 0; i < this.modelCoordinates.length; i += 2) {
      centerX += this.modelCoordinates[i];
      centerY += this.modelCoordinates[i + 1];
    }
    
    centerX /= pointCount;
    centerY /= pointCount;
    
    return { x: centerX, y: centerY };
  }

  /**
   * Rotate the shape about its default center
   * @param {number} angleInDegrees - Rotation angle in degrees (positive = counterclockwise)
   * @param {number} duration - Animation duration in seconds (optional, for animated version)
   * @returns {SVGScriptShape} Returns this for method chaining
   */
  rotate(angleInDegrees, duration = 0) {
    const center = this.getRotationCenter();
    return this.rotateAbout(angleInDegrees, center, duration);
  }
}