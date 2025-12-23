/**
 * Strategy for animating 2D and 3D vectors
 */
import { ChangeStrategy } from './ChangeStrategy.js';
import { VectorExpression } from '../../expression-parser/expressions/VectorExpression.js';
import { Vector3DExpression } from '../../expression-parser/expressions/3d/Vector3DExpression.js';
import { NumericExpression } from '../../expression-parser/expressions/NumericExpression.js';

export class VectorStrategy extends ChangeStrategy {
    validate(sourceExpr, targetExpr) {
        const sourceType = sourceExpr.getName();
        const targetType = targetExpr.getName();
        const validTypes = ['vector', 'vector3d'];

        if (!validTypes.includes(sourceType)) {
            throw new Error(`change() source must be vector or vector3d, got: ${sourceType}`);
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
        const is3D = sourceExpr.getName() === 'vector3d';

        let newExpr;
        if (is3D) {
            // vector3d: [x1, y1, z1, x2, y2, z2]
            const nums = values.map(v => new NumericExpression(v));
            newExpr = new Vector3DExpression([graphExpr, ...nums]);
        } else {
            // vector: [x1, y1, x2, y2]
            const nums = values.map(v => new NumericExpression(v));
            newExpr = new VectorExpression([graphExpr, ...nums]);
        }

        newExpr.resolve(context);
        context.updateReference(variableName, newExpr);
    }
}
