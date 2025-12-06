/**
 * Created by Mathdisk on 3/17/14.
 */
module robo.core {
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Matrix = away.geom.Matrix;
    import Point = away.geom.Point;
    import PMath = robo.util.PMath;
    import Geometric2DUtil = robo.core.Geometric2DUtil;


    export class ProcessingLine2D implements IIntersectable, ITransformable {
        private _x1: number;
        private _y1: number;
        private _x2: number;
        private _y2: number;

        public static TRANSFORMABLE_TYPE: number = 2;

        constructor(x1: number, y1: number, x2: number, y2: number) {
            this.x1 = x1;
            this.y1 = y1;
            this.x2 = x2;
            this.y2 = y2;

        }

        public static polylineInterpolate(ctrlPoints, number, offsetDist = 0, minGap = 0) {

            var index: number = 0;
            var pointValues: any = []; // @ts-ignore
            for (var i: number = 0; i < ctrlPoints.length; i++) {
                // @ts-ignore
                pointValues[index++] = [ctrlPoints[i].x, ctrlPoints[i].y]
            }

            return interpolateLineRange(pointValues, number, offsetDist, minGap);
        }

        public static fromPoints(p1: Point, p2: Point): ProcessingLine2D {
            return new ProcessingLine2D(p1.x, p1.y, p2.x, p2.y);
        }

        public get startPoint(): Point {
            return new Point(this.x1, this.y1);
        }


        public get endPoint(): Point {
            return new Point(this.x2, this.y2);
        }


        public dx(): number {
            return this.x2 - this.x1;
        }

        public dy(): number {
            return this.y2 - this.y1;
        }


        public static lineByMedian(p1: Point, p2: Point): ProcessingLine2D {
            var mid: Point = Point.interpolate(p1, p2, 0.5);
            var line: ProcessingLine2D = new ProcessingLine2D(p1.x, p1.y, p2.x, p2.y);
            return line.perp(mid);
        }

        public static lineThrough(px: number, py: number, dirX: number, dirY: number, mag: number = 5): ProcessingLine2D {
            //ScriptMethodArgumentValidator.validateNumericalArgumentsWithArgName("lineThrough",["px","py","dirX","dirY","mag"],[px,py,dirX,dirY,mag]);

            var direction: Point = new Point(dirX, dirY);
            direction.normalize(1);

            var passThrough: Point = new Point(px, py);

            var dirStart: Point = direction.clone();
            dirStart.normalize(-mag / 2);

            var dirEnd: Point = direction.clone();
            dirEnd.normalize(mag / 2);

            var startPoint: Point = passThrough.add(dirStart);
            var endPoint: Point = passThrough.add(dirEnd);

            return new ProcessingLine2D(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        }

        public get x1(): number {
            return this._x1;
        }

        public set x1(value: number) {
            this._x1 = value;
        }

        public get y1(): number {
            return this._y1;
        }

        public set y1(value: number) {
            this._y1 = value;
        }

        public get x2(): number {
            return this._x2;
        }

        public set x2(value: number) {
            this._x2 = value;
        }

        public get y2(): number {
            return this._y2;
        }

        public set y2(value: number) {
            this._y2 = value;
        }

        /**
         * returns null if no intersection is found
         */
        public intersectAsLine(other: ProcessingLine2D): Point {
            var intersectPt: Point = Geometric2DUtil.intersectLines(this.x1, this.y1, this.x2, this.y2, other.x1, other.y1, other.x2, other.y2);

            return intersectPt;
        }


        public intersectAsSegment(other: ProcessingLine2D): Point[] {
            var intersectPt: Point = Geometric2DUtil.intersectSegments(this.x1, this.y1, this.x2, this.y2, other.x1, other.y1, other.x2, other.y2);

            if (intersectPt == null) {
                return [];
            }

            if (this.winthInRange(intersectPt) && other.winthInRange(intersectPt)) {
                return [intersectPt];
            }
            return [];
        }

        public project(inputPointX: number, inputPointY: number): Point {
            return Geometric2DUtil.project(inputPointX, inputPointY, this.x1, this.y1, this.x2, this.y2);
        }


        public reflect(pointX: number, pointY: number): Point {
            return Geometric2DUtil.reflect(pointX, pointY, this.x1, this.y1, this.x2, this.y2);
        }


        public angle(): number {
            var dist: number = Point.distance(new Point(this.x1, this.y1), new Point(this.x2, this.y2));
            if (PMath.isZero(dist))
                return 0;

            return PMath.horizontalAngle(new Point(this.x1, this.y1), new Point(this.x2, this.y2));

        }

        public constant(): number {
            return (this.x1 * this.y2) - (this.y1 * this.x2);
        }

        public normal(): Point {
            return new Point(this.y1 - this.y2, this.x2 - this.x1);
        }


        /**
         * Returns the signed distance of the StraightObject2d to the given point.
         * The signed distance is positive if point lies 'to the right' of the
         * line, when moving in the direction given by direction vector.
         */
        public signedDistance(p: Point): number {
            var delta = PMath.hypot(this.dx(), this.dy());

            if (delta < 0.00000001)
                return Infinity;

            return ((p.x - this.x1) * this.dy() - (p.y - this.y1) * this.dx()) / delta;
        }


        public slope(): Point {
            var normalPoint: Point = this.normal();
            return new Point(normalPoint.y, -normalPoint.x);
        }

        /**
         * A line parallel through this line nd passing through px,py
         */
        public parallel(px: number, py: number): ProcessingLine2D {
            var startPoint: Point = new Point(px, py);
            var endPoint: Point = new Point();

            var slopePoint: Point = this.slope();

            endPoint.x = startPoint.x + slopePoint.x;
            endPoint.y = startPoint.y + slopePoint.y;

            return ProcessingLine2D.fromPoints(startPoint, endPoint);
        }


        public parallelByDist(dist: number): ProcessingLine2D {
            var dx1: number = this.dx();
            var dy1: number = this.dy();

            var d2: number = Point.distance(this.startPoint, this.endPoint);
            d2 = dist / d2;

            return ProcessingLine2D.lineThrough(this.x1 + dy1 * d2, this.y1 - dx1 * d2, dx1, dy1);
        }

        public translate(tx: number, ty: number): ProcessingLine2D {
            return new ProcessingLine2D(this.x1 + tx, this.y1 + ty, this.x2 + tx, this.y2 + ty);
        }


        public rotate(rotationDegress: number, ox: number = 0, oy: number = 0): ProcessingLine2D {
            var rotatedPt1: Point = Geometric2DUtil.rotatePoint(rotationDegress, this.x1, this.y1, ox, oy);
            var rotatedPt2: Point = Geometric2DUtil.rotatePoint(rotationDegress, this.x2, this.y2, ox, oy);

            return new ProcessingLine2D(rotatedPt1.x, rotatedPt1.y, rotatedPt2.x, rotatedPt2.y);
        }


        public scale(sx: number, sy: number): ProcessingLine2D {
            var matrix: Matrix = new Matrix();
            matrix.scale(sx, sy);

            var scaledStartPoint: Point = matrix.transformPoint(new Point(this.x1, this.y1));
            var scaledEndPoint: Point = matrix.transformPoint(new Point(this.x2, this.y2));

            return new ProcessingLine2D(scaledStartPoint.x, scaledStartPoint.y, scaledEndPoint.x, scaledEndPoint.y);
        }

        public normalize(len: number): ProcessingLine2D {
            var slopeDirection: Point = this.slope();

            if (slopeDirection.equals(new Point(0, 0)) == false)
                slopeDirection.normalize(len);

            var normaizedEndPt: Point = this.startPoint.add(slopeDirection);
            return new ProcessingLine2D(this.startPoint.x, this.startPoint.y, normaizedEndPt.x, normaizedEndPt.y);
        }

        /**
         * A line perpendicular through this line nd passing through px,py
         */
        public perp(through: Point): ProcessingLine2D {
            var normalPoint: Point = this.normal();

            var endPoint: Point = new Point(through.x - normalPoint.x, through.y - normalPoint.y);

            return new ProcessingLine2D(through.x, through.y, endPoint.x, endPoint.y);
        }


        /**
         * parameter typically ranges from 0 t0 1 (not necessary)
         */
        public pointAt(parameter: number): Point {
            var x: number = this.x1 + parameter * (this.x2 - this.x1);
            var y: number = this.y1 + parameter * (this.y2 - this.y1);

            return new Point(x, y);
        }

        /**P = p1 + t*[p2-p1]
         * where p1 = startPoint
         * p2 = endPoint
         * t = interpolatedValue
         * p = givenPoint
         *
         * (p - p1) = t*(p2 - p1)
         * do (p - p1).(p - p1) = t* (p-p1).(p2-p1)
         * there is no division between vectors, So here we make vector as number
         * by using dot product , then find interpolatedValue
         * t = (p - p1).(p - p1) /  (p-p1).(p2-p1)*/

        public ratioAt(x: number, y: number): number {
            var P: Vector3D = new Vector3D(x, y, 0);
            var P1: Vector3D = new Vector3D(this.x1, this.y1, 0);
            var P2: Vector3D = new Vector3D(this.x2, this.y2, 0);

            var interpolatedValue: number = P.subtract(P1).dotProduct(P.subtract(P1)) / P2.subtract(P1).dotProduct(P.subtract(P1));
            if (isNaN(interpolatedValue) || !isFinite(interpolatedValue)) {
                var distance: number = Point.distance(new Point(x, y), new Point(this.x1, this.y1));
                if (PMath.isZero(distance, 0.02))
                    return 0;

                var distance: number = Point.distance(new Point(x, y), new Point(this.x2, this.y2));
                if (PMath.isZero(distance, 0.02))
                    return 1;

                return -1000;
            }


            return interpolatedValue;
        }


        /**
         * Returns true if the given point lies to the left of the line when
         * traveling along the line in the direction given by its direction vector.
         *
         * @param p the point to test
         * @return true if point p lies on the 'left' of the line.
         */
        public isInside(p: Point): boolean {
            return ((p.x - this.x1) * this.dy() - (p.y - this.y1) * this.dx() < 0);
        }


        /**
         * Returns true if the point  lies on the line covering the object
         *
         */
        public contains(pt: Point): boolean {
            var x: number = pt.x;
            var y: number = pt.y;

            var denom: number = PMath.hypot(this.dx(), this.dy());
            return (Math.abs((x - this.x1) * this.dy() - (y - this.y1) * this.dx()) / denom < 0.000000000001);
        }


        /**
         * Returns the position of the closest point on the line arc.
         * If the point belongs to the line, this position is defined by the ratio:
         * <p>
         * <code> t = (xp - x0)/dx <\code>, or equivalently:<p>
         * <code> t = (yp - y0)/dy <\code>.<p>
         * If point does not belong to line, returns t0, or t1, depending on which
         * one is the closest.
         */
        public projectPosition(x: number, y: number): number {
            var pos: number = this.positionOnLine(x, y);

            // Bounds between t0 and t1
            return Math.min(Math.max(pos, -Infinity), Infinity);
        }

        /**
         * Computes position on the line of the point given by (x,y).
         * The position is the number t such that if the point
         * belong to the line, it location is given by x=x0+t*dx and y=y0+t*dy.
         * <p>
         * If the point does not belong to the line, the method returns the position
         * of its projection on the line.
         */
        public positionOnLine(x: number, y: number): number {
            var denom: number = this.dx() * this.dx() + this.dy() * this.dy();
            if (Math.abs(denom) < 0.0000000001)
                throw new Error("Line is Degenerate");

            return ((y - this.y1) * this.dy() + (x - this.x1) * this.dx()) / denom;
        }


        public copy(): ProcessingLine2D {
            return new ProcessingLine2D(this.x1, this.y1, this.x2, this.y2);
        }


        /**
         * @param box1:lower end of the Box
         * @param box2 upper end of the box
         * @returns array of points or empty
         */
        public intersectBox(box1: Point, box2: Point): Point[] {
            var r1: Point = new Point(this.x1, this.y1);
            var r2: Point = new Point(this.x2, this.y2);
            // lower values of bounding box
            var b1: Point = new Point();
            // higher values of bounding box
            var b2: Point = new Point();

            b1.x = Math.min(box1.x, box2.x);
            b1.y = Math.min(box1.y, box2.y);
            b2.x = Math.max(box1.x, box2.x);
            b2.y = Math.max(box1.y, box2.y);

            if (b2.x < Math.min(r1.x, r2.x) || b1.x > Math.max(r1.x, r2.x)) return [];
            if (b2.y < Math.min(r1.y, r2.y) || b1.y > Math.max(r1.y, r2.y)) return [];

            var arr: Point[] = [];
            var tnear: number;	// near value on plane
            var tfar: number;	// far value on plane

            tnear = Math.max((b1.x - r1.x) / (r2.x - r1.x), (b1.y - r1.y) / (r2.y - r1.y));
            tfar = Math.min((b2.x - r1.x) / (r2.x - r1.x), (b2.y - r1.y) / (r2.y - r1.y));
            if (tnear < tfar) {
                if (tnear >= 0 && tnear <= 1) arr[0] = Point.interpolate(r2, r1, tnear);
                if (tfar >= 0 && tfar <= 1) arr[1] = Point.interpolate(r2, r1, tfar);
                return arr;
            }

            tnear = Math.min((b1.x - r1.x) / (r2.x - r1.x), (b1.y - r1.y) / (r2.y - r1.y));
            tfar = Math.max((b2.x - r1.x) / (r2.x - r1.x), (b2.y - r1.y) / (r2.y - r1.y));
            if (tnear > tfar) {
                if (tnear >= 0 && tnear <= 1) arr[0] = Point.interpolate(r2, r1, tnear);
                if (tfar >= 0 && tfar <= 1) arr[1] = Point.interpolate(r2, r1, tfar);
                return arr;
            }

            tnear = Math.min((b2.x - r1.x) / (r2.x - r1.x), (b1.y - r1.y) / (r2.y - r1.y));
            tfar = Math.max((b1.x - r1.x) / (r2.x - r1.x), (b2.y - r1.y) / (r2.y - r1.y));
            if (tnear > tfar) {
                if (tnear >= 0 && tnear <= 1) arr[0] = Point.interpolate(r2, r1, tnear);
                if (tfar >= 0 && tfar <= 1) arr[1] = Point.interpolate(r2, r1, tfar);
                return arr;
            }

            tnear = Math.max((b2.x - r1.x) / (r2.x - r1.x), (b1.y - r1.y) / (r2.y - r1.y));
            tfar = Math.min((b1.x - r1.x) / (r2.x - r1.x), (b2.y - r1.y) / (r2.y - r1.y));
            if (tnear < tfar) {
                if (tnear >= 0 && tnear <= 1) arr[0] = Point.interpolate(r2, r1, tnear);
                if (tfar >= 0 && tfar <= 1) arr[1] = Point.interpolate(r2, r1, tfar);
                return arr;
            }

            return [];
        }


        /**
         * Get the distance of the point (x, y) to this edge.
         */

        public distance(x: number, y: number): number {
            var proj: Point = this.project(x, y);
            if (this.contains(proj))
                return Point.distance(proj, new Point(x, y));

            var d1 = PMath.hypot(this.x1 - x, this.y1 - y);
            var d2 = PMath.hypot(this.x1 + this.dx() - x, this.y1 + this.dy() - y);

            return Math.min(d1, d2);
        }


        public length(): number {
            return PMath.hypot(this.dx(), this.dy());
        }


        public static isParallel(line1: ProcessingLine2D, line2: ProcessingLine2D): boolean {
            var ACCURACY: number = 1e-10;

            return (Math.abs(line1.dx() * line2.dy() - line1.dy() * line2.dx()) < ACCURACY);
        }


        public static isColinear(pt1: Point, pt2: Point, pt3: Point): boolean {
            var line1: ProcessingLine2D = new ProcessingLine2D(pt1.x, pt1.y, pt2.x, pt2.y);
            var line2: ProcessingLine2D = new ProcessingLine2D(pt2.x, pt2.y, pt3.x, pt3.y);

            return ProcessingLine2D.isParallel(line1, line2);
        }


        /**
         * Array of line2D input
         * output - array of point2d objects
         */
        public static polyLineIntersect(lines: ProcessingLine2D[]): Point[] {
            var intersectedPoints: Point[] = [];

            for (var i: number = 0; i < lines.length; i++) {
                for (var j: number = i; j < lines.length; j++) {
                    var line1: ProcessingLine2D = lines[i];
                    var line2: ProcessingLine2D = lines[j];

                    var result: Point = line1.intersectAsLine(line2);
                    if (result != null) {
                        intersectedPoints.push(result);
                    }
                }
            }
            return intersectedPoints;
        }


        public winthInRange(point: Point): boolean {
            if (isNaN(point.x) || isNaN(point.y)) {
                return false;
            }

            var ptRatio: number = this.ratioAt(point.x, point.y);

            if (PMath.isWithInRange(ptRatio, 0, 1, 0.001)) {
                return true;
            }
            return false;
        }


        public intersect(object: IIntersectable): Point[] {

            if (object instanceof ProcessingCircle) {

                var processingCircle: ProcessingCircle = <ProcessingCircle>object;
                return processingCircle.intersectLine(this);
            }

            if (object instanceof ProcessingLine2D) {
                return this.intersectAsSegment(<ProcessingLine2D>object);
            }

            if (object instanceof ProcessingPolygon2D) {
                return object.intersect(<ProcessingLine2D>this);
            }

            return [];
        }

        public getPerpLinePassingThroughPoint(inputPt: Point, lineLength: number): Point[] {

            var perpLine: ProcessingLine2D = this.perp(new Point(inputPt.x, inputPt.y));

            var normalizedLine1: ProcessingLine2D = perpLine.normalize(lineLength / 2);
            var endPoint1: Point = new Point(normalizedLine1.x2, normalizedLine1.y2);

            var normalizedLine2: ProcessingLine2D = perpLine.normalize(-lineLength / 2);
            var endPoint2: Point = new Point(normalizedLine2.x2, normalizedLine2.y2);

            var inputs: Point[] = [endPoint1, endPoint2];
            inputs.reverse();

            return inputs;
        }

        public getParallelLinePassingThroughPoint(inputPt: Point, lineLength: number): Point[] {

            var parallelLine: ProcessingLine2D = this.parallel(inputPt.x, inputPt.y);

            var normalizedLine1: ProcessingLine2D = parallelLine.normalize(lineLength / 2);
            var endPoint1: Point = new Point(normalizedLine1.x2, normalizedLine1.y2);

            var normalizedLine2: ProcessingLine2D = parallelLine.normalize(-lineLength / 2);
            var endPoint2: Point = new Point(normalizedLine2.x2, normalizedLine2.y2);

            var inputs: Point[] = [endPoint1, endPoint2];
            return inputs;
        }


        public asPolyPoints(arrayOfPointArray: any): void {

        }

        public getTranslatedObject(translationFucn: Function): IIntersectable {
            return this.transformedProcessLine(translationFucn);
        }


        dilateTransform(scaleValue: number, dilateAbout: Point): ITransformable {
            var dilatedStartPt: Point = Geometric2DUtil.dilate(scaleValue, this.startPoint.x, this.startPoint.y,
                dilateAbout.x, dilateAbout.y);

            var dilatedEndPt: Point = Geometric2DUtil.dilate(scaleValue, this.endPoint.x, this.endPoint.y,
                dilateAbout.x, dilateAbout.y);

            return new ProcessingLine2D(dilatedStartPt.x, dilatedStartPt.y, dilatedEndPt.x, dilatedEndPt.y);
        }

        public reflectTransform(point1: Point, point2: Point, ratio: number): ITransformable {
            var reflectedStartPt: Point = Geometric2DUtil.reflect(this.startPoint.x, this.startPoint.y,
                point1.x, point1.y, point2.x, point2.y);

            var reflectedEndPt: Point = Geometric2DUtil.reflect(this.endPoint.x, this.endPoint.y,
                point1.x, point1.y, point2.x, point2.y);

            var newStartPt: Point = Point.interpolate(reflectedStartPt, this.startPoint, ratio);
            var newEndPoint: Point = Point.interpolate(reflectedEndPt, this.endPoint, ratio);

            return new ProcessingLine2D(newStartPt.x, newStartPt.y, newEndPoint.x, newEndPoint.y);
        }

        public projectTransform(point1: Point, point2: Point, ratio: number): ITransformable {

            return null;
        }

        public rotateTransform(angleInDegress: number, rotateAbout: Point): ProcessingLine2D {
            var rotatedStartPt: Point = Geometric2DUtil.rotatePoint(angleInDegress, this.startPoint.x, this.startPoint.y,
                rotateAbout.x, rotateAbout.y);

            var rotatedEndPt: Point = Geometric2DUtil.rotatePoint(angleInDegress, this.endPoint.x, this.endPoint.y,
                rotateAbout.x, rotateAbout.y);

            return new ProcessingLine2D(rotatedStartPt.x, rotatedStartPt.y, rotatedEndPt.x, rotatedEndPt.y);


        }

        public translateTransform(tranValue: Point, tranAbout: Point): ProcessingLine2D {
            var translatedStartPt: Point = Geometric2DUtil.translatePoint(this.startPoint.x, this.startPoint.y,
                tranValue.x, tranValue.y, tranAbout.x, tranAbout.y);

            var translatedEndPt: Point = Geometric2DUtil.translatePoint(this.endPoint.x, this.endPoint.y,
                tranValue.x, tranValue.y, tranAbout.x, tranAbout.y);

            return new ProcessingLine2D(translatedStartPt.x, translatedStartPt.y, translatedEndPt.x, translatedEndPt.y);
        }

        public getAsAtomicValues(): number[] {
            return [this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y];
        }


        private transformedProcessLine(translationFucn: Function): ProcessingLine2D {
            var newStartPt: Point = translationFucn(new Point(this._x1, this.y1));
            var newEndPt: Point = translationFucn(new Point(this.x2, this.y2));

            var lineObj: ProcessingLine2D = new ProcessingLine2D(newStartPt.x, newStartPt.y, newEndPt.x, newEndPt.y);
            return lineObj;
        }

        public translatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            return this.transformedProcessLine(translationFucn);
        }

        public reverseTranslatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            return this.transformedProcessLine(translationFucn);
        }

        public getType(): number {
            return ProcessingLine2D.TRANSFORMABLE_TYPE;
        }

        public getStartValue(): number[] {

            return [this.x1, this.y1];
        }

        public getStartValueAsPoint(): Point {
            return new Point(this.x1, this.y1);
        }

        public getEndValue(): number[] {
            return [this.x2, this.y2];
        }

        public getEndValueAsPoint(): Point {
            return new Point(this.x2, this.y2);
        }

        public getLabelPosition(): Point {
            var midpoint: Point = Point.interpolate(this.startPoint, this.endPoint, 0.5);

            var offsetVal: number = 0.25;
            return new Point(midpoint.x + offsetVal, midpoint.y + offsetVal);
        }


        public positionIndex(index: number): Point {
            if (index == 1) {
                return this.startPoint.clone();
            }

            if (index == 2) {
                return this.endPoint.clone();
            }

            return null;
        }

        public reverse(): ITransformable {
            return new ProcessingLine2D(this.x2, this.y2, this.x1, this.y1);
        }


        part(fromRatio, toRatio) {
            var fromPoint = this.pointAt(fromRatio);
            var toPoint = this.pointAt(toRatio);
            return [fromPoint, toPoint];
        }

        partFromPoints(fromPointA, toPointB) {
            var fromRatio = this.ratioAt(fromPointA.x, fromPointA.y);
            var toRatio = this.ratioAt(toPointB.x, toPointB.y)
            var fromPoint = this.pointAt(fromRatio);
            var toPoint = this.pointAt(toRatio);
            return [fromPoint, toPoint];
        }

        /**
         * returns array of parts
         * @param fromPointA
         * @param toPointB
         */
        excludeParts(firstAnchorPoint, secondAnchorPoint) {
            var part1EndRatio = this.ratioAt(firstAnchorPoint.x, firstAnchorPoint.y);
            var part2StartRatio = this.ratioAt(secondAnchorPoint.x, secondAnchorPoint.y);

            if (part1EndRatio < 0 || part1EndRatio > 1) {
                throw new Error(' The from Point doesnt lie on the Line')
            }

            if (part2StartRatio < 0 || part2StartRatio > 1) {
                throw new Error(' The To Point doesnt lie on the Line')
            }

            if (part1EndRatio > part2StartRatio) {
                var temp = part2StartRatio;
                part2StartRatio = part1EndRatio;
                part1EndRatio = temp;
            }

            var part1StartPoint = this.pointAt(0);
            var part1EndPoint = this.pointAt(part1EndRatio);
            var part2StartPoint = this.pointAt(part2StartRatio);
            var part2EndPoint = this.pointAt(1);

            if (PMath.isEqual(part1EndRatio, 0, 0.05)) {
                return [ProcessingLine2D.fromPoints(part1StartPoint, part2StartPoint)]
            }

            if (PMath.isEqual(part2StartRatio, 1, 0.05)) {
                return [ProcessingLine2D.fromPoints(part1EndPoint, part2StartPoint)]
            }


            return [ProcessingLine2D.fromPoints(part1StartPoint, part1EndPoint),
                ProcessingLine2D.fromPoints(part2StartPoint, part2EndPoint)]
        }

        includeParts(firstAnchorPoint, secondAnchorPoint) {
            var fromRatio = this.ratioAt(firstAnchorPoint.x, firstAnchorPoint.y);
            var toRatio = this.ratioAt(secondAnchorPoint.x, secondAnchorPoint.y)

            if (fromRatio < 0 || fromRatio > 1) {
                throw new Error(' The from Point doesnt lie on the Line')
            }

            if (toRatio < 0 || toRatio > 1) {
                throw new Error(' The To Point doesnt lie on the Line')
            }


            var fromPoint = this.pointAt(fromRatio);
            var toPoint = this.pointAt(toRatio);
            return [ProcessingLine2D.fromPoints(fromPoint, toPoint)];
        }


    }

    /**
     * @param {Point} pt1
     * @param {Point} pt1
     * @return number The Euclidean distance between `pt1` and `pt2`.
     */
    function distance(pt1, pt2) {
        var deltaX = pt1[0] - pt2[0];
        var deltaY = pt1[1] - pt2[1];
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    /**
     * @param {Point} point The Point object to offset.
     * @param {number} dx The delta-x of the line segment from which `point` will
     *    be offset.
     * @param {number} dy The delta-y of the line segment from which `point` will
     *    be offset.
     * @param {number} distRatio The quotient of the distance to offset `point`
     *    by and the distance of the line segment from which it is being offset.
     */
    function offsetPoint(point, dx, dy, distRatio) {
        return [
            point[0] - dy * distRatio,
            point[1] + dx * distRatio
        ];
    }

    /**
     * @param {array of Point} ctrlPoints The vertices of the (multi-segment) line
     *      to be interpolate along.
     * @param {int} number The number of points to interpolate along the line; this
     *      includes the endpoints, and has an effective minimum value of 2 (if a
     *      smaller number is given, then the endpoints will still be returned).
     * @param {number} [offsetDist] An optional perpendicular distance to offset
     *      each point from the line-segment it would otherwise lie on.
     * @param {int} [minGap] An optional minimum gap to maintain between subsequent
     *      interpolated points; if the projected gap between subsequent points for
     *      a set of `number` points is lower than this value, `number` will be
     *      decreased to a suitable value.
     */
    function interpolateLineRange(ctrlPoints, number, offsetDist, minGap) {
        minGap = minGap || 0;
        offsetDist = offsetDist || 0;

        // Calculate path distance from each control point (vertex) to the beginning
        // of the line, and also the ratio of `offsetDist` to the length of every
        // line segment, for use in computing offsets.
        var totalDist = 0;
        var ctrlPtDists = [0];
        var ptOffsetRatios = [];
        for (var pt = 1; pt < ctrlPoints.length; pt++) {
            var dist = distance(ctrlPoints[pt], ctrlPoints[pt - 1]);
            totalDist += dist;
            ptOffsetRatios.push(offsetDist / dist);
            ctrlPtDists.push(totalDist);
        }

        if (totalDist / (number - 1) < minGap) {
            number = totalDist / minGap + 1;
        }

        // Variables used to control interpolation.
        var step = totalDist / (number - 1);
        var interpPoints = [offsetPoint(
            ctrlPoints[0],
            ctrlPoints[1][0] - ctrlPoints[0][0],
            ctrlPoints[1][1] - ctrlPoints[0][1],
            ptOffsetRatios[0]
        )];
        var prevCtrlPtInd = 0;
        var currDist = 0;
        var currPoint = ctrlPoints[0];
        var nextDist = step;

        for (pt = 0; pt < number - 2; pt++) {
            // Find the segment in which the next interpolated point lies.
            while (nextDist > ctrlPtDists[prevCtrlPtInd + 1]) {
                prevCtrlPtInd++;
                currDist = ctrlPtDists[prevCtrlPtInd];
                currPoint = ctrlPoints[prevCtrlPtInd];
            }

            // Interpolate the coordinates of the next point along the current segment.
            var remainingDist = nextDist - currDist;
            var ctrlPtsDeltaX = ctrlPoints[prevCtrlPtInd + 1][0] -
                ctrlPoints[prevCtrlPtInd][0];
            var ctrlPtsDeltaY = ctrlPoints[prevCtrlPtInd + 1][1] -
                ctrlPoints[prevCtrlPtInd][1];
            var ctrlPtsDist = ctrlPtDists[prevCtrlPtInd + 1] -
                ctrlPtDists[prevCtrlPtInd];
            var distRatio = remainingDist / ctrlPtsDist;

            currPoint = [
                currPoint[0] + ctrlPtsDeltaX * distRatio,
                currPoint[1] + ctrlPtsDeltaY * distRatio
            ];

            // Offset currPoint according to `offsetDist`.
            var offsetRatio = offsetDist / ctrlPtsDist;
            interpPoints.push(offsetPoint(
                currPoint, ctrlPtsDeltaX, ctrlPtsDeltaY, ptOffsetRatios[prevCtrlPtInd])
            );

            currDist = nextDist;
            nextDist += step;
        }

        interpPoints.push(offsetPoint(
            ctrlPoints[ctrlPoints.length - 1],
            ctrlPoints[ctrlPoints.length - 1][0] -
            ctrlPoints[ctrlPoints.length - 2][0],
            ctrlPoints[ctrlPoints.length - 1][1] -
            ctrlPoints[ctrlPoints.length - 2][1],
            ptOffsetRatios[ptOffsetRatios.length - 1]
        ));
        return interpPoints;
    }


}
