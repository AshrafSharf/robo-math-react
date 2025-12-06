/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module  robo.polyclipping
{
	export  class PolyFillType
	{
		//By far the most widely used winding rules for polygon filling are
		//EvenOdd & NonZero (GDI, GDI+, XLib, OpenGL, Cairo, AGG, Quartz, SVG, Gr32)
		//Others rules include Positive, Negative and ABS_GTR_EQ_TWO (only in OpenGL)
		//see http://glprogramming.com/red/chapter11.html

		public static  EVEN_ODD:number = 0;
		public static  NON_ZERO:number = 1;
		public static  POSITIVE:number = 2;
		public static  NEGATIVE:number = 3;
	}
}