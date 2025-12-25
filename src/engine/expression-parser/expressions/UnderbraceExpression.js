/**
 * UnderbraceExpression - Draws annotation text below a TextItem with underbrace
 *
 * Syntax:
 *   underbrace(T, "annotation")           - Draw annotation below textItem T
 *   underbrace(T, "annotation", buffer)   - With custom vertical buffer
 *
 * Creates a MathTextComponent with \underbrace{\phantom{\hspace{W}}}_{annotation}
 * positioned so the phantom aligns with the textItem.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { UnderbraceCommand } from '../../commands/UnderbraceCommand.js';

export class UnderbraceExpression extends AbstractNonArithmeticExpression {
    static NAME = 'underbrace';

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
            this.dispatchError('underbrace() requires at least 2 arguments: underbrace(T, "annotation")');
        }

        // First arg: textItem variable
        const targetExpr = this.subExpressions[0];
        targetExpr.resolve(context);

        if (!targetExpr.variableName) {
            this.dispatchError('underbrace() first argument must be a TextItem variable');
        }
        this.textItemVariableName = targetExpr.variableName;

        // Second arg: annotation text (quoted string)
        const annotationExpr = this.subExpressions[1];
        annotationExpr.resolve(context);
        const resolvedAnnotation = this._getResolvedExpression(context, annotationExpr);
        if (!resolvedAnnotation || resolvedAnnotation.getName() !== 'quotedstring') {
            this.dispatchError('underbrace() second argument must be a quoted string (annotation text)');
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
        return UnderbraceExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        return new UnderbraceCommand({
            textItemVariableName: this.textItemVariableName,
            annotationText: this.annotationText,
            buffer: this.buffer
        });
    }

    canPlay() {
        return true;
    }
}
