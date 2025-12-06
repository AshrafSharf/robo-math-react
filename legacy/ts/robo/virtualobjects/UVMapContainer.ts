/**
* Created by Safi on 3/19/14.
*/

module robo.virtualobjects.util{


    import Point = away.geom.Point;

    export class UVMapContainer{

        public uvMapList1:Point[];
        public uvMapList2:Point[];
        public uvMapList3:Point[];
        public uvMapList4:Point[];

        public constructor(){

            this.uvMapList1 = [];
            this.uvMapList2 = [];
            this.uvMapList3 = [];
            this.uvMapList4 = [];
        }

        public getAllUVMapList():any[]
        {
            return [this.uvMapList1,this.uvMapList2,this.uvMapList3,this.uvMapList4];
        }
    }
}