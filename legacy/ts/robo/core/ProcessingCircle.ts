/**
 * Created by rizwan on 3/27/14.
 */
module robo.core {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Matrix = away.geom.Matrix;
    import Point = away.geom.Point;
    import PMath = robo.util.PMath;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ArrayHelper = robosys.lang.ArrayHelper;

    export class ProcessingCircle implements IIntersectable, ITransformable {
        private _ox: number;
        private _oy: number;
        private _radius: number;
        private _fromAngle: number;
        private _toAngle: number;

        public sourceFromAngleInDegrees: number;
        public sourceToAngleInDegrees: number;

        public static TRANSFORMABLE_TYPE: number = 3;

        constructor(x: number, y: number, radius: number, fromAngle: number, toAngle: number) {
            this.ox = x;
            this.oy = y;
            this.radius = radius;
            this.fromAngle = fromAngle;
            this.toAngle = toAngle;
        }

        public set ox(value: number) {
            this._ox = value;
        }

        public get ox(): number {
            return this._ox;
        }

        public get oy(): number {
            return this._oy;
        }

        public set oy(value: number) {
            this._oy = value;
        }

        public set radius(value: number) {
            this._radius = value;
        }

        public get radius(): number {
            return this._radius;
        }

        public set fromAngle(value: number) {
            this._fromAngle = value;
        }

        public get fromAngle(): number {
            return this._fromAngle;
        }

        public set toAngle(value: number) {
            this._toAngle = value;
        }

        public get toAngle(): number {
            return this._toAngle;
        }

        public intersectLine(line: ProcessingLine2D): Point[] {
            var intersectPts: Point[] = Geometric2DUtil.intersectCircleAndLine(this.ox, this.oy, this.radius, line.x1, line.y1, line.x2, line.y2);

            var validIntersectPts: Point[] = [];

            for (var i: number = 0; i < intersectPts.length; i++) {

                var intersectPt: Point = intersectPts[i];

                if (this.winthInRange(intersectPt) && line.winthInRange(intersectPt)) {
                    validIntersectPts[validIntersectPts.length] = intersectPt;
                }
            }
            return validIntersectPts.reverse();
        }

        public intersectCircle(other: ProcessingCircle): Point[] {
            var intersectPts: Point[] = Geometric2DUtil.intersectCircleAndCircle(this.ox, this.oy, this.radius, other.ox, other.oy, other.radius);

            var validIntersectPts: Point[] = [];

            for (var i: number = 0; i < intersectPts.length; i++) {

                var intersectPt: Point = intersectPts[i];

                if (this.winthInRange(intersectPt) && other.winthInRange(intersectPt)) {
                    validIntersectPts[validIntersectPts.length] = intersectPt;
                }
            }
            return validIntersectPts.reverse();
        }


        public contains(point: Point): boolean {
            var v1: number = PMath.square(point.x - this.ox) + PMath.square(point.y - this.oy);
            var v2: number = PMath.square(this.radius);

            v1 = PMath.roundDecimal(v1, 2);
            v2 = PMath.roundDecimal(v2, 2);

            if (PMath.isEqual(v1, v2, 0.1)) {
                var angleInRadian: number = this.angleAt(point);
                var angleInDeg: number = PMath.degrees(angleInRadian);
                if (angleInDeg >= this.fromAngle && angleInDeg <= this.toAngle) {
                    return true;
                }
            }

            return false;
        }

        public winthInRange(point: Point): boolean {
            if (isNaN(point.x) || isNaN(point.y)) {
                return false;
            }

            var angleInRadian: number = this.angleAt(point);
            var angleInDeg: number = PMath.degrees(angleInRadian);

            if (this.sourceFromAngleInDegrees < 0 && this.sourceToAngleInDegrees < 0) {

                if (PMath.isWithInRange(angleInDeg, Math.abs(this.sourceFromAngleInDegrees),
                    Math.abs(this.sourceFromAngleInDegrees + this.sourceToAngleInDegrees), 0.01)) {
                    return true;
                }

            }

            var startAngle: number = this.fromAngle;
            var endAngle: number = this.toAngle;

            if (startAngle < 0 || endAngle < 0) {
                startAngle = Math.min(this.fromAngle, this.toAngle);
                endAngle = Math.max(this.fromAngle, this.toAngle);
            }

            var positiveStartAngle: number = (startAngle < 0) ? (360 + startAngle) : startAngle;
            var positiveEndAngle: number = (endAngle < 0) ? (360 + endAngle) : endAngle;

            var normalizedStartAngle: number = (positiveStartAngle > 360) ? (positiveStartAngle - 360) : positiveStartAngle;
            var normalizedEndAngle: number = (positiveEndAngle > 360) ? (positiveEndAngle - 360) : positiveEndAngle;

            startAngle = normalizedStartAngle;
            endAngle = normalizedEndAngle;

            if (startAngle < endAngle) {
                if (PMath.isWithInRange(angleInDeg, startAngle, endAngle, 0.01)) {
                    return true;
                }
                return false;
            }

            startAngle = normalizedEndAngle;
            endAngle = normalizedStartAngle;

            if (PMath.isWithInRange(angleInDeg, 0, startAngle, 0.01)) {
                return true;
            }


            if (PMath.isWithInRange(angleInDeg, endAngle, 360, 0.01)) {
                return true;
            }

            //straight forward checking
            //  if(angleInDeg>=startAngle && angleInDeg<=endAngle)
            //   return true;

            return false;
        }


        /**
         * Get the position of the curve from internal parametric representation,
         * depending on the parameter t. This parameter is between the two limits 0
         * and 2*Math.PI.
         */
        public pointAt(angle: number): Point {
            var xPos: number = this.ox + this.radius * Math.cos(angle);
            var yPos: number = this.oy + this.radius * Math.sin(angle);
            return new Point(xPos, yPos);
        }

        /**
         * also positionAt
         */
        public angleAt(point: Point): number {
            //first four values belong to line1 and second four belongs to line2
            var angle: number = PMath.horizontalAngle(new Point(this.ox, this.oy), new Point(point.x, point.y));
            return PMath.formatAngle(angle);//angle;
        }


        public intersect(object: IIntersectable): Point[] {

            if (object instanceof ProcessingCircle) {
                return this.intersectCircle(<ProcessingCircle>object);
            }

            if (object instanceof ProcessingLine2D) {
                return this.intersectLine(<ProcessingLine2D>object);
            }

            if (object instanceof ProcessingPolygon2D) {

                return object.intersect(<ProcessingCircle>this);
            }

            return [];
        }

        public asPolyPoints(arrayOfPointArray: any, stepSize: number = 1): void {
            var points: Point[] = [];

            var normalizedFromAngleInDegrees: number = (this.sourceFromAngleInDegrees % 360);
            var signMultiplier: number = (this.sourceToAngleInDegrees < 0) ? -1 : 1;
            var normalizedToAngleInDegrees: number = ((Math.abs(this.sourceToAngleInDegrees) > 360) ? signMultiplier * 360 : this.sourceToAngleInDegrees);

            //convert real coordinates into away3D coordinates....
            var fromAngleInDegrees: number = 360 - normalizedFromAngleInDegrees;
            var toAngleInDegrees: number = fromAngleInDegrees - normalizedToAngleInDegrees;

            var startAngle: number = Math.min(fromAngleInDegrees, toAngleInDegrees);
            var endAngle: number = Math.max(fromAngleInDegrees, toAngleInDegrees);

            if (Math.abs(endAngle - startAngle) < 360) {
                points[points.length] = new Point(this.ox, this.oy);
            }

            var angle: number = 0;
            for (angle = startAngle; angle < endAngle; angle += stepSize) {
                var xPos: number = this.ox + Math.cos(PMath.radians(angle)) * this._radius;
                var yPos: number = this.oy + Math.sin(PMath.radians(angle)) * this._radius;

                points.push(new Point(xPos, yPos));
            }

            angle = angle - stepSize; // the last increment has increaed the angle by another stepSize

            if ((angle % stepSize) != 0) {
                var xPos: number = this.ox + Math.cos(PMath.radians(endAngle)) * this._radius;
                var yPos: number = this.oy + Math.sin(PMath.radians(endAngle)) * this._radius;

                points.push(new Point(xPos, yPos));
            }

            if (points.length > 360) {
                points = points.slice(0, 360);
            }


            arrayOfPointArray.push(points);
        }

        public getTranslatedObject(translationFucn: Function): IIntersectable {
            return this.transformedProcessingCirlce(translationFucn);

        }

        private transformedProcessingCirlce(translationFucn: Function): ProcessingCircle {
            var newOriginPt: Point = translationFucn(new Point(this.ox, this.oy));

            var circle1: ProcessingCircle = new ProcessingCircle(newOriginPt.x, newOriginPt.y, this.radius, this.fromAngle, this.toAngle);
            circle1.sourceFromAngleInDegrees = this.sourceFromAngleInDegrees;
            circle1.sourceToAngleInDegrees = this.sourceToAngleInDegrees;

            return circle1;
        }

        public translatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            return this.transformedProcessingCirlce(translationFucn);

        }

        public reverseTranslatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            return this.transformedProcessingCirlce(translationFucn);

        }

        public static fromAtomicValues(coordinates: number[], preserveAngle: boolean = false): ProcessingCircle {
            var circle1: ProcessingCircle;
            if (coordinates.length == 5) {
                var originPt: Point = new Point(coordinates[0], coordinates[1]);
                var arcRadius: number = coordinates[2];
                var fromAngle: number = coordinates[3];
                var toAngle: number = coordinates[4];

                circle1 = new ProcessingCircle(originPt.x, originPt.y, arcRadius, ProcessingCircle.calculateFromAngle(fromAngle, toAngle, preserveAngle), ProcessingCircle.calculateToAngle(fromAngle, toAngle, preserveAngle));
                circle1.sourceFromAngleInDegrees = fromAngle;
                circle1.sourceToAngleInDegrees = toAngle;
            }

            if (coordinates.length == 8) {
                var copyStartPt: Point = new Point(coordinates[0], coordinates[1]);
                var copyEndPt: Point = new Point(coordinates[2], coordinates[3]);
                var arcRadius: number = Point.distance(copyStartPt, copyEndPt);
                var originPt: Point = new Point(coordinates[4], coordinates[5]);
                var fromAngle: number = coordinates[6];
                var toAngle: number = coordinates[7];

                circle1 = new ProcessingCircle(originPt.x, originPt.y, arcRadius, ProcessingCircle.calculateFromAngle(fromAngle, toAngle, preserveAngle), ProcessingCircle.calculateToAngle(fromAngle, toAngle, preserveAngle));
                circle1.sourceFromAngleInDegrees = fromAngle;
                circle1.sourceToAngleInDegrees = toAngle;
            }
            return circle1;
        }

        //added by sharf ,
        private static calculateFromAngle(fromAngle: number, toAngle: number, donotAddOffset: boolean): number {
            //not to do add 360 for endValue calculation, reoffset again which is added in getProcessingCircle
            if (donotAddOffset == false && toAngle < 0) {
                var tempToAngle: number = 360 + toAngle;
                var tempFromAngle: number = 360 + fromAngle;

                return Math.min(tempFromAngle, tempToAngle);
            }
            return fromAngle;
        }

        //added by sharf ,
        private static calculateToAngle(fromAngle: number, toAngle: number, donotAddOffset: boolean): number {
            //not to do add 360 for endValue calculation, reoffset again which is added in getProcessingCircle
            if (donotAddOffset == false && toAngle < 0) {
                var tempToAngle: number = 360 + toAngle;
                var tempFromAngle: number = 360 + fromAngle;

                return Math.max(tempFromAngle, tempToAngle);
            }
            return fromAngle + toAngle;
        }


        public dilateTransform(scaleValue: number, dilateAbout: Point): ITransformable {
            var reflectedOriginPt: Point = Geometric2DUtil.dilate(scaleValue,
                this.ox, this.oy, dilateAbout.x, dilateAbout.y);


            var circle1: ProcessingCircle = new ProcessingCircle(reflectedOriginPt.x, reflectedOriginPt.y, this.radius * scaleValue, this.fromAngle, this.toAngle);
            circle1.sourceFromAngleInDegrees = this.sourceFromAngleInDegrees;
            circle1.sourceToAngleInDegrees = this.sourceToAngleInDegrees;
            return circle1;
        }

        public reflectTransform(point1: Point, point2: Point, ratio: number): ITransformable {
            var reflectedOriginPt: Point = Geometric2DUtil.reflect(this.ox, this.oy,
                point1.x, point1.y, point2.x, point2.y);
            var newOriginPt: Point = Point.interpolate(reflectedOriginPt, new Point(this.ox, this.oy), ratio);

            var circle1: ProcessingCircle = new ProcessingCircle(newOriginPt.x, newOriginPt.y, this.radius, this.fromAngle, this.toAngle);
            circle1.sourceFromAngleInDegrees = this.sourceFromAngleInDegrees;
            circle1.sourceToAngleInDegrees = this.sourceToAngleInDegrees;
            return circle1;
        }


        public rotateTransform(angleInDegress: number, rotateAbout: Point): ITransformable {
            var rotatedOrigin: Point = Geometric2DUtil.rotatePoint(angleInDegress, this.ox, this.oy,
                rotateAbout.x, rotateAbout.y);

            var circle1: ProcessingCircle = new ProcessingCircle(rotatedOrigin.x, rotatedOrigin.y, this.radius, this.fromAngle, this.toAngle);
            circle1.sourceFromAngleInDegrees = this.sourceFromAngleInDegrees;
            circle1.sourceToAngleInDegrees = this.sourceToAngleInDegrees;

            return circle1;
        }

        public translateTransform(tranValue: Point, transAbout: Point): ITransformable {
            var translatedOrigin: Point = Geometric2DUtil.translatePoint(this.ox, this.oy,
                tranValue.x, tranValue.y, transAbout.x, transAbout.y);

            var circle1: ProcessingCircle = new ProcessingCircle(translatedOrigin.x, translatedOrigin.y, this.radius, this.fromAngle, this.toAngle);
            circle1.sourceFromAngleInDegrees = this.sourceFromAngleInDegrees;
            circle1.sourceToAngleInDegrees = this.sourceToAngleInDegrees;

            return circle1;
        }

        public getAsAtomicValues(): number[] {
            return [this.ox, this.oy, this.radius, this.fromAngle, this.toAngle];
        }

        public getType(): number {
            return ProcessingCircle.TRANSFORMABLE_TYPE;
        }


        public getStartValue(): number[] {

            var fromAngle: number = this.fromAngle;
            var startPt: Point = this.pointAt(PMath.radians(fromAngle));
            return [startPt.x, startPt.y];
        }

        public getEndValue(): number[] {

            var toAngle: number = this.toAngle;
            var endPt: Point = this.pointAt(PMath.radians(toAngle));
            return [endPt.x, endPt.y];
        }

        public getUIFromAngle(): number {
            var fromAngleInDegrees: number = 360 - this.sourceFromAngleInDegrees;
            var toAngleInDegrees: number = fromAngleInDegrees - this.sourceToAngleInDegrees;

            return fromAngleInDegrees;
        }

        public getUIToAngle(): number {
            var fromAngleInDegrees: number = 360 - this.sourceFromAngleInDegrees;
            var toAngleInDegrees: number = fromAngleInDegrees - this.sourceToAngleInDegrees;

            return toAngleInDegrees;
        }

        public getLabelPosition(): Point {
            var fromAngleInDeg: number = this.getUIFromAngle();
            var toAngleInDeg: number = this.getUIToAngle();

            //processing circle always consider as reverse position
            var circle1: ProcessingCircle = new ProcessingCircle(this.ox, this.oy, this.radius, fromAngleInDeg, toAngleInDeg);
            var midAngle: number = fromAngleInDeg + (toAngleInDeg - fromAngleInDeg) / 2;
            var labelPos: Point = circle1.pointAt(PMath.radians(midAngle));

            //return labelPos;
            var offsetVal: number = 0.3;
            return new Point(labelPos.x + offsetVal, labelPos.y + offsetVal);
        }


        public positionIndex(index: number): Point {
            if (index == 1) //midPoint
            {
                var angleVal: number = this.fromAngle + (this.toAngle - this.fromAngle) / 2;
                var point: Point = this.pointAt(PMath.radians(angleVal));
                return point;
            }

            if (index == 2) //startPoint
            {
                var angleVal: number = this.fromAngle;
                var point: Point = this.pointAt(PMath.radians(angleVal));
                return point;
            }

            if (index == 3) //endPoint
            {
                var angleVal: number = this.toAngle;
                var point: Point = this.pointAt(PMath.radians(angleVal));
                return point;
            }

            return null;
        }


        public reverse(): ITransformable {
            return this;
        }

        public projectTransform(point1: Point, point2: Point, ratio: number): ITransformable {

            return null;
        }

        pointAtRatio(ratio): Point {
            var points = this._getAllPathPoints();
            var mappedIndex = Math.floor(PMath.map(ratio, 0, 1, 0, points.length - 1));
            return points[mappedIndex];
        }

        part(fromRatio, toRatio) {
            var points = this._getAllPathPoints();
            var mappedFromIndex = Math.floor(PMath.map(fromRatio, 0, 1, 0, points.length - 1));
            var mappedToIndex = Math.floor(PMath.map(toRatio, 0, 1, 0, points.length - 1));

            if (mappedFromIndex < 0) {
                mappedFromIndex = 0;
            }

            if (mappedToIndex > points.length - 1) {
                mappedToIndex = points.length - 1
            }

            return points.slice(mappedFromIndex, mappedToIndex);
        }

        partFromPoints(fromPointA, toPointB) {
            var fromAnglePart = this.angleAt(fromPointA);
            var toAnglePart = this.angleAt(toPointB);

            var points = [];
            var fromAngle: number = Math.floor(fromAnglePart);
            var toAngle: number = Math.floor(toAnglePart);

            var small = fromAngle < toAngle ? fromAngle : toAngle;
            var big = fromAngle > toAngle ? fromAngle : toAngle;

            for (var angle = small; angle <= big; angle++) {
                var pt: Point = this.pointAt(PMath.radians(angle));
                points.push(pt);
            }
            return points;
        }

        /**
         * returns array of parts
         * @param fromPointA
         * @param toPointB
         */
        excludeParts(firstAnchorPoint, secondAnchorPoint) {
            var allPoints = this._getAllPathPoints();
            var firstIndex = this.getPointIndex(allPoints, firstAnchorPoint);
            var secondIndex = this.getPointIndex(allPoints, secondAnchorPoint);

            if (firstIndex < 0 || firstIndex > allPoints.length) {
                throw new Error(' The from Point doesnt lie on the arc')
            }

            if (secondIndex < 0 || secondIndex > allPoints.length) {
                throw new Error(' The To Point doesnt lie on the arc')
            }


            if (firstIndex > secondIndex) {
                var temp = secondIndex;
                secondIndex = firstIndex;
                firstIndex = temp;
            }


            return [
                ProcessingPointPair2D.fromPoints2(allPoints.slice(0, firstIndex + 1), []),
                ProcessingPointPair2D.fromPoints2(allPoints.slice(secondIndex, allPoints.length), [])
            ]
        }

        includeParts(firstAnchorPoint, secondAnchorPoint) {
            var allPoints = this._getAllPathPoints();
            var firstIndex = this.getPointIndex(allPoints, firstAnchorPoint);

            if (firstIndex < 0 || firstIndex > allPoints.length) {
                throw new Error(' The from Point doesnt lie on the arc')
            }
            var secondIndex = this.getPointIndex(allPoints, secondAnchorPoint);

            if (secondIndex < 0 || secondIndex > allPoints.length) {
                throw new Error(' The To Point doesnt lie on the arc')
            }

            if (firstIndex > secondIndex) {
                var temp = secondIndex;
                secondIndex = firstIndex;
                firstIndex = temp;
            }

            return [
                ProcessingPointPair2D.fromPoints2(allPoints.slice(firstIndex, secondIndex + 1), [])
            ]
        }

        getPointIndex(allPoints, anchorPoint) {
            var minDistance = 100000;
            var pointIndex = -1;
            for (var index = 0; index <allPoints.length; index++) {
                var pt: Point = allPoints[index];
                var distance = Point.distance(pt, anchorPoint);
                if (distance < minDistance) {
                    minDistance = distance;
                    pointIndex = index;
                }
            }

            if (minDistance < 0.5) {
                return pointIndex;
            }
            return -1;
        }

        _getAllPathPoints() {
            var points = [];
            var fromAngle: number = Math.floor(this.fromAngle);
            var toAngle: number = Math.floor(this.toAngle);

            var small = fromAngle < toAngle ? fromAngle : toAngle;
            var big = fromAngle > toAngle ? fromAngle : toAngle;

            for (var angle = small; angle <= big; angle++) {
                var pt: Point = this.pointAt(PMath.radians(angle));
                points.push(pt);
            }
            return points;
        }

    }
}

