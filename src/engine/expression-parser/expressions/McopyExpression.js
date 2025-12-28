/**
 * McopyExpression - Copies a TextItem to a target position with animation
 *
 * Original TextItem stays visible, a clone animates to the target position.
 *
 * Syntax:
 *   mcopy(T, P)           - Copy TextItem T to point P
 *   mcopy(T, T2)          - Copy TextItem T to TextItem T2's position
 *   mcopy(T, row, col)    - Copy TextItem T to logical coordinates (row, col)
 */
import { AbstractNonArithmeticExpression } from './AbstractNonArithmeticExpression.js';
import { CopyTextItemCommand } from '../../commands/CopyTextItemCommand.js';
import { KatexCopyTextItemCommand } from '../../commands/KatexCopyTextItemCommand.js';

export class McopyExpression extends AbstractNonArithmeticExpression {
    static NAME = 'mcopy';
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
            this.dispatchError('mcopy() requires at least 2 arguments');
        }

        // Arg 0: TextItem variable reference (required)
        const sourceExpr = this.subExpressions[0];
        sourceExpr.resolve(context);

        if (!sourceExpr.variableName) {
            this.dispatchError('mcopy() first argument must be a TextItem variable');
        }
        this.textItemVariableName = sourceExpr.variableName;

        // Detect if source is KaTeX by checking the expression that created the TextItem
        const textItemExpr = context.getReference(this.textItemVariableName);
        this.isKatexSource = this._isKatexExpression(textItemExpr);

        // Determine target type based on remaining arguments
        if (this.subExpressions.length === 2) {
            // mcopy(T, P) or mcopy(T, T2)
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
                this.dispatchError('mcopy() second argument must be a point or TextItem');
            }
        } else if (this.subExpressions.length >= 3) {
            // mcopy(T, row, col)
            const rowExpr = this.subExpressions[1];
            const colExpr = this.subExpressions[2];

            rowExpr.resolve(context);
            colExpr.resolve(context);

            const rowValues = rowExpr.getVariableAtomicValues();
            const colValues = colExpr.getVariableAtomicValues();

            if (rowValues.length === 0 || colValues.length === 0) {
                this.dispatchError('mcopy() row and col must be numbers');
            }

            this.targetType = 'logical';
            this.targetData = {
                row: rowValues[0],
                col: colValues[0]
            };
        }
    }

    getName() {
        return McopyExpression.NAME;
    }

    getVariableAtomicValues() {
        return [];
    }

    /**
     * Check if an expression originates from a KaTeX source
     */
    _isKatexExpression(expr) {
        if (!expr || !expr.sourceExpression) return false;
        return McopyExpression.KATEX_SOURCES.includes(expr.sourceExpression.getName());
    }

    toCommand(options = {}) {
        // Pass graphExpression separately like LineCommand does
        const graphExpression = this.targetData.graphExpression || null;

        if (this.isKatexSource) {
            return new KatexCopyTextItemCommand(
                this.textItemVariableName,
                this.targetType,
                this.targetData,
                graphExpression
            );
        }

        return new CopyTextItemCommand(
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
