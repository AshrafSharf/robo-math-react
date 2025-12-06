/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	export class TEdge 
	{

        constructor()
        {

        }
		public   xbot:number;
		public   ybot:number;
		public   xcurr:number;
		public   ycurr:number;
		public   xtop:number;
		public   ytop:number;
		public   dx:number;
		public   tmpX:number;
		public   polyType:number; //PolyType 
		public   side:number; //EdgeSide 
		public   windDelta:number; //1 or -1 depending on winding direction
		public   windCnt:number;
		public   windCnt2:number; //winding count of the opposite polytype
		public   outIdx:number;
		public   next:TEdge;
		public   prev:TEdge;
		public   nextInLML:TEdge;
		public   nextInAEL:TEdge;
		public   prevInAEL:TEdge;
		public   nextInSEL:TEdge;
		public   prevInSEL:TEdge;
	}
}