/**
 * MoveToExpression - Moves a TextItem to a target position
 *
 * Syntax:
 *   moveto(T, P)           - Move TextItem T to point P (uses point's view coords + grapher position)
 *   moveto(T, T2)          - Move TextItem T to TextItem T2's position
 *   moveto(T, row, col)    - Move TextItem T to logical coordinates (row, col)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { TextItemMoveToCommand } from '../../commands/TextItemMoveToCommand.js';

export class MoveToExpression extends AbstractNonArithmeticExpression {
    static NAME = 'moveto';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        this.textItemVariableName = null;

        // Target can be one of:
        // - pointVariableName + graphVariableName (point on a graph)
        // - targetTextItemVariableName (another TextItem)
        // - row, col (logical coordinates)
        this.targetType = null;  // 'point', 'textitem', 'logical'
        this.targetData = {};
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('moveto() requires at least 2 arguments');
        }

        // Arg 0: TextItem variable reference (required)
        const sourceExpr = this.subExpressions[0];
        sourceExpr.resolve(context);

        if (!sourceExpr.variableName) {
            this.dispatchError('moveto() first argument must be a TextItem variable');
        }
        this.textItemVariableName = sourceExpr.variableName;

        // Determine target type based on remaining arguments
        if (this.subExpressions.length === 2) {
            // moveto(T, P) or moveto(T, T2)
            const targetExpr = this.subExpressions[1];
            targetExpr.resolve(context);

            // Check if it's an inline point expression like point(g, 2, 3)
            if (targetExpr.getName() === 'point') {
                this.targetType = 'point';
                this.targetData = {
                    pointExpression: targetExpr,
                    graphExpression: targetExpr.graphExpression
                };
            } else if (targetExpr.variableName) {
                // It's a variable reference - check what type
                const resolvedExpr = context.getReference(targetExpr.variableName);

                if (resolvedExpr && resolvedExpr.getName() === 'point') {
                    // It's a point variable
                    this.targetType = 'point';
                    this.targetData = {
                        pointVariableName: targetExpr.variableName,
                        graphExpression: resolvedExpr.graphExpression
                    };
                } else {
                    // Assume it's a TextItem
                    this.targetType = 'textitem';
                    this.targetData = {
                        targetTextItemVariableName: targetExpr.variableName
                    };
                }
            } else {
                this.dispatchError('moveto() second argument must be a point or TextItem');
            }
        } else if (this.subExpressions.length >= 3) {
            // moveto(T, row, col)
            const rowExpr = this.subExpressions[1];
            const colExpr = this.subExpressions[2];

            rowExpr.resolve(context);
            colExpr.resolve(context);

            const rowValues = rowExpr.getVariableAtomicValues();
            const colValues = colExpr.getVariableAtomicValues();

            if (rowValues.length === 0 || colValues.length === 0) {
                this.dispatchError('moveto() row and col must be numbers');
            }

            this.targetType = 'logical';
            this.targetData = {
                row: rowValues[0],
                col: colValues[0]
            };
        }
    }

    getName() {
        return MoveToExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    toCommand(options = {}) {
        // Pass graphExpression separately like LineCommand does
        const graphExpression = this.targetData.graphExpression || null;
        return new TextItemMoveToCommand(
            this.textItemVariableName,
            this.targetType,
            this.targetData,
            graphExpression
        );
    }

    canPlay() {
        return true;
    }
}
