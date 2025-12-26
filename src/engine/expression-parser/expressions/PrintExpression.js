/**
 * PrintExpression - Renders LaTeX using KaTeX (instant display, no pen animation)
 *
 * Uses KatexComponent instead of MathTextComponent.
 * KaTeX renders to HTML/CSS, so no pen-tracing animation is possible.
 *
 * Syntax:
 *   print(row, col, "latex")                    - Default: black, 35px
 *   print(row, col, "latex", fontSize)          - Custom fontSize, black
 *   print(row, col, "latex", fontSize, "color") - Custom fontSize and color
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PrintCommand } from '../../commands/PrintCommand.js';

export class PrintExpression extends AbstractNonArithmeticExpression {
  static NAME = 'print';

  constructor(subExpressions) {
    super();
    this.subExpressions = subExpressions;
    this.row = null;
    this.col = null;
    this.latexString = '';
    this.fontSize = 35;
    this.color = '#000000';
    this.katexComponent = null;
  }

  resolve(context) {
    if (this.subExpressions.length < 3) {
      this.dispatchError('print() requires at least 3 arguments.\nUsage: print(row, col, "latex", [fontSize], ["color"])');
    }

    // Parse position coordinates (row, col)
    const positionCoords = [];
    let argIndex = 0;

    while (argIndex < this.subExpressions.length && positionCoords.length < 2) {
      const expr = this.subExpressions[argIndex];
      expr.resolve(context);
      const atomicValues = expr.getVariableAtomicValues();

      for (const val of atomicValues) {
        positionCoords.push(val);
        if (positionCoords.length >= 2) break;
      }
      argIndex++;
    }

    if (positionCoords.length < 2) {
      this.dispatchError('print() requires 2 position coordinates (row, col)');
    }
    this.row = positionCoords[0];
    this.col = positionCoords[1];

    // Parse latex string (required)
    if (argIndex >= this.subExpressions.length) {
      this.dispatchError('print() requires a latex string after position');
    }
    const latexExpr = this.subExpressions[argIndex];
    latexExpr.resolve(context);
    const resolvedLatexExpr = this._getResolvedExpression(context, latexExpr);

    if (!resolvedLatexExpr || typeof resolvedLatexExpr.getStringValue !== 'function') {
      this.dispatchError('print() third argument must be a quoted string, meq(), or mflow()');
    }
    this.latexString = resolvedLatexExpr.getStringValue();
    argIndex++;

    // Parse optional fontSize (4th argument)
    if (argIndex < this.subExpressions.length) {
      const fontSizeExpr = this.subExpressions[argIndex];
      fontSizeExpr.resolve(context);
      const fontSizeValues = fontSizeExpr.getVariableAtomicValues();
      if (fontSizeValues.length > 0 && typeof fontSizeValues[0] === 'number') {
        this.fontSize = fontSizeValues[0];
      }
      argIndex++;
    }

    // Parse optional color (5th argument)
    if (argIndex < this.subExpressions.length) {
      const colorExpr = this.subExpressions[argIndex];
      colorExpr.resolve(context);
      const resolvedColorExpr = this._getResolvedExpression(context, colorExpr);

      if (resolvedColorExpr && resolvedColorExpr.getName() === 'quotedstring') {
        this.color = resolvedColorExpr.getStringValue();
      }
    }
  }

  getName() {
    return PrintExpression.NAME;
  }

  getKatexComponent() {
    return this.katexComponent;
  }

  setKatexComponent(component) {
    this.katexComponent = component;
  }

  getVariableAtomicValues() {
    return [];
  }

  toCommand() {
    return new PrintCommand({
      row: this.row,
      col: this.col,
      latexString: this.latexString,
      fontSize: this.fontSize,
      color: this.color,
      expression: this
    });
  }

  canPlay() {
    return true;
  }
}
