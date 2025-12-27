/**
 * PrintOnlyCommand - Displays LaTeX using KaTeX, showing ONLY marked portions
 *
 * Uses KatexComponent with \htmlClass{robo-select}{...} markers.
 * All content is initially hidden, then marked portions fade in.
 *
 * Lifecycle:
 *   doInit(): Creates KatexComponent with wrapped latex (hidden)
 *   playSingle(): Fade in marked portions
 *   doDirectPlay(): Show marked portions immediately
 */
import { BaseCommand } from './BaseCommand.js';
import { KatexComponent } from '../../mathtext/katex/katex-component.js';
import { KatexLatexWrapper } from '../../mathtext/katex/katex-latex-wrapper.js';
import { KatexBoundsExtractor } from '../../mathtext/katex/katex-bounds-extractor.js';
import { TweenMax, Power2 } from 'gsap';

export class PrintOnlyCommand extends BaseCommand {
  /**
   * Create a printonly command
   * @param {Object} options - { row, col, latexString, includePatterns, fontSize, color, expression }
   */
  constructor(options = {}) {
    super();
    this.options = options;
    this.katexComponent = null;
    this.wrappedLatex = '';
  }

  async doInit() {
    const coordinateMapper = this.diagram2d.coordinateMapper;
    const canvasSection = this.diagram2d.canvasSection;

    // Wrap include patterns with \htmlClass{robo-select}{...}
    this.wrappedLatex = KatexLatexWrapper.wrapMultiple(
      this.options.latexString,
      this.options.includePatterns
    );

    this.katexComponent = new KatexComponent(
      this.wrappedLatex,
      this.options.row,
      this.options.col,
      coordinateMapper,
      canvasSection,
      {
        fontSize: this.options.fontSize,
        color: this.options.color
      }
    );

    // Hide the component initially
    this.katexComponent.hide();

    // Store reference in expression
    if (this.options.expression) {
      this.options.expression.setKatexComponent(this.katexComponent);
    }

    this.commandResult = this.katexComponent;
  }

  async playSingle() {
    if (!this.katexComponent) return;

    const container = this.katexComponent.containerDOM;

    // Show container but hide all content initially
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';

    // Get the katex-html element (main content)
    const katexHtml = container.querySelector('.katex-html');
    if (katexHtml) {
      // Use visibility:hidden - children can override with visibility:visible
      katexHtml.style.visibility = 'hidden';
      katexHtml.style.opacity = '1';
    }

    // Get marked elements and prepare them
    const markedElements = KatexBoundsExtractor.getMarkedElements(container);

    // Set marked elements to be visible (override parent's visibility:hidden)
    markedElements.forEach(el => {
      el.style.visibility = 'visible';
      el.style.opacity = '0'; // Start transparent for fade-in
    });

    // Fade in the marked elements
    return new Promise(resolve => {
      if (markedElements.length === 0) {
        // No marked elements found - just show everything
        if (katexHtml) {
          katexHtml.style.visibility = 'visible';
        }
        this.katexComponent.visible = true;
        resolve();
        return;
      }

      TweenMax.to(markedElements, 0.5, {
        opacity: 1,
        ease: Power2.easeOut,
        onComplete: () => {
          this.katexComponent.visible = true;
          resolve();
        }
      });
    });
  }

  doDirectPlay() {
    if (!this.katexComponent) return;

    const container = this.katexComponent.containerDOM;

    // Show container
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';

    // Get the katex-html element
    const katexHtml = container.querySelector('.katex-html');
    if (katexHtml) {
      // Use visibility:hidden - children can override
      katexHtml.style.visibility = 'hidden';
      katexHtml.style.opacity = '1';
    }

    // Show marked elements (override parent's visibility)
    const markedElements = KatexBoundsExtractor.getMarkedElements(container);
    markedElements.forEach(el => {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });

    this.katexComponent.visible = true;
  }

  getLabelPosition() {
    return { x: this.options.col, y: this.options.row };
  }

  clear() {
    if (this.katexComponent) {
      this.katexComponent.destroy();
    }
    this.katexComponent = null;
    this.commandResult = null;
    this.isInitialized = false;
  }
}
