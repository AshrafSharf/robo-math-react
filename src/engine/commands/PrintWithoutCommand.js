/**
 * PrintWithoutCommand - Displays LaTeX using KaTeX, hiding marked portions
 *
 * Uses KatexComponent with \htmlClass{robo-select}{...} markers.
 * Marked portions are hidden, rest fades in.
 *
 * Lifecycle:
 *   doInit(): Creates KatexComponent with wrapped latex (hidden)
 *   playSingle(): Fade in non-marked content
 *   doDirectPlay(): Show non-marked content immediately
 */
import { BaseCommand } from './BaseCommand.js';
import { KatexComponent } from '../../mathtext/katex/katex-component.js';
import { KatexLatexWrapper } from '../../mathtext/katex/katex-latex-wrapper.js';
import { KatexBoundsExtractor } from '../../mathtext/katex/katex-bounds-extractor.js';
import { TweenMax, Power2 } from 'gsap';

export class PrintWithoutCommand extends BaseCommand {
  /**
   * Create a printwithout command
   * @param {Object} options - { row, col, latexString, excludePatterns, fontSize, color, expression }
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

    // Wrap exclude patterns with \htmlClass{robo-select}{...}
    this.wrappedLatex = KatexLatexWrapper.wrapMultiple(
      this.options.latexString,
      this.options.excludePatterns
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
      katexHtml.style.visibility = 'visible';
      katexHtml.style.opacity = '0'; // Start transparent for fade-in
    }

    // Get marked elements (to be hidden) and hide them
    const markedElements = KatexBoundsExtractor.getMarkedElements(container);
    markedElements.forEach(el => {
      el.style.visibility = 'hidden';
    });

    // Fade in the katex-html (non-marked content will show)
    return new Promise(resolve => {
      if (!katexHtml) {
        this.katexComponent.visible = true;
        resolve();
        return;
      }

      TweenMax.to(katexHtml, 0.5, {
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

    // Get the katex-html element and show it
    const katexHtml = container.querySelector('.katex-html');
    if (katexHtml) {
      katexHtml.style.visibility = 'visible';
      katexHtml.style.opacity = '1';
    }

    // Hide marked elements
    const markedElements = KatexBoundsExtractor.getMarkedElements(container);
    markedElements.forEach(el => {
      el.style.visibility = 'hidden';
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
