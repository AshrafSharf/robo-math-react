/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.core {


    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point = away.geom.Point;
    import PMath = robo.util.PMath;

    export class Point3D {

        public static  DEFAULT_FOCAL_LENGTH:number = 4000;
        public static  ACCURACY:number = 0.00000001;

        public  fl:number = Point3D.DEFAULT_FOCAL_LENGTH;
        private  vpX:number = 0;
        private  vpY:number = 0;
        private  cX:number = 0;
        private  cY:number = 0;
        private  cZ:number = 0;


        constructor(public x:number = 0, public y:number = 0, public z:number = 0)
        {

        }


        public static fromVector3D(vector3D:Vector3D):Point3D {

            return new Point3D(vector3D.x, vector3D.y, vector3D.z);
        }



        public setVanishingPoint(vpX:number, vpY:number):void {
            this.vpX = vpX;
            this.vpY = vpY;
        }

        /*
         Refer to Page 459 of Foundation Actionscript making Things Move
         */
        public setCenter(cX:number, cY:number, cZ:number = 0):void {
            this.cX = cX;
            this.cY = cY;
            this.cZ = cZ;
        }

        public get screenX():number {

            var scale:number = this.fl / (this.fl + this.z + this.cZ);
            return this.vpX + (this.cX + this.x) * scale;
        }

        public get screenY():number {

            var scale:number = this.fl / (this.fl + this.z + this.cZ);
            return this.vpY + (this.cY + this.y) * scale;
        }


        public toVector3D():Vector3D {

            return new Vector3D(this.x, this.y, this.z);
        }

        public update(vector3dvalue:Vector3D):void {

            this.x = vector3dvalue.x;
            this.y = vector3dvalue.y;
            this.z = vector3dvalue.z;
        }

        public set(x, y, z = 0):void {

            this.x = x;
            this.y = y;
            this.z = z;
        }

        public copy():Point3D {

            return new Point3D(this.x, this.y, this.z);
        }

        public copySelf(pt:Point3D):Point3D {

            this.x = pt.x;
            this.y = pt.y;
            this.z = pt.z;

            return this;
        }


        public moveBy(vector3dvalue:Vector3D):void {

            this.x += vector3dvalue.x;
            this.y += vector3dvalue.y;
            this.z += vector3dvalue.z;
        }

        public subtract(otherPont:Point3D):Point3D {

            return new Point3D(this.x - otherPont.x, this.y - otherPont.y, this.z - otherPont.z);
        }

        public subSelf(otherPont:Point3D):Point3D {

            this.x = this.x - otherPont.x;
            this.y = this.y - otherPont.y;
            this.z = this.z - otherPont.z;

            return this;
        }


        public subtractSelf(v:Point3D, w:Point3D):Point3D {

            if (w !== undefined) {

                console.log('DEPRECATED: Vector3\'s .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
                return this.subVectors(v, w);
            }

            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;

            return this;
        }

        public  subVectors(a:Point3D, b:Point3D):Point3D {

            this.x = a.x - b.x;
            this.y = a.y - b.y;
            this.z = a.z - b.z;

            return this;
        }


        public dot(v) {

            return this.x * v.x + this.y * v.y + this.z * v.z;
        }


        public min(v):Point3D {

            if (this.x > v.x) {

                this.x = v.x;
            }

            if (this.y > v.y) {

                this.y = v.y;
            }

            if (this.z > v.z) {

                this.z = v.z;
            }

            return this;
        }

        public max(v) {

            if (this.x < v.x) {

                this.x = v.x;
            }

            if (this.y < v.y) {

                this.y = v.y;
            }

            if (this.z < v.z) {

                this.z = v.z;
            }

            return this;
        }


        public add(otherPont:Point3D):Point3D {

            return new Point3D(this.x + otherPont.x, this.y + otherPont.y, this.z + otherPont.z);
        }

        public addByVector(otherPont:Vector3D):Point3D {

            return new Point3D(this.x + otherPont.x, this.y + otherPont.y, this.z + otherPont.z);
        }

        /** changes the object itself **/

        public  clampSelf(min, max) {

            // This  assumes min < max, if this assumption isn't true it will not operate correctly

            if (this.x < min.x) {

                this.x = min.x;

            } else if (this.x > max.x) {

                this.x = max.x;
            }

            if (this.y < min.y) {

                this.y = min.y;

            } else if (this.y > max.y) {

                this.y = max.y;
            }

            if (this.z < min.z) {

                this.z = min.z;

            } else if (this.z > max.z) {

                this.z = max.z;
            }

            return this;
        }


        /** dont document ,inline transform, updates the current point itself **/

        public transform(matrix3D:Matrix3D):void {

            if (matrix3D == null)
                return;

            var transformedVector:Vector3D = matrix3D.transformVector(new Vector3D(this.x, this.y, this.z));
            this.update(transformedVector);
        }


        public rotate(angleInDegress:number, axis:Point3D, pivotPoint:Point3D = null):Point3D {

            return Geometric3DUtil.rotate(this, angleInDegress, axis, pivotPoint);
        }

        public scale(scaleX:number, scaleY:number, scaleZ:number):Point3D {

            return Geometric3DUtil.scale(this, scaleX, scaleY, scaleZ);
        }


        // utility methods for easy of use
        public  moveUp(val:number):Point3D {

            return new Point3D(this.x, this.y + val, this.z);
        }

        public  moveDown(val:number):Point3D {

            return new Point3D(this.x, this.y - val, this.z);
        }

        public  moveLeft(val:number):Point3D {

            return new Point3D(this.x - val, this.y, this.z);
        }

        public  moveRight(val:number):Point3D {

            return new Point3D(this.x + val, this.y, this.z);
        }

        public  moveFront(val:number):Point3D {

            return new Point3D(this.x, this.y, this.z - val);
        }

        public  moveBack(val:number):Point3D {

            return new Point3D(this.x, this.y, this.z + val);
        }

        public  move(valX:number, valY:number, valZ:number):Point3D {

            return new Point3D(this.x + valX, this.y + valY, this.z + valZ);
        }


        public moveTo(direction:Point3D, distance:number):Point3D {

            var offsetByDistanceAndDir:Point3D = direction.copy();
            offsetByDistanceAndDir.normalizeSelf();
            offsetByDistanceAndDir.multiplyScalarSelf(distance);
            return this.add(offsetByDistanceAndDir);
        }


        public divide(v:Point3D):Point3D {

            var newPoint3D:Point3D = new Point3D();

            newPoint3D.x = this.x / v.x;
            newPoint3D.y = this.y / v.y;
            newPoint3D.z = this.z / v.z;

            return newPoint3D;
        }

        public lerp(v, alpha):Point3D {

            var newPoint3D:Point3D = new Point3D();

            newPoint3D.x = this.x + ( v.x - this.x ) * alpha;
            newPoint3D.y = this.y + ( v.y - this.y ) * alpha;
            newPoint3D.z = this.z + ( v.z - this.z ) * alpha;

            return newPoint3D;
        }


        public lengthSq():number {

            return this.x * this.x + this.y * this.y + this.z * this.z;
        }

        public length():number {

            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

        }

        public distanceTo(v:Point3D):number {

            return Math.sqrt(this.distanceToSquared(v));
        }

        public  distanceToSquared(v:Point3D):number {

            var dx = this.x - v.x;
            var dy = this.y - v.y;
            var dz = this.z - v.z;

            return dx * dx + dy * dy + dz * dz;
        }


        public  multiplyScalar(scalar:number):Point3D {

            var newPoint3D:Point3D = new Point3D();

            newPoint3D.x = this.x * scalar;
            newPoint3D.y = this.y * scalar;
            newPoint3D.z = this.z * scalar;

            return newPoint3D;
        }

        public  multiplyScalarSelf(scalar:number):Point3D {

            this.x = this.x * scalar;
            this.y = this.y * scalar;
            this.z = this.z * scalar;

            return this;
        }


        public addScalar(s):Point3D {

            var newPoint3D:Point3D = new Point3D();

            newPoint3D.x = this.x + s;
            newPoint3D.y = this.y + s;
            newPoint3D.z = this.z + s;

            return newPoint3D;
        }

        public addScalarSelf(s) {

            this.x = this.x + s;
            this.y = this.y + s;
            this.z = this.z + s;

            return this;
        }

        public static addVectors(a, b):Point3D {

            var newPoint3D:Point3D = new Point3D();

            newPoint3D.x = a.x + b.x;
            newPoint3D.y = a.y + b.y;
            newPoint3D.z = a.z + b.z;

            return newPoint3D;
        }

        public static subVectors(a, b) {

            var newPoint3D:Point3D = new Point3D();

            newPoint3D.x = a.x - b.x;
            newPoint3D.y = a.y - b.y;
            newPoint3D.z = a.z - b.z;

            return newPoint3D;
        }


        public  divideScalar(scalar:number):Point3D {

            var newPoint3D:Point3D = new Point3D();

            if (scalar !== 0) {

                var invScalar = 1 / scalar;

                newPoint3D.x = this.x * invScalar;
                newPoint3D.y = this.y * invScalar;
                newPoint3D.z = this.z * invScalar;

            } else {

                newPoint3D.x = 0;
                newPoint3D.y = 0;
                newPoint3D.z = 0;
            }
            return newPoint3D;
        }


        public static  midPoint(pt1:Point3D, pt2:Point3D):Point3D {

            var midPt:Point3D = new Point3D();

            midPt.x = (pt1.x + pt2.x) / 2;
            midPt.y = (pt1.y + pt2.y) / 2;
            midPt.z = (pt1.z + pt2.z) / 2;

            return midPt;
        }

        public addSelf(otherPont:Point3D):Point3D {

            this.x = this.x + otherPont.x;
            this.y = this.y + otherPont.y;
            this.z = this.z + otherPont.z;

            return this;
        }

        public addSelfByValues(x,y,z):Point3D {

            this.x = this.x + x;
            this.y = this.y + y;
            this.z = this.z + z;

            return this;
        }


        public divideScalarSelf(scalar:number):Point3D {

            if (scalar !== 0) {

                var invScalar = 1 / scalar;

                this.x = this.x * invScalar;
                this.y = this.y * invScalar;
                this.z = this.z * invScalar;

            } else {

                this.x = 0;
                this.y = 0;
                this.z = 0;
            }
            return this;
        }

        public normalizeSelf():Point3D {

            return this.divideScalarSelf(this.length());
        }

        public cross(v, w):Point3D {

            if (w !== undefined) {

                console.log('DEPRECATED: Vector3\'s .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.');
                return this.crossVectors(v, w);
            }

            var x = this.x, y = this.y, z = this.z;

            this.x = y * v.z - z * v.y;
            this.y = z * v.x - x * v.z;
            this.z = x * v.y - y * v.x;

            return this;
        }


        public crossProduct(v:Point3D):Point3D {

            var perpVector:Point3D = new Point3D();

            var x = this.x, y = this.y, z = this.z;

            perpVector.x = y * v.z - z * v.y;
            perpVector.y = z * v.x - x * v.z;
            perpVector.z = x * v.y - y * v.x;

            return perpVector;
        }

        /**
         * This method is buggy,dont documnent ut
         */
        public crossVectors(a, b):Point3D {

            this.x = a.y * b.z - a.z * b.y;
            this.y = a.z * b.x - a.x * b.z;
            this.z = a.x * b.y - a.y * b.x;

            return this;
        }

        public applyMatrix3(m) {

            var x = this.x;
            var y = this.y;
            var z = this.z;

            var e = m.elements;

            this.x = e[0] * x + e[3] * y + e[6] * z;
            this.y = e[1] * x + e[4] * y + e[7] * z;
            this.z = e[2] * x + e[5] * y + e[8] * z;

            return this;
        }


        public equals(v) {

            var compVector1:Vector3D = new Vector3D(this.x, this.y, this.z);
            var compVector2:Vector3D = new Vector3D(v.x, v.y, v.z);

            var dist:number = this.distanceTo(v);
            return PMath.isZero(dist,0.05);
            //return compVector1.nearEquals(compVector1, 0.05);
        }


        public  applyMatrix4(m) {

            // input: THREE.Matrix4 affine matrix

            var x = this.x, y = this.y, z = this.z;
            var e = m.elements;

            this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
            this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
            this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

            return this;

        }

        public static  from2DPoint(pt:Point, ignore:string = 'z'):Point3D {
            var point3D:Point3D = null;

            if (ignore == 'x') {
                point3D = new Point3D(0, pt.x, pt.y);
                return point3D;
            }

            if (ignore == 'y') {
                point3D = new Point3D(pt.x, 0, pt.y);
                return point3D;
            }

            point3D = new Point3D(pt.x, pt.y, 0);
            return point3D;
        }





        /**
         * test if the two vectors are colinear
         *
         * @return true if the vectors are colinear
         */
        public static    isColinear(v1:Point3D, v2:Point3D):Boolean {
            v1 = v1.normalizeSelf();
            v2 = v2.normalizeSelf();
            return v1.crossProduct(v1).length() < Point3D.ACCURACY;
        }

        /**
         * test if the two vectors are orthogonal
         *
         * @return true if the vectors are orthogonal
         */
        public static  isOrthogonal(v1:Point3D, v2:Point3D):Boolean {
            v1 = v1.normalizeSelf();
            v2 = v2.normalizeSelf();
            var dotValue = v1.dot(v2);
            return Math.abs(dotValue) < Point3D.ACCURACY;
        }


        public static  interpolate(pt1:Point3D, pt2:Point3D, ratio:number):Point3D {
            var v1:Vector3D = pt2.toVector3D();
            var v0:Vector3D = pt1.toVector3D();

            var diff:Vector3D = v1.subtract(v0);
            diff.scaleBy(ratio);

            var interpolatedVector:Vector3D = v0.add(diff);

            return Point3D.fromVector3D(interpolatedVector);

        }

        public clone():Point3D{

            return new Point3D(this.x,this.y,this.z);
        }


    }


}