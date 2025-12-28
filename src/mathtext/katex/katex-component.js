/**
 * KatexComponent - Renders LaTeX using KaTeX (HTML output)
 *
 * Simple component for displaying LaTeX without pen animation.
 * Uses KaTeX to render HTML/CSS output.
 */
import { KatexProcessor } from './katex-processor.js';
import { TweenMax, Power2 } from 'gsap';
import $ from '../utils/dom-query.js';

export class KatexComponent {
  constructor(text, row, col, coordinateMapper, parentDOM, options = {}) {
    this.coordinateMapper = coordinateMapper;

    const pixelCoords = this.coordinateMapper.toPixel(row, col);

    this.componentState = {
      componentId: `katex-text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: text,
      left: pixelCoords.x,
      top: pixelCoords.y
    };

    this.parentDOM = parentDOM;
    this.visible = false;
    this.color = options.color || '#000000';
    this.fontSizeValue = options.fontSize || 35;
    this.containerDOM = null;

    this.init();
  }

  init() {
    this.containerDOM = $('<div>').attr({
      'id': this.componentState.componentId,
      'class': 'katex-text-item'
    }).css({
      'position': 'absolute',
      'left': (this.componentState.left || 0) + 'px',
      'top': (this.componentState.top || 0) + 'px',
      'font-size': this.fontSizeValue + 'px',
      'color': this.color,
      'display': 'none'
    })[0];
    $(this.parentDOM).append(this.containerDOM);

    this.renderMath();
  }

  renderMath() {
    const html = KatexProcessor.renderToString(
      this.componentState.content,
      this.fontSizeValue
    );
    $(this.containerDOM).html(html);

    this.componentState.size = {
      width: parseInt($(this.containerDOM).width()),
      height: parseInt($(this.containerDOM).height())
    };
  }

  show() {
    $(this.containerDOM).css({
      'display': 'block',
      'opacity': 1,
      'visibility': 'visible'
    });
    this.visible = true;
    return this;
  }

  hide() {
    $(this.containerDOM).css({
      'display': 'none',
      'opacity': 0,
      'visibility': 'hidden'
    });
    this.visible = false;
    return this;
  }

  revealIn(duration = 2) {
    // Get the full height first
    $(this.containerDOM).css({
      'display': 'block',
      'visibility': 'hidden',
      'opacity': 1,
      'height': 'auto',
      'overflow': 'hidden'
    });
    const fullHeight = this.containerDOM.offsetHeight;

    // Start from 0 height
    $(this.containerDOM).css({
      'visibility': 'visible',
      'height': 0
    });

    return new Promise((resolve) => {
      TweenMax.to(this.containerDOM, duration, {
        height: fullHeight + 'px',
        ease: Power2.easeOut,
        onComplete: () => {
          $(this.containerDOM).css({
            'height': 'auto',
            'overflow': 'visible'
          });
          this.visible = true;
          resolve();
        }
      });
    });
  }

  revealOut(duration = 2) {
    const currentHeight = this.containerDOM.offsetHeight;
    $(this.containerDOM).css({
      'height': currentHeight + 'px',
      'overflow': 'hidden'
    });

    return new Promise((resolve) => {
      TweenMax.to(this.containerDOM, duration, {
        height: 0,
        ease: Power2.easeIn,
        onComplete: () => {
          $(this.containerDOM).css('display', 'none');
          this.visible = false;
          resolve();
        }
      });
    });
  }

  setColor(color) {
    this.color = color;
    $(this.containerDOM).css('color', color);
    return this;
  }

  setFontSize(size) {
    this.fontSizeValue = size;
    $(this.containerDOM).css('font-size', size + 'px');
    return this;
  }

  getPosition() {
    return {
      left: this.componentState.left || 0,
      top: this.componentState.top || 0
    };
  }

  setCanvasPosition(x, y) {
    this.componentState.left = x;
    this.componentState.top = y;
    this.containerDOM.style.left = x + 'px';
    this.containerDOM.style.top = y + 'px';
  }

  getContent() {
    return this.componentState.content;
  }

  updateContent(newLatex) {
    this.componentState.content = newLatex;
    $(this.containerDOM).html('');
    this.renderMath();
  }

  destroy() {
    if (this.containerDOM && this.containerDOM.parentNode) {
      this.containerDOM.parentNode.removeChild(this.containerDOM);
    }
    this.containerDOM = null;
  }

  /**
   * Create a KatexComponent-like wrapper from a cloned element
   * Used for move animations
   * @param {HTMLElement} sourceElement - The element to clone
   * @param {number} pixelX - X position in pixels
   * @param {number} pixelY - Y position in pixels
   * @param {HTMLElement} parentDOM - Parent DOM element
   * @param {Object} options - Options (fontSize, color)
   * @returns {Object} A wrapper with component-like interface
   */
  static fromClone(sourceElement, pixelX, pixelY, parentDOM, options = {}) {
    const clonedElement = sourceElement.cloneNode(true);

    const containerDOM = $('<div>').attr({
      'class': 'katex-clone-wrapper'
    }).css({
      'position': 'absolute',
      'left': pixelX + 'px',
      'top': pixelY + 'px',
      'font-size': (options.fontSize || 35) + 'px',
      'color': options.color || '#000000',
      'display': 'none'
    })[0];

    containerDOM.appendChild(clonedElement);
    $(parentDOM).append(containerDOM);

    // Return a minimal component-like interface
    return {
      containerDOM,
      parentDOM,
      fontSizeValue: options.fontSize || 35,
      color: options.color || '#000000',
      componentState: {
        left: pixelX,
        top: pixelY
      },

      show() {
        $(containerDOM).css({ 'display': 'block', 'opacity': 1 });
        return this;
      },

      hide() {
        $(containerDOM).css({ 'display': 'none', 'opacity': 0 });
        return this;
      },

      setCanvasPosition(x, y) {
        this.componentState.left = x;
        this.componentState.top = y;
        containerDOM.style.left = x + 'px';
        containerDOM.style.top = y + 'px';
      },

      destroy() {
        if (containerDOM && containerDOM.parentNode) {
          containerDOM.parentNode.removeChild(containerDOM);
        }
      }
    };
  }
}
