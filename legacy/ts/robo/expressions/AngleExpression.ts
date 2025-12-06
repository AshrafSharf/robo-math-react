/**
 * Created by MohammedAzeem on 3/29/14.
 */

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
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import Vector3D = away.geom.Vector3D;

    export class AngleExpression extends AbstractNonArithmeticExpression
    {
        public static NAME:string = "angle";
        private subExpressions:IBaseExpression[] = [];
        private coordinates:number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2

        constructor(subExpressions:IBaseExpression[])
        {
            super();
            this.subExpressions = subExpressions;
        }

        resolve(context:ExpressionContext):void {

            this.coordinates =[];

            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];
                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number=0; j < atomicValues.length; j++)
                {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }

            //last arg is optional, so add zero if doesnot exist
            if(this.coordinates.length==5)
                this.coordinates[this.coordinates.length] = 0;

            if(this.coordinates.length!=6)
            {
                this.dispatchError("The Angle Expression doesn't have 6 coordinate values ");
            }
        }

        getName():string
        {
            return AngleExpression.NAME;
        }

        public getVariableAtomicValues():number[]
        {

            var fromPoint:Point=new Point(this.coordinates[0],this.coordinates[1]);
            var toPoint:Point=new Point(this.coordinates[2],this.coordinates[3]);
            var angleToMeasure:number=this.coordinates[4];
            var linePosRatio:number=this.coordinates[5];
            var rotatedPoint:Point=this.calculateRotatedPointFromBaseLine(fromPoint,toPoint,linePosRatio,angleToMeasure);

            return  [rotatedPoint.x,rotatedPoint.y];
        }

        //convient method
        public getLinePoints():Point[]
        {
            var pts:Point[] =[];

            pts[0]= new Point(this.coordinates[0],this.coordinates[1]);
            pts[1]= new Point(this.coordinates[2],this.coordinates[3]);

            return pts;
        }

        public getAngleToMeasure():number
        {
           return this.coordinates[4];
        }

        public getPositionRatio():number
        {
            var posRatio:number = this.coordinates[5];
            posRatio = Math.max(0,posRatio);
            posRatio = Math.min(1,posRatio);

            return posRatio;
        }


        private calculateRotatedPointFromBaseLine( fromPoint:Point, toPoint:Point, lineratio:number,angle:number):Point
        {


            angle = angle;

            var line2d1:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);

            if(line2d1.length()!=0)
            {
                line2d1=line2d1.normalize(line2d1.length()*lineratio);
            }
            var protectorOrgin:Vector3D=new Vector3D(line2d1.x2,line2d1.y2,0);
            var midPoint:Vector3D= new Vector3D(protectorOrgin.x,protectorOrgin.y,protectorOrgin.z);


            var radius:number = 3.5;//protractor length/2 - almost fixed
            var rad_diff:number = 0.2* radius;


            var linevector:Vector3D=new Vector3D(toPoint.x-fromPoint.x,toPoint.y-fromPoint.y);
            linevector.normalize();
            linevector.scaleBy(radius+2*rad_diff);

            var startpt:Vector3D=midPoint.clone();
            var endpoint:Vector3D=startpt.add(linevector);

            if(lineratio>0.5)
                angle=180-angle;

            var proMarkPt:Point = Geometric2DUtil.rotatePoint(angle,endpoint.x,endpoint.y,midPoint.x,midPoint.y);
            return proMarkPt;
        }

    }


}
