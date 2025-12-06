/**
 * Created by Mathdisk on 3/16/14.
 */


///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.extrusions {



    import Point = away.geom.Point;

    export class DelanauyPoint
    {
        public  id:number;
        public  X:number;
        public  Y:number;
        public  Z:number =0;

        public  angle:number; // dgress from centroid

        public  constructor( x:number, y:number, id:number = -1 )
    {
        this.X = x;
        this.Y = y;
        if( id != -1 ) this.id = id;
    }

        public  Equals2D( other:DelanauyPoint ):Boolean
    {
        return ( this.X == other.X && this.Y == other.Y );
    }

        public  toPoint2DInst():Point{

        return new Point(this.X,this.Y);
    }
    }
}