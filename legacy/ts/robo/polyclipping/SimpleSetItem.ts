/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
	import ArrayHelper = robosys.lang.ArrayHelper;

	export class SimpleSetItem implements ISetItem
	{
		private  memberArray:ArrayHelper;
		
		public  constructor(pointsArray:ArrayHelper)
		{
			this.memberArray = pointsArray;
		}
		
		/** returns array of Point Array Instances **/
		public  getMembers():any
		{
			
			var polyPointsArrayOfArray:ArrayHelper = new ArrayHelper(); //each array inside this array represents collections of points belonging to a Polygon
			polyPointsArrayOfArray.addItem(this.memberArray);
			
			return polyPointsArrayOfArray;
		}
	}
}