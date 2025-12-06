/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module  robo.polyclipping
{

	export class OutPt
	{
		public  idx:number;
		public  pt:IntPoint;
		public  next:OutPt;
		public  prev:OutPt;
	}
}