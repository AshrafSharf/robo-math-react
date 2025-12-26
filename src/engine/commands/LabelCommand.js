/**
 * LabelCommand - Command for rendering a MathTextComponent label on a grapher
 *
 * Creates a pen-animated math label using MathJax rendering
 * positioned absolutely over a grapher using model coordinates.
 */
import { BaseCommand } from './BaseCommand.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';
import { TemplateEvaluator } from '../template/TemplateEvaluator.js';

export class LabelCommand extends BaseCommand {
  /**
   * Create a label command
   * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
   * @param {string} latexString - LaTeX string to render
   * @param {Object} position - Position in model coordinates {x, y}
   * @param {Object} options - Additional options {fontSize, fontColor, background, offset, isTemplate, templateString, templateScope}
   */
  constructor(graphExpression, latexString, position, options = {}) {
    super();
    this.graphExpression = graphExpression;
    this.graphContainer = null;
    this.latexString = latexString;
    this.position = position;

    // Template support
    this.isTemplate = options.isTemplate || false;
    this.templateString = options.templateString || null;
    this.templateScope = options.templateScope || {};
    this.expressionContext = null;  // Set during init for re-fetching values

    // Merge options with explicit fontSize/fontColor if provided
    this.options = { ...options };
    if (options.fontSize !== undefined) {
      this.options.fontSize = options.fontSize;
    }
    if (options.fontColor !== undefined) {
      this.options.fontColor = options.fontColor;
    }
  }

  /**
   * Create label shape via diagram
   * @returns {Promise}
   */
  async doInit() {
    // Store expressionContext for re-fetching values in playSingle
    if (this.commandContext && this.commandContext.expressionContext) {
      this.expressionContext = this.commandContext.expressionContext;
    }

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
    this.commandResult = this.diagram2d.label(
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

    // Just disable strokes and animate - don't overwrite content
    this.commandResult.disableStroke();
    this.commandResult.show();

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

  /**
   * Update the label with new variable values (called by change command)
   * @param {Object} scope - New variable values {a: 5, b: 10}
   */
  update(scope) {
    console.log('LabelCommand.update called with scope:', scope);
    console.log('LabelCommand.update - isTemplate:', this.isTemplate, 'templateString:', this.templateString);

    if (!this.isTemplate || !this.templateString || !this.commandResult) {
      console.log('LabelCommand.update - early return, missing:', !this.isTemplate ? 'isTemplate' : !this.templateString ? 'templateString' : 'commandResult');
      return;
    }

    // Merge new scope with existing scope
    const mergedScope = { ...this.templateScope, ...scope };
    this.templateScope = mergedScope;

    // Evaluate template with new scope
    const newLatex = TemplateEvaluator.evaluate(this.templateString, mergedScope);
    console.log('LabelCommand.update - newLatex:', newLatex);
    this.latexString = newLatex;

    // Update the MathTextComponent
    this.commandResult.updateContent(newLatex);
  }

  /**
   * Check if this label uses template syntax
   * @returns {boolean}
   */
  hasTemplate() {
    return this.isTemplate;
  }

  /**
   * Get the template string (original with placeholders)
   * @returns {string|null}
   */
  getTemplateString() {
    return this.templateString;
  }

  /**
   * Get the current template scope values
   * @returns {Object}
   */
  getTemplateScope() {
    return { ...this.templateScope };
  }
}
