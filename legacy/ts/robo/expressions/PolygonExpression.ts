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
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import IIntersectable = robo.core.IIntersectable;
    import ITransformable = robo.core.ITransformable;
    import ClipBuilder = robo.geom.ClipBuilder;
    import GraphSheet3D = robo.geom.GraphSheet3D;


    export class PolygonExpression extends AbstractNonArithmeticExpression {

        public static NAME:string = "polygon";

        public subExpressions:IBaseExpression[] = [];

        public coordinates:number[] = [];// gets populated  after calling resolve,

        public hasInnerPolgonalPoints:Boolean=false;

        private  static  INNER_POLY_TEST_COUNT:number=6;

        public static SMOOTH_LIMIT:number=50;//number of coordinate values




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

                /** simple check.. Any thing which has more than 6 atomic values is considered a polygonal expression **/
                for (var j:number = 0; j < atomicValues.length; j++) {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }

                if(atomicValues.length>=PolygonExpression.INNER_POLY_TEST_COUNT)
                {
                    this.hasInnerPolgonalPoints=true;
                }
            }

            if (this.coordinates.length <6) {
                this.dispatchError("The Polygon Expression should have three points. ");
                return;
            }

            if (this.coordinates.length % 2!=0) {
                this.dispatchError("The Polygon Expression missing 1 coordinate value ");
                return;
            }

            this.reducePointsIfRequired();

            this.joinPointsIfRequired();

        }

        private reducePointsIfRequired():void
        {

            if(this.coordinates.length > PolygonExpression.SMOOTH_LIMIT)
            {
                var points:Point[] =  this.getPoints();
                points = ClipBuilder.properRDP(points,0.016);// 0.016 is the model equilavalent of UIscale 0.8

                this.coordinates =[];

                for(var i:number=0;i<points.length;i++)
                {
                    this.coordinates[this.coordinates.length]=points[i].x;
                    this.coordinates[this.coordinates.length]=points[i].y;
                }

            }
        }

        private joinPointsIfRequired():void
        {
            if(this.hasInnerPolgonalPoints)
            return;

            var firstAtomicVal:number = this.coordinates[0];
            var secondAtomicVal:number = this.coordinates[1];

            var firstFromLast:number = this.coordinates[this.coordinates.length-1];
            var secondFromLast:number = this.coordinates[this.coordinates.length-2];

            if(firstAtomicVal==secondFromLast && secondAtomicVal == firstFromLast)
            {
                return;
            }

            //join

            this.coordinates[this.coordinates.length]=firstAtomicVal;
            this.coordinates[this.coordinates.length]=secondAtomicVal;


        }




        getName():string {

            return PolygonExpression.NAME;
        }

        public getVariableAtomicValues():number[] {

            return  this.coordinates.slice(0);// this expression clones the array as it is since slice is zero
        }

        public getPoints():Point[] {

            var pts:Point[] = [];

            for (var i:number = 0; i < this.coordinates.length; i=i+2) {

                pts.push(new Point(this.coordinates[i], this.coordinates[i+1]));
            }

            return pts;
        }


        public getStartValue():number[]{

            var firstPos:number = 0;
            return [this.coordinates[firstPos],this.coordinates[firstPos+1]];
        }


        public getEndValue():number[]{

            var lastPos:number = this.coordinates.length-1;
            return [this.coordinates[lastPos-1],this.coordinates[lastPos]];
        }

        public getIntersectableObject():IIntersectable {

            var processingPolygon2D:ProcessingPolygon2D = new ProcessingPolygon2D(this.getPoints());

            return processingPolygon2D;
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
            var processingPolygon2D:ProcessingPolygon2D = new ProcessingPolygon2D(this.getPoints());
            return  <ITransformable>processingPolygon2D;
        }





    }
}