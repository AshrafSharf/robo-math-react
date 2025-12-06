/**
 * Created by MohammedAzeem on 4/15/14.
 */
/**
 * Created by MohammedAzeem on 3/31/14.
 */

module robo.expressions {


    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point = away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import PointExpression = robo.expressions.PointExpression;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;

    export class InterpolateExpression extends PointExpression {
        public static NAME: string = "interpolate";
        public coordinates: number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2

        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);
        }

        resolve(context: ExpressionContext): void {
            this.coordinates = [];

            // check if arc or polygon is given

            var startingExp = this.getVariableValueExp(context, this.subExpressions[0]);

            if ((startingExp.getName() == ArcExpression.NAME) || (startingExp.getName() == PolygonExpression.NAME)) {
                for (var j: number = 0; j < this.subExpressions.length; j++) {
                    this.subExpressions[j].resolve(context);
                }


                var numValues = this.subExpressions[1].getVariableAtomicValues();
                if (numValues.length != 1) {
                    this.dispatchError(" Arc or PolygonExpression interpolate must give ratio  ");
                    return
                }

                var ratio = this.subExpressions[1].getVariableAtomicValues()[0];
                if (ratio < 0 || ratio > 1) {
                    this.dispatchError(" Interpolate ratio for Arc or Polygon must be greater than(or equal) zero and less than 1 ");
                }

                var intersectableExp: any = startingExp.getIntersectableObject();
                this.point = intersectableExp.pointAtRatio(ratio);
                return;
            }


            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                var resultExpression: IBaseExpression = this.subExpressions[i];
                var atomicValues: number[] = this.getAtomicValues(context, resultExpression);

                for (var j: number = 0; j < atomicValues.length; j++) {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }
            this.interpolate();
        }

        private getVariableValueExp(context: ExpressionContext, expression: IBaseExpression): IBaseExpression {

            if (expression.getName() == VariableReferenceExpression.NAME) {
                var variableReferenceExpression: VariableReferenceExpression = <VariableReferenceExpression>expression;
                return context.getReference(variableReferenceExpression.getVariableName());
            }

            return expression;
        }


        //overrided by Start and End Expressions
        public getAtomicValues(context: ExpressionContext, resultExpression: IBaseExpression): number[] {

            return resultExpression.getVariableAtomicValues();
        }


        private interpolate(): void {
            this.point = new Point(0, 0);

            if (this.coordinates.length < 5) {
                this.dispatchError("Insufficient arguments for Interpolate ");
            }

            if (this.coordinates.length == 5) // This is interpolation between two points
            {
                var pt1: Point = new Point(this.coordinates[0], this.coordinates[1]);
                var pt2: Point = new Point(this.coordinates[2], this.coordinates[3]);
                var ratio: number = this.coordinates[4];

                this.point = Point.interpolate(pt2, pt1, ratio);

                return;
            }

            if (this.coordinates.length > 10)// This must be from Trace or Polygon (we will consider this as trace
            {
                var points: Point[] = [];

                var ratio: number = this.coordinates[this.coordinates.length - 1];

                ratio = Math.min(1, ratio);

                var index: number = 0;
                for (var i: number = 0; i < this.coordinates.length - 1; i += 2) {
                    points[index++] = new Point(this.coordinates[i], this.coordinates[i + 1]);
                }


                var splineCurve: ProcessingSpline2D = new ProcessingSpline2D(points);

                this.point = splineCurve.getInterpolatedPoint(ratio);

            }


        }

        getName(): string {
            return InterpolateExpression.NAME;
        }
    }
}
