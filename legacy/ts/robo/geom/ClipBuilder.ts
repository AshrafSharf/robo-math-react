/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.geom {

    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import IIntersectable = robo.core.IIntersectable;
    import Graphsheet3D=robo.geom.GraphSheet3D;
    import UI3DScript = robo.geom.UI3DScript;
    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import PMath = robo.util.PMath;
    import ISetItem = robo.polyclipping.ISetItem;
    import SimpleSetItem = robo.polyclipping.SimpleSetItem;
    import IntersectOperation = robo.polyclipping.IntersectOperation;
    import UnionOperation = robo.polyclipping.UnionOperation;
    import DifferenceOperation = robo.polyclipping.DifferenceOperation;
    import Clipper = robo.polyclipping.Clipper;
    import ClipOperation = robo.polyclipping.ClipOperation;
    import XOROperation = robo.polyclipping.XOROperation;
    import ClipResult = robo.polyclipping.ClipResult;

    export class ClipBuilder {

        public static  INTERSECTION:number = 0;
        public static  UNION:number = 1;
        public static  DIFFERENCE:number = 2;
        public static  XOR:number = 3;

        constructor() {

        }


        /** Updates the Clip Result's output Point Array **/

        public polyClip(clipResult:ClipResult):void {

            var arrayOfPointsArray:any = clipResult.inputArrayOfUIPointsArray;


            var arrayOfResultArray:any = [];// This is array of array

            if (arrayOfPointsArray.length > 1) {

                var points:Point[] = arrayOfPointsArray[0];

                var lhsItem:ISetItem = new SimpleSetItem(this.arrayToArrayHelper(points));

                for (var i:number = 1; i < arrayOfPointsArray.length; i++) {
                    var rhsPoints:Point[] = arrayOfPointsArray[i];
                    var rhsItem:ISetItem = new SimpleSetItem(this.arrayToArrayHelper(rhsPoints));

                    var clipOperation:ClipOperation = this.getOperationInstance(lhsItem, rhsItem, clipResult.clipType);

                    lhsItem = clipOperation.execute();


                }

                arrayOfResultArray = lhsItem.getMembers();

                arrayOfResultArray = this.reduceOutputPoints(arrayOfResultArray);

                this.joinEndPoints(arrayOfResultArray);

            }
            else {
                arrayOfResultArray = [];
                arrayOfResultArray.push(this.cloneArrayElements(arrayOfPointsArray[0]));
            }


            clipResult.outputArrayOfUIPointsArray = arrayOfResultArray;


        }



        private joinEndPoints(arrayOfResultArray:any):void {


            for (var i:number = 0; i < arrayOfResultArray.length; i++) {
                var points:Point[] = arrayOfResultArray[i];


                var XValue:number = points[0].x;
                var YValue:number = points[0].y;

                var lastXvalue:number = points[points.length - 1].x;
                var lastYValue:number = points[points.length - 1].y;

                if (XValue == lastYValue && YValue == lastXvalue) {
                    return;
                }

                //join

                points[points.length] = new Point(XValue, YValue);

            }


        }


        private reduceOutputPoints(arrayOfResultArray:any):any
        {

            var reducedPointsArrayOfResultArray:any=[];

            for (var i:number = 0; i < arrayOfResultArray.length; i++) {

                var points:Point[] = arrayOfResultArray[i];

                var reducedPoints = ClipBuilder.properRDP(points);

                reducedPointsArrayOfResultArray.push(reducedPoints);


            }


            return reducedPointsArrayOfResultArray;

        }

        /** NOT USED **/
        private arrayOfArrayToPointArray(arrayOfResultArray:any):Point[] {
            var allPoints:Point[] = [];

            for (var i:number = 0; i < arrayOfResultArray.length; i++) {
                allPoints = allPoints.concat(arrayOfResultArray[i]);

            }

            return allPoints;
        }

        /** NOT USED **/
        private  unionisePoints(arrayOfPointsArray:any):Point[] {
            var points:Point[] = arrayOfPointsArray[0];

            if (arrayOfPointsArray.length == 1) {
                arrayOfPointsArray.push(this.cloneArrayElements(arrayOfPointsArray[0]));

            }


            var lhsItem:ISetItem = new SimpleSetItem(this.arrayToArrayHelper(points));

            for (var i:number = 1; i < arrayOfPointsArray.length; i++) {
                var rhsPoints:Point[] = arrayOfPointsArray[i];
                var rhsItem:ISetItem = new SimpleSetItem(this.arrayToArrayHelper(rhsPoints));

                var clipOperation:ClipOperation = this.getOperationInstance(lhsItem, rhsItem, 1);

                lhsItem = clipOperation.execute();


            }


            var arrayOfResultArray:any = lhsItem.getMembers();

            var allPoints:Point[] = [];

            for (var i:number = 0; i < arrayOfResultArray.length; i++) {
                allPoints = allPoints.concat(arrayOfResultArray[i]);

            }

            return allPoints;


        }


        private cloneArrayElements(pts:Point[]):Point[] {
            var clonedPts:Point[] = [];

            for (var i:number = 0; i < pts.length; i++) {
                clonedPts.push(new Point(pts[i].x, pts[i].y));
            }


            return clonedPts;
        }

        private getOperationInstance(lhsItem:ISetItem, rhsItem:ISetItem, clipType:number):ClipOperation {

            if (clipType == ClipBuilder.UNION) {
                return new UnionOperation(lhsItem, rhsItem);
            }

            if (clipType == ClipBuilder.DIFFERENCE) {
                return new DifferenceOperation(lhsItem, rhsItem);
            }

            if (clipType == ClipBuilder.XOR) {
                return new XOROperation(lhsItem, rhsItem);
            }


            return new IntersectOperation(lhsItem, rhsItem);
        }


        private arrayToArrayHelper(pts:Point[]):ArrayHelper {
            var arrayHelper:ArrayHelper = new ArrayHelper();

            for (var i:number = 0; i < pts.length; i++) {
                arrayHelper.addItem(pts[i]);
            }


            return arrayHelper;

        }



        /** Ramer Douglas Peucker algorithm to reduce no of points **/

        public static  properRDP(points, epsilon=0.8) { // The epsilon is in UI SCALE (This is important for model give the scale as 0.016
            var firstPoint = points[0];
            var lastPoint = points[points.length - 1];
            if (points.length < 3) {
                return points;
            }
            var index = -1;
            var dist = 0;
            for (var i = 1; i < points.length - 1; i++) {
                var cDist = ClipBuilder.findPerpendicularDistance(points[i], firstPoint, lastPoint);
                if (cDist > dist) {
                    dist = cDist;
                    index = i;
                }
            }
            if (dist > epsilon) {
                // iterate
                var l1 = points.slice(0, index + 1);
                var l2 = points.slice(index);
                var r1 = this.properRDP(l1, epsilon);
                var r2 = this.properRDP(l2, epsilon);
                // concat r2 to r1 minus the end/startpoint that will be the same
                var rs = r1.slice(0, r1.length - 1).concat(r2);
                return rs;
            } else {
                return [firstPoint, lastPoint];
            }
        }


        public static findPerpendicularDistance(p, p1, p2) {

            var result;
            var slope;
            var intercept;

            if (p1.x==p2.x) {
                result=Math.abs(p.x-p1.x);
            }
            else {
                slope = (p2.y - p1.y) / (p2.x - p1.x);
                intercept=p1.y-(slope*p1.x);
                result = Math.abs(slope * p.x - p.y + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
            }

            return result;
        }

    }


}