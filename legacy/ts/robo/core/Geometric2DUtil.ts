/**
 * Created by rizwan on 3/18/14.
 */

module robo.core {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Vector3DUtils = robo.util.Vector3DUtils;
    import MathSystem = robo.util.MathSystem;
    import PMath = robo.util.PMath;
    import Point = away.geom.Point;
    import Matrix = away.geom.Matrix;


    export class Geometric2DUtil
    {

        public static intersectLines(x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number):Point
        {
            var point1:Point = new Point(x1,y1);
            var point2:Point = new Point(x2,y2);
            var point3:Point = new Point(x3,y3);
            var point4:Point = new Point(x4,y4);

            var bx:number = point2.x - point1.x;
            var by:number = point2.y - point1.y;
            var dx:number = point4.x - point3.x;
            var dy:number = point4.y - point3.y;

            var b_dot_d_perp:number = bx*dy - by*dx;
            if(b_dot_d_perp===0)
            {
                return null;
            }
            var cx:number = point3.x-point1.x;
            var cy:number = point3.y-point1.y;
            var t:number = (cx*dy - cy*dx) / b_dot_d_perp;

            return new Point(point1.x+t*bx, point1.y+t*by);
        }


         // Line Segment Intersection

        public static intersectSegments(x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number):Point
        {
            var point1:Point = new Point(x1,y1);
            var point2:Point = new Point(x2,y2);
            var point3:Point = new Point(x3,y3);
            var point4:Point = new Point(x4,y4);


            var bx:number = point2.x - point1.x;
            var by:number = point2.y - point1.y;
            var dx:number = point4.x - point3.x;
            var dy:number = point4.y - point3.y;

            var b_dot_d_perp:number = bx * dy - by * dx;
            if(b_dot_d_perp == 0) {
                return null;
            }
            var cx:number = point3.x-point1.x;
            var cy:number = point3.y-point1.y;
            var t:number = (cx * dy - cy * dx) / b_dot_d_perp;
            if(t < 0 || t > 1) {
                return null;
            }
            var u:number = (cx * by - cy * bx) / b_dot_d_perp;
            if(u < 0 || u > 1) {
                return null;
            }
            return new Point(point1.x+t*bx, point1.y+t*by);
        }


        /** x1,y1 - line's start point **/

        public static reflect(pointX:number,pointY:number,x1:number, y1:number, x2:number, y2:number):Point
        {
            var startPoint:Point =  new Point(x1,y1);
            var endPoint:Point = new Point(x2,y2);

            var normalX:number = startPoint.y - endPoint.y;
            var normalY:number = endPoint.x - startPoint.x;
            var generalFormConstant:number = (startPoint.x * endPoint.y) - (startPoint.y * endPoint.x);

            var xIntercept:number = -(generalFormConstant/normalX);
            var yIntercept:number = -(generalFormConstant/normalY);
            var lineAngle:number = Math.atan2(-normalX,normalY);

            var tx:number;
            var ty:number;
            if (Math.abs(normalX) > Math.abs(normalY)) {
                tx = xIntercept;
                ty = 0;
            } else {
                tx = 0;
                ty = yIntercept;
            }

            var pointMatrix:Matrix = new Matrix();
            pointMatrix.translate(-tx,-ty);///transalate
            pointMatrix.rotate(-lineAngle); //rotate

            var  reflection:Matrix = new Matrix(1,0,0,-1,0,0);//reflection along yxis
            pointMatrix.concat(reflection);
            pointMatrix.rotate(lineAngle);
            pointMatrix.translate(tx,ty);

            var reflectingPoint:Point = new Point(pointX,pointY);
            var transformedReflectedPoint:Point = pointMatrix.transformPoint(reflectingPoint);
            return transformedReflectedPoint;
        }


        /** Duplicate code -- Ashraf , left it for performance reason **/
        public static  reflectPoints(inputPoints:Point[],x1:number, y1:number, x2:number, y2:number):Point[]{


        var point1:Point = new Point(x1,y1);
        var point2:Point = new Point(x2,y2);

        var  tx:number;
        var  ty:number;


            var startPoint:Point =  new Point(x1,y1);
            var endPoint:Point = new Point(x2,y2);

            var normalX:number = startPoint.y - endPoint.y;
            var normalY:number = endPoint.x - startPoint.x;
            var generalFormConstant:number = (startPoint.x * endPoint.y) - (startPoint.y * endPoint.x);

            var xIntercept:number = -(generalFormConstant/normalX);
            var yIntercept:number = -(generalFormConstant/normalY);
            var lineAngle:number = Math.atan2(-normalX,normalY);

            var tx:number;
            var ty:number;
            if (Math.abs(normalX) > Math.abs(normalY)) {
                tx = xIntercept;
                ty = 0;
            } else {
                tx = 0;
                ty = yIntercept;
            }

        var pointMatrix:Matrix=new Matrix();

        pointMatrix.translate(-tx,-ty);///transalate

        pointMatrix.rotate(-lineAngle); //rotate

        var  reflection:Matrix=new Matrix(1,0,0,-1,0,0);//reflection along yxis

        pointMatrix.concat(reflection);

        pointMatrix.rotate(lineAngle);

        pointMatrix.translate(tx,ty);

        var reflectedPoints:Point[] = [];

        for(var i:number=0;i<inputPoints.length;i++)
        {


            var  reflectingPoint:Point=new Point(inputPoints[i].x,inputPoints[i].y);
            var reflectedPoint:Point=pointMatrix.transformPoint(reflectingPoint);
            reflectedPoints.push(reflectedPoint);

        }

        return reflectedPoints;
    }



        public static project(inputPointX:number,inputPointY:number,x1:number, y1:number, x2:number, y2:number):Point
        {
            var startPoint:Point =  new Point(x1,y1);
            var endPoint:Point = new Point(x2,y2);

            var normalX:number = startPoint.y - endPoint.y;
            var normalY:number = endPoint.x - startPoint.x;
            var generalFormConstant:number = (startPoint.x * endPoint.y) - (startPoint.y * endPoint.x);
            var normal:Vector3D = new Vector3D(normalX,normalY,0);

            ///////////distanceFromLine  calculation start//////////////
            var givenPoint:Point = new Point(inputPointX,inputPointY);
            var givenPointVector:Vector3D = new Vector3D(givenPoint.x,givenPoint.y,0);
            var dn:number = givenPointVector.dotProduct(normal);//input point . normal vector
            var nn:number = normal.dotProduct(normal);//normal vector^2
            var pointNormalDistance:number = -generalFormConstant;
            var distancefromLine:number =  (dn-pointNormalDistance)/nn;
            ///////////distanceFromLine  calculation end//////////////

            var projectedPoint_x:number = givenPoint.x - (distancefromLine*normal.x);
            var projectedPoint_y:number = givenPoint.y - (distancefromLine*normal.y);

            var projectedPoint:Point = new Point(projectedPoint_x,projectedPoint_y);
            return projectedPoint;
        }


        public static  dilate(ratio:number,px:number,py:number,ax:number,ay:number):Point
       {
            var dialatedPt:Point = new Point();

            dialatedPt.x = (ax) + (px - ax)*ratio;
            dialatedPt.y = (ay) + (py - ay)*ratio;

            return dialatedPt;
      }


      public static   dilatePoints(ratio:number,points:Point[],cx:number,cy:number):Point[]
      {
        var dialtedPoints:Point[] = [];

        for(var i:number=0;i<points.length;i++)
        {
            dialtedPoints.push(this.dilate(ratio,points[i].x,points[i].y,cx,cy));
        }

        return dialtedPoints;
     }


        public static  interpolatePoints(pts1:Point[],pts2:Point[],ratio:number):Point[]
    {
         var minPtLen:number = Math.min(pts1.length,pts2.length);

         var interpolatedPts:Point[]=[];

        for(var i:number=0;i<minPtLen;i++)
        {
            var inPoint:Point = Point.interpolate(pts2[i],pts1[i],ratio);
            interpolatedPts.push(inPoint);

        }


        return interpolatedPts;
    }


       public static   translatePoint(px:number,py:number,tx:number,ty:number,aboutX:number=0,aboutY:number=0):Point
      {
          var withRespX:number = px-aboutX;
          var withRespY:number = py-aboutY;

        return new Point(withRespX+tx,withRespY+ty);
       }

       public static   translatePoints(points:Point[],tx:number,ty:number,aboutX:number=0,aboutY:number=0):Point[]
      {
        var translatedPoints:Point[] = [];

        for(var i:number=0;i<points.length;i++)
        {
            translatedPoints.push(this.translatePoint(points[i].x,points[i].y,tx,ty,aboutX,aboutX));
        }

        return translatedPoints;
     }



        public static rotatePoint(angleInDegree:number,px:number,py:number,ox:number,oy:number):Point
        {
            var angle:number = PMath.radians(angleInDegree);

            var point:Point = new Point(px,py);
            var origin:Point = new Point(ox,oy);

            if (angle == 0)
                return new Point(point.x, point.y);

            var d:number = Math.sqrt((origin.x - point.x) * (origin.x - point.x) + (origin.y - point.y) * (origin.y - point.y));
            var ang:number = Math.atan2((point.y - origin.y), (point.x - origin.x));
            return new Point(origin.x + (d * Math.cos(ang + angle)), origin.y + (d * Math.sin(ang + angle)));
        }


     public static   rotatePoints(angleInDegree:number,points:Point[],ox:number,oy:number):Point[]
     {


        var rotatedPoints:Point[] = [];

        for(var i:number=0;i<points.length;i++)
        {
            rotatedPoints.push(this.rotatePoint(angleInDegree,points[i].x,points[i].y,ox,oy));
        }

        return rotatedPoints;
    }

        public static angle(x1:number, y1:number, x2:number, y2:number,x3:number,y3:number):number
        {
            var vector1:Vector3D = new Vector3D(x1-x2,y1-y2);
            var vector2:Vector3D = new Vector3D(x3-x2,y3-y2);

            var dotProduct:number = vector1.dotProduct(vector2);
            var crossProductVec:Vector3D = vector1.crossProduct(vector2);

            var angleInBetweenRadian:number = Math.atan2(crossProductVec.z,dotProduct);
            angleInBetweenRadian = MathSystem.calculatePositiveAngle(angleInBetweenRadian);//reflex angle

            return angleInBetweenRadian;
        }

        /**
         * Dont document internal - use Circle and Line classes
         */
        public static intersectCircleAndLine(circleCenterX:number,circleCenterY:number,radius:number,x1:number, y1:number, x2:number, y2:number):Point[]
        {
            var startPoint:Point = new Point(x1,y1);
            var endPoint:Point = new Point(x2,y2);

            var xDiff:number = endPoint.x - startPoint.x;  // x2-x1
            var yDiff:number = endPoint.y - startPoint.y;  //y2-y1
            var magnitude:number =  Math.sqrt(Math.pow(xDiff,2)+Math.pow(yDiff,2));//Root((x2-x1)^2 + (y2-y1)^2)
            var line_unitPoint:Point = new Point(xDiff/magnitude,yDiff/magnitude);

            var line_transformPoint_x:number = startPoint.x - circleCenterX;
            var line_transformPoint_y:number = startPoint.y - circleCenterY;

            var a:number = line_unitPoint.x * line_transformPoint_y;
            var b:number = line_transformPoint_x * line_unitPoint.y;

            var sqrt_Term:number = Math.pow(radius,2) - Math.pow((a-b),2);

            var coEfficient1:number = -((line_transformPoint_x * line_unitPoint.x) + (line_transformPoint_y * line_unitPoint.y)) + Math.sqrt(sqrt_Term);
            var coEfficient2:number = -((line_transformPoint_x * line_unitPoint.x) + (line_transformPoint_y * line_unitPoint.y)) - Math.sqrt(sqrt_Term);

            var outputPoints:Point[] = [];
            if(sqrt_Term<0)
            {
                return outputPoints;
            }

            var x:number = startPoint.x + (coEfficient1 * line_unitPoint.x);
            var y:number = startPoint.y + (coEfficient1 * line_unitPoint.y);
            outputPoints.push(new Point(x,y));

            if(PMath.isZero(sqrt_Term))
                return outputPoints;

            x = startPoint.x + (coEfficient2 * line_unitPoint.x);
            y = startPoint.y + (coEfficient2 * line_unitPoint.y);
            outputPoints.push(new Point(x,y));

            return outputPoints;
        }


        public static intersectCircleAndCircle(circleCenterX1:number,circleCenterY1:number,radius1:number,circleCenterX2:number,circleCenterY2:number,radius2:number):Point[]
        {
            var outputPoints:Point[] = [];

            var c_1:Point = new Point(circleCenterX1,circleCenterY1);
            var c_2:Point = new Point(circleCenterX2,circleCenterY2);
            var r1:number = radius1;
            var r2:number = radius2;

            // Determine minimum and maximum radii where circles can intersect
            var r_max:number = radius1 + radius2;
            var r_min:number = Math.abs(radius1-radius2);

            // Determine actual distance between circle circles
            var c_dist:number = Point.distance(c_1,c_2);

            if (c_dist>r_max){

                return outputPoints;

            }else if (c_dist<r_min){

                return outputPoints;

            }else{

                var a:number = (r1*r1-r2*r2+c_dist*c_dist)/(2*c_dist);
                var h:number = Math.sqrt(r1*r1-a*a);
                var p:Point = Point.interpolate(c_2,c_1, a/c_dist);
                var b:number = h/c_dist;

                outputPoints[outputPoints.length] = new Point(p.x-b*(c_2.y-c_1.y), p.y+b*(c_2.x-c_1.x));
                outputPoints[outputPoints.length] = new Point(p.x+b*(c_2.y-c_1.y), p.y-b*(c_2.x-c_1.x));
            }

            return outputPoints;
        }


        public static filterUniquePoints(pts:Point[]):Point[]
        {
            var uniquePoints:Point[]=[];

            var keyPairDict:any = {};

            for(var i:number=0;i<pts.length;i++)
            {
                var key:string = pts[i].x+":"+pts[i].y;
                keyPairDict[key] = pts[i];
            }

            for(var pointKey in keyPairDict)
            {
                uniquePoints[uniquePoints.length]=keyPairDict[pointKey];
            }

            return uniquePoints;
        }
    }
}
