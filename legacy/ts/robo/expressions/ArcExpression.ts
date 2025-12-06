/**
 * Created by Mathdisk on 3/23/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import Point = away.geom.Point;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import PMath = robo.util.PMath;
    import IIntersectable = robo.core.IIntersectable;
    import ITransformable = robo.core.ITransformable;


    export class ArcExpression extends AbstractNonArithmeticExpression {
        public static NAME: string = "arc";
        private subExpressions: IBaseExpression[] = [];
        private coordinates: number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2

        constructor(subExpressions: IBaseExpression[]) {

            super();
            this.subExpressions = subExpressions;
        }

        resolve(context: ExpressionContext): void {

            this.coordinates = [];

            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                var resultExpression: IBaseExpression = this.subExpressions[i];

                var atomicValues: number[] = resultExpression.getVariableAtomicValues();

                for (var j: number = 0; j < atomicValues.length; j++) {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }

            if (this.coordinates.length != 5 && this.coordinates.length != 8) {
                this.dispatchError("The Arc Expression doesn't have 5 or 8 coordinate values ");
            }
        }

        getName(): string {

            return ArcExpression.NAME;
        }

        public getVariableAtomicValues(): number[] {

            return this.coordinates.slice(0);// this expression clones the array as it is since slice is zero
        }

        //convient method


        public getInputCoordinates(): number[] {
            return this.coordinates;
        }


        public getOriginPoint(): Point {
            var originPt: Point = new Point(this.coordinates[0], this.coordinates[1]);
            return originPt;
        }


        //convient method
        public getArcRadius(): number {
            var arcRadius: number = this.coordinates[2];
            return arcRadius;
        }

        //convient method
        public getArcAngles(): number[] {
            var angles: number[] = [];

            angles[0] = this.coordinates[3];
            angles[1] = this.coordinates[4];

            return angles;
        }


        public getProcessingCircle(preserveAngle: boolean = false): ProcessingCircle {
            return ProcessingCircle.fromAtomicValues(this.coordinates, preserveAngle);
        }


        public getIntersectableObject(): IIntersectable {

            return this.getProcessingCircle();
        }

        public getStartValue(): number[] {

            var donotAddOffset: boolean = true;//todo
            var processingCircle: ProcessingCircle = this.getProcessingCircle(donotAddOffset);

            return processingCircle.getStartValue();
        }

        public getEndValue(): number[] {

            var preserveAngle: boolean = true;//todo
            var processingCircle: ProcessingCircle = this.getProcessingCircle(preserveAngle);

            return processingCircle.getEndValue();
        }

        public getTransformableExpression(): IBaseExpression {
            return this;
        }

        public isTransformable(): Boolean {
            return true;
        }

        public getTransformable(): ITransformable {
            return <ITransformable>this.getProcessingCircle(true);
        }

        // trace(arc(point(0,0),3,0,90))

        public getTraceableCoordinates(): number[]
        {  var coordinates = [];

            var origin: Point = this.getOriginPoint();
            var radius = this.getArcRadius();

            var startAngle = this.coordinates[3];
            var endAngle = this.coordinates[3] + this.coordinates[4];
            var stepSize = 0.3;
            for (var angle = startAngle; angle <= endAngle; angle += stepSize) {
                var x = origin.x + radius * Math.cos(PMath.radians(angle));
                var y = origin.y + radius * Math.sin(PMath.radians(angle));

                coordinates.push(x);
                coordinates.push(y);
            }
            return coordinates;
        }

    }
}