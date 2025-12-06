/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping
{
    export class ExPolygon
    {
        public  outer:Polygon;
        public  holes:Polygons;
    }
}