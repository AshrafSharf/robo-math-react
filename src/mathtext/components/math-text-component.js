import { MathNodeBuilder } from '../animator/math-node-builder.js';
import { MathNodeCalculator } from '../animator/math-node-calculator.js';
import { MathNodeAnimator } from '../animator/math-node-animator.js';
import { CustomOrderTypeAnimator } from '../animator/custom-order-type-animator.js';
import { PlaySelectionAnimator } from '../animator/play-selection-animator.js';
import { NonSelectionOrderTypeAnimator } from '../animator/non-selection-order-type-animator.js';
import { TweenableNode } from '../animator/tweenable-node.js';
import { MathJaxProcessor } from '../processor/math-jax-processor.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';
import { PenDef } from '../../pen/pen-def.js';
import { Bounds2 } from '../../geom/Bounds2.js';
import { BoundsExtractor } from '../utils/bounds-extractor.js';
import { TextExUtil } from '../../shared/utils/text-ex-util.js';
import { TweenMax, Power2 } from 'gsap';
import { WriteEffect } from '../effects/write-effect.js';
import { WriteOnlyEffect } from '../effects/write-only-effect.js';
import { WriteWithoutEffect } from '../effects/write-without-effect.js';
import { SelectionUnit } from '../models/selection-unit.js';
import $ from '../utils/dom-query.js';

export class MathTextComponent {
  constructor(componentState, parentDOM, options = {}) {
    this.componentState = componentState;
    this.parentDOM = parentDOM;
    this.visible = false;
    this.strokeColor = options.stroke || '#000000';
    this.fillColor = options.fill || '#000000';
    this.fontSizeValue = options.fontSize || 22;  // Default font size
    this.mathNodes = [];
    this.containerDOM = null;
    this.renderedSVG = null;
    this.highLightedSections = {
      fBoxBounds: [],
      semiColonBounds: [],
      angleBracketBounds: []
    };
    this.init();
  }

  init() {
    // Create the container div with position
    this.containerDOM = $('<div>').attr({
      'id': this.componentState.componentId,
      'class': this.getComponentClass()
    }).css({
      'position': 'absolute',
      'left': (this.componentState.left || 0) + 'px',
      'top': (this.componentState.top || 0) + 'px',
      'font-size': this.fontSizeValue + 'px',  // Apply font size to container
      'display': 'none'  // Start hidden
    })[0];
    $(this.parentDOM).append(this.containerDOM);
    
    // Auto-render on init
    this.renderMath();
    this.applyStrokeColor();
    // Start with strokes disabled for write animation
    this.disableStroke();
  }
  
  getComponentClass() {
    return 'math-text-item';
  }
  
  style(cssStyles) {
    // Simple method to apply any CSS styles
    if (cssStyles) {
      $(this.containerDOM).css(cssStyles);
    }
    return this;
  }
  

  renderMath() {
    let processedStr = MathJaxProcessor.renderToString(this.componentState.content, TextExUtil.getTextSizeInEx(this.getFontSize()));
    processedStr = this.extractHighLightSections(processedStr);
    const mathNodeBuilder = new MathNodeBuilder(processedStr);
    mathNodeBuilder.process(this.componentState.componentId + "_math_node", this.getFontStroke());
    this.mathGraphNode = mathNodeBuilder.rootMathGrapNode;
    $(this.containerDOM).html(mathNodeBuilder.outputSVG);
    this.componentState.size = {
      width: parseInt($(this.containerDOM).width()),
      height: parseInt($(this.containerDOM).height())
    };
    this.createOverlaySVGLayer();
    // Bounds are extracted in extractHighLightSections, but paths are NOT removed
    // To remove fbox paths, call removeFBoxPaths() explicitly
  }
  
  detectBounds() {
    // Extract fbox metadata (bounds + paths for later removal if needed)
    this.highLightedSections.fBoxBoundsDescriptors = BoundsExtractor.extractFBoxBoundsDescriptors(
      $(this.containerDOM).find('svg')
    );
    this.highLightedSections.semiColonBounds = BoundsExtractor.extractOverSetUnderSetBoundsDescriptors(
      $(this.containerDOM).find('svg'), BoundsExtractor.SEMI_COLON
    );
    // DON'T extract angle bracket bounds here - do it after full render
    // when SVG is attached to DOM and getBBox/getCTM work correctly
    this.highLightedSections.angleBracketBounds = [];
  }
  
  extractHighLightSections(processedStr) {
    const originalHtml = $(this.containerDOM).html();
    $(this.containerDOM).html(processedStr);
    this.detectBounds();
    const postSVGRoot = this.getMathSVGRoot()[0];
    $(this.containerDOM).html(originalHtml);
    return postSVGRoot.outerHTML;
  }
  
  createOverlaySVGLayer() {
    const mathTextOverlayLayerId = "overlayLayer" + this.generateId();
    $(this.containerDOM).append(`<svg id="${mathTextOverlayLayerId}" class="mathTextOverlayLayer" width="100%" height="100%"
        xmlns="http://www.w3.org/2000/svg">
            </svg>
        `);
    this.overlaySVGLayerElement = $(`#${mathTextOverlayLayerId}`)[0];
  }
  
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  getMathSVGRoot() {
    return $(this.containerDOM).find('svg');
  }
  
  getOverlayMathSVGRoot() {
    return this.overlaySVGLayerElement;
  }
  
  renderFallback() {
    console.log('Rendering fallback for:', this.componentState.content);
    // Create a simple text element as fallback
    const fallbackHtml = `<div style="font-family: Arial; font-size: ${this.fontSizeValue}px; color: ${this.strokeColor}">${this.componentState.content}</div>`;
    $(this.containerDOM).html(fallbackHtml);
  }

  buildMathNodes() {
    // For now, skip building math nodes if we don't have the proper structure
    // This needs to be properly integrated with MathNodeGraph
    console.log('Building math nodes for animation...');
    this.mathNodes = [];
    
    // Get all paths from the rendered SVG
    const paths = $("path", this.containerDOM);
    
    paths.each((index, path) => {
      // Give each path an ID if it doesn't have one
      if (!path.id) {
        path.id = `math-path-${this.componentState.id}-${index}`;
      }
      
      // Store path reference for animation
      this.mathNodes.push({
        element: path,
        id: path.id,
        length: path.getTotalLength ? path.getTotalLength() : 0
      });
    });
    
    console.log(`Created ${this.mathNodes.length} math nodes for animation`);
  }

  show() {
    // Show everything - container visibility and strokes
    $(this.containerDOM).css({
      'display': 'block',
      'opacity': 1,
      'visibility': 'visible'
    });
    this.enableStroke();  // Make strokes visible (stroke-dasharray: 0,0)
    return this;
  }
  
  fadeIn(duration = 0.5) {
    // Fade in using GSAP
    $(this.containerDOM).css({
      'display': 'block',
      'opacity': 0
    });
    this.enableStroke();  // Make strokes visible for fade in
    TweenMax.to(this.containerDOM, duration, {
      opacity: 1,
      ease: Power2.easeInOut
    });
    return this;
  }

  hide() {
    // Just hide the container
    $(this.containerDOM).css('display', 'none');
    return this;
  }

  stroke(color) {
    this.strokeColor = color;
    if (this.containerDOM) {
      $("path", this.containerDOM).attr('stroke', color);
      $("path", this.containerDOM).css('stroke', color);
    }
    return this;
  }

  fill(color) {
    this.fillColor = color;
    if (this.containerDOM) {
      $("path", this.containerDOM).attr('fill', color);
    }
    return this;
  }

  fontSize(size) {
    this.fontSizeValue = size;
    // Font size affects the rendering, not the container CSS
    return this;
  }

  getMathNodes() {
    return this.mathNodes;
  }

  getSVGGroup() {
    return $("svg", this.containerDOM)[0];
  }

  getPosition() {
    // Return position using left/top for consistency
    return {
      left: this.componentState.left || 0,
      top: this.componentState.top || 0
    };
  }

  enableStroke() {
    // Match the original exactly
    $("path", this.containerDOM).attr('stroke-dasharray', '0,0');
    $("path", this.containerDOM).css('stroke-dasharray', '0,0');
    $("path", this.containerDOM).css('opacity', 1);
    $("path", this.containerDOM).css('visibility', 'visible');
  }

  applyStrokeColor() {
    // Apply stroke color to paths after rendering
    if (this.containerDOM) {
      $("path", this.containerDOM).attr('stroke', this.getFontStroke());
      $("path", this.containerDOM).css('stroke', this.getFontStroke());
    }
  }

  // Convenience methods for bbox-based animations (hides SelectionUnit implementation)
  writeOnlyBBox(includeAll = false) {
    const bboxBounds = this.getBBoxHighlightBounds();
    const selectionUnits = bboxBounds.map(bounds => {
      const selectionUnit = new SelectionUnit();
      this.computeSelectionUnit(bounds, selectionUnit);
      return selectionUnit;
    });
    return new WriteOnlyEffect(this, selectionUnits, includeAll);
  }

  writeWithoutBBox() {
    const bboxBounds = this.getBBoxHighlightBounds();
    const selectionUnits = bboxBounds.map(bounds => {
      const selectionUnit = new SelectionUnit();
      this.computeSelectionUnit(bounds, selectionUnit);
      return selectionUnit;
    });
    return new WriteWithoutEffect(this, selectionUnits);
  }

  disableStroke() {
    // Match the original exactly
    $("path", this.containerDOM).attr('stroke-dasharray', '0,10000');
    $("path", this.containerDOM).css('stroke-dasharray', '0,10000');
  }

  writeAnimate(completionHandler, context) {
    // Match the original implementation exactly
    PenDef.setInkColor(this.getFontStroke());
    const startPenPos = RoboEventManager.getLastVisitedPenPoint();
    const mathTypeAnimator = new MathNodeAnimator(startPenPos);
    mathTypeAnimator.animateType(this.mathGraphNode, this.getFontStroke(), completionHandler);
  }
  
  writeSelectionOnlyAnimate(selectionUnits, autoComplete, completionHandler) {
    const startPenPos = RoboEventManager.getLastVisitedPenPoint();
    const mathTypeAnimator = new CustomOrderTypeAnimator(startPenPos, selectionUnits, autoComplete);
    mathTypeAnimator.animateType(this.mathGraphNode, this.getFontStroke(), completionHandler);
  }
  
  writeSelectionAnimate(selectionUnits, autoComplete, completionHandler) {
    const startPenPos = RoboEventManager.getLastVisitedPenPoint();
    const mathTypeAnimator = new PlaySelectionAnimator(startPenPos, selectionUnits, autoComplete);
    mathTypeAnimator.animateType(this.mathGraphNode, this.getFontStroke(), completionHandler);
  }
  
  writeWithoutSelectionAnimate(selectionUnits, completionHandler) {
    const startPenPos = RoboEventManager.getLastVisitedPenPoint();
    const mathTypeAnimator = new NonSelectionOrderTypeAnimator(startPenPos, selectionUnits, false);
    mathTypeAnimator.animateType(this.mathGraphNode, this.getFontStroke(), completionHandler);
  }
  
  hideSelectionUnits(selectionUnits) {
    const startPenPos = RoboEventManager.getLastVisitedPenPoint();
    const mathTypeAnimator = new PlaySelectionAnimator(startPenPos, selectionUnits, false);
    mathTypeAnimator.hide(this.mathGraphNode);
  }
  
  getFontStroke() {
    return this.strokeColor || '#000000';
  }
  
  getFontSize() {
    return this.fontSizeValue + 'px';
  }
  
  updateStroke() {
    this.mathGraphNode.updateStrokeColor(this.getFontStroke());
  }
  
  updateSelectionStroke(selectionUnits) {
    const svgNodes$ = [];
    this.mathGraphNode.collectNodesBySelectionUnit(svgNodes$, selectionUnits);
    svgNodes$.forEach((svgNode$) => {
      svgNode$.attr('stroke', this.getFontStroke());
      svgNode$.css('stroke', this.getFontStroke());
    });
  }
  
  getTweenableNodes() {
    const mathNodeCalculator = new MathNodeCalculator();
    return mathNodeCalculator.getTweenableNodes(this.mathGraphNode);
  }
  
  includeTweenNodes(selUnits) {
    const mathNodeCalculator = new MathNodeCalculator();
    return mathNodeCalculator.includeTweenNodes(this.mathGraphNode, selUnits);
  }
  
  excludeTweenNodes(selUnits) {
    const mathNodeCalculator = new MathNodeCalculator();
    return mathNodeCalculator.excludeTweenNodes(this.mathGraphNode, selUnits);
  }

  computeSelectionUnit(boundsInCTM, selectionUnit) {
    // Match the original implementation - delegate to mathGraphNode
    if (this.mathGraphNode && this.mathGraphNode.collectSelectionUnits) {
      this.mathGraphNode.collectSelectionUnits(boundsInCTM, selectionUnit);
    } else {
      // Fallback implementation if collectSelectionUnits is not available
      // Find all paths that intersect with the bounds and add as fragments
      const paths = $("path", this.containerDOM);
      paths.each((index, path) => {
        const bbox = path.getBBox();
        const pathBounds = new Bounds2(bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height);
        
        if (this.boundsIntersect(boundsInCTM, pathBounds)) {
          selectionUnit.addFragment(path.id);
        }
      });
    }
  }

  boundsIntersect(bounds1, bounds2) {
    return !(bounds1.right < bounds2.left || 
             bounds2.right < bounds1.left || 
             bounds1.bottom < bounds2.top || 
             bounds2.bottom < bounds1.top);
  }

  getOverlayMathSVGRoot() {
    // Create or return overlay SVG for selection visualization
    let overlay = $('.overlay-svg', this.containerDOM)[0];
    if (!overlay) {
      const svg = $("svg", this.containerDOM)[0];
      if (svg) {
        overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        overlay.setAttribute('class', 'overlay-svg');
        svg.appendChild(overlay);
      }
    }
    return overlay;
  }

  getFBoxHighlightBounds() {
    // Pure getter - returns only the bounds, does NOT remove paths
    if (!this.highLightedSections.fBoxBoundsDescriptors) {
      return [];
    }
    return this.highLightedSections.fBoxBoundsDescriptors.map(descriptor => descriptor.bounds);
  }

  removeFBoxPaths() {
    // Explicit method to remove fbox paths from the rendered SVG
    if (!this.highLightedSections.fBoxBoundsDescriptors) {
      return;
    }
    this.highLightedSections.fBoxBoundsDescriptors.forEach(descriptor => {
      BoundsExtractor.removeFBoxPaths(descriptor.paths);
    });
  }

  getSemicolonHighlightBounds() {
    return this.highLightedSections.semiColonBounds;
  }

  getBBoxHighlightBounds() {
    // Extract bounds for \bbox marked content (returns array of {bounds, paths, mpaddedElement})
    const descriptors = BoundsExtractor.extractBBoxBoundsDescriptors(
      $(this.containerDOM).find('svg')
    );
    // Return just the bounds for backward compatibility
    return descriptors.map(d => d.bounds);
  }

  getBBoxDescriptors() {
    // Get full descriptors with bounds, paths, and mpadded elements
    return BoundsExtractor.extractBBoxBoundsDescriptors(
      $(this.containerDOM).find('svg')
    );
  }

  hideBBoxContent() {
    // Hide all content within bbox regions using stroke-dasharray
    const descriptors = this.getBBoxDescriptors();
    console.log(`\nHiding content in ${descriptors.length} bbox regions...`);

    descriptors.forEach((descriptor, index) => {
      console.log(`  Region ${index + 1}: hiding ${descriptor.paths.length} paths`);
      descriptor.paths.forEach(path => {
        const nodepath = path.getAttribute('nodepath');
        console.log(`    - Hiding path with nodepath="${nodepath}"`);
        path.setAttribute('stroke-dasharray', '0,10000');
        path.style.strokeDasharray = '0,10000';
        path.style.opacity = '0';
        path.style.visibility = 'hidden';
      });
    });

    console.log('✓ BBox content hidden');
  }

  getColorHighlightBounds(markerColor = 'magenta') {
    // Extract bounds for \color{markerColor}{content} marked content
    return BoundsExtractor.extractColorMarkedBounds(
      $(this.containerDOM).find('svg'),
      markerColor
    );
  }

  getAngleBracketBounds() {
    // Calculate bounds NOW by re-extracting from the fully rendered SVG
    console.log('\n=== CALCULATING ANGLE BRACKET BOUNDS (after full render) ===');

    const svg = $(this.containerDOM).find('svg')[0];
    if (!svg) {
      console.error('No SVG found in container');
      return [];
    }

    // Find angle brackets in the rendered SVG
    const allGroups = Array.from(svg.querySelectorAll('g'));
    const langleGroups = [];
    const rangleGroups = [];

    allGroups.forEach((g, index) => {
      const paths = Array.from(g.children).filter(n => n.tagName === 'path');
      if (paths.length > 0) {
        const meta = paths[0].getAttribute('meta');
        if (meta === BoundsExtractor.LANGLE) {
          langleGroups.push({ group: g, index, paths });
        } else if (meta === BoundsExtractor.RANGLE) {
          rangleGroups.push({ group: g, index, paths });
        }
      }
    });

    console.log(`Found ${langleGroups.length} left and ${rangleGroups.length} right angle brackets`);

    const boundsList = [];
    const pairCount = Math.min(langleGroups.length, rangleGroups.length);

    for (let i = 0; i < pairCount; i++) {
      const langle = langleGroups[i];
      const rangle = rangleGroups[i];

      // Get groups between the brackets
      const contentGroups = allGroups.filter((g, idx) => {
        return idx > langle.index && idx < rangle.index;
      });

      console.log(`Pair ${i}: ${contentGroups.length} content groups between brackets`);

      if (contentGroups.length > 0) {
        const contentBounds = new Bounds2(
          Number.POSITIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NEGATIVE_INFINITY
        );

        contentGroups.forEach((g, gIdx) => {
          const bounds = BoundsExtractor.getBoundsInCTMUnits(g);
          console.log(`  Group ${gIdx}: bounds =`, {
            minX: bounds.minX,
            minY: bounds.minY,
            maxX: bounds.maxX,
            maxY: bounds.maxY
          });
          if (bounds && !bounds.isEmpty()) {
            contentBounds.includeBounds(bounds);
          }
        });

        console.log(`Pair ${i}: Combined bounds =`, {
          minX: contentBounds.minX,
          minY: contentBounds.minY,
          maxX: contentBounds.maxX,
          maxY: contentBounds.maxY
        });

        boundsList.push(contentBounds);

        // Store bracket paths for later removal
        if (!this.highLightedSections.angleBracketBounds) {
          this.highLightedSections.angleBracketBounds = [];
        }
        this.highLightedSections.angleBracketBounds.push({
          bounds: contentBounds,
          langlePaths: langle.paths,
          ranglePaths: rangle.paths
        });
      }
    }

    return boundsList;
  }

  removeAngleBrackets() {
    // Hide the angle bracket paths instead of removing them
    // (removing breaks the animation system's node IDs)
    if (this.highLightedSections.angleBracketBounds && this.highLightedSections.angleBracketBounds.length > 0) {
      console.log("Hiding angle brackets from rendered SVG...");
      this.highLightedSections.angleBracketBounds.forEach(item => {
        item.langlePaths.forEach(path => {
          path.style.display = 'none';
          path.style.visibility = 'hidden';
        });
        item.ranglePaths.forEach(path => {
          path.style.display = 'none';
          path.style.visibility = 'hidden';
        });
      });
      console.log("Angle brackets hidden");
    } else {
      console.warn("No angle bracket bounds to hide");
    }
  }

  toDefaultState() {
    // Set default state - make visible
    $(this.containerDOM).css({
      'display': 'block',
      'opacity': 1,
      'visibility': 'visible'
    });
    return this;
  }
}