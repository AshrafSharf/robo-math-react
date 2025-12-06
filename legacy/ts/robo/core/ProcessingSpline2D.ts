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
    import SplineCurve = THREE.Spline;
    import Point3D = robo.core.Point3D;


    export class ProcessingSpline2D implements IIntersectable,ITransformable
    {
        public static TRANSFORMABLE_TYPE:number = 5;
        public inputPoints:Point[] =[];
        public splineOutputPoints:Point[]=[];
        public smoothness:number=20;
        public splineCurve:SplineCurve;

        constructor(inputPoints:Point[],smoothness:number=20,explictSmoothCheck:boolean=true)
        {
            this.inputPoints = inputPoints;
            this.smoothness = smoothness;

            if(explictSmoothCheck && inputPoints.length>smoothness)
            {
                this.smoothness = 5;
            }

            this.calculateSplinePoints();
        }


        private calculateSplinePoints():void
        {
            var vect3Pts:THREE.Vector3[] = [];

            for(var i:number=0;i<this.inputPoints.length;i++)
            {
                var pt:Point = this.inputPoints[i];
                vect3Pts.push(new THREE.Vector3(pt.x,pt.y,0));
            }

             this.splineCurve = new THREE.Spline(vect3Pts);

            this.splineOutputPoints=[];

            for ( var i = 0; i < vect3Pts.length * this.smoothness; i ++ ) {

                var index = i / ( vect3Pts.length * this.smoothness );

                var position = this.splineCurve.getPoint( index );

                this.splineOutputPoints.push(new Point( position.x, position.y));
            }
        }


        public getInterpolatedPoint(interpolVal:number):Point
        {
            var position = this.splineCurve.getPoint( interpolVal );
            return new Point( position.x, position.y)
        }


        public intersect(object:IIntersectable):Point[]{

            return [];
        }


        public  asPolyPoints(arrayOfPointArray:any):void
        {
            arrayOfPointArray.push(this.splineOutputPoints);
        }




        public outPutAsPoint3D():Point3D[]
        {
            var point3ds:Point3D[]=[];
            var outputPts:Point[]= this.splineOutputPoints;
            for(var i:number=0;i<outputPts.length;i++)
            {
                var pt:Point =  outputPts[i];
                point3ds.push(new Point3D( pt.x, pt.y, 0 ));
            }

            return point3ds;

        }


        public toFillableUIPoints(converter:any,points:Point[]):Point[] // converter is GraphSheet3D
        {
            var uiPoints:Point[] =[];
            for(var i:number=0;i<points.length;i++)
            {
                var vect:Vector3D = converter.toUIVector(points[i].x,points[i].y,0);
                uiPoints.push(new Point(vect.x,vect.z));
            }
            return uiPoints;
        }



        public getTranslatedObject(translationFucn:Function):IIntersectable
        {
            var transPoints:Point[]=[];
            for(var i:number=0;i<this.inputPoints.length;i++)
            {
                transPoints[i]=translationFucn(this.inputPoints[i]);
            }

            var splineObj:ProcessingSpline2D = new ProcessingSpline2D(transPoints);
            return splineObj;
        }


        public  dilateTransform(scaleValue:number,dilateAbout:Point):ITransformable
        {
            var rotatedPts:Point[] = Geometric2DUtil.dilatePoints(scaleValue,this.inputPoints,
                dilateAbout.x,dilateAbout.y);

            return <ITransformable>new ProcessingSpline2D(rotatedPts);
        }

        public reflectTransform(point1:Point,point2:Point,ratio:number):ITransformable
        {
            var reflectedPts:Point[] = Geometric2DUtil.reflectPoints(this.inputPoints,
                point1.x,point1.y,point2.x,point2.y);

            var resultPts:Point[] = [];
            for(var i:number=0;i<reflectedPts.length;i++)
            {
                var sourcePoint:Point = this.inputPoints[i];
                var reflectedPt:Point = reflectedPts[i];

                var newStartPt:Point = Point.interpolate(reflectedPt,sourcePoint,ratio);
                resultPts[resultPts.length] = newStartPt;
            }
            return <ITransformable>new ProcessingSpline2D(resultPts);
        }

        public rotateTransform(angleInDegress:number,rotateAbout:Point):ITransformable
        {
            var rotatedPts:Point[] = Geometric2DUtil.rotatePoints(angleInDegress,this.inputPoints,
                rotateAbout.x,rotateAbout.y);

            return <ITransformable>new ProcessingSpline2D(rotatedPts);
        }

        public translateTransform(tranValue:Point,tranAbout:Point):ITransformable
        {
            var rotatedPts:Point[] = Geometric2DUtil.translatePoints(this.inputPoints,
                tranValue.x,tranValue.y,tranAbout.x,tranAbout.y);

            return <ITransformable>new ProcessingSpline2D(rotatedPts);
        }

        public getAsAtomicValues():number[]
        {
            var coordinates:number[]=[];

            for(var i:number=0;i<this.splineOutputPoints.length;i++)
            {
                coordinates[coordinates.length]=this.splineOutputPoints[i].x;
                coordinates[coordinates.length]=this.splineOutputPoints[i].y;
            }

            return  coordinates;
        }


        public translatePointForGraphSheetOffset(translationFucn:Function):ITransformable
        {
            var transPoints:Point[]=[];
            for(var i:number=0;i<this.inputPoints.length;i++)
            {
                transPoints[i]=translationFucn(this.inputPoints[i]);
            }

            var splineObj:ProcessingSpline2D = new ProcessingSpline2D(transPoints);
            return <ITransformable>splineObj;
        }

        public reverseTranslatePointForGraphSheetOffset(translationFucn:Function):ITransformable
        {
            var transPoints:Point[] = [];
            for(var i:number=0;i<this.splineOutputPoints.length;i++)
            {
                transPoints[i]=translationFucn(this.inputPoints[i]);
            }

            var splineObj:ProcessingSpline2D = new ProcessingSpline2D(transPoints);
            return <ITransformable>splineObj;
        }

        public getType():number
        {
            return ProcessingSpline2D.TRANSFORMABLE_TYPE;
        }

        public getStartValue():number[]
        {
            return [this.splineOutputPoints[0].x,this.splineOutputPoints[0].y];
        }

        public getEndValue():number[]
        {
            var lastIndex:number=this.splineOutputPoints.length-1;
            return [this.splineOutputPoints[lastIndex].x,this.splineOutputPoints[lastIndex].y];
        }

        public getLabelPosition():Point
        {
            var offsetVal:number = 0.25;
            return new Point();
        }

        public positionIndex(index:number):Point
        {
            if(index<=this.splineOutputPoints.length)
            {
                var point:Point = this.splineOutputPoints[index-1];
                return point;
            }
            return null;
        }

        public reverse():ITransformable
        {
            var newInputPoints:Point[]= this.inputPoints.slice(0).reverse();
            return new ProcessingSpline2D(newInputPoints);
        }
        public projectTransform(point1:Point,point2:Point,ratio:number):ITransformable
        {

            return null;
        }

        /**
         * returns array of parts
         * @param fromPointA
         * @param toPointB
         */
        excludeParts(firstAnchorPoint, secondAnchorPoint) {
            var allPoints = this.inputPoints;
            var firstIndex = this.getPointIndex(allPoints, firstAnchorPoint);
            var secondIndex = this.getPointIndex(allPoints, secondAnchorPoint);
            if (firstIndex > secondIndex) {
                var temp = secondIndex;
                secondIndex = firstIndex;
                firstIndex = temp;
            }
            return [
                ProcessingPointPair2D.fromPoints2(allPoints.slice(0, firstIndex + 1), []),
                ProcessingPointPair2D.fromPoints2(allPoints.slice(secondIndex, allPoints.length), [])
            ]
        }

        includeParts(firstAnchorPoint, secondAnchorPoint) {
            var allPoints =  this.inputPoints;
            var firstIndex = this.getPointIndex(allPoints, firstAnchorPoint);

            if( firstIndex < 0 || firstIndex > allPoints.length) {
                throw new Error(' The from Point doesnt lie on the arc')
            }
            var secondIndex = this.getPointIndex(allPoints, secondAnchorPoint);

            if( secondIndex < 0 || secondIndex > allPoints.length) {
                throw new Error(' The To Point doesnt lie on the arc')
            }

            if (firstIndex > secondIndex) {
                var temp = secondIndex;
                secondIndex = firstIndex;
                firstIndex = temp;
            }

            return [
                ProcessingPointPair2D.fromPoints2(allPoints.slice(firstIndex, secondIndex + 1), [])
            ]
        }

        getPointIndex(allPoints, anchorPoint) {
            for (var index = 0; index <= allPoints.length; index++) {
                var pt: Point = allPoints[index];
                if (PMath.isEqual(pt.x, anchorPoint.x) && PMath.isEqual(pt.y, anchorPoint.y)) {
                    return index;
                }
            }

            return -1;
        }

    }


}
