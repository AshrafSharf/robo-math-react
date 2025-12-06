/**
 * Created by Mathdisk on 3/15/14.
 */
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.util
{
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point = away.geom.Point;


    export class PMath
    {
        /**
         * The amount to multiply with when converting radians to degrees.
         */
        public static  RADIANS_TO_DEGREES : number = 180 / Math.PI;

        /**
         * The amount to multiply with when converting degrees to radians.
         */
        public static  DEGREES_TO_RADIANS : number = Math.PI / 180;


        //=========================================================
        // Constants
        //=========================================================

        public static HALF_PI:number = Math.PI / 2;
        public static TWO_PI:number = Math.PI * 2;
        public static PI:number = Math.PI;


        public  static   degrees( aAngle:number ):number
        {
            return ( aAngle  * 180)/Math.PI;
        }


        public static radians( aAngle:number ):number
        {
            return ( aAngle / 180 ) * Math.PI;
        }

        public static  roundDecimal(num:number, precision:number):number
        {
            var decimal:number = Math.pow(10, precision);

            return Math.round(decimal* num) / decimal;
        }



         public static  appendRotationByPivot(matrix3D:Matrix3D,rotationDeg:number,axisVector:Vector3D,pivotPt:Vector3D=null):void
         {
            if(pivotPt==null)
            {
                matrix3D.appendRotation(rotationDeg,axisVector);
            }

            else
            {
                matrix3D.appendTranslation(-pivotPt.x,-pivotPt.y,-pivotPt.z);
                matrix3D.appendRotation(rotationDeg,axisVector);
                matrix3D.appendTranslation(pivotPt.x,pivotPt.y,pivotPt.z);
            }
        }



        public static formatAngle(ang:number):number
        {
            return ((ang % PMath.TWO_PI)+PMath.TWO_PI) % PMath.TWO_PI;
        }


        /**
         * Returns the horizontal angle formed by the line joining the two given
         * points.
         */
        public static horizontalAngle(p1:Point,p2:Point):number
        {
            return (Math.atan2(p2.y - p1.y,p2.x - p1.x) + PMath.TWO_PI) % (PMath.TWO_PI);
        }



        public static hypot(x:number,y:number):number
        {
            return Math.sqrt((x*x)+(y*y));
        }

        public static isZero(toCheck:number,tolerance:number=1E-8):boolean
        {
            return (-tolerance < toCheck) && (toCheck < tolerance);
        }

        public static map( value:number, istart:number, istop:number, ostart:number, ostop:number ):number
        {
            return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
        }

        public static lerp( value1:number, value2:number, amt:number ):number
        {
            return value1 + ((value2 - value1) * amt);
        }

        public static square(n:number):number
        {
            return n*n;
        }

        public static isEqual(toCheck:number,against:number,range:number=0.02):boolean
        {
            return ((-range+against) < toCheck) && (toCheck < (range+against));
        }
        
        public static angleBetweenLine(linePts:number[],isReflex:boolean=false):number{

            var vector1:Vector3D = new Vector3D(linePts[2]-linePts[0],linePts[3]-linePts[1]);
            var vector2:Vector3D = new Vector3D(linePts[6]-linePts[4],linePts[7]-linePts[5]);

            var dotProduct:number=vector1.dotProduct(vector2);
            var crossProductVec:Vector3D = vector1.crossProduct(vector2);

            var angleInBetweenRadian:number = Math.atan2(crossProductVec.z,dotProduct);

            if(isReflex)
                angleInBetweenRadian = MathSystem.calculatePositiveAngle(angleInBetweenRadian);

            return angleInBetweenRadian;
        }


        public static isNaN(toCheck:number):boolean
        {
            if(isNaN(toCheck))
             return true;

            if(toCheck==undefined || toCheck==null)
              return true;

            return false;
        }

        public static isWithInRange(val:number,from:number, to:number, range:number=0):boolean
        {
            if(PMath.isEqual1(val,from,range))
                return true;

            if(PMath.isEqual1(val,to,range))
                return true;

            if(PMath.isBetween(val,from,to))
                return true;

            return  false;
        }


        private static isEqual1(val1:number, val2:number, precision:number = 0):boolean
        {
            return Math.abs(val1 - val2) <= Math.abs(precision);
        }

        public static isBetween(value:number, firstValue:number, secondValue:number):boolean
        {
            return !(value < Math.min(firstValue, secondValue) || value > Math.max(firstValue, secondValue));
        }
    }

}