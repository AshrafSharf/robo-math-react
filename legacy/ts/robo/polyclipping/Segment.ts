/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	export class Segment 
	{

        public pt1:IntPoint;
        public pt2:IntPoint;

		constructor(pt1:IntPoint, pt2:IntPoint)
		{
			this.pt1 = pt1;
			this.pt2 = pt2;
		}
		
		public  swapPoints():void
		{
			var temp:IntPoint = this.pt1;
            this.pt1 = this.pt2;
            this.pt2 = temp;
		}
		

	}
}