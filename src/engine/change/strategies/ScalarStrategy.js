/**
 * Strategy for animating scalar (numeric) values
 */
import { ChangeStrategy } from './ChangeStrategy.js';
import { NumericExpression } from '../../expression-parser/expressions/NumericExpression.js';

export class ScalarStrategy extends ChangeStrategy {
    validate(sourceExpr, targetExpr) {
        const sourceType = sourceExpr.getName();
        const targetType = targetExpr.getName();

        if (sourceType !== 'number') {
            throw new Error(`change() source must be number, got: ${sourceType}`);
        }
        if (targetType !== 'number') {
            throw new Error(`change() target must be number, got: ${targetType}`);
        }
    }

    getFromValues(sourceExpr) {
        return [sourceExpr.getNumericValue()];
    }

    getToValues(targetExpr) {
        return [targetExpr.getNumericValue()];
    }

    updateContext(context, variableName, values, sourceExpr) {
        const newExpr = new NumericExpression(values[0]);
        context.updateReference(variableName, newExpr);
    }
}
