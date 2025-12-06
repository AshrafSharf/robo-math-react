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
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import Vector3D = away.geom.Vector3D;
    import IIntersectable = robo.core.IIntersectable;
    import ITransformable = robo.core.ITransformable;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import GraphSheet3D = robo.geom.GraphSheet3D; // soft ref


    /**
     * dash(0,0,4,5)
     */
    export class DashLineExpression extends AbstractNonArithmeticExpression {

        public static NAME: string = "dash";
        subExpressions: IBaseExpression[] = [];
        coordinates: number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2
        processingPointPair2D: ProcessingPointPair2D = null;
        private onLength: number = 0.5
        private offLength: number = 0.5
        private allValues = [];


        constructor(subExpressions: IBaseExpression[]) {

            super();
            this.subExpressions = subExpressions;
        }

        resolve(context: ExpressionContext): void {
            this.coordinates = [];

            var collectedValues = [];
            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                var resultExpression: IBaseExpression = this.subExpressions[i];

                var atomicValues: number[] = resultExpression.getVariableAtomicValues();

                for (var j: number = 0; j < atomicValues.length; j++) {
                    collectedValues[collectedValues.length] = atomicValues[j];
                }
            }


            if (collectedValues.length < 4) {
                this.dispatchError("The Dash Expression must have at least 4 coordinate values");
            }

            for (var j: number = 0; j < 4; j++) {
                this.coordinates.push(collectedValues[j])
            }

            if (collectedValues[4]) {
                this.onLength = collectedValues[4]
            }

            if (this.onLength < 0) {
                this.dispatchError("Dash Length Must be Positive");
            }

            if (collectedValues[5]) {
                this.offLength = collectedValues[5]
            }

            if (this.offLength < 0) {
                this.dispatchError("Dash Gap Length Must be Positive");
            }

            var modelPointPairs = this.dashLine(this.coordinates[0], this.coordinates[1],
                this.coordinates[2], this.coordinates[3], this.onLength, this.offLength);

            this.allValues = collectedValues.slice(0);

            this.processingPointPair2D = new ProcessingPointPair2D(modelPointPairs);

        }

        getName(): string {
            return DashLineExpression.NAME;
        }

        public getVariableAtomicValues(): number[] {
            return this.allValues.slice(0);
        }

        //convient method
        public getLinePoints(): Point[] {
            var pts: Point[] = [];
            pts[0] = new Point(this.coordinates[0], this.coordinates[1]);
            pts[1] = new Point(this.coordinates[2], this.coordinates[3]);
            return pts;
        }

        public getProcessingLine(): ProcessingLine2D {
            var lineObj: ProcessingLine2D = new ProcessingLine2D(this.coordinates[0],
                this.coordinates[1], this.coordinates[2], this.coordinates[3]);
            return lineObj;
        }

        public getIntersectableObject(): IIntersectable {
            return this.getProcessingLine();
        }

        public getStartValue(): number[] {
            return [this.coordinates[0], this.coordinates[1]];
        }

        public getEndValue(): number[] {
            return [this.coordinates[2], this.coordinates[3]];
        }

        public getTransformableExpression(): IBaseExpression {
            return this;
        }

        public isTransformable(): Boolean {
            return true;
        }

        public getTransformable(): ITransformable {
            return <ITransformable>this.processingPointPair2D
        }


        /**
         * Draws a straight line between the starting and ending points.
         * The line defaults to a solid line, but can also be a dashed line.
         * If dashed is false then the Graphics.lineTo()  is used.
         * @param start the starting point
         * @param end the end point
         * @param dashed if true then the line will be dashed
         * @param dashLength the length of the dash (only applies if dashed is true)
         */


        public dashLine(x1: number, y1: number, x2: number, y2: number,
                        onLength: number = 0, offLength: number = 0) {
            var modelPointPairs = [];
            var pt = {
                start: new Point3D(x1, y1, 0),
                end: new Point3D(0, 0, 0),
            }

            modelPointPairs.push(pt);
            if (offLength == 0) {
                pt.end = new Point3D(x2, y2, 0);
                return;
            }

            var dx: number = x2 - x1,
                dy: number = y2 - y1,
                lineLen: number = Math.sqrt(dx * dx + dy * dy),
                angle: number = Math.atan2(dy, dx),
                cosAngle: number = Math.cos(angle),
                sinAngle: number = Math.sin(angle),
                ondx: number = cosAngle * onLength,
                ondy: number = sinAngle * onLength,
                offdx: number = cosAngle * offLength,
                offdy: number = sinAngle * offLength,

                x: number = x1,
                y: number = y1;


            var fullDashCountNumber: number = Math.floor(lineLen / (onLength + offLength));

            for (var i: number = 0; i < fullDashCountNumber; i++) {
                pt.end = new Point3D(x += ondx, y += ondy, 0);
                pt = {
                    start: new Point3D(x += offdx, y += offdy, 0),
                    end: new Point3D(0, 0, 0)
                }
                modelPointPairs.push(pt);
            }

            var remainder: number = lineLen - ((onLength + offLength) * fullDashCountNumber);

            if (remainder >= onLength) {
                pt.end = new Point3D(x += ondx, y += ondy, 0);
            } else {
                pt.end = new Point3D(x2, y2, 0);
            }

            modelPointPairs.forEach((modelPointPais) => {
                GraphSheet3D.translateInlinePoint3DForGraphSheetOffset(modelPointPais.start);
                GraphSheet3D.translateInlinePoint3DForGraphSheetOffset(modelPointPais.end);
            })

            return modelPointPairs;

        }

        public equals(other: IBaseExpression): boolean {
            return false;
        }



    }
}
