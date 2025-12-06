/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	export class IntRect 
    {
        public  left:number;
        public  top:number;
        public  right:number;
        public  bottom:number;

        constructor(left:number, top:number, right:number, bottom:number)
        {
            this.left = left; 
			this.top = top;
            this.right = right; 
			this.bottom = bottom;
        }
    }
}