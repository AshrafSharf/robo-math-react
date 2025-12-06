/**
 * Created by MohammedAzeem on 4/8/14.
 */

module robo.expressions {


    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import PointExpression = robo.expressions.PointExpression;
    import NumericExpression = robo.expressions.NumericExpression;
    import Point = away.geom.Point;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import Vector3D = away.geom.Vector3D;
    import MathSystem = robo.util.MathSystem;
    import PMath = robo.util.PMath;
    import Point3D =  robo.core.Point3D;
    import GraphSheet3D = robo.geom.GraphSheet3D; // soft ref

    export class FindAngleExpression extends AbstractArithmeticExpression
    {
        public static NAME:string = "findangle";
        private subExpressions:IBaseExpression[] = [];
        private coordinates:number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2
        private isPolyAngleExpression:boolean = false;

        constructor(subExpressions:IBaseExpression[])
        {
            super();
            this.subExpressions = subExpressions;
        }

        resolve(context:ExpressionContext):void {

            this.coordinates = [];
            this.isPolyAngleExpression = this.validateAngleExpressionInputs(context);

            if(this.isPolyAngleExpression)
                this.resolvePolyAngleExpression(context);
            else
                this.reolveFindAngleExpression(context);
        }

        reolveFindAngleExpression(context:ExpressionContext):void
        {
            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                var resultExpression:IBaseExpression = this.subExpressions[i];

                resultExpression.resolve(context);

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number=0; j < atomicValues.length; j++)
                {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }

            if(this.coordinates.length!=8)
            {
                this.dispatchError("The Find Angle Expression doesn't have atleast 8 coordinate values ");
            }
        }

        public validateAngleExpressionInputs(context:ExpressionContext):boolean
        {
            if(this.subExpressions.length!=1)
            {
                return false;
            }


            var firstExpression:IBaseExpression = this.subExpressions[0];
            var expressionName:string = firstExpression.getName();

            if(firstExpression.getName()==PolygonExpression.NAME)
            {
                return true;
            }


            if(expressionName==VariableReferenceExpression.NAME)
            {
                var variableExpression:VariableReferenceExpression = <VariableReferenceExpression>firstExpression;

                var variableName:string = variableExpression.getVariableName();

                var variableValueExpression:IBaseExpression = context.getReference(variableName);

                return (variableValueExpression.getName()==PolygonExpression.NAME) ? true : false;
            }

            return false;
        }


        resolvePolyAngleExpression(context:ExpressionContext):void
        {
            var variableExpression:IBaseExpression = this.subExpressions[0];

            variableExpression.resolve(context);

            var atomicValues:number[] = variableExpression.getVariableAtomicValues();

            for (var j:number=0; j < atomicValues.length; j++)
            {
                this.coordinates[this.coordinates.length] = atomicValues[j];
            }

        }


        getName():string
        {
            return FindAngleExpression.NAME;
        }

        //convient method
        public getInputPoints():Point[]
        {
            var pts:Point[] =[];
            var iterationLen:number = this.coordinates.length/2;

            for(var i:number=0;i<iterationLen;i++)
            {
                var index:number = i*2;

                pts[i]= new Point(this.coordinates[index],this.coordinates[index+1]);
            }
            return pts;
        }

        public getVariableAtomicValues():number[]
        {
            return  [this.getAngleInDegree()];// this expression clones the array as it is since slice is zero

        }

        public containsPolyAngleExpression():boolean{

            return this.isPolyAngleExpression;
        }

        //convient method
        public getAngleInDegree():number
        {

            var points:Point[] = this.getInputPoints();

            var fromPoint1:Point3D = this.getTranslatedPoint3D(points[0]);
            var toPoint1:Point3D =this.getTranslatedPoint3D(points[1]);
            var fromPoint2:Point3D =this.getTranslatedPoint3D(points[2]);
            var toPoint2:Point3D =this.getTranslatedPoint3D(points[3]);


            var intersecPt:Point = this.findIntersectinPt(fromPoint1,toPoint1,fromPoint2,toPoint2);
            var norm_line1:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint1,toPoint1,intersecPt);
            var norm_line2:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint2,toPoint2,intersecPt);

            var outputAngles:number[] = this.findFromAndToAngle(norm_line1,norm_line2);
            var from_angle = outputAngles[0];
            var to_angle = outputAngles[1];

            return Math.abs(to_angle-from_angle);


        }

        private getTranslatedPoint3D(point2d:Point):Point3D{

            var translatedPt:Point = GraphSheet3D.translatePointForGraphSheetOffset(point2d);
            return new Point3D(translatedPt.x,translatedPt.y);
        }
        private findIntersectinPt(fromPoint1:Point3D, toPoint1:Point3D, fromPoint2:Point3D, toPoint2:Point3D):Point{

            var line1:ProcessingLine2D = new ProcessingLine2D(fromPoint1.x, fromPoint1.y, toPoint1.x, toPoint1.y);
            var line2:ProcessingLine2D = new ProcessingLine2D(fromPoint2.x, fromPoint2.y, toPoint2.x, toPoint2.y);

            var intersecPt:Point = line1.intersectAsLine(line2);
            if(intersecPt==null)
            {
                intersecPt  = new Point(fromPoint1.x,fromPoint1.y);
            }
            return intersecPt;
        }
        private getLineFromIntersectPt(fromPoint:Point3D, toPoint:Point3D,intersecPt:Point):ProcessingLine2D{

            var line1:ProcessingLine2D=new ProcessingLine2D(intersecPt.x,intersecPt.y,fromPoint.x, fromPoint.y);

            var line2:ProcessingLine2D=new ProcessingLine2D(intersecPt.x,intersecPt.y,toPoint.x, toPoint.y);

            var outputLine:ProcessingLine2D=line1;

            if(outputLine.length()<line2.length()){

                outputLine=line2;
            }
            return outputLine;
        }

        private findFromAndToAngle(norm_line1:ProcessingLine2D,norm_line2:ProcessingLine2D):number[]{

            //from angle
            var lineAngle1:number = norm_line1.angle();
            var lineAngle2:number = norm_line2.angle();

            lineAngle1 = PMath.degrees(lineAngle1);
            lineAngle2 = PMath.degrees(lineAngle2);

            var diffBetAngle:number = Math.abs(Math.abs(lineAngle2)-Math.abs(lineAngle1));

            if(diffBetAngle>180){

                if(lineAngle1>180 && lineAngle1!=0){

                    lineAngle1=lineAngle1-360;
                }

                if(lineAngle2>180 && lineAngle2!=0){

                    lineAngle2=lineAngle2-360;
                }
            }
            return [lineAngle1,lineAngle2];
        }
        public  equals(other:IBaseExpression):boolean
        {
            return false;

        }
    }
}
