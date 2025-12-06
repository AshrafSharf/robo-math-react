/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>


/**
 * const polygonClipping = require('polygon-clipping')
 * const poly1 = [[[0,0],[2,0],[0,2],[0,0]]]
 * const poly2 = [[[-1,0],[1,0],[0,1],[-1,0]]]
 * polygonClipping.union       (poly1, poly2 , poly3, ... )
 * polygonClipping.intersection(poly1, poly2 , poly3, ... )
 * polygonClipping.xor         (poly1, poly2  , poly3, ... )
 * polygonClipping.difference  (poly1, poly2 , poly3, ... )
 */
module robo.geom {

    var polygonClipping = window["polygonClipping"];
    var earcut = window["earcut"];
    var Flatten = window["@flatten-js/core"];
    var Polygon = Flatten.Polygon;
    var point = Flatten.point;
    var subtract = Flatten.BooleanOperations.subtract;

    export class PolyClipping {

        public static INTERSECTION: number = 0;
        public static UNION: number = 1;
        public static DIFFERENCE: number = 2;
        public static XOR: number = 3;
        public static SUBTRACT: number = 4;

        constructor() {

        }


        /**
         *
         * @param polygonCollection array of polygon (each polygon is a array of 2 value array
         */
        union(polygonCollection) {
            return polygonClipping.union.apply(null, polygonCollection);
        }

        intersection(polygonCollection) {
            return polygonClipping.intersection.apply(null, polygonCollection);
        }

        diff(polygonCollection) {
            return polygonClipping.difference.apply(null, polygonCollection);
        }

        xor(polygonCollection) {
            return polygonClipping.xor.apply(null, polygonCollection);
        }


        subtract(surface, hole) {
            var a = this.toFlattenPoly(surface);
            var b = this.toFlattenPoly(hole);
            var polygon = subtract(a,b);
            return this.flattenOutToNumberedArray(polygon);
        }

        toFlattenPoly(surface) {
            var a = new Polygon();
            for (var i = 0; i < surface.length; i++) {
                var polygon = surface[i];
                var face = a.addFace(polygon.map((pts) => point(pts[0], pts[1])));
                if (face.orientation() !== Flatten.ORIENTATION.CCW) {
                    face.reverse();
                }
            }
            return a;
        }

        cut(surface, hole) {
           var a = this.toFlattenPoly(surface);
           var b = this.toFlattenPoly(hole);


            if (a.intersect(b).length) {
                return this.diff([surface, hole]);
            }



            try {
            // Check if one of the polygon in inside the other
            if (a.contains(b) || b.contains(a)) {
                return this.getPolyWithHole(a, b);
            }
            }
            catch(e) {
                return this.diff([surface, hole]);
            }

            return this.diff([surface, hole]);

        }

        flattenOutToNumberedArray(outPolygonCollection) {
            var polygons = outPolygonCollection.toArray();
            var numberedPolygons = [];

            for (var k = 0; k < polygons.length; k++) {
                var processed = polygons[k];
                var vertices = processed.vertices;

                var outPoly = [];

                for (var v = 0; v < vertices.length; v++) {
                    outPoly.push([vertices[v].x, vertices[v].y])
                }

                numberedPolygons.push(outPoly);
            }

            return [numberedPolygons]; // Make it compatible with other libs
        }


        /**
         * https://gis.stackexchange.com/questions/21935/algorithm-for-displaying-holes-in-a-polygon-by-translating-it-into-several-hole
         *
         * P1,P2,...,Pn,P1,H1,H2,...,Hm,H1,P1
         */
        getPolyWithHole(a, b) {
            var outerPoly, innerPoly;
            if (a.contains(b)) {
                outerPoly = a;
                innerPoly = b;
            } else {
                outerPoly = b;
                innerPoly = a;
            }


            var outerVertices = outerPoly.vertices;
            var innerVertices = innerPoly.vertices;

            var outPoly = [];
            for (var v = 0; v < outerVertices.length; v++) {
                outPoly.push(outerVertices[v].x, outerVertices[v].y)
            }

            for (var h = 0; h < innerVertices.length; h++) {
                outPoly.push(innerVertices[h].x, innerVertices[h].y)
            }


            var result = earcut(outPoly, [outerVertices.length]);
            var dim = 2;
            var numberedPolygons = [];
            for (var i = 0; i < result.length - 2; i += 3) {
                var p1 = result[i];
                var p2 = result[i + 1];
                var p3 = result[i + 2];
                var polygon = [];
                polygon.push([outPoly[p1 * dim], outPoly[(p1 * dim) + 1]]);
                polygon.push([outPoly[p2 * dim], outPoly[(p2 * dim) + 1]])
                polygon.push([outPoly[p3 * dim], outPoly[(p3 * dim) + 1]])
                polygon.push([outPoly[p1 * dim], outPoly[(p1 * dim) + 1]]);
                numberedPolygons.push(polygon);
            }

            return [numberedPolygons];
        }

    }


}
