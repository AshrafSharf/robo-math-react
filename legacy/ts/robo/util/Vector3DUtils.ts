/**
 * Created by Mathdisk on 3/15/14.
 */
///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.util
{
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import PMath = robo.util.PMath;

    
    export class Vector3DUtils
    {
        public static  MathPI:number = Math.PI;

        /**
         * Returns the angle in radians made between the 3d number obejct and the given <code>Vector3D</code> object.
         *
         * @param    w                The first 3d number object to use in the calculation.
         * @param    q                The first 3d number object to use in the calculation.
         * @return                    An angle in radians representing the angle between the two <code>Vector3D</code> objects.
         */
        public static  getAngle(w:Vector3D, q:Vector3D):number
    {
        return Math.acos(w.dotProduct(q)/(w.length*q.length));
    }

    

        public static  rotatePoint(aPoint:Vector3D, rotation:Vector3D):Vector3D
    {
        if (rotation.x != 0 || rotation.y != 0 || rotation.z != 0) {

            var x1:number;
            var y1:number;

            var rad:number = PMath.DEGREES_TO_RADIANS;
            var rotx:number = rotation.x*rad;
            var roty:number = rotation.y*rad;
            var rotz:number = rotation.z*rad;

            var sinx:number = Math.sin(rotx);
            var cosx:number = Math.cos(rotx);
            var siny:number = Math.sin(roty);
            var cosy:number = Math.cos(roty);
            var sinz:number = Math.sin(rotz);
            var cosz:number = Math.cos(rotz);

            var x:number = aPoint.x;
            var y:number = aPoint.y;
            var z:number = aPoint.z;

            y1 = y;
            y = y1*cosx + z* -sinx;
            z = y1*sinx + z*cosx;

            x1 = x;
            x = x1*cosy + z*siny;
            z = x1* -siny + z*cosy;

            x1 = x;
            x = x1*cosz + y* -sinz;
            y = x1*sinz + y*cosz;

            aPoint.x = x;
            aPoint.y = y;
            aPoint.z = z;
        }

        return aPoint;
    }

        public static  subdivide(startVal:Vector3D, endVal:Vector3D, numSegments:number):Vector3D[]
    {
        var points:Vector3D[] = new Array<Vector3D>();

        var numPoints:number = 0;
        var stepx:number = (endVal.x - startVal.x)/numSegments;
        var stepy:number = (endVal.y - startVal.y)/numSegments;
        var stepz:number = (endVal.z - startVal.z)/numSegments;

        var step:number = 1;
        var scalestep:Vector3D;

        while (step < numSegments) {
            scalestep = new Vector3D();
            scalestep.x = startVal.x + (stepx*step);
            scalestep.y = startVal.y + (stepy*step);
            scalestep.z = startVal.z + (stepz*step);
            points[numPoints++] = scalestep;

            step++;
        }

        points[numPoints] = endVal;

        return points;
    }
    }

}