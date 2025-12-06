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
    import ArrayHelper = robosys.lang.ArrayHelper;
    import SplineCurve = THREE.Spline;
    import Point3D = robo.core.Point3D;
    import IBaseExpression = robo.expressions.IBaseExpression;
    import QuotedStringExpression = robo.expressions.QuotedStringExpression;

    declare var math;

    export class ProcessingPointPair2D implements IIntersectable, ITransformable {

        public static TRANSFORMABLE_TYPE: number = 9;
        public modelPointPairs = [];
        subExpressions: IBaseExpression[] = [];

        constructor(modelPointPairs, subExpressions: IBaseExpression[] = []) {
            this.modelPointPairs = modelPointPairs;
            this.subExpressions = subExpressions;
        }

        static fromPoints2(points: Point[], subExpressions: IBaseExpression[] = []) {
            var pointPairs = [];
            for (var i = 0; i < points.length - 1; i++) {
                var newPointPair: any = {};
                newPointPair.start = new Point3D(points[i].x, points[i].y, 0);
                newPointPair.end = new Point3D(points[i + 1].x, points[i + 1].y, 0);
                pointPairs.push(newPointPair);
            }

            return new ProcessingPointPair2D(pointPairs, subExpressions);
        }

        public getAsAtomicValues(): number[] {
            var coordinates: number[] = [];
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                if (this.modelPointPairs[i].start.equals(this.modelPointPairs[i].end)) {
                    continue;
                }
                coordinates[coordinates.length] = this.modelPointPairs[i].start.x;
                coordinates[coordinates.length] = this.modelPointPairs[i].start.y;
                coordinates[coordinates.length] = this.modelPointPairs[i].end.x;
                coordinates[coordinates.length] = this.modelPointPairs[i].end.y;
            }
            return coordinates;
        }

        public getTranslatedObject(translationFucn: Function): IIntersectable {
            return <IIntersectable>this.translatedByFunction(translationFucn);
        }

        /**
         * Transforms can retrun simple points (no need for Point3D)
         * @param scaleValue
         * @param dilateAbout
         */
        public dilateTransform(scaleValue: number, dilateAbout: Point): ITransformable {
            var dilatedPairs = [];
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                dilatedPairs[i] = {};

                dilatedPairs[i].start = Geometric2DUtil.dilate(scaleValue, this.modelPointPairs[i].start.x, this.modelPointPairs[i].start.y,
                    dilateAbout.x, dilateAbout.y);
                dilatedPairs[i].end = Geometric2DUtil.dilate(scaleValue, this.modelPointPairs[i].end.x, this.modelPointPairs[i].end.y,
                    dilateAbout.x, dilateAbout.y);
            }

            return <ITransformable>new ProcessingPointPair2D(dilatedPairs);
        }

        public reflectTransform(point1: Point, point2: Point, ratio: number): ITransformable {
            var reflectedPairs = [];
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                reflectedPairs[i] = {};
                var reflectedStart = Geometric2DUtil.reflect(this.modelPointPairs[i].start.x, this.modelPointPairs[i].start.y,
                    point1.x, point1.y, point2.x, point2.y);
                var reflectedEnd = Geometric2DUtil.reflect(this.modelPointPairs[i].end.x, this.modelPointPairs[i].end.y,
                    point1.x, point1.y, point2.x, point2.y);

                reflectedPairs[i].start = Point.interpolate(reflectedStart, this.modelPointPairs[i].start, ratio);
                reflectedPairs[i].end = Point.interpolate(reflectedEnd, this.modelPointPairs[i].end, ratio);

            }

            return <ITransformable>new ProcessingPointPair2D(reflectedPairs);
        }

        public rotateTransform(angleInDegress: number, rotateAbout: Point): ITransformable {

            var rotatedPairs = [];
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                rotatedPairs[i] = {};
                rotatedPairs[i].start = Geometric2DUtil.rotatePoint(angleInDegress, this.modelPointPairs[i].start.x, this.modelPointPairs[i].start.y,
                    rotateAbout.x, rotateAbout.y);
                rotatedPairs[i].end = Geometric2DUtil.rotatePoint(angleInDegress, this.modelPointPairs[i].end.x, this.modelPointPairs[i].end.y,
                    rotateAbout.x, rotateAbout.y);
            }
            return <ITransformable>new ProcessingPointPair2D(rotatedPairs);

        }

        public translateTransform(tranValue: Point, tranAbout: Point): ITransformable {
            var translatedPairs = [];
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                translatedPairs[i] = {};

                translatedPairs[i].start = Geometric2DUtil.translatePoint(this.modelPointPairs[i].start.x, this.modelPointPairs[i].start.y,
                    tranValue.x, tranValue.y, tranAbout.x, tranAbout.y);
                translatedPairs[i].end = Geometric2DUtil.translatePoint(this.modelPointPairs[i].end.x, this.modelPointPairs[i].end.y,
                    tranValue.x, tranValue.y, tranAbout.x, tranAbout.y);
            }
            return <ITransformable>new ProcessingPointPair2D(translatedPairs);

        }

        public translatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            return this.translatedByFunction(translationFucn);
        }

        private translatedByFunction(translationFucn: Function): any {

            var transPairs = [];
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                transPairs[i] = {};
                transPairs[i].start = translationFucn(this.modelPointPairs[i].start);
                transPairs[i].end = translationFucn(this.modelPointPairs[i].end);
            }

            var pointPair2D: ProcessingPointPair2D = new ProcessingPointPair2D(transPairs);
            return pointPair2D;

            return this;
        }


        public reverseTranslatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            return this.translatedByFunction(translationFucn);
        }

        public getType(): number {
            return ProcessingPointPair2D.TRANSFORMABLE_TYPE;
        }

        public getStartValue(): number[] {
            return [this.modelPointPairs[0].start.x, this.modelPointPairs[0].start.y];
        }

        public getEndValue(): number[] {
            var lastIndex: number = this.modelPointPairs.length - 1;
            return [this.modelPointPairs[lastIndex].end.x, this.modelPointPairs[lastIndex].end.y];
        }

        public getLabelPosition(): Point {
            var offsetVal: number = 0.25;
            return new Point();
        }


        public reverse(): ITransformable {
            var newInputPoints: Point[] = this.modelPointPairs.slice(0).reverse();
            return new ProcessingPointPair2D(newInputPoints);
        }

        public projectTransform(point1: Point, point2: Point, ratio: number): ITransformable {

            return null;
        }

        public intersect(object: IIntersectable): Point[] {

            return [];
        }

        public asPolyPoints(arrayOfPointArray: any): void {
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                arrayOfPointArray.push(new Point3D(this.modelPointPairs[i].start.x, this.modelPointPairs[i].start.y));
                arrayOfPointArray.push(new Point3D(this.modelPointPairs[i].end.x, this.modelPointPairs[i].end.y));
            }
        }

        public clonePairs(): any {
            var pointPairs = [];
            for (var i: number = 0; i < this.modelPointPairs.length; i++) {
                pointPairs[i] = {};
                pointPairs[i].start = new Point3D(this.modelPointPairs[i].start.x, this.modelPointPairs[i].start.y);
                pointPairs[i].end = new Point3D(this.modelPointPairs[i].end.x, this.modelPointPairs[i].end.y);
            }

            return pointPairs;
        }

        public positionIndex(inputValue: number): Point {

            if (this.subExpressions.length == 0) {
                throw new Error(" Position cannot be calculated ");
            }

            var graphSheet3D = robo.geom.GraphSheet3D.getInstance();
            var context: robo.expressions.ExpressionContext = new robo.expressions.ExpressionContext(graphSheet3D);

            var graphingExpression: QuotedStringExpression = <QuotedStringExpression>this.subExpressions[0];
            var compiledExpression;
            var lhs = 'y';

            try {
                var expressionString = graphingExpression.getComment();
                var parts = expressionString.split("=");
                if (parts.length > 1) {
                    lhs = parts[0];
                    expressionString = parts[1]; // take the right side
                }
                compiledExpression = math.compile(expressionString);
            } catch (e) {
                throw new Error(" Position cannot be calculated. Not a valid Expression ");
            }

            var variableName: string = "x";
            var inverted = false;
            if (lhs == 'x') {
                inverted = true;
                variableName = 'y';
            }

            var scope = context.getReferencesCopyAsPrimivitiveValues();
            scope[variableName] = inputValue; //
            var outPut = compiledExpression.eval(scope);

            if (inverted) {
                return new Point(outPut, inputValue);
            }

            return new Point(inputValue, outPut);
        }

    }

}
