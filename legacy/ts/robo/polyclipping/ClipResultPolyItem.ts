/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping {

    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;

    export class ClipResultPolyItem implements ISetItem {
        private  resultPolyPointsArray:any;

        public constructor(resultPolyPointsArray:any)//array of array of point instances
        {
            this.resultPolyPointsArray = resultPolyPointsArray;
        }

        public  getMembers():any //returns instances of Points
        {
            return this.resultPolyPointsArray;
        }


    }


}
