/**
 * Created by Mathdisk on 3/15/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.util
{
    import PMath = robo.util.PMath;

    export class MathSystem
    {
        public static calculatePositiveAngle(val:number):number
        {
            var EPSILON:number = 1E-8;
            var _2PI:number  = 2.0 * Math.PI;

            if (val > EPSILON && val < _2PI) return val;

            var value:number  = val % _2PI;
            if(PMath.isZero(value)) {
                if (val < 1.0) value = 0.0;
                else value = _2PI;

            }else if (value < 0.0){
                value += _2PI;
            }
            return value;
         }
    }






}