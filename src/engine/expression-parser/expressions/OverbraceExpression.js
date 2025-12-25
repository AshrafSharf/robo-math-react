/**
 * OverbraceExpression - Draws annotation text above a TextItem with overbrace
 *
 * Syntax:
 *   overbrace(T, "annotation")           - Draw annotation above textItem T
 *   overbrace(T, "annotation", buffer)   - With custom vertical buffer
 *
 * Creates a MathTextComponent with \overbrace{\phantom{\hspace{W}}}^{annotation}
 * positioned so the phantom aligns with the textItem.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { OverbraceCommand } from '../../commands/OverbraceCommand.js';

export class OverbraceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'overbrace';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;
        this.annotationText = '';
        this.buffer = 0;
    }

    resolve(context) {
        // Arg 0: TextItem variable reference (required)
        if (this.subExpressions.length < 2) {
            this.dispatchError('overbrace() requires at least 2 arguments: overbrace(T, "annotation")');
        }

        // First arg: textItem variable
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('overbrace() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Second arg: annotation text (quoted string)
        const annotationExpr = this.subExpressions[1];
        annotationExpr.resolve(context);
        const resolvedAnnotation = this._getResolvedExpression(context, annotationExpr);
        if (!resolvedAnnotation || resolvedAnnotation.getName() !== 'quotedstring') {
            this.dispatchError('overbrace() second argument must be a quoted string (annotation text)');
        }
        this.annotationText = resolvedAnnotation.getStringValue();

        // Third arg (optional): buffer
        if (this.subExpressions.length >= 3) {
            const bufferExpr = this.subExpressions[2];
            bufferExpr.resolve(context);
            const bufferValues = bufferExpr.getVariableAtomicValues();
            if (bufferValues.length > 0) {
                this.buffer = bufferValues[0];
            }
        }
    }

    getName() {
        return OverbraceExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new OverbraceCommand({
            textItemVariableName: this.textItemVariableName,
            annotationText: this.annotationText,
            buffer: this.buffer
        });
    }

    canPlay() {
        return true;
    }
}
