/**
 * Created by Mathdisk on 3/16/14.
 */


///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.extrusions {

    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Matrix3D = away.geom.Matrix3D;
    import Geometry = away.base.Geometry;
    import SubGeometry = away.base.SubGeometry;
    import MaterialBase = away.materials.MaterialBase;


    export class Delaunay
    {
    public static  Triangulate( vertices:any ):any
    {

        var nv:number = vertices.length;

        if (nv < 3) return [];

        var trimax:number = 4 * nv;

        // Find the maximum and minimum vertex bounds.
        // This is to allow calculation of the bounding supertriangle

        var xmin:number = vertices[0].X;
        var ymin:number = vertices[0].Y;
        var xmax:number = xmin;
        var ymax:number = ymin;

        for (var i:number = 1; i < nv; i++)
        {

            ( <DelanauyPoint>vertices[i]).id = i;

            if (vertices[i].X < xmin) xmin = vertices[i].X;

            if (vertices[i].X > xmax) xmax = vertices[i].X;

            if (vertices[i].Y < ymin) ymin = vertices[i].Y;

            if (vertices[i].Y > ymax) ymax = vertices[i].Y;

        }



        var dx:number = xmax - xmin;
        var dy:number = ymax - ymin;
        var dmax:number = (dx > dy) ? dx : dy;

        var xmid:number = (xmax + xmin) * 0.5;
        var ymid:number = (ymax + ymin) * 0.5;





        // Set up the supertriangle
        // This is a DelanayTriangle which encompasses all the sample points.
        // The supertriangle coordinates are added to the end of the
        // vertex list. The supertriangle is the first DelanayTriangle in
        // the DelanayTriangle list.

        vertices.push(new DelanauyPoint( (xmid - 2 * dmax), (ymid - dmax), nv+1 ) );
        vertices.push(new DelanauyPoint( xmid, (ymid + 2 * dmax), nv+2 ) );
        vertices.push(new DelanauyPoint((xmid + 2 * dmax), (ymid - dmax), nv+3));

        var Triangles:any = new Array();//array typé de triangles

        Triangles.push( new DelanayTriangle( vertices[ nv ], vertices[ nv + 1 ], vertices[ nv + 2 ] ) ); //SuperTriangle placed at index 0



        // Include each DelanauyPoint one at a time into the existing mesh
        for ( i = 0; i < nv; i++)
        {

            var Edges:any = new Array(); //[trimax * 3];

            // Set up the edge buffer.
            // If the DelanauyPoint (Vertex(i).x,Vertex(i).y) lies inside the circumcircle then the
            // three edges of that DelanayTriangle are added to the edge buffer and the DelanayTriangle is removed from list.
            for (var j:number = 0; j < Triangles.length; j++ )
            {

                if ( this.InCircle( vertices[ i ], <DelanauyPoint>Triangles[ j ].p1, <DelanauyPoint>Triangles[ j ].p2, <DelanauyPoint>Triangles[ j ].p3 ) )
                {

                    Edges.push(new DelanuayEdge(<DelanauyPoint>Triangles[j].p1, <DelanauyPoint>Triangles[j].p2) );

                    Edges.push(new DelanuayEdge(<DelanauyPoint>Triangles[j].p2, <DelanauyPoint>Triangles[j].p3) );

                    Edges.push(new DelanuayEdge(<DelanauyPoint>Triangles[j].p3, <DelanauyPoint>Triangles[j].p1) );

                    Triangles.splice( j,1 );

                    j--;

                }

            }

            if ( i >= nv) continue; //In case we the last duplicate DelanauyPoint we removed was the last in the array



            // Remove duplicate edges
            // Note: if all triangles are specified anticlockwise then all
            // interior edges are opposite pointing in direction.

            for ( j = Edges.length - 2; j >= 0; j--)
            {

                for (var k:number = Edges.length - 1; k >= j + 1; k--)
                {

                    if ( Edges[ j ].Equals( Edges[ k ] ) )
                    {

                        Edges.splice( k, 1 );
                        Edges.splice( j, 1 );
                        k--;
                        continue;

                    }

                }

            }

            // Form new triangles for the current DelanauyPoint
            // Skipping over any tagged edges.
            // All edges are arranged in clockwise order.
            for ( j = 0; j < Edges.length; j++)
            {

                if (Triangles.length >= trimax )
                {
                    //	throw new ApplicationException("Exceeded maximum edges");
                    console.log("Exceeded maximum edges");
                }
                Triangles.push( new DelanayTriangle(<DelanauyPoint> Edges[ j ].p1, <DelanauyPoint>Edges[ j ].p2, vertices[ i ] ));

            }

            Edges = [];

        }

        // Remove triangles with supertriangle vertices
        // These are triangles which have a vertex number greater than nv

        for ( i = Triangles.length - 1; i >= 0; i--)
        {

            if ( Triangles[ i ].p1.id >= nv || Triangles[ i ].p2.id >= nv || Triangles[ i ].p3.id >= nv)
            {

                Triangles.splice(i, 1);
            }

        }

        //Remove SuperTriangle vertices
        vertices.splice(vertices.length - 1, 1);
        vertices.splice(vertices.length - 1, 1);
        vertices.splice(vertices.length - 1, 1);

        Triangles.concat();
        return Triangles;

    }



        /// <summary>
        /// Returns true if the DelanauyPoint (p) lies inside the circumcircle made up by points (p1,p2,p3)
        /// </summary>
        /// <remarks>
        /// NOTE: A DelanauyPoint on the edge is inside the circumcircle
        /// </remarks>
        /// <param name="p">DelanauyPoint to check</param>
        /// <param name="p1">First DelanauyPoint on circle</param>
        /// <param name="p2">Second DelanauyPoint on circle</param>
        /// <param name="p3">Third DelanauyPoint on circle</param>
        /// <returns>true if p is inside circle</returns>

        private static  InCircle( p:DelanauyPoint, p1:DelanauyPoint, p2:DelanauyPoint, p3:DelanauyPoint ):Boolean

    {

        //Return TRUE if the DelanauyPoint (xp,yp) lies inside the circumcircle

        //made up by points (x1,y1) (x2,y2) (x3,y3)

        //NOTE: A DelanauyPoint on the edge is inside the circumcircle


        var Epsilon:number = .000000000000000000000000001;
        if ( Math.abs( p1.Y - p2.Y ) < Epsilon && Math.abs( p2.Y - p3.Y) < Epsilon)
        {

            //INCIRCUM - F - Points are coincident !!
            return false;

        }



        var m1:number;
        var m2:number;

        var mx1:number;
        var mx2:number;

        var my1:number;
        var my2:number;

        var xc:number;
        var yc:number;



        if ( Math.abs(p2.Y - p1.Y) < Epsilon)
        {

            m2 = -(p3.X - p2.X) / (p3.Y - p2.Y);

            mx2 = (p2.X + p3.X) * 0.5;

            my2 = (p2.Y + p3.Y) * 0.5;

            //Calculate CircumCircle center (xc,yc)
            xc = (p2.X + p1.X) * 0.5;

            yc = m2 * (xc - mx2) + my2;

        }
        else if ( Math.abs(p3.Y - p2.Y) < Epsilon)
        {

            m1 = -(p2.X - p1.X) / (p2.Y - p1.Y);

            mx1 = (p1.X + p2.X) * 0.5;

            my1 = (p1.Y + p2.Y) * 0.5;

            //Calculate CircumCircle center (xc,yc)

            xc = (p3.X + p2.X) * 0.5;

            yc = m1 * (xc - mx1) + my1;

        }
        else
        {

            m1 = -(p2.X - p1.X) / (p2.Y - p1.Y);

            m2 = -(p3.X - p2.X) / (p3.Y - p2.Y);

            mx1 = (p1.X + p2.X) * 0.5;

            mx2 = (p2.X + p3.X) * 0.5;

            my1 = (p1.Y + p2.Y) * 0.5;

            my2 = (p2.Y + p3.Y) * 0.5;

            //Calculate CircumCircle center (xc,yc)
            xc = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);

            yc = m1 * (xc - mx1) + my1;

        }



        var dx:number = p2.X - xc;

        var dy:number = p2.Y - yc;

        var rsqr:number = dx * dx + dy * dy;

        //double r = Math.Sqrt(rsqr); //Circumcircle radius

        dx = p.X - xc;

        dy = p.Y - yc;

        var drsqr:number = dx * dx + dy * dy;



        return ( drsqr <= rsqr );

    }

    }


}