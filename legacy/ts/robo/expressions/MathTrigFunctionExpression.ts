/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import PointExpression = robo.expressions.PointExpression;
    import NumericExxpression = robo.expressions.NumericExpression;
    import PMath = robo.util.PMath;


    export class MathTrigFunctionExpression extends NumericExpression {

        public functionName: string;
        public expressions: IBaseExpression[];

        public static TRIG_FUNCTIONS: string[] = ["sin", "cos", "tan", "cosec", "sec", "cot", "cosh", "sinh", "tanh"];
        public static INVERSE_TRIG_FUNCTIONS: string[] = ["asin", "acos", "atan"];
        public static DEGREE_MODE: boolean = true;
        public static DISCONTINIOUS_FUNCTIONS: string[] = [];

        constructor(functionName: string, expressions: IBaseExpression[]) {
            super(0); //not resolved yet
            this.expressions = expressions.slice(0);
            this.functionName = functionName;

        }

        resolve(context: ExpressionContext): void {
            var argValues: number[] = [];
            for (var i: number = 0; i < this.expressions.length; i++) {
                this.expressions[i].resolve(context);

                var atomicValues: number[] = this.expressions[i].getVariableAtomicValues();

                for (var j: number = 0; j < atomicValues.length; j++) {
                    if (this.isDiscontiniuousFunction()) {
                        this.dispatchError(" Function with discontinuities  not supported")
                    }

                    if (this.isTrigFunction()) {
                        argValues.push(this.convertTrigArgument(atomicValues[j])); // check and convert as  degree or radian..
                    } else {
                        argValues.push(atomicValues[j]);
                    }
                }

            }


            var result: number = Math[this.functionName].apply(Math, argValues);

            if (this.isInverseTrigFunction()) {
                result = PMath.degrees(result); // convert to degress
            }

            this.value = result;

        }


        getName(): string {
            return this.functionName;
        }


        private convertTrigArgument(angleValue: number): number {
            if (MathTrigFunctionExpression.DEGREE_MODE) {
                return PMath.radians(angleValue);
            }


            return angleValue;
        }


        private isTrigFunction(): boolean {
            if (MathTrigFunctionExpression.TRIG_FUNCTIONS.indexOf(this.functionName) >= 0) {
                return true;
            }


            return false;
        }


        private isDiscontiniuousFunction(): boolean {
            if (MathTrigFunctionExpression.DISCONTINIOUS_FUNCTIONS.indexOf(this.functionName) >= 0) {
                return true;
            }


            return false;
        }

        private isInverseTrigFunction(): boolean {
            if (MathTrigFunctionExpression.INVERSE_TRIG_FUNCTIONS.indexOf(this.functionName) >= 0) {
                return true;
            }

            return false;
        }


    }


}