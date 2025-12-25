/**
 * MarrowExpression - Draws a curved arrow from a TextItem with annotation
 *
 * Syntax:
 *   marrow(T, "anchor", direction, length, "text")
 *   marrow(T, "anchor", direction, length, "text", curvature)
 *   marrow(T, "anchor", direction, length, "text", curvature, offset)
 *
 * Parameters:
 *   T          - TextItem variable reference
 *   anchor     - Anchor position on TextItem: "tl", "tm", "tr", "lm", "rm", "bl", "bm", "br"
 *   direction  - "N", "E", "S", "W" (cardinal direction for arrow)
 *   length     - Arrow length in pixels
 *   text       - Annotation text (LaTeX supported), appears at arrowhead
 *   curvature  - Curve amount (optional, default 0)
 *   offset     - Offset from TextItem edge (optional, default 5)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { MarrowCommand } from '../../commands/MarrowCommand.js';

export class MarrowExpression extends AbstractNonArithmeticExpression {
    static NAME = 'marrow';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
        this.anchor = 'rm';
        this.direction = 'E';
        this.length = 50;
        this.text = '';
        this.curvature = 50;
        this.offset = 5;
    }

    resolve(context) {
        // Minimum 5 arguments required
        if (this.subExpressions.length < 5) {
            this.dispatchError('marrow() requires at least 5 arguments: marrow(T, "anchor", direction, length, "text")');
        }

        // Arg 0: TextItem variable reference
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('marrow() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Arg 1: anchor ("tl", "tm", "tr", "lm", "rm", "bl", "bm", "br")
        const anchorExpr = this.subExpressions[1];
        anchorExpr.resolve(context);
        const resolvedAnchor = this._getResolvedExpression(context, anchorExpr);
        if (resolvedAnchor && resolvedAnchor.getName() === 'quotedstring') {
            this.anchor = resolvedAnchor.getStringValue().toLowerCase();
        } else {
            this.dispatchError('marrow() anchor must be a quoted string ("tl", "tm", "tr", "lm", "rm", "bl", "bm", "br")');
        }

        // Validate anchor
        const validAnchors = ['tl', 'tm', 'tr', 'lm', 'rm', 'bl', 'bm', 'br'];
        if (!validAnchors.includes(this.anchor)) {
            this.dispatchError(`marrow() invalid anchor "${this.anchor}". Must be one of: ${validAnchors.join(', ')}`);
        }

        // Arg 2: direction ("N", "E", "S", "W")
        const directionExpr = this.subExpressions[2];
        directionExpr.resolve(context);
        const resolvedDirection = this._getResolvedExpression(context, directionExpr);
        if (resolvedDirection && resolvedDirection.getName() === 'quotedstring') {
            this.direction = resolvedDirection.getStringValue().toUpperCase();
        } else {
            this.dispatchError('marrow() direction must be a quoted string ("N", "E", "S", or "W")');
        }

        // Validate direction
        if (!['N', 'E', 'S', 'W'].includes(this.direction)) {
            this.dispatchError(`marrow() invalid direction "${this.direction}". Must be "N", "E", "S", or "W"`);
        }

        // Arg 3: length
        const lengthExpr = this.subExpressions[3];
        lengthExpr.resolve(context);
        const lengthValues = lengthExpr.getVariableAtomicValues();
        if (lengthValues.length > 0) {
            this.length = lengthValues[0];
        } else {
            this.dispatchError('marrow() length must be a number');
        }

        // Arg 4: text (quoted string)
        const textExpr = this.subExpressions[4];
        textExpr.resolve(context);
        const resolvedText = this._getResolvedExpression(context, textExpr);
        if (resolvedText && resolvedText.getName() === 'quotedstring') {
            this.text = resolvedText.getStringValue();
        } else {
            this.dispatchError('marrow() text must be a quoted string');
        }

        // Arg 5 (optional): curvature
        if (this.subExpressions.length >= 6) {
            const curvatureExpr = this.subExpressions[5];
            curvatureExpr.resolve(context);
            const curvatureValues = curvatureExpr.getVariableAtomicValues();
            if (curvatureValues.length > 0) {
                this.curvature = curvatureValues[0];
            }
        }

        // Arg 6 (optional): offset
        if (this.subExpressions.length >= 7) {
            const offsetExpr = this.subExpressions[6];
            offsetExpr.resolve(context);
            const offsetValues = offsetExpr.getVariableAtomicValues();
            if (offsetValues.length > 0) {
                this.offset = offsetValues[0];
            }
        }
    }

    getName() {
        return MarrowExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new MarrowCommand({
            textItemVariableName: this.textItemVariableName,
            anchor: this.anchor,
            direction: this.direction,
            length: this.length,
            text: this.text,
            curvature: this.curvature,
            offset: this.offset
        });
    }

    canPlay() {
        return true;
    }
}
