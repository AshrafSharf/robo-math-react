/**
 * PrintCommand - Displays LaTeX using KaTeX (no pen animation)
 *
 * Uses KatexComponent. Only supports instant show or fadeIn animation.
 *
 * Lifecycle:
 *   doInit(): Creates KatexComponent (hidden)
 *   playSingle(): fadeIn animation
 *   doDirectPlay(): show() immediately
 */
import { BaseCommand } from './BaseCommand.js';
import { KatexComponent } from '../../mathtext/katex/katex-component.js';

export class PrintCommand extends BaseCommand {
  /**
   * Create a print command
   * @param {Object} options - { row, col, latexString, fontSize, color, expression }
   */
  constructor(options = {}) {
    super();
    this.options = options;
    this.katexComponent = null;
  }

  async doInit() {
    const coordinateMapper = this.diagram2d.coordinateMapper;
    const canvasSection = this.diagram2d.canvasSection;

    // Evaluate nextToExpression if provided (deferred position)
    let row = this.options.row;
    let col = this.options.col;

    if (this.options.nextToExpression) {
      // nextto returns canvas coords, convert to logical
      const canvasPos = this.options.nextToExpression.evaluate(this.commandContext);
      const logical = coordinateMapper.toLogical(canvasPos.x, canvasPos.y);
      row = logical.row;
      col = logical.col;
    }

    this.katexComponent = new KatexComponent(
      this.options.latexString,
      row,
      col,
      coordinateMapper,
      canvasSection,
      {
        fontSize: this.options.fontSize,
        color: this.options.color
      }
    );

    this.katexComponent.hide();

    if (this.options.expression) {
      this.options.expression.setKatexComponent(this.katexComponent);
    }

    this.commandResult = this.katexComponent;
  }

  async playSingle() {
    if (!this.katexComponent) return;
    return this.katexComponent.revealIn(2);
  }

  doDirectPlay() {
    if (this.katexComponent) {
      this.katexComponent.show();
    }
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
