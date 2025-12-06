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
    import IIntersectable = robo.core.IIntersectable;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import ITransformable = robo.core.ITransformable;

    export class TraceExpression extends PolygonExpression {

        public static NAME: string = "trace";
        private splineCurve: ProcessingSpline2D = null;
        private inputPoints: Point[] = [];


        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);
        }

        resolve(context: ExpressionContext): void {
            var expressionLength: number = this.subExpressions.length;
            this.drawByExplictPoints(context);
        }


        private drawByExplictPoints(context: ExpressionContext): void {
            this.coordinates = [];
            var inputValues: number[] = [];

            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                var resultExpression: IBaseExpression = this.subExpressions[i];

                var atomicValues: number[] = resultExpression.getTraceableCoordinates();

                for (var j: number = 0; j < atomicValues.length; j++) {
                    inputValues[inputValues.length] = atomicValues[j];
                }
            }

            if (inputValues.length < 4) {
                this.dispatchError("The trace expression should have  atleast two points. ");
                return;
            }

            if (inputValues.length % 2 != 0) {
                this.dispatchError("The trace expression missing a coordinate value ");
                return;
            }

            var index: number = 0;
            for (var i: number = 0; i < inputValues.length; i += 2) {
                this.inputPoints[index++] = new Point(inputValues[i], inputValues[i + 1]);
            }

            this.splineCurve = new ProcessingSpline2D(this.inputPoints);
            this.coordinates = this.splineCurve.getAsAtomicValues();
        }

        getName(): string {

            return TraceExpression.NAME;
        }

        public getIntersectableObject(): IIntersectable {
            this.validateSpline();
            return this.splineCurve;
        }

        public getTransformable(): ITransformable {
            this.validateSpline();
            return <ITransformable>this.splineCurve;
        }


        public getSplineCurve(): ProcessingSpline2D {
            this.validateSpline();
            return this.splineCurve;
        }

        validateSpline() {
            if (!this.splineCurve) {
                this.dispatchError("Not a valid Expression, Trace Not Generated");
            }

        }

    }
}