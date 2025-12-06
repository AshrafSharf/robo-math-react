/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	export class IntPoint 
	{
		constructor(x:number = 0, y:number = 0) 
		{

			this.X = Clipper.float2int(x);
			this.Y = Clipper.float2int(y);
		}
		
		public static cross(vec1:IntPoint, vec2:IntPoint):number
		{
			return vec1.X * vec2.Y - vec2.X * vec1.Y;
		}
		
		public equals(pt:IntPoint):Boolean
		{
		    return this.X == pt.X && this.Y == pt.Y;
		}
		
		public  X:number;
        public  Y:number;
	}

}