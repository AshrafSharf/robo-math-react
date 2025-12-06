/**
 * Created by Mathdisk on 3/17/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *  Responsible for creating command Objects based on  expression
 *
 */
module robo.expressions {

    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import FIlledPolygon2D = robo.core.FIlledPolygon2D;


    export class TransformableToExpressionFactory {
        constructor() {

        }

        public static getExpression(transformable: ITransformable, graphSheet3D: GraphSheet3D): IBaseExpression {
            var expression: IBaseExpression = null;

            switch (transformable.getType()) {
                case TransformablePoint.TRANSFORMABLE_TYPE:
                    var transPoint: TransformablePoint = <TransformablePoint>transformable;
                    expression = new PointExpression([new NumericExpression(transPoint.getSourcePoint().x), new NumericExpression(transPoint.getSourcePoint().y)])
                    break;

                case ProcessingLine2D.TRANSFORMABLE_TYPE:
                    var line: ProcessingLine2D = <ProcessingLine2D>transformable;
                    expression = new LineExpression([new NumericExpression(line.x1), new NumericExpression(line.y1), new NumericExpression(line.x2), new NumericExpression(line.y2)])
                    break;

                case ProcessingPolygon2D.TRANSFORMABLE_TYPE:
                    var polygon: ProcessingPolygon2D = <ProcessingPolygon2D>transformable;
                    var pts: Point[] = polygon.points;

                    var ptsExpressions: IBaseExpression[] = [];
                    for (var i: number = 0; i < pts.length; i++) {
                        ptsExpressions[ptsExpressions.length] = new NumericExpression(pts[i].x);
                        ptsExpressions[ptsExpressions.length] = new NumericExpression(pts[i].y);
                    }

                    expression = new PolygonExpression(ptsExpressions);
                    break;

                case FIlledPolygon2D.TRANSFORMABLE_TYPE:
                    var fIlledPolygon2D: FIlledPolygon2D = <FIlledPolygon2D>transformable;
                    var pts: Point[] = fIlledPolygon2D.points;

                    var ptsExpressions: IBaseExpression[] = [];
                    for (var i: number = 0; i < pts.length; i++) {
                        ptsExpressions[ptsExpressions.length] = new NumericExpression(pts[i].x);
                        ptsExpressions[ptsExpressions.length] = new NumericExpression(pts[i].y);
                    }

                    var polygonExpression: PolygonExpression = new PolygonExpression(ptsExpressions);
                    var fillAlphaExpression: NumericExpression = new NumericExpression(fIlledPolygon2D.fillAlpha);
                    expression = new FillExpression([polygonExpression, fillAlphaExpression]);
                    break;

                case ProcessingSpline2D.TRANSFORMABLE_TYPE:
                    var processingSpline: ProcessingSpline2D = <ProcessingSpline2D>transformable;
                    var pts: Point[] = processingSpline.inputPoints;

                    var ptsExpressions: IBaseExpression[] = [];
                    for (var i: number = 0; i < pts.length; i++) {
                        ptsExpressions[ptsExpressions.length] = new NumericExpression(pts[i].x);
                        ptsExpressions[ptsExpressions.length] = new NumericExpression(pts[i].y);
                    }

                    expression = new TraceExpression(ptsExpressions);
                    break;

                case ProcessingCircle.TRANSFORMABLE_TYPE:

                    var processingCirlce: ProcessingCircle = <ProcessingCircle>transformable;
                    var atomicValues: number[] = processingCirlce.getAsAtomicValues();
                    var numericExpressions: IBaseExpression[] = [];

                    for (var i: number = 0; i < atomicValues.length; i++) {
                        numericExpressions[numericExpressions.length] = new NumericExpression(atomicValues[i]);

                    }

                    expression = new ArcExpression(numericExpressions);

                    break;

                case ProcessingGroup.TRANSFORMABLE_TYPE:
                    var processingGroup: ProcessingGroup = <ProcessingGroup>transformable;
                    var groupItems: ITransformable[] = processingGroup.getGroupItems();
                    var groupItemExpressions: IBaseExpression[] = [];
                    for (var i: number = 0; i < groupItems.length; i++) {
                        groupItemExpressions[groupItemExpressions.length] = this.getExpression(groupItems[i], graphSheet3D);
                    }

                    expression = new GroupExpression(groupItemExpressions);
                    break;

                case ProcessingPointPair2D.TRANSFORMABLE_TYPE:
                    var processingPointPair2D: ProcessingPointPair2D = <ProcessingPointPair2D>transformable;
                    var modelPointPairs = processingPointPair2D.clonePairs();
                    expression = new PointPair2DExpression(groupItemExpressions);
                    break;

            }

            if (expression != null) {
                expression.resolve(new ExpressionContext(graphSheet3D));
            }


            return expression;

        }

        public static determineTranformableExpression(rootTransformableExpression: IBaseExpression): IBaseExpression {
            var transformExp: IBaseExpression = rootTransformableExpression;


            while (transformExp.isTransformable()) {
                var innerExpression: IBaseExpression = transformExp.getTransformableExpression();

                if (transformExp == innerExpression) {
                    //reached leaf

                    return transformExp;
                }

                if (innerExpression == null) {
                    rootTransformableExpression.dispatchError("No transformable object found");
                }

                transformExp = innerExpression;

            }

            rootTransformableExpression.dispatchError("No transformable object found");

            return null;
        }


    }

}