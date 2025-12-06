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

    export class FadeExpression extends AbstractNonArithmeticExpression {

        public static NAME: string = "fade";

        public subExpressions: IBaseExpression[] = [];

        public fadeExpressionLabels: string[] = [];

        private alphaValue: number = -1;
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
                    this.fadeExpressionLabels.push(resultExpression.getVariableName());
                } else {
                    this.determineTransparencyValue(this.subExpressions[i]);
                    if(this.alphaValue < 0) {
                        this.dispatchError("Fade value must be greater than zero");
                    }

                    // Optional thickness
                    this.determineThicknessValue(this.subExpressions[i+1]);
                    break;
                }
            }

            if (this.fadeExpressionLabels.length == 0) {
                this.dispatchError("Fade expression must refer existing label of shape");
                return;
            }

        }

        private determineTransparencyValue(expression: IBaseExpression): void {
            var atmoicValues: number[] = expression.getVariableAtomicValues();
            if (atmoicValues.length == 1) {
                this.alphaValue = atmoicValues[0];
            }
        }

        private determineThicknessValue(expression: IBaseExpression): void {
            if(expression) {
                var atmoicValues: number[] = expression.getVariableAtomicValues();
                if (atmoicValues.length == 1) {
                    this.thickness = atmoicValues[0];
                }
            }
        }

        getName(): string {
            return FadeExpression.NAME;
        }

        getExpressionLabels(): string[] {
            return this.fadeExpressionLabels.slice(0);
        }

        getAlphaValue(): number {
            return this.alphaValue;
        }
        public equals(other: IBaseExpression): boolean {
          return false;
        }

        alwaysExecute():boolean {
            return true;
        }

    }
}
