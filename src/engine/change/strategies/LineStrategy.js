/**
 * Strategy for animating 2D and 3D lines
 */
import { ChangeStrategy } from './ChangeStrategy.js';
import { LineExpression } from '../../expression-parser/expressions/LineExpression.js';
import { Line3DExpression } from '../../expression-parser/expressions/3d/Line3DExpression.js';
import { NumericExpression } from '../../expression-parser/expressions/NumericExpression.js';

export class LineStrategy extends ChangeStrategy {
    validate(sourceExpr, targetExpr) {
        const sourceType = sourceExpr.getName();
        const targetType = targetExpr.getName();
        const validTypes = ['line', 'line3d'];

        if (!validTypes.includes(sourceType)) {
            throw new Error(`change() source must be line or line3d, got: ${sourceType}`);
        }
        if (sourceType !== targetType) {
            throw new Error(`change() source and target must be same type. Source: ${sourceType}, Target: ${targetType}`);
        }
    }

    getFromValues(sourceExpr) {
        return sourceExpr.getVariableAtomicValues();
    }

    getToValues(targetExpr) {
        return targetExpr.getVariableAtomicValues();
    }

    updateContext(context, variableName, values, sourceExpr) {
        const graphExpr = sourceExpr.graphExpression;
        const is3D = sourceExpr.getName() === 'line3d';

        let newExpr;
        if (is3D) {
            // line3d: [x1, y1, z1, x2, y2, z2]
            const nums = values.map(v => new NumericExpression(v));
            newExpr = new Line3DExpression([graphExpr, ...nums]);
        } else {
            // line: [x1, y1, x2, y2]
            const nums = values.map(v => new NumericExpression(v));
            newExpr = new LineExpression([graphExpr, ...nums]);
        }

        newExpr.resolve(context);
        context.updateReference(variableName, newExpr);
    }
}
