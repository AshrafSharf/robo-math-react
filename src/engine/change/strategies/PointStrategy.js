/**
 * Strategy for animating 2D and 3D points
 */
import { ChangeStrategy } from './ChangeStrategy.js';
import { PointExpression } from '../../expression-parser/expressions/PointExpression.js';
import { Point3DExpression } from '../../expression-parser/expressions/3d/Point3DExpression.js';
import { NumericExpression } from '../../expression-parser/expressions/NumericExpression.js';

export class PointStrategy extends ChangeStrategy {
    validate(sourceExpr, targetExpr) {
        const sourceType = sourceExpr.getName();
        const targetType = targetExpr.getName();
        const validTypes = ['point', 'point3d'];

        if (!validTypes.includes(sourceType)) {
            throw new Error(`change() source must be point or point3d, got: ${sourceType}`);
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
        const is3D = sourceExpr.getName() === 'point3d';

        let newExpr;
        if (is3D) {
            const numX = new NumericExpression(values[0]);
            const numY = new NumericExpression(values[1]);
            const numZ = new NumericExpression(values[2]);
            newExpr = new Point3DExpression([graphExpr, numX, numY, numZ]);
        } else {
            const numX = new NumericExpression(values[0]);
            const numY = new NumericExpression(values[1]);
            newExpr = new PointExpression([graphExpr, numX, numY]);
        }

        newExpr.resolve(context);
        context.updateReference(variableName, newExpr);
    }
}
