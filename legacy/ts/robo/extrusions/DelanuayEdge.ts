/**
 * Created by Mathdisk on 3/16/14.
 */


///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.extrusions {


    import Point = away.geom.Point;

    export class DelanuayEdge
    {
        /// <summary>
        /// Start of edge index
        /// </summary>

        public  p1:DelanauyPoint;

        /// <summary>
        /// End of edge index
        /// </summary>

        public  p2:DelanauyPoint;

        /// <summary>
        /// Initializes a new edge instance
        /// </summary>
        /// <param name="point1">Start edge vertex index</param>
        /// <param name="point2">End edge vertex index</param>

        public constructor( point1:DelanauyPoint, point2:DelanauyPoint )
    {

       this.p1 = point1;
        this.p2 = point2;
    }

        /// <summary>
        /// Initializes a new edge instance with start/end indexes of '0'
        /// </summary>
        /*
         public Edge()

         : this(0, 0)

         {

         }
         */

        /// <summary>
        /// Checks whether two edges are equal disregarding the direction of the edges
        /// </summary>
        /// <param name="other"></param>
        /// <returns></returns>

        public  Equals( other:DelanuayEdge ):Boolean
    {


        return ((this.p1 == other.p2) && (this.p2 == other.p1)) || ((this.p1 == other.p1) && (this.p2 == other.p2));


    }

    }

}