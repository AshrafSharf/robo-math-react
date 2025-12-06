/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	export class IntersectNode
	{		
		public  edge1:TEdge;
		public  edge2:TEdge;
		public  pt:IntPoint;
		public  next:IntersectNode;

        constructor()
        {

        }
	}
}



