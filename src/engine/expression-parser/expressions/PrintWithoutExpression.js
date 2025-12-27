/**
 * PrintWithoutExpression - Renders LaTeX using KaTeX, hiding specified parts
 *
 * Uses KatexComponent with \htmlClass{robo-select}{...} markers.
 * The excluded patterns are hidden; rest is visible.
 *
 * Syntax:
 *   printwithout(row, col, "latex", "exclude1", "exclude2", ...)
 *   printwithout(row, col, meq(...), "exclude1", ...)
 *
 * Examples:
 *   printwithout(4, 4, "x^2 + 2x + 1 = 0", "2x")
 *   printwithout(4, 4, A, "last line")  // where A = meq(...)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { PrintWithoutCommand } from '../../commands/PrintWithoutCommand.js';

export class PrintWithoutExpression extends AbstractNonArithmeticExpression {
  static NAME = 'printwithout';

  constructor(subExpressions) {
    super();
    this.subExpressions = subExpressions;
    this.row = null;
    this.col = null;
    this.latexString = '';
    this.excludePatterns = [];
    this.fontSize = 35;
    this.color = '#000000';
    this.katexComponent = null;
  }

  resolve(context) {
    if (this.subExpressions.length < 4) {
      this.dispatchError('printwithout() requires at least 4 arguments.\nUsage: printwithout(row, col, "latex", "exclude1", ...)');
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
      this.dispatchError('printwithout() requires 2 position coordinates (row, col)');
    }
    this.row = positionCoords[0];
    this.col = positionCoords[1];

    // Parse latex string (required)
    if (argIndex >= this.subExpressions.length) {
      this.dispatchError('printwithout() requires a latex string after position');
    }
    const latexExpr = this.subExpressions[argIndex];
    latexExpr.resolve(context);
    const resolvedLatexExpr = this._getResolvedExpression(context, latexExpr);

    if (!resolvedLatexExpr || typeof resolvedLatexExpr.getStringValue !== 'function') {
      this.dispatchError('printwithout() third argument must be a quoted string, meq(), or mflow()');
    }
    this.latexString = resolvedLatexExpr.getStringValue();
    argIndex++;

    // Parse exclude patterns (remaining string arguments)
    while (argIndex < this.subExpressions.length) {
      const patternExpr = this.subExpressions[argIndex];
      patternExpr.resolve(context);
      const resolvedPattern = this._getResolvedExpression(context, patternExpr);

      if (resolvedPattern && resolvedPattern.getName() === 'quotedstring') {
        this.excludePatterns.push(resolvedPattern.getStringValue());
      } else if (resolvedPattern && resolvedPattern.getName() === 'number') {
        // Could be fontSize - check if it's the first non-pattern arg
        if (this.excludePatterns.length === 0) {
          this.fontSize = resolvedPattern.getVariableAtomicValues()[0];
        }
      }
      argIndex++;
    }

    if (this.excludePatterns.length === 0) {
      this.dispatchError('printwithout() requires at least one exclude pattern');
    }
  }

  getName() {
    return PrintWithoutExpression.NAME;
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
    return new PrintWithoutCommand({
      row: this.row,
      col: this.col,
      latexString: this.latexString,
      excludePatterns: this.excludePatterns,
      fontSize: this.fontSize,
      color: this.color,
      expression: this
    });
  }

  canPlay() {
    return true;
  }
}
