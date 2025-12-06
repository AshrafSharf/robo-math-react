/**
 * Created by rizwan on 3/27/14.
 */
module robo.core {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Matrix = away.geom.Matrix;
    import Point = away.geom.Point;
    import PMath = robo.util.PMath;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ArrayHelper = robosys.lang.ArrayHelper;

    export class TransformablePoint implements IIntersectable,ITransformable
    {
        public static TRANSFORMABLE_TYPE:number=1;
        private sourcePoint:Point;

        constructor(x:number,y:number)
        {
            this.sourcePoint = new Point(x,y);
        }

        public intersect(object:IIntersectable):Point[]{

            return [];
        }

        public toFillableUIPoints(converter:any,points:Point[]):Point[] // converter is GraphSheet3D
        {
            return [];
        }

        public getTranslatedObject(translationFucn:Function):IIntersectable
        {
           var transPoint:Point =  translationFucn(this.sourcePoint);
            return new TransformablePoint(transPoint.x,transPoint.y)
        }

        public  asPolyPoints(stepSize:number=1):Point[]
        {
            return [];
        }


        public dilateTransform(scaleValue:number,dilateAbout:Point):ITransformable
        {
            var dilatedPt:Point = Geometric2DUtil.dilate(scaleValue,this.sourcePoint.x,this.sourcePoint.y,
                dilateAbout.x,dilateAbout.y);

            return new TransformablePoint(dilatedPt.x,dilatedPt.y);
        }

        public reflectTransform(point1:Point,point2:Point,ratio:number):ITransformable
        {
            var reflectedPoint:Point = Geometric2DUtil.reflect(this.sourcePoint.x,this.sourcePoint.y,
                point1.x,point1.y,point2.x,point2.y);

            var newStartPt:Point = Point.interpolate(reflectedPoint,this.sourcePoint,ratio);

            return new TransformablePoint(newStartPt.x,newStartPt.y);

        }

        public projectTransform(point1:Point,point2:Point,ratio:number):ITransformable
        {
            var projectedPoint:Point = Geometric2DUtil.project(this.sourcePoint.x,this.sourcePoint.y,
                point1.x,point1.y,point2.x,point2.y);

            var newProjectPt:Point = Point.interpolate(projectedPoint,this.sourcePoint,ratio);

            return new TransformablePoint(newProjectPt.x,newProjectPt.y);
        }


        public rotateTransform(angleInDegress:number,rotateAbout:Point):ITransformable
        {
            var rotatedPt:Point = Geometric2DUtil.rotatePoint(angleInDegress,this.sourcePoint.x,this.sourcePoint.y,
                rotateAbout.x,rotateAbout.y);

            return new TransformablePoint(rotatedPt.x,rotatedPt.y);
        }

        public translateTransform(tranValue:Point,tranAbout:Point):ITransformable
        {
            var translatePoint:Point = Geometric2DUtil.translatePoint(this.sourcePoint.x,this.sourcePoint.y,
                tranValue.x,tranValue.y,tranAbout.x,tranAbout.y);

            return new TransformablePoint(translatePoint.x,translatePoint.y);
        }

        public getAsAtomicValues():number[]
        {
            return  [this.sourcePoint.x,this.sourcePoint.y];
        }

        public getSourcePoint():Point{

            return this.sourcePoint;
        }

       public translatePointForGraphSheetOffset(transformaterFunction:Function):ITransformable
        {
            var newSourcePoint:Point = transformaterFunction(this.sourcePoint);
            return new TransformablePoint(newSourcePoint.x,newSourcePoint.y);

        }

       public  reverseTranslatePointForGraphSheetOffset(transformaterFunction:Function):ITransformable
        {

            var newSourcePoint:Point = transformaterFunction(this.sourcePoint);
            return new TransformablePoint(newSourcePoint.x,newSourcePoint.y);
        }

        public getType():number
        {
            return TransformablePoint.TRANSFORMABLE_TYPE;
        }

        public getStartValue():number[]
        {
            return [this.sourcePoint.x,this.sourcePoint.y];
        }

        public getEndValue():number[]
        {
            return [this.sourcePoint.x,this.sourcePoint.y];
        }


        public getLabelPosition():Point
        {
            var newSourcePoint:Point = this.getSourcePoint();

            var offsetVal:number = 0.40;
            return new Point(newSourcePoint.x+offsetVal,newSourcePoint.y+offsetVal);
        }

        public positionIndex(index:number):Point
        {
            if(index==1)
            {
                return this.sourcePoint.clone();
            }
            return null;
        }


        public reverse():ITransformable
        {
            return new TransformablePoint(-this.sourcePoint.x,-this.sourcePoint.y);
        }
    }

}