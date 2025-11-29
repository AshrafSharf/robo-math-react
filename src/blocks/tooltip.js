import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export class Tooltip {
  constructor(graphContainer) {
    this.graphContainer = graphContainer;
    this.graphComponent = graphContainer.graphComponent;
    this.tooltips = new Map();
  }

  // Process text to render LaTeX between $ symbols
  processLatexContent(text) {
    // Check if text contains LaTeX markers
    if (!text.includes('$')) {
      return text;
    }
    
    // Replace LaTeX expressions between $ symbols with rendered KaTeX
    return text.replace(/\$([^\$]+)\$/g, (match, latex) => {
      try {
        // Render LaTeX to HTML using KaTeX
        const html = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: false  // inline mode for tooltips
        });
        return html;
      } catch (e) {
        console.warn('KaTeX render error:', e);
        return match; // Return original if error
      }
    });
  }

  // Add tooltip to a shape
  add(shape, text, options = {}) {
    const {
      placement = 'top',     // where: 'top', 'bottom', 'left', 'right'
      distance = 10,         // how far from the shape
      theme = 'dark'         // 'dark' or 'light'
    } = options;
    
    // Get SVG element from shape
    const element = this.getShapeElement(shape);
    if (!element) {
      console.warn('Could not find SVG element for shape');
      return null;
    }
    
    // Remove existing tooltip if any
    this.remove(shape);
    
    // Process LaTeX in text
    const processedContent = this.processLatexContent(text);
    
    // Create tooltip
    const instance = tippy(element, {
      content: processedContent,
      placement: placement,
      distance: distance,
      theme: theme,
      arrow: true,
      trigger: 'manual',
      showOnCreate: true,
      allowHTML: true,
      appendTo: () => document.body
    });
    
    this.tooltips.set(shape.id, instance);
    return this;
  }
  
  // Add tooltip at model coordinates (not attached to shape)
  addAt(modelPoint, text, options = {}) {
    const {
      placement = 'top',
      distance = 10,
      theme = 'dark'
    } = options;
    
    // Convert to view coordinates
    const viewX = this.graphComponent.graphSheet2D.toViewX(modelPoint.x);
    const viewY = this.graphComponent.graphSheet2D.toViewY(modelPoint.y);
    
    // Create invisible anchor
    const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    anchor.setAttribute('cx', viewX);
    anchor.setAttribute('cy', viewY);
    anchor.setAttribute('r', '0');
    anchor.style.pointerEvents = 'none';
    this.graphComponent.d3SvgRoot.node().appendChild(anchor);
    
    // Process LaTeX in text
    const processedContent = this.processLatexContent(text);
    
    // Create tooltip
    const instance = tippy(anchor, {
      content: processedContent,
      placement: placement,
      distance: distance,
      theme: theme,
      arrow: true,
      trigger: 'manual',
      showOnCreate: true,
      allowHTML: true,
      appendTo: () => document.body
    });
    
    const id = 'point_' + Date.now();
    this.tooltips.set(id, { instance, anchor });
    return id;
  }
  
  show(shape) {
    const tooltip = this.tooltips.get(shape.id || shape);
    if (tooltip) {
      if (tooltip.instance) {
        tooltip.instance.show();
      } else {
        tooltip.show();
      }
    }
  }
  
  hide(shape) {
    const tooltip = this.tooltips.get(shape.id || shape);
    if (tooltip) {
      if (tooltip.instance) {
        tooltip.instance.hide();
      } else {
        tooltip.hide();
      }
    }
  }
  
  remove(shape) {
    const tooltip = this.tooltips.get(shape.id || shape);
    if (tooltip) {
      if (tooltip.instance) {
        tooltip.instance.destroy();
        if (tooltip.anchor) {
          tooltip.anchor.remove();
        }
      } else {
        tooltip.destroy();
      }
      this.tooltips.delete(shape.id || shape);
    }
  }
  
  clear() {
    this.tooltips.forEach(tooltip => {
      if (tooltip.instance) {
        tooltip.instance.destroy();
        if (tooltip.anchor) {
          tooltip.anchor.remove();
        }
      } else {
        tooltip.destroy();
      }
    });
    this.tooltips.clear();
  }
  
  getShapeElement(shape) {
    // Try different properties where SVG element might be
    if (shape.primitiveShape && shape.primitiveShape.node) {
      return shape.primitiveShape.node;
    }
    if (shape.shapeGroup && shape.shapeGroup.node) {
      return shape.shapeGroup.node;
    }
    if (shape.plotShape && shape.plotShape.node) {
      return shape.plotShape.node;
    }
    if (shape.generatedSVGPath && shape.generatedSVGPath.node) {
      return shape.generatedSVGPath.node;
    }
    return null;
  }
}