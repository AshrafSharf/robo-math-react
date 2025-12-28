/**
 * MmoveExpression - Moves a TextItem to a target position with animation
 *
 * Original TextItem is hidden, a clone animates to the target position.
 *
 * Syntax:
 *   mmove(T, P)           - Move TextItem T to point P
 *   mmove(T, T2)          - Move TextItem T to TextItem T2's position
 *   mmove(T, row, col)    - Move TextItem T to logical coordinates (row, col)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { TextItemMoveToCommand } from '../../commands/TextItemMoveToCommand.js';
import { KatexTextItemMoveToCommand } from '../../commands/KatexTextItemMoveToCommand.js';

export class MmoveExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mmove';
    static KATEX_SOURCES = ['print', 'printonly', 'printwithout'];

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
        this.isKatexSource = false;  // Detected during resolve
    }

    resolve(context) {
        if (this.subExpressions.length < 2) {
            this.dispatchError('mmove() requires at least 2 arguments');
        }

        // Arg 0: TextItem variable reference (required)
        const sourceExpr = this.subExpressions[0];
        sourceExpr.resolve(context);

        if (!sourceExpr.variableName) {
            this.dispatchError('mmove() first argument must be a TextItem variable');
        }
        this.textItemVariableName = sourceExpr.variableName;

        // Detect if source is KaTeX by checking the expression that created the TextItem
        const textItemExpr = context.getReference(this.textItemVariableName);
        this.isKatexSource = this._isKatexExpression(textItemExpr);

        // Determine target type based on remaining arguments
        if (this.subExpressions.length === 2) {
            // mmove(T, P) or mmove(T, T2)
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
                this.dispatchError('mmove() second argument must be a point or TextItem');
            }
        } else if (this.subExpressions.length >= 3) {
            // mmove(T, row, col)
            const rowExpr = this.subExpressions[1];
            const colExpr = this.subExpressions[2];

            rowExpr.resolve(context);
            colExpr.resolve(context);

            const rowValues = rowExpr.getVariableAtomicValues();
            const colValues = colExpr.getVariableAtomicValues();

            if (rowValues.length === 0 || colValues.length === 0) {
                this.dispatchError('mmove() row and col must be numbers');
            }

            this.targetType = 'logical';
            this.targetData = {
                row: rowValues[0],
                col: colValues[0]
            };
        }
    }

    getName() {
        return MmoveExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Check if an expression originates from a KaTeX source
     */
    _isKatexExpression(expr) {
        if (!expr || !expr.sourceExpression) return false;
        return MmoveExpression.KATEX_SOURCES.includes(expr.sourceExpression.getName());
    }

    toCommand(options = {}) {
        // Pass graphExpression separately like LineCommand does
        const graphExpression = this.targetData.graphExpression || null;

        if (this.isKatexSource) {
            return new KatexTextItemMoveToCommand(
                this.textItemVariableName,
                this.targetType,
                this.targetData,
                graphExpression
            );
        }

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
