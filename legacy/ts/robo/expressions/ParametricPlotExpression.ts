/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import PointExpression = robo.expressions.PointExpression;
    import NumericExpression = robo.expressions.NumericExpression;
    import Point = away.geom.Point;
    import Point3D = robo.core.Point3D;
    import IIntersectable = robo.core.IIntersectable;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import ITransformable = robo.core.ITransformable;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import MathTrigFunctionExpression = robo.expressions.MathTrigFunctionExpression;
    import ProcessingParametricGraphTrace = robo.core.ProcessingParametricGraphTrace;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;


    declare var math;

    // https://stackoverflow.com/questions/43388716/the-correct-way-to-graph-of-a-function-on-html5-canvas

    export class ParametricPlotExpression extends PolygonExpression {

        public static NAME: string = "para";
        private splineCurve: ProcessingSpline2D = null;
        private inputPoints: Point[] = [];

        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);
        }

        resolve(context: ExpressionContext): void {
            if (this.isParametricExpression(context) == true) {
                this.drawAsParametricGraph(context);
                return;
            }

            this.dispatchError("Needs 2 expressions and each expression must be a quoted string like \"sin(x)\" ");

        }

        private checkIfGraphExpression(expression: IBaseExpression, context: ExpressionContext): boolean {
            if (expression.getName() == QuotedStringExpression.NAME) {
                return true;
            }
            return false;
        }


        private isParametricExpression(context: ExpressionContext): boolean {

            if (!(this.subExpressions.length >= 2)) {
                return false;
            }
            return this.checkIfGraphExpression(this.subExpressions[0], context) && this.checkIfGraphExpression(this.subExpressions[1], context);
        }

        private drawAsParametricGraph(context: ExpressionContext): void {
            MathTrigFunctionExpression.DEGREE_MODE = true;

            try {
                this.coordinates = [];

                var graphingExpression1: IBaseExpression = this.subExpressions[0];
                var graphingExpression2: IBaseExpression = this.subExpressions[1];

                var minValue: number = 0
                var maxValue: number = 2 * Math.PI;

                if (this.subExpressions.length > 2) {
                    this.subExpressions[2].resolve(context);
                    minValue = this.subExpressions[2].getVariableAtomicValues()[0];
                }

                if (this.subExpressions.length > 3) {
                    this.subExpressions[3].resolve(context);
                    maxValue = this.subExpressions[3].getVariableAtomicValues()[0];
                }

                var stepSize = 0.1;

                if (this.subExpressions.length > 4) {
                    this.subExpressions[4].resolve(context);
                    stepSize = this.subExpressions[4].getVariableAtomicValues()[0];
                }

                var diff = Math.abs(maxValue - minValue);
                if (diff < 0.001) {
                    this.dispatchError(" Distance between Max and Min is too small");
                    return;
                }

                if (stepSize <= 0) {
                    this.dispatchError(" Step Size Should be Greater than 0");
                    return;
                }


                var range: number = (maxValue - minValue);

                if (range <= 0) {
                    this.dispatchError(" Max Should be greater than Min");
                    return;
                }

                var totalSteps = range / stepSize;
                if (totalSteps > 1000) {
                    this.dispatchError(" Too many steps for the GraphSheet to draw, change the min, max or step");
                }

                var polarParamValues: number[] = [];
                for (var inputValue: number = minValue; inputValue <= maxValue; inputValue += stepSize) {
                    polarParamValues[polarParamValues.length] = inputValue;
                }
                polarParamValues[polarParamValues.length] = maxValue;

                var xValues: number[] = this.evaluateFunction(<QuotedStringExpression>graphingExpression1, polarParamValues, context);
                var yValues: number[] = this.evaluateFunction(<QuotedStringExpression>graphingExpression2, polarParamValues, context);
                for (var i: number = 0; i < xValues.length; i++) {
                    this.inputPoints[i] = new Point(xValues[i], yValues[i]);
                }

                this.splineCurve = new ProcessingParametricGraphTrace(graphingExpression1, graphingExpression2, "t", context.getReferencesCopyAsPrimivitiveValues(), this.inputPoints, 10, false);// Dont reduce Smoothing
                this.coordinates = this.splineCurve.getAsAtomicValues();
            } catch (error) {
                MathTrigFunctionExpression.DEGREE_MODE = true;
                throw error;
            }
        }


        private evaluateFunction(graphingExpression: QuotedStringExpression, polarParamValues: number[], context: ExpressionContext): number[] {
            var variableName: string = 't';
            var compiledExpression;

            try {
                var expressionString = graphingExpression.getComment();
                compiledExpression = math.compile(expressionString);
            } catch (e) {
                this.dispatchError(" Invalid Expression, Check if you have the parameter 't' ");
            }

            var scope = context.getReferencesCopyAsPrimivitiveValues();

            var paramOutputValues: number[] = [];
            for (var valueIndex: number = 0; valueIndex < polarParamValues.length; valueIndex++) {
                var value: number = polarParamValues[valueIndex];
                scope[variableName] = value; //
                paramOutputValues[paramOutputValues.length] = compiledExpression.eval(scope);
            }

            return paramOutputValues;
        }


        getName(): string {
            return ParametricPlotExpression.NAME;
        }


        public getSplineCurve(): ProcessingSpline2D {
            this.validateSpline();
            return this.splineCurve;
        }


        validateSpline() {
            if (!this.splineCurve) {
                this.dispatchError("Not a valid Expression, The expression must be a quoted string like \"sin(x)\" ");
            }

        }

        public getTransformable(): ITransformable {
            this.validateSpline();
            return <ITransformable>this.splineCurve;
        }

    }
}