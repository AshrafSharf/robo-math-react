/**
 * Created by Mathdisk on 3/15/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.core {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Vector3DUtils = robo.util.Vector3DUtils;
    import MathSystem = robo.util.MathSystem;
    import PMath = robo.util.PMath;


    export class Geometric3DUtil {

        /**
         *
         *Dont document this method, the point can be rotated using Point3D instance's rotate method Axis could be axis:vector = new Vector3D(1,0,0); -- X axis.. ,it could be any arbitrary axis ...
         */
        public static  rotate(inputPoint3D:Point3D, angleInDegress:number, axis:Point3D, pivotPoint:Point3D = null):Point3D {
            var axisVector:Vector3D = axis.toVector3D();

            var matrix3D:Matrix3D = new Matrix3D();
            var pivotPointVector3D:Vector3D = null;
            if (pivotPoint != null) {
                pivotPointVector3D = pivotPoint.toVector3D();
            }


            PMath.appendRotationByPivot(matrix3D,angleInDegress, axisVector, pivotPointVector3D);

            var transformedVector3D:Vector3D = matrix3D.transformVector(inputPoint3D.toVector3D());

            var transformedPoint3D:Point3D = new Point3D(transformedVector3D.x, transformedVector3D.y, transformedVector3D.z);

            return transformedPoint3D;


        }


        public static  rotatePoints(inputPoints:Point3D[], angleInDegress:number, axis:Point3D, pivotPoint:Point3D = null):Point3D[] {


            var axisVector:Vector3D = axis.toVector3D();

            var matrix3D:Matrix3D = new Matrix3D();
            var pivotPointVector3D:Vector3D = null;
            if (pivotPoint != null) {
                pivotPointVector3D = pivotPoint.toVector3D();
            }



            var rotatedPoints:Point3D[] = [];

            PMath.appendRotationByPivot(matrix3D,angleInDegress, axisVector, pivotPointVector3D);

            for (var i:number = 0; i < inputPoints.length; i++) {
                var transformedVector3D:Vector3D = matrix3D.transformVector(inputPoints[i].toVector3D());

                var transformedPoint3D:Point3D = new Point3D(transformedVector3D.x, transformedVector3D.y, transformedVector3D.z);

                rotatedPoints.push(transformedPoint3D);
            }


            return rotatedPoints;


        }

        /**
         *
         *Dont document this method, the point can be scaled  using Point3D instance's scale method...
         */
        public static  scale(inputPoint3D:Point3D, scaleX:number, scaleY:number, scaleZ:number):Point3D {
            var matrix3D:Matrix3D = new Matrix3D();

            matrix3D.appendScale(scaleX, scaleY, scaleZ);
            var transformedVector3D:Vector3D = matrix3D.transformVector(inputPoint3D.toVector3D());


            var transformedPoint3D:Point3D = new Point3D(transformedVector3D.x, transformedVector3D.y, transformedVector3D.z);

            return transformedPoint3D;
        }


        public static  scalePoints(inputPoints:Point3D[], scaledPoint3D:Point3D):Point3D[] {
            var matrix3D:Matrix3D = new Matrix3D();

            matrix3D.appendScale(scaledPoint3D.x, scaledPoint3D.y, scaledPoint3D.z);

            var scaledPoints:Point3D[] = [];

            for (var i:number = 0; i < inputPoints.length; i++) {
                var transformedVector3D:Vector3D = matrix3D.transformVector(inputPoints[i].toVector3D());

                var transformedPoint3D:Point3D = new Point3D(transformedVector3D.x, transformedVector3D.y, transformedVector3D.z);

                scaledPoints.push(transformedPoint3D);
            }


            return scaledPoints;
        }


        public static  translatePoints(inputPoints:Point3D[], translationPoint:Point3D):Point3D[] {
            var matrix3D:Matrix3D = new Matrix3D();

            matrix3D.appendTranslation(translationPoint.x, translationPoint.y, translationPoint.z);

            var scaledPoints:Point3D[] = [];

            for (var i:number = 0; i < inputPoints.length; i++) {
                var transformedVector3D:Vector3D = matrix3D.transformVector(inputPoints[i].toVector3D());

                var transformedPoint3D:Point3D = new Point3D(transformedVector3D.x, transformedVector3D.y, transformedVector3D.z);

                scaledPoints.push(transformedPoint3D);
            }


            return scaledPoints;
        }


        private static  toPoint3DArray(vector3Ds:Vector3D[]):Point3D[] {
            var polygonPoints = new Array();

            for (var i:number = 0; i < vector3Ds.length; i++) {
                polygonPoints.push(new Point3D(vector3Ds[i].x, vector3Ds[i].y, vector3Ds[i].z));
            }

            return polygonPoints;

        }


        public static  getRotationMatrix(standardVector:Vector3D, directionVec:Vector3D, pivotPoint:Vector3D):Matrix3D {

            var angleBetweenVector:number = Vector3DUtils.getAngle(directionVec, standardVector);
            var degree:number = PMath.degrees(angleBetweenVector); // how far it got tiled...? Ashraf notes...


            var axisOfRotationVector:Vector3D = standardVector.crossProduct(directionVec); // the axis about which the generated points should be rotated..

            var rotationMatrix:Matrix3D = new Matrix3D();


            PMath.appendRotationByPivot(rotationMatrix,degree, axisOfRotationVector, pivotPoint);



            return rotationMatrix;
        }


        //methods ported from Three js Triangle - dont document use the normal method

        public static  triangleNormal(a:Point3D, b:Point3D, c:Point3D):Vector3D {
            var v0:Vector3D = a.subtract(b).toVector3D();

            var v1:Vector3D = c.subtract(b).toVector3D();

            var result:Vector3D = v1.crossProduct(v0);

            result.normalize();

            return result;
        }

        public static  normal(a:Point3D, b:Point3D, c:Point3D):Point3D {
            var normalVector:Vector3D = Geometric3DUtil.triangleNormal(a, b, c);
            var normalPoint:Point3D = new Point3D();
            normalPoint.update(normalVector);

            return normalPoint;


        }


        public static  triangleBarycoords(point:Point3D, a:Point3D, b:Point3D, c:Point3D):Point3D {
            var v0:Vector3D = c.subtract(a).toVector3D();
            var v1:Vector3D = b.subtract(a).toVector3D();
            var v2:Vector3D = point.subtract(a).toVector3D();

            var dot00 = v0.dotProduct(v0);
            var dot01 = v0.dotProduct(v1);
            var dot02 = v0.dotProduct(v2);
            var dot11 = v1.dotProduct(v1);
            var dot12 = v1.dotProduct(v2);

            var denom = ( dot00 * dot11 - dot01 * dot01 );

            var result:Vector3D = new Vector3D();

            // colinear or singular triangle
            if (denom == 0) {
                // arbitrary location outside of triangle?
                // not sure if this is the best idea, maybe should be returning undefined
                result.setTo(-2, -1, -1);

                return    new Point3D(result.x, result.y, result.z);

            }

            var invDenom = 1 / denom;
            var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
            var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

            // barycoordinates must always sum to 1
            result.setTo(1 - u - v, v, u);

            return    new Point3D(result.x, result.y, result.z);

        }

        public static  triangleContains(point:Point3D, a:Point3D, b:Point3D, c:Point3D):Boolean {
            var result:Point3D = Geometric3DUtil.triangleBarycoords(point, a, b, c);

            return ( result.x >= 0 ) && ( result.y >= 0 ) && ( ( result.x + result.y ) <= 1 );
        }

        public static  triangleMidpoint(a:Point3D, b:Point3D, c:Point3D):Point3D {
            var result:Vector3D = new Vector3D();

            var p1:Point3D = a.add(b);
            var p2:Point3D = p1.add(c);

            result = p2.toVector3D();

            result.scaleBy(1 / 3);

            return new Point3D(result.x, result.y, result.z);

        }


        /**
         * Returns a Point3D where the ray intersects a plane inside a triangle
         * Returns null if no hit is found.
         *
         *@param        p0            Point3D.        The origin of the ray.
         *@param        p1            Point3D.        The end of the ray.
         *@param        v0            Point3D.        The first  vertex of the triangle.
         *@param        v1            Point3D.        The second  vertex of the triangle.
         *@param        v2            Point3D.        The third  vertex of the triangle.
         */

        public static  rayToTriangleIntersection(p0:Point3D, p1:Point3D, v0:Point3D, v1:Point3D, v2:Point3D):Vector3D {
            var _orig:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            var _dir:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            var _tu:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            var _tv:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            var _w:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            var _pn:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            var _npn:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            var _a:number;
            var _b:number;
            var _c:number;
            var _d:number;

            _tu.x = v1.x - v0.x;
            _tu.y = v1.y - v0.y;
            _tu.z = v1.z - v0.z;
            _tv.x = v2.x - v0.x;
            _tv.y = v2.y - v0.y;
            _tv.z = v2.z - v0.z;

            _pn.x = _tu.y * _tv.z - _tu.z * _tv.y;
            _pn.y = _tu.z * _tv.x - _tu.x * _tv.z;
            _pn.z = _tu.x * _tv.y - _tu.y * _tv.x;

            if (_pn.length == 0)
                return null;

            _dir.x = p1.x - p0.x;
            _dir.y = p1.y - p0.y;
            _dir.z = p1.z - p0.z;
            _orig.x = p0.x - v0.x;
            _orig.y = p0.y - v0.y;
            _orig.z = p0.z - v0.z;

            _npn.x = -_pn.x;
            _npn.y = -_pn.y;
            _npn.z = -_pn.z;

            var a:number = _npn.x * _orig.x + _npn.y * _orig.y + _npn.z * _orig.z;

            if (a == 0)
                return null;

            var b:number = _pn.x * _dir.x + _pn.y * _dir.y + _pn.z * _dir.z;
            var r:number = a / b;

            if (r < 0 || r > 1)
                return null;

            var result:Vector3D = new Vector3D(0.0, 0.0, 0.0);
            result.x = p0.x + (_dir.x * r);
            result.y = p0.y + (_dir.y * r);
            result.z = p0.z + (_dir.z * r);

            var uu:number = _tu.x * _tu.x + _tu.y * _tu.y + _tu.z * _tu.z;
            var uv:number = _tu.x * _tv.x + _tu.y * _tv.y + _tu.z * _tv.z;
            var vv:number = _tv.x * _tv.x + _tv.y * _tv.y + _tv.z * _tv.z;

            _w.x = result.x - v0.x;
            _w.y = result.y - v0.y;
            _w.z = result.z - v0.z;

            var wu:number = _w.x * _tu.x + _w.y * _tu.y + _w.z * _tu.z;
            var wv:number = _w.x * _tv.x + _w.y * _tv.y + _w.z * _tv.z;
            var d:number = uv * uv - uu * vv;

            var v:number = (uv * wv - vv * wu) / d;
            if (v < 0 || v > 1)
                return null;

            var t:number = (uv * wu - uu * wv) / d;
            if (t < 0 || (v + t) > 1.0)
                return null;

            return result;
        }

        public static  rayToTriangle(p0:Point3D, p1:Point3D, v0:Point3D, v1:Point3D, v2:Point3D):Point3D {
            var intersectionVctor3D:Vector3D = Geometric3DUtil.rayToTriangleIntersection(p0, p1, v0, v1, v2);
            var intersectingpoint:Point3D = new Point3D();
            intersectingpoint.update(intersectionVctor3D);
            return intersectingpoint;
        }


///vector operations

        public static  dotProduct(p1:Point3D, p2:Point3D):number {
            return p1.dot(p2);
        }

        public static  cross(p1:Point3D, p2:Point3D):Point3D {
            return p1.crossProduct(p2);
        }

        /** returns in radian **/
        public static  angleBetween(p1:Point3D, p2:Point3D):number {
            var angleInBetweenRadian:number = Vector3DUtils.getAngle(p1.toVector3D(), p2.toVector3D());
            return angleInBetweenRadian;
        }


        public static  findRotationInfo(startPt3D:Point3D, endPt3D:Point3D, withRespectTo:Point3D = null):RotationInfo {
            var startPt:Vector3D = startPt3D.toVector3D();
            var endPt:Vector3D = endPt3D.toVector3D();


            var directionVector:Vector3D = endPt.subtract(startPt);
            var standardVector:Vector3D = new Vector3D(0, 1, 0);

            // by default use the Y axis as the
            //standard and find axis of rotation and degree..Cylinder,cone capsule all are generated with respect to Y.If an object's natural
            //axis is different than this then use the respective axis

            directionVector.normalize();


            if (withRespectTo != null) {
                standardVector = withRespectTo.toVector3D();
            }

            standardVector.normalize();

            var angleBetweenVector:number = Vector3DUtils.getAngle(directionVector, standardVector);
            var degree:number = PMath.degrees(angleBetweenVector); // how far it got tiled...? Ashraf notes...
            var axisOfRotationVector:Vector3D = standardVector.crossProduct(directionVector); // the axis about which the generated points should be rotated..

            axisOfRotationVector.normalize(1);

            var rotationInfo:RotationInfo = new RotationInfo();
            rotationInfo.axis = Point3D.fromVector3D(axisOfRotationVector);
            rotationInfo.degree = degree;
            rotationInfo.standardAxis = standardVector;

            return rotationInfo;

        }


        public static  interpolateVector(p1:Point3D, p2:Point3D, t:number):Point3D {
            var angle:number = Geometric3DUtil.angleBetween(p1, p2);
            //angle=PMath.degrees(angle);
            var x = ((Math.sin((1 - t) * angle) / Math.sin(angle)) * p1.x) + ((Math.sin(t * angle) / Math.sin(angle)) * p2.x);
            var y = ((Math.sin((1 - t) * angle) / Math.sin(angle)) * p1.y) + ((Math.sin(t * angle) / Math.sin(angle)) * p2.y);
            var z = ((Math.sin((1 - t) * angle) / Math.sin(angle)) * p1.z) + ((Math.sin(t * angle) / Math.sin(angle)) * p2.z);
            return new Point3D(x, y, z);
        }

        public static  angleBetweenThreePoints(o1:Point3D, p1:Point3D, p2:Point3D):number {
            var firstVector:Vector3D = new Vector3D(p1.x - o1.x, p1.y - o1.y, p1.z - o1.z);
            var secondVector:Vector3D = new Vector3D(p2.x - o1.x, p2.y - o1.y, p2.z - o1.z);

            var angleInBetweenRadian:number = Vector3DUtils.getAngle(firstVector, secondVector);

            return angleInBetweenRadian;
        }


        /**
         * Dont expose use the Line3D intersect method
         */

        public static line3dIntersect(startPoint1:Point3D,endPoint1:Point3D,startPoint2:Point3D,endPoint2:Point3D):Point3D
        {
            var startVector1:Vector3D = new Vector3D(startPoint1.x,startPoint1.y,startPoint1.z);
            var normalVector1:Vector3D = new Vector3D(endPoint1.x-startPoint1.x,endPoint1.y-startPoint1.y,endPoint1.z-startPoint1.z);
            normalVector1.normalize();

            var startVector2:Vector3D = new Vector3D(startPoint2.x,startPoint2.y,startPoint2.z);
            var normalVector2:Vector3D = new Vector3D(endPoint2.x-startPoint2.x,endPoint2.y-startPoint2.y,endPoint2.z-startPoint2.z);
            normalVector2.normalize();


            var p1:Vector3D = startVector1;
            var v1:Vector3D = normalVector1;

            var p2:Vector3D = startVector2;
            var v2:Vector3D = normalVector2;

            var crossProductRes:Vector3D = v1.crossProduct(v2);

            //check whether crossProductRes is zero or not.. if zero then given two lines do not intersect
            if(PMath.isZero(crossProductRes.x) && PMath.isZero(crossProductRes.y) && PMath.isZero(crossProductRes.z))
                return null;

            var unitCrossRes:Vector3D = v1.crossProduct(v2);

            var numerator:number = p1.subtract(p2).dotProduct(unitCrossRes);
            var denominator:number = unitCrossRes.length;

            var distance:number = numerator / denominator;
            if(PMath.isZero(distance,0.1)==false)
                return null;

            var rhs:Vector3D = p2.subtract(p1).crossProduct(v2);

            var lamda:number = rhs.length / (v1.crossProduct(v2).length);
            v1.scaleBy(lamda);

            var result:Vector3D = p1.add(v1);
            return new Point3D(result.x,result.y,result.z);
        }
    }
}