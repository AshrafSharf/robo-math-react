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
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import Vector3D = away.geom.Vector3D;
    import IIntersectable = robo.core.IIntersectable;
    import ITransformable = robo.core.ITransformable;

    export class LineExpression extends AbstractNonArithmeticExpression {

        public static NAME:string = "line";

         subExpressions:IBaseExpression[] = [];
         coordinates:number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2



        constructor(subExpressions:IBaseExpression[]) {

            super();
            this.subExpressions = subExpressions;
        }

        resolve(context:ExpressionContext):void {



            this.coordinates = [];

            for (var i:number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number = 0; j < atomicValues.length; j++) {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }


            if(this.coordinates.length==4){
                this.coordinates[4] = 0;//lst arg is to extedn line length
            }

            if (this.coordinates.length != 5) {
                this.dispatchError("The Line Expression allows max of 5 values including an optional length ");
            }


            // this.point =  Point.interpolate(pt2,pt1, ratio);

            if(this.coordinates[4]!=0)
                this.extendEndPoint();
        }


        private asVector():Point
        {
            var atomicValues:number[] = this.getVariableAtomicValues();

            //This is x2-x1 and y2-y1
            var vector:Point = new Point(atomicValues[2]-atomicValues[0],atomicValues[3]-atomicValues[1]);

            return vector;
        }


        private extendEndPoint(){

            var processingLine2D:ProcessingLine2D = new ProcessingLine2D(this.coordinates[0],this.coordinates[1],this.coordinates[2],this.coordinates[3]);

            var extraDistance:number = this.coordinates[4];
            var lineLength:number = processingLine2D.length();
            var normalizeLength:number = Math.abs(extraDistance)+lineLength;

            if(extraDistance>0)
            {
                var normalizedLine1:ProcessingLine2D = processingLine2D.normalize(normalizeLength);

                this.coordinates[2] = normalizedLine1.x2;
                this.coordinates[3] = normalizedLine1.y2;

            }else{

                var reverseLine2D:ProcessingLine2D = <ProcessingLine2D>processingLine2D.reverse();
                var normalizedLine2:ProcessingLine2D = reverseLine2D.normalize(normalizeLength);

                this.coordinates[0] = normalizedLine2.x2;
                this.coordinates[1] = normalizedLine2.y2;
            }


            return;

            var lineVector:Vector3D = new Vector3D(this.coordinates[2]-this.coordinates[0],this.coordinates[3]-this.coordinates[1]);
            var lineLength:number = lineVector.length;

            lineVector.normalize();

            var extraDistance:number = this.coordinates[4];

            lineVector.scaleBy(lineLength+extraDistance);


            var startVector:Vector3D =  new Vector3D(this.coordinates[0], this.coordinates[1]);

            var extendedVector:Vector3D = lineVector.add(startVector);

            this.coordinates[2] = extendedVector.x;
            this.coordinates[3] = extendedVector.y;
        }

        getName():string {

            return LineExpression.NAME;
        }

        public getVariableAtomicValues():number[] {

            return  this.coordinates.slice(0,4);// this expression clones the array as it is since slice is zero
        }

        //convient method
        public getLinePoints():Point[] {

            var pts:Point[] = [];

            pts[0] = new Point(this.coordinates[0], this.coordinates[1]);
            pts[1] = new Point(this.coordinates[2], this.coordinates[3]);

            return pts;
        }

        public getProcessingLine():ProcessingLine2D {

            var lineObj:ProcessingLine2D = new ProcessingLine2D(this.coordinates[0], this.coordinates[1], this.coordinates[2], this.coordinates[3]);

            return lineObj;
        }

        public getIntersectableObject():IIntersectable {

            return this.getProcessingLine();
        }

        public getStartValue():number[]{

            return [this.coordinates[0],this.coordinates[1]];
        }

        public getEndValue():number[]{

            return [this.coordinates[2],this.coordinates[3]];
        }

        public getTransformableExpression():IBaseExpression
        {
            return this;
        }

        public isTransformable():Boolean
        {
            return true;
        }

        public getTransformable():ITransformable
        {
            return  <ITransformable>this.getProcessingLine();
        }


    }
}
