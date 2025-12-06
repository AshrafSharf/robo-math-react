/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.polyclipping {

    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;

    export class ClipOperation {
        aPolyItem:ISetItem;
        bPolyItem:ISetItem;

        constructor(aPolyItem:ISetItem, bPolyItem:ISetItem) {
            this.aPolyItem = aPolyItem;
            this.bPolyItem = bPolyItem;
        }


        public  execute():ISetItem {
            return this.doExecute();
        }

        doExecute():ISetItem {

            var subjectPolygons:any =this.aPolyItem.getMembers();
            var clipPolygons:any = this.bPolyItem.getMembers();

            var subjectPolygonPoints:any;
            var clipPolygonPoints:any;

            var resultPolygons:any = new ArrayHelper();


            var partialResult:any = Clipper.clipMultiPolygons(subjectPolygons, clipPolygons, this.getOperationType());

            resultPolygons.addAll(partialResult);


            return new ClipResultPolyItem(resultPolygons);
        }


        combinePolygons(polyArray:any):any {

            if (polyArray.length <= 1)
                return polyArray;

            var resultPolygons:any = new ArrayHelper();

            for (var i:number = 0; i < polyArray.length - 1; i++) {
                var partialResult:any = Clipper.clipPolygon(polyArray[i], polyArray[i + 1], ClipType.UNION);
                resultPolygons.addAll(partialResult);
            }
            return resultPolygons;
        }


        combineAsPointArray(polyArray:any):any {
            if (polyArray.length <= 1)
                return polyArray;

            var resultPolygons:any = new ArrayHelper();

            var pointArray:any = new ArrayHelper();

            for (var i:number = 0; i < polyArray.length - 1; i++) {
                var partialArray:any = polyArray[i];

                for (var j:number = 0; j < partialArray.length; j++) {
                    var point:any = partialArray[j];
                    pointArray.addItem(point);
                }
            }

            resultPolygons.addItem(pointArray);

            return resultPolygons;
        }


        getAsPointArray(polygon:Polygon):any {

            var pointArray:any = new ArrayHelper();
            var intPoints:IntPoint[] = polygon.getPoints();

            for(var i:number=0;i<intPoints.length;i++)
            {
                var intPoint:IntPoint = intPoints[i];
                pointArray.addItem(new Point(intPoint.X, intPoint.Y));
            }
            return pointArray;
        }


        getOperationType():number {
            return 0;
        }

    }

}