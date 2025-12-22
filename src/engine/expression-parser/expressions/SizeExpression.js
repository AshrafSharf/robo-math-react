/**
 * SizeExpression - Scales g2d, mathtext, and g3d containers by width/height ratios
 *
 * Syntax:
 *   size(G, 0.5, 0.5)           - scale G to half width and height
 *   size(G, T, 2, 2)            - scale G and T to double size
 *   size(G, T, M, 1.5, 0.75)    - scale G, T, and M with different ratios
 *
 * The last two arguments are always widthRatio and heightRatio.
 * Ratios: 0.5 = half, 1 = no change, 2 = double
 * All preceding arguments are variable references to containers.
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { SizeCommand } from '../../commands/reposition/SizeCommand.js';

export class SizeExpression extends AbstractNonArithmeticExpression {
    static NAME = 'size';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.shapeVariableNames = [];
        this.widthRatio = 1;
        this.heightRatio = 1;
    }

    resolve(context) {
        if (this.subExpressions.length < 3) {
            this.dispatchError('size() requires at least 3 arguments: size(container, widthRatio, heightRatio)');
        }

        // Resolve all subexpressions
        for (const subExpr of this.subExpressions) {
            subExpr.resolve(context);
        }

        // Last two args are widthRatio and heightRatio
        const widthExpr = this._getResolvedExpression(context, this.subExpressions[this.subExpressions.length - 2]);
        const heightExpr = this._getResolvedExpression(context, this.subExpressions[this.subExpressions.length - 1]);

        // Get numeric values for ratios
        const widthValues = widthExpr.getVariableAtomicValues();
        const heightValues = heightExpr.getVariableAtomicValues();

        if (widthValues.length === 0 || heightValues.length === 0) {
            this.dispatchError('size(): widthRatio and heightRatio must be numeric values');
        }

        this.widthRatio = widthValues[0];
        this.heightRatio = heightValues[0];

        // Validate ratios are positive
        if (this.widthRatio <= 0 || this.heightRatio <= 0) {
            this.dispatchError('size(): ratios must be positive numbers');
        }

        // All preceding args are container variable references
        this.shapeVariableNames = [];
        for (let i = 0; i < this.subExpressions.length - 2; i++) {
            const subExpr = this.subExpressions[i];
            const resolved = this._getResolvedExpression(context, subExpr);

            // Get variable name for registry lookup
            const varName = subExpr.variableName || resolved.variableName;
            if (!varName) {
                this.dispatchError(`size(): argument ${i + 1} must be a variable reference to a g2d, mathtext, or g3d`);
            }

            // Validate type (g2d, mathtext, g3d)
            const typeName = resolved.getName ? resolved.getName() : null;
            const validTypes = ['g2d', 'mathtext', 'g3d'];
            if (typeName && !validTypes.includes(typeName)) {
                this.dispatchError(`size(): ${varName} must be a g2d, mathtext, or g3d (got: ${typeName})`);
            }

            this.shapeVariableNames.push(varName);
        }

        if (this.shapeVariableNames.length === 0) {
            this.dispatchError('size() requires at least one container variable');
        }
    }

    getName() {
        return SizeExpression.NAME;
    }

    getVariableAtomicValues() {
        return [this.widthRatio, this.heightRatio];
    }

    toCommand() {
        return new SizeCommand(this.shapeVariableNames, this.widthRatio, this.heightRatio);
    }

    canPlay() {
        return true;
    }
}
