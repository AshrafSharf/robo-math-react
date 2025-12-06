/**
 * Created by Mathdisk on 3/16/14.
 */


///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.extrusions {


    import Point = away.geom.Point;

    export  class DelanayTriangle
    {
        public  p1:DelanauyPoint;
        public  p2:DelanauyPoint;
        public  p3:DelanauyPoint;

        public  constructor( p1:DelanauyPoint, p2:DelanauyPoint, p3:DelanauyPoint )
    {

        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;

    }
        public  get zpos():number
    {
        return this.p1.Z +this.p2.Z +this.p3.Z;
    }
        
    }




}