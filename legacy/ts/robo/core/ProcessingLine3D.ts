/**
 * Created by Mathdisk on 3/17/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>


/**
 *
 * The classes in core package should not have any reference GraphSheet,canvas(PGraohics)
 * Existing methods which rely on such objects can be ignored (esp draw method)
 */
module robo.core
{
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point3D = robo.core.Point3D;
    import BoundingSphere = away.bounds.BoundingSphere;

    export class ProcessingLine3D
    {
        private  _startPoint:Point3D;
        private  _endPoint:Point3D;

        constructor(startPoint:Point3D,endPoint:Point3D)
        {
            //super(startPoint);

            this._startPoint = startPoint;
            this._endPoint = endPoint;
        }

        public get endPoint():Point3D
        {
            return this._endPoint;
        }

        public set endPoint(value:Point3D)
        {
            this._endPoint = value;
        }

        public get startPoint():Point3D
        {
            return this._startPoint;
        }

        public set startPoint(value:Point3D)
        {
            this._startPoint = value;

            //setPosition(value);
        }

        /**
         * @param t number - value ranges from 0 t0 1 (but not necessary)
         */
        public pointAt(t:number):Point3D
        {
            var vector3D:Vector3D = new Vector3D(this._endPoint.x-this._startPoint.x,this._endPoint.y-this._startPoint.y,this._endPoint.z-this._startPoint.z)
            vector3D.scaleBy(t);

            return 	new Point3D(this._startPoint.x+vector3D.x,this._startPoint.y+vector3D.y,this._startPoint.z+vector3D.z);
        }


        /**
         * Docnt document this method,The value param doesnt range from 0 to 1..used internally for different purposes
         */
        public interpolate(value:number):Point3D
        {
            var vector3D:Vector3D = new Vector3D(this._endPoint.x-this._startPoint.x,this._endPoint.y-this._startPoint.y,this._endPoint.z-this._startPoint.z)
            vector3D.normalize();
            vector3D.scaleBy(value);

            return 	new Point3D(this._startPoint.x+vector3D.x,this._startPoint.y+vector3D.y,this._startPoint.z+vector3D.z);
        }



        public  projectPointOnLine(inputPoint3D:Point3D):Point3D
        {
            var otherLine3D:ProcessingLine3D = new ProcessingLine3D(this._startPoint.copy(),inputPoint3D.copy());

            return otherLine3D.projectOnLine(this);
        }


        //internal method
        private  projectOnLine(otherLine:ProcessingLine3D):Point3D
        {
            var vector1:Vector3D = new Vector3D(otherLine.endPoint.x-otherLine.startPoint.x,otherLine.endPoint.y-otherLine.startPoint.y,
                otherLine.endPoint.z-otherLine.startPoint.z);
            var vector2:Vector3D = new Vector3D(this._endPoint.x-this._startPoint.x,this._endPoint.y-this._startPoint.y,this._endPoint.z-this._startPoint.z);

            var dotProduct:number = vector2.dotProduct(vector1);
            var cosTheta:number = dotProduct/(vector2.length * vector1.length);
            var projectionLength:number = vector2.length*cosTheta;

            var unitVector1:Vector3D = vector1.clone();
            unitVector1.normalize();
            unitVector1.scaleBy(projectionLength);

            var startVec:Vector3D = new Vector3D(this._startPoint.x,this._startPoint.y,this._startPoint.z);
            var projectedPt:Vector3D = startVec.add(unitVector1);
            return new Point3D(projectedPt.x,projectedPt.y,projectedPt.z);

        }

        public  direction():Point3D
        {
            return this._endPoint.subtract(this._startPoint);
        }
        /**
         *
         * @returns the intersecting point or null
         */
        public  intersect(otherLine:ProcessingLine3D):Point3D
        {
            return Geometric3DUtil.line3dIntersect(this.startPoint,this.endPoint,otherLine.startPoint,otherLine.endPoint);
        }


        /**
         * Returns point3D instance or null
         *
         */
        public intersectTriangle(a:Point3D, b:Point3D, c:Point3D):Point3D
        {
            // Compute the offset origin, edges, and normal.
            var diff:Point3D = new Point3D();
            var edge1:Point3D = new Point3D();
            var edge2:Point3D = new Point3D();
            var normal:Point3D = new Point3D();

            var directionVector:Point3D = this.direction();

            // from http://www.geometrictools.com/LibMathematics/Intersection/Wm5IntrRay3Triangle3.cpp

            edge1 = b.subtract( a );
            edge2 = c.subtract( a );
            normal = edge1.crossProduct(edge2 );

            // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
            // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
            //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
            //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
            //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
            var DdN = directionVector.dot( normal );
            var sign;

            if ( DdN > 0 )
            {
                sign = 1;

            } else if ( DdN < 0 ) {

                sign = - 1;
                DdN = - DdN;

            } else {

                return null;
            }

            diff = this.startPoint.subtract( a );

            var DdQxE2 = sign * directionVector.dot( diff.crossProduct(edge2 ) );

            // b1 < 0, no intersection
            if ( DdQxE2 < 0 ) {

                return null;

            }

            var DdE1xQ = sign * directionVector.dot( edge1.crossProduct( diff ) );

            // b2 < 0, no intersection
            if ( DdE1xQ < 0 ) {

                return null;

            }

            // b1+b2 > 1, no intersection
            if ( DdQxE2 + DdE1xQ > DdN ) {

                return null;

            }

            // Line intersects triangle, check if ray does.
            var QdN = - sign * diff.dot( normal );

            // t < 0, no intersection
            if ( QdN < 0 ) {

                return null;
            }
            // Ray intersects triangle.
            return this.pointAt( QdN / DdN );
        }


        public intersectSphere(center:Point3D,radius:number):Point3D
        {
            var boundingSphere:BoundingSphere = new BoundingSphere();
            boundingSphere.fromSphere(new Vector3D(center.x, center.y, center.z), radius);

            var positionVector:Vector3D = this.startPoint.toVector3D();
            var directionVector:Vector3D = this.direction().toVector3D();

            var parameter:number = boundingSphere.rayIntersection(positionVector,directionVector,new Vector3D());
            if(isNaN(parameter))
            {
                return null;
            }
            var intersectingPosition:Point3D = this.pointAt(parameter);
            return intersectingPosition;
        }

        public  contains(inputPoint:Point3D):boolean
        {
            var P:Vector3D  = new Vector3D(inputPoint.x,inputPoint.y,inputPoint.z);
            var P1:Vector3D = this.startPoint.toVector3D();
            var P2:Vector3D = this.endPoint.toVector3D();
            P2.crossProduct(P1);

            var interpolatedValue:number = P.subtract(P1).dotProduct(P.subtract(P1))/P2.subtract(P1).dotProduct(P.subtract(P1));

            if(isNaN(interpolatedValue) || !isFinite(interpolatedValue))
                return false;

            if(!(interpolatedValue>=0.05 && interpolatedValue<=1.05))
                return  false;

            return  true;
        }

        public  distanceTo(otherLine:ProcessingLine3D):number
        {
            var q:Vector3D = this.startPoint.toVector3D();
            var q1:Vector3D = otherLine.startPoint.toVector3D();
            var a:Vector3D = this.direction().toVector3D();
            var b:Vector3D = otherLine.direction().toVector3D();

            var qsubq1:Vector3D = q.subtract(q1);
            var acrossb:Vector3D = a.crossProduct(b);
            var qsubq1acrossb:number = qsubq1.dotProduct(acrossb);
            var d:number = Math.abs(qsubq1acrossb)/acrossb.length;
            return d;
        }

        public angleBetween(other:ProcessingLine3D):number
        {
            var direction1:Vector3D = this.direction().toVector3D();
            var direction2:Vector3D = other.direction().toVector3D();

            return Vector3D.angleBetween(direction1,direction2);
        }


        public dilate(scaleFactor:number):ProcessingLine3D
        {
            var newStartPoint:Point3D = this._startPoint.copy();

            var directionPt:Point3D  = this.direction();
            directionPt.normalizeSelf();
            directionPt.multiplyScalarSelf(scaleFactor);

            var newEndPoint:Point3D = newStartPoint.add(directionPt);
            return new ProcessingLine3D(newStartPoint,newEndPoint);
        }


        public reverse():ProcessingLine3D
        {
            return new ProcessingLine3D(this._endPoint.copy(),this._startPoint.copy());
        }
    }
}