/**
 * LabelCommand - Command for rendering a MathTextComponent label on a grapher
 *
 * Creates a pen-animated math label using MathJax rendering
 * positioned absolutely over a grapher using model coordinates.
 */
import { BaseCommand } from './BaseCommand.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class LabelCommand extends BaseCommand {
  /**
   * Create a label command
   * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
   * @param {string} latexString - LaTeX string to render
   * @param {Object} position - Position in model coordinates {x, y}
   * @param {Object} options - Additional options {fontSize, background, offset}
   */
  constructor(graphExpression, latexString, position, options = {}) {
    super();
    this.graphExpression = graphExpression;
    this.graphContainer = null;
    this.latexString = latexString;
    this.position = position;
    this.options = options;
  }

  /**
   * Create label shape via diagram
   * @returns {Promise}
   */
  async doInit() {
    const { diagram } = this.commandContext;

    // Resolve grapher from expression at init time
    if (!this.graphExpression) {
      const err = new Error(common_error_messages.GRAPH_REQUIRED('label'));
      err.expressionId = this.expressionId;
      throw err;
    }

    if (typeof this.graphExpression.getGrapher !== 'function') {
      const varName = this.graphExpression.variableName || 'first argument';
      const err = new Error(common_error_messages.INVALID_GRAPH_TYPE(varName));
      err.expressionId = this.expressionId;
      throw err;
    }

    this.graphContainer = this.graphExpression.getGrapher();
    if (!this.graphContainer) {
      const varName = this.graphExpression.variableName || 'graph';
      const err = new Error(common_error_messages.GRAPH_NOT_INITIALIZED(varName));
      err.expressionId = this.expressionId;
      throw err;
    }

    // Create the label using diagram's label method
    // This returns a MathTextComponent (hidden, ready for animation)
    this.commandResult = await diagram.label(
      this.graphContainer,
      this.position,
      this.latexString,
      this.color,
      this.options
    );
  }

  /**
   * Get label position
   * @returns {{x: number, y: number}}
   */
  getLabelPosition() {
    return this.position;
  }

  /**
   * Replay animation on existing MathTextComponent
   * @returns {Promise}
   */
  async playSingle() {
    if (!this.commandResult) return;

    // Reset to hidden state and replay write animation
    this.commandResult.hide();
    this.commandResult.disableStroke();

    const effect = new WriteEffect(this.commandResult);
    return effect.play();
  }

  /**
   * Direct play (instant, no animation)
   */
  doDirectPlay() {
    if (this.commandResult) {
      this.commandResult.show();
      this.commandResult.enableStroke();
    }
  }
}
