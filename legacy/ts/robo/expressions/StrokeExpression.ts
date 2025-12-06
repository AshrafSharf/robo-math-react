/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {
    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point = away.geom.Point;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;

    export class StrokeExpression extends AbstractNonArithmeticExpression {

        public static NAME: string = "stroke";

        public subExpressions: IBaseExpression[] = [];
        public shapeExpressionLabels: string[] = [];
        private thickness: number = 1;


        constructor(subExpressions: IBaseExpression[]) {
            super();
            this.subExpressions = subExpressions;
        }

        resolve(context: ExpressionContext): void {
            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                if (this.subExpressions[i].getName() == VariableReferenceExpression.NAME) {
                    var resultExpression: VariableReferenceExpression = <VariableReferenceExpression>this.subExpressions[i];
                    this.shapeExpressionLabels.push(resultExpression.getVariableName());
                } else {
                    this.determineThicknessValue(this.subExpressions[i]);
                    if(this.thickness < 0) {
                        this.dispatchError("Fade value must be greater than zero");
                    }
                    break;
                }
            }

            if (this.shapeExpressionLabels.length == 0) {
                this.dispatchError("Stroke expression must refer existing label of shape");
                return;
            }

        }

        private determineThicknessValue(expression: IBaseExpression): void {
            var atmoicValues: number[] = expression.getVariableAtomicValues();
            if (atmoicValues.length == 1) {
                this.thickness = atmoicValues[0];
            }
        }

        getName(): string {
            return StrokeExpression.NAME;
        }

        getExpressionLabels(): string[] {
            return this.shapeExpressionLabels.slice(0);
        }

        getThickness(): number {
            return this.thickness;
        }
        public equals(other: IBaseExpression): boolean {
          return false;
        }

        alwaysExecute():boolean {
            return true;
        }

    }
}
