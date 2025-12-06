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

    export class FIlledPolygon2D extends ProcessingPolygon2D {
        public static TRANSFORMABLE_TYPE: number = 8;
        fillAlpha: number = 0.7;


        constructor(points: Point[], fillAlpha: number) {
            super(points);
            this.fillAlpha = fillAlpha;
        }

        public getTranslatedObject(translationFucn: Function): IIntersectable {
            var transPoints: Point[] = [];
            for (var i: number = 0; i < this.points.length; i++) {
                transPoints[i] = translationFucn(this.points[i]);
            }

            var polygonObj: FIlledPolygon2D = new FIlledPolygon2D(transPoints, this.fillAlpha);
            return polygonObj;
        }

        public dilateTransform(scaleValue: number, dilateAbout: Point): ITransformable {
            var rotatedPts: Point[] = Geometric2DUtil.dilatePoints(scaleValue, this.points,
                dilateAbout.x, dilateAbout.y);

            return <ITransformable>new FIlledPolygon2D(rotatedPts, this.fillAlpha);
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
            return <ITransformable>new FIlledPolygon2D(resultPts, this.fillAlpha);
        }

        public rotateTransform(angleInDegress: number, rotateAbout: Point): ITransformable {
            var rotatedPts: Point[] = Geometric2DUtil.rotatePoints(angleInDegress, this.points,
                rotateAbout.x, rotateAbout.y);

            return <ITransformable>new FIlledPolygon2D(rotatedPts, this.fillAlpha);
        }

        public translateTransform(tranValue: Point, tranAbout: Point): ITransformable {
            var rotatedPts: Point[] = Geometric2DUtil.translatePoints(this.points,
                tranValue.x, tranValue.y, tranAbout.x, tranAbout.y);

            return <ITransformable>new FIlledPolygon2D(rotatedPts, this.fillAlpha);
        }

        public translatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            var transPoints: Point[] = [];
            for (var i: number = 0; i < this.points.length; i++) {
                transPoints[i] = translationFucn(this.points[i]);
            }

            var polygonObj: ProcessingPolygon2D = new FIlledPolygon2D(transPoints, this.fillAlpha);
            return <ITransformable>polygonObj;
        }

        public reverseTranslatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            var transPoints: Point[] = [];
            for (var i: number = 0; i < this.points.length; i++) {
                transPoints[i] = translationFucn(this.points[i]);
            }

            var polygonObj: ProcessingPolygon2D = new FIlledPolygon2D(transPoints, this.fillAlpha);
            return <ITransformable>polygonObj;
        }


        public getType(): number {
            return FIlledPolygon2D.TRANSFORMABLE_TYPE;
        }

        closeIt() {
            var firstPoint = this.points[0]
            this.points.push(firstPoint.clone())
        }


    }


}
