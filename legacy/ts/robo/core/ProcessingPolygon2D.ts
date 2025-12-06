/**
 * Created by MohammedAzeem on 4/23/14.
 */



module robo.core {
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Matrix = away.geom.Matrix;
    import Point = away.geom.Point;
    import PMath = robo.util.PMath;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ExpressionError = roboexpressions.ExpressionError;
    import ProcessingLine2D = robo.core.ProcessingLine2D;

    export class ProcessingPolygon2D implements IIntersectable, ITransformable {
        public static TRANSFORMABLE_TYPE: number = 4;
        public points: Point[] = [];

        constructor(points: Point[]) {

            this.points = points;
        }

        public asLines(): ProcessingLine2D[] {
            var listOfLines: ProcessingLine2D[] = [];

            var pointList: Point[] = this.points;
            var len: number = pointList.length - 1; // Ignore the last point (it is same as first one added by polygon expression)
            for (var i: number = 0; i < len; i++) {
                var start: Point = pointList[i];
                var end: Point = pointList[(i + 1) % len];
                var lineObj: ProcessingLine2D = new ProcessingLine2D(start.x, start.y, end.x, end.y);

                listOfLines.push(lineObj);
            }
            return listOfLines;
        }


        public intersect(object: IIntersectable): Point[] {

            var intersectPtsCollection: Point[] = [];

            if (object instanceof ProcessingPolygon2D) {

                return this.intersectPolygonAndPolygon(<ProcessingPolygon2D>object);
            }

            var processingLines: ProcessingLine2D[] = this.asLines();

            for (var i: number = 0; i < processingLines.length; i++) {

                var polyLine: ProcessingLine2D = processingLines[i];

                if (object instanceof ProcessingCircle) {

                    var processingCircle: ProcessingCircle = <ProcessingCircle>object;

                    var intersectItems: Point[] = processingCircle.intersectLine(polyLine);

                    if (intersectItems.length > 0)
                        intersectPtsCollection = intersectPtsCollection.concat(intersectItems);
                }

                if (object instanceof ProcessingLine2D) {

                    var intersectItems: Point[] = polyLine.intersectAsSegment(<ProcessingLine2D>object);

                    if (intersectItems.length > 0)
                        intersectPtsCollection = intersectPtsCollection.concat(intersectItems);
                }
            }

            return intersectPtsCollection.reverse();
        }


        public intersectPolygonAndPolygon(object: ProcessingPolygon2D): Point[] {

            var intersectPtsCollection: Point[] = [];
            var processingLines: ProcessingLine2D[] = this.asLines();

            for (var i: number = 0; i < processingLines.length; i++) {

                var polyLine: ProcessingLine2D = processingLines[i];
                var intersectItems: Point[] = object.intersect(<ProcessingLine2D>polyLine);

                if (intersectItems.length > 0)
                    intersectPtsCollection = intersectPtsCollection.concat(intersectItems);
            }
            return intersectPtsCollection;
        }


        public asPolyPoints(arrayOfPointArray: any): void {
            arrayOfPointArray.push(this.points);
        }


        public getTranslatedObject(translationFucn: Function): IIntersectable {
            var transPoints: Point[] = [];
            for (var i: number = 0; i < this.points.length; i++) {
                transPoints[i] = translationFucn(this.points[i]);
            }

            var polygonObj: ProcessingPolygon2D = new ProcessingPolygon2D(transPoints);
            return polygonObj;
        }


        public dilateTransform(scaleValue: number, dilateAbout: Point): ITransformable {
            var rotatedPts: Point[] = Geometric2DUtil.dilatePoints(scaleValue, this.points,
                dilateAbout.x, dilateAbout.y);

            return <ITransformable>new ProcessingPolygon2D(rotatedPts);
        }

        public reflectTransform(point1: Point, point2: Point, ratio: number): ITransformable {
            var reflectedPts: Point[] = Geometric2DUtil.reflectPoints(this.points,
                point1.x, point1.y, point2.x, point2.y);

            var resultPts: Point[] = [];
            for (var i: number = 0; i < reflectedPts.length; i++) {
                var sourcePoint: Point = this.points[i];
                var reflectedPt: Point = reflectedPts[i];

                var newStartPt: Point = Point.interpolate(reflectedPt, sourcePoint, ratio);
                resultPts[resultPts.length] = newStartPt;
            }
            return <ITransformable>new ProcessingPolygon2D(resultPts);
        }

        public rotateTransform(angleInDegress: number, rotateAbout: Point): ITransformable {
            var rotatedPts: Point[] = Geometric2DUtil.rotatePoints(angleInDegress, this.points,
                rotateAbout.x, rotateAbout.y);

            return <ITransformable>new ProcessingPolygon2D(rotatedPts);
        }

        public translateTransform(tranValue: Point, tranAbout: Point): ITransformable {
            var rotatedPts: Point[] = Geometric2DUtil.translatePoints(this.points,
                tranValue.x, tranValue.y, tranAbout.x, tranAbout.y);

            return <ITransformable>new ProcessingPolygon2D(rotatedPts);
        }

        public getAsAtomicValues(): number[] {
            var coordinates: number[] = [];

            for (var i: number = 0; i < this.points.length; i++) {
                coordinates[coordinates.length] = this.points[i].x;
                coordinates[coordinates.length] = this.points[i].y;
            }

            return coordinates;
        }


        public translatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            var transPoints: Point[] = [];
            for (var i: number = 0; i < this.points.length; i++) {
                transPoints[i] = translationFucn(this.points[i]);
            }

            var polygonObj: ProcessingPolygon2D = new ProcessingPolygon2D(transPoints);
            return <ITransformable>polygonObj;
        }

        public reverseTranslatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            var transPoints: Point[] = [];
            for (var i: number = 0; i < this.points.length; i++) {
                transPoints[i] = translationFucn(this.points[i]);
            }

            var polygonObj: ProcessingPolygon2D = new ProcessingPolygon2D(transPoints);
            return <ITransformable>polygonObj;
        }

        public getType(): number {
            return ProcessingPolygon2D.TRANSFORMABLE_TYPE;
        }

        public getStartValue(): number[] {
            return [this.points[0].x, this.points[0].y];
        }

        public getStartValueAsPoint(): Point {
            return new Point(this.points[0].x, this.points[0].y)
        }

        public getEndValue(): number[] {
            var lastIndex: number = this.points.length - 1;
            return [this.points[lastIndex].x, this.points[lastIndex].y];
        }

        public getEndValueAsPoint(): Point {
            var lastIndex: number = this.points.length - 1;
            return new Point(this.points[lastIndex].x, this.points[lastIndex].y);
        }

        public getLabelPosition(): Point {
            var offsetVal: number = 0.25;
            return new Point();
        }

        public positionIndex(index: number): Point {
            if (index == this.points.length) {
                var firstPoint: Point = this.points[0];
                var lastPoint: Point = this.points[this.points.length - 1];

                if (Point.distance(firstPoint, lastPoint) == 0) {
                    return null;
                }
            }

            if (index <= this.points.length) {
                var point: Point = this.points[index - 1];
                return point;
            }
            return null;
        }

        public reverse(): ITransformable {
            var newReversedPts: Point[] = this.points.slice(0).reverse();
            return new ProcessingPolygon2D(newReversedPts);
        }

        public projectTransform(point1: Point, point2: Point, ratio: number): ITransformable {

            return null;
        }

        pointAtRatio(ratio): Point {
            var polyPoints = [];
            this.asPolyPoints(polyPoints);

            var maxPoints = 360;

            // @ts-ignore
            var interPointValues: any = ProcessingLine2D.polylineInterpolate(polyPoints[0], maxPoints);

            var index: number = 0;
            var interPoints: any = []; // @ts-ignore
            for (var i: number = 0; i < interPointValues.length; i++) {
                // @ts-ignore
                interPoints[index++] = new Point(interPointValues[i][0], interPointValues[i][1]);
            }

            // @ts-ignore
            var ratioIndex = Math.floor(PMath.map(ratio, 0, 1, 0, (maxPoints - 1)));
            return interPoints[ratioIndex];
        }


        part(fromRatio, toRatio) {
            var small = toRatio > fromRatio ? fromRatio : toRatio;
            var big = toRatio > fromRatio ? toRatio : fromRatio;
            var fromPoint = this.pointAtRatio(small);
            var toPoint = this.pointAtRatio(big);

            if (!fromPoint || !toPoint) {
                throw new Error(" Part cannot be extracted as it is out of range")
            }
            return this.includeParts(fromPoint, toPoint);
        }

        getIntersectingLineIndices(fromPoint, toPoint) {
            var lines: ProcessingLine2D[] = this.asLines();
            var startLineIndex = -1;
            var endLineIndex = -1;
            for (var i: number = 0; i < lines.length; i++) {
                if (lines[i].contains(fromPoint)) {
                    startLineIndex = i;
                    break;
                }
            }

            for (var i: number = 0; i < lines.length; i++) {
                if (lines[i].contains(toPoint)) {
                    endLineIndex = i;
                    break;
                }
            }


            return {
                fromLineIndex: startLineIndex,
                toLineIndex: endLineIndex
            }
        }

        includeParts(fromPoint, toPoint) {
            var lines: ProcessingLine2D[] = this.asLines();
            var lineIndices = this.getIntersectingLineIndices(fromPoint, toPoint);

            var fromLineIndex = lineIndices.fromLineIndex;
            var toLineIndex = lineIndices.toLineIndex;

            if (fromLineIndex == -1) {
                throw new Error(' The from Point doesnt lie on the Polygon')
            }

            if (toLineIndex == -1) {
                throw new Error(' The To Point doesnt lie on the Polygon')
            }

            if (fromLineIndex == toLineIndex) {
                var lineFromRatio = lines[fromLineIndex].ratioAt(fromPoint.x, fromPoint.y);
                var firstLineStartPt = lines[fromLineIndex].pointAt(lineFromRatio);
                var lineToRatio = lines[toLineIndex].ratioAt(toPoint.x, toPoint.y);
                var lastLineEndPt = lines[toLineIndex].pointAt(lineToRatio);

                return [
                    ProcessingPointPair2D.fromPoints2([firstLineStartPt, lastLineEndPt], [])
                ]
            }

            if (fromLineIndex > toLineIndex) {
                lineIndices = this.getIntersectingLineIndices(toPoint, fromPoint)
                fromLineIndex = lineIndices.fromLineIndex;
                toLineIndex = lineIndices.toLineIndex;

                var tempPoint = fromPoint;
                fromPoint = toPoint;
                toPoint = tempPoint;
            }


            var points = [];
            if (fromLineIndex > -1 && toLineIndex > -1) {
                var lineFromRatio = lines[fromLineIndex].ratioAt(fromPoint.x, fromPoint.y);
                var firstLineStartPt = lines[fromLineIndex].pointAt(lineFromRatio);
                var firstLineEndPt = lines[fromLineIndex].getEndValueAsPoint();
                points.push(firstLineStartPt);
                points.push(firstLineEndPt);

                for (var j = fromLineIndex + 1; j < toLineIndex - 1; j++) {
                    points.push(lines[j].getStartValueAsPoint())
                    points.push(lines[j].getEndValueAsPoint())
                }
                var lineToRatio = lines[toLineIndex].ratioAt(toPoint.x, toPoint.y);
                var lastLineStartPt = lines[toLineIndex].getStartValueAsPoint();
                var lastLineEndPt = lines[toLineIndex].pointAt(lineToRatio);
                points.push(lastLineStartPt);
                points.push(lastLineEndPt);
            }

            return [
                ProcessingPointPair2D.fromPoints2(points, [])
            ]
        }

        /**
         * returns array of parts
         * @param fromPointA
         * @param toPointB
         */
        excludeParts(fromPoint, toPoint) {
            var lines: ProcessingLine2D[] = this.asLines();
            var lineIndices = this.getIntersectingLineIndices(fromPoint, toPoint)
            var fromLineIndex = lineIndices.fromLineIndex;
            var toLineIndex = lineIndices.toLineIndex;

            if (fromLineIndex < 0 || fromLineIndex > lines.length) {
                throw new Error(' The from Point doesnt lie on the Polygon')
            }

            if (toLineIndex < 0 || toLineIndex > lines.length) {
                throw new Error(' The To Point doesnt lie on the Polygon')
            }

            var swap = false;
            if (fromLineIndex > toLineIndex) {
                lineIndices = this.getIntersectingLineIndices(toPoint, fromPoint)
                fromLineIndex = lineIndices.fromLineIndex;
                toLineIndex = lineIndices.toLineIndex;

                var tempPoint = fromPoint;
                fromPoint = toPoint;
                toPoint = tempPoint;

                swap = true;
            }

            // if the first intersection happens on nth line, the collect points upto n-1
            var firstPartPoints = [];
            for (var j = 0; j < fromLineIndex; j++) {
                firstPartPoints.push(lines[j].getStartValueAsPoint())
                firstPartPoints.push(lines[j].getEndValueAsPoint());
            }

            // firstLineStartPt refers to the line on whic the point lies - not the first line of the polygon
            var firstLineStartPt = lines[fromLineIndex].getStartValueAsPoint();
            var lineFromRatio = lines[fromLineIndex].ratioAt(fromPoint.x, fromPoint.y);
            var firstLineEndPt = lines[fromLineIndex].pointAt(lineFromRatio);
            lines[fromLineIndex].getEndValueAsPoint();
            firstPartPoints.push(firstLineStartPt);
            firstPartPoints.push(firstLineEndPt);

            var secondPartPoints = [];
            var lineToRatio = lines[toLineIndex].ratioAt(toPoint.x, toPoint.y);
            var lastLineStartPt = lines[toLineIndex].pointAt(lineToRatio);
            var lastLineEndPt = lines[toLineIndex].getEndValueAsPoint();

            secondPartPoints.push(lastLineStartPt);
            secondPartPoints.push(lastLineEndPt);

            for (var j = toLineIndex + 1; j < lines.length; j++) {
                secondPartPoints.push(lines[j].getStartValueAsPoint())
                secondPartPoints.push(lines[j].getEndValueAsPoint())
            }

            // Ensure continuity
            if (secondPartPoints[secondPartPoints.length - 1].equals(firstPartPoints[0])) {
                var tempPoints = secondPartPoints;
                secondPartPoints = firstPartPoints;
                firstPartPoints = tempPoints;
            }

            var allPoints = firstPartPoints.concat(secondPartPoints);

            // remove duplicates
            var filteredPoints = [];
            filteredPoints.push(allPoints[0]);
            for (var i = 1; i < allPoints.length; i++) {
                if (filteredPoints[filteredPoints.length - 1].equals(allPoints[i])) {
                    continue;
                }
                filteredPoints.push(allPoints[i])
            }


            return [
                ProcessingPointPair2D.fromPoints2(filteredPoints, []),
            ]
        }


    }
}
