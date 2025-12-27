/**
 * PrintOnlyExpression - Renders LaTeX using KaTeX, showing ONLY specified parts
 *
 * Uses KatexComponent with \htmlClass{robo-select}{...} markers.
 * Only the included patterns are visible; rest is hidden.
 *
 * Syntax:
 *   printonly(row, col, "latex", "include1", "include2", ...)
 *   printonly(row, col, meq(...), "include1", ...)
 *
 * Examples:
 *   printonly(4, 4, "x^2 + 2x + 1 = 0", "x^2", "= 0")
 *   printonly(4, 4, A, "first line")  // where A = meq(...)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PrintOnlyCommand } from '../../commands/PrintOnlyCommand.js';

export class PrintOnlyExpression extends AbstractNonArithmeticExpression {
  static NAME = 'printonly';

  constructor(subExpressions) {
    super();
    this.subExpressions = subExpressions;
    this.row = null;
    this.col = null;
    this.latexString = '';
    this.includePatterns = [];
    this.fontSize = 35;
    this.color = '#000000';
    this.katexComponent = null;
  }

  resolve(context) {
    if (this.subExpressions.length < 4) {
      this.dispatchError('printonly() requires at least 4 arguments.\nUsage: printonly(row, col, "latex", "include1", ...)');
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
      this.dispatchError('printonly() requires 2 position coordinates (row, col)');
    }
    this.row = positionCoords[0];
    this.col = positionCoords[1];

    // Parse latex string (required)
    if (argIndex >= this.subExpressions.length) {
      this.dispatchError('printonly() requires a latex string after position');
    }
    const latexExpr = this.subExpressions[argIndex];
    latexExpr.resolve(context);
    const resolvedLatexExpr = this._getResolvedExpression(context, latexExpr);

    if (!resolvedLatexExpr || typeof resolvedLatexExpr.getStringValue !== 'function') {
      this.dispatchError('printonly() third argument must be a quoted string, meq(), or mflow()');
    }
    this.latexString = resolvedLatexExpr.getStringValue();
    argIndex++;

    // Parse include patterns (remaining string arguments)
    while (argIndex < this.subExpressions.length) {
      const patternExpr = this.subExpressions[argIndex];
      patternExpr.resolve(context);
      const resolvedPattern = this._getResolvedExpression(context, patternExpr);

      if (resolvedPattern && resolvedPattern.getName() === 'quotedstring') {
        this.includePatterns.push(resolvedPattern.getStringValue());
      } else if (resolvedPattern && resolvedPattern.getName() === 'number') {
        // Could be fontSize - check if it's the first non-pattern arg
        if (this.includePatterns.length === 0) {
          this.fontSize = resolvedPattern.getVariableAtomicValues()[0];
        }
      }
      argIndex++;
    }

    if (this.includePatterns.length === 0) {
      this.dispatchError('printonly() requires at least one include pattern');
    }
  }

  getName() {
    return PrintOnlyExpression.NAME;
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
    return new PrintOnlyCommand({
      row: this.row,
      col: this.col,
      latexString: this.latexString,
      includePatterns: this.includePatterns,
      fontSize: this.fontSize,
      color: this.color,
      expression: this
    });
  }

  canPlay() {
    return true;
  }
}
