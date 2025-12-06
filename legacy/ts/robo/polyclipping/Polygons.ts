/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module  robo.polyclipping
{
	export class Polygons
	{
		constructor()
		{		
		}
		
		public  addPolygon(polygon:Polygon):void
		{
			this._polygons.push(polygon);
		}
		
		public  clear():void
		{
            this._polygons.length = 0;
		}
		
		public  getPolygons():Polygon[]
		{
			return this._polygons;
		}
		
		private  _polygons:Polygon[] = [];
	}
}