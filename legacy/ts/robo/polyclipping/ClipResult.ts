/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping {

    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;

    export class ClipResult {


        public inputArrayOfUIPointsArray:any=[];
        public inputArrayOfModelPointsArray:any=[];

        public outputArrayOfUIPointsArray:any=[];
        public outputArrayOfModelPointsArray:any=[];

        public clipType:number=0;




        constructor()
        {

        }

    }

}