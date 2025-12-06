/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module  robo.polyclipping
{
	export  class OutRec
	{
		public  idx:number;
		public  isHole:Boolean;
		public  firstLeft:OutRec;
		public  appendLink:OutRec;
		public  pts:OutPt;
		public  bottomPt:OutPt;
		public  bottomFlag:OutPt;
		public  sides:number;//EdgeSide
	}
}