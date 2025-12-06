/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module  robo.polyclipping
{


	export class Polygon
	{
		constructor()
		{		
		}
		
		public  addPoint(point:IntPoint):void
		{
			this._points.push(point);
		}
		
		public  getPoint(index:number):IntPoint
		{
			return this._points[index]
		}
		
		public  getPoints():IntPoint[]
		{
			return this._points;
		}
		
		public  getSize():number
		{
			return this._points.length;
		}

		public  reverse():void
		{
            this._points.reverse();
		}
		
		private _points:IntPoint[] = [];
	}
}


