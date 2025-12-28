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
 *   print(nextto(M, mr), "latex")               - Position relative to M
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
    // For deferred position evaluation (nextto expression)
    this.nextToExpression = null;
  }

  resolve(context) {
    if (this.subExpressions.length < 2) {
      this.dispatchError('print() requires at least 2 arguments.\nUsage: print(row, col, "latex") or print(nextto(...), "latex")');
    }

    // Resolve first expression to check if it's a NextToExpression
    const firstExpr = this.subExpressions[0];
    firstExpr.resolve(context);

    // Check if first expression is a NextToExpression (deferred position)
    if (firstExpr.getName && firstExpr.getName() === 'nextto') {
      this.nextToExpression = firstExpr;

      // Next arg should be the latex string
      if (this.subExpressions.length < 2) {
        this.dispatchError('print(nextto(...), "latex") requires a latex string');
      }

      const latexExpr = this.subExpressions[1];
      latexExpr.resolve(context);
      const resolvedLatexExpr = this._getResolvedExpression(context, latexExpr);

      if (!resolvedLatexExpr || typeof resolvedLatexExpr.getStringValue !== 'function') {
        this.dispatchError('print() second argument must be a quoted string, meq(), or mflow()');
      }
      this.latexString = resolvedLatexExpr.getStringValue();

      // Parse remaining arguments for styling
      let argIndex = 2;
      const styleExprs = [];
      while (argIndex < this.subExpressions.length) {
        const expr = this.subExpressions[argIndex];
        expr.resolve(context);
        const resolvedExpr = this._getResolvedExpression(context, expr);

        if (this._isStyleExpression(resolvedExpr)) {
          styleExprs.push(resolvedExpr);
        } else if (resolvedExpr && resolvedExpr.getName() === 'quotedstring') {
          this.color = resolvedExpr.getStringValue();
        } else {
          const values = resolvedExpr.getVariableAtomicValues();
          if (values.length > 0 && typeof values[0] === 'number') {
            this.fontSize = values[0];
          }
        }
        argIndex++;
      }
      this._parseStyleExpressions(styleExprs);
      return;
    }

    // Standard path: parse position coordinates (row, col)
    if (this.subExpressions.length < 3) {
      this.dispatchError('print() requires at least 3 arguments.\nUsage: print(row, col, "latex", [fontSize], ["color"])');
    }

    const positionCoords = [];
    let argIndex = 0;

    while (argIndex < this.subExpressions.length && positionCoords.length < 2) {
      const expr = this.subExpressions[argIndex];
      if (argIndex > 0) expr.resolve(context);  // First already resolved above
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

    // Parse remaining arguments - can be fontSize, color, or style expressions (c(), f())
    const styleExprs = [];
    while (argIndex < this.subExpressions.length) {
      const expr = this.subExpressions[argIndex];
      expr.resolve(context);
      const resolvedExpr = this._getResolvedExpression(context, expr);

      if (this._isStyleExpression(resolvedExpr)) {
        styleExprs.push(resolvedExpr);
      } else if (resolvedExpr && resolvedExpr.getName() === 'quotedstring') {
        // Legacy: color as quoted string
        this.color = resolvedExpr.getStringValue();
      } else {
        // Legacy: fontSize as number
        const values = resolvedExpr.getVariableAtomicValues();
        if (values.length > 0 && typeof values[0] === 'number') {
          this.fontSize = values[0];
        }
      }
      argIndex++;
    }

    // Parse style expressions (c(), f()) - these override legacy positional args
    this._parseStyleExpressions(styleExprs);
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

  toCommand(options = {}) {
    const styleOptions = this.getStyleOptions();
    return new PrintCommand({
      row: this.row,
      col: this.col,
      latexString: this.latexString,
      fontSize: styleOptions.fontSize || this.fontSize,
      color: styleOptions.color || this.color,
      expression: this,
      nextToExpression: this.nextToExpression  // For deferred position evaluation
    });
  }

  canPlay() {
    return true;
  }
}
