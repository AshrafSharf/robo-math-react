/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	export  class ClipType
	{
		public static  INTERSECTION:number = 0;
		public static  UNION:number = 1;
		public static  DIFFERENCE:number = 2;
		public static  XOR:number = 3;
		public static  SUBTRACT:number = 4;
	}
}
