/**
 * Created by rizwan on 5/15/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point = away.geom.Point;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;
    import ArcExpression = robo.expressions.ArcExpression;
    import IIntersectable = robo.core.IIntersectable;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import Point3D = robo.core.Point3D;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ITransformable = robo.core.ITransformable;
    import Vector3D = away.geom.Vector3D;
    import FIlledPolygon2D = robo.core.FIlledPolygon2D;


    export class FillExpression extends GroupExpression {
        public static NAME: string = "fill";
        private fillExpressionLabels: string[] = [];
        private fillAlpha: number = 0.7;


        private fillProcessingGroup: ProcessingGroup;

        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);


        }


        resolve(context: ExpressionContext): void {


            var arrayOfModelPointsArray: any = [];

            var polyObjectsLength: number = this.subExpressions.length;

            for (var i: number = 0; i < polyObjectsLength; i++) {
                var resultExpression: IBaseExpression = this.subExpressions[i];
                resultExpression.resolve(context);

                if (resultExpression.getVariableAtomicValues().length == 1) {
                    continue; // This is refering to a alpha expression
                }
                var expressionName: string = resultExpression.getName();

                var intersectableObject: IIntersectable = null;
                if (expressionName == VariableReferenceExpression.NAME) {
                    var variableExpression: VariableReferenceExpression = <VariableReferenceExpression>this.subExpressions[i];
                    var variableName: string = variableExpression.getVariableName();
                    var variableValueExpression: IBaseExpression = context.getReference(variableName);

                    if (!variableValueExpression) {
                        this.dispatchError("Object refered  by " + variableName + " doesnt exist");
                    }
                    intersectableObject = variableValueExpression.getIntersectableObject();
                } else {
                    intersectableObject = resultExpression.getIntersectableObject();

                    if (!intersectableObject) {
                        this.dispatchError("Not a valid object to fill");
                    }


                }


                if (intersectableObject == null) {
                    this.dispatchError("Not a valid object to fill");

                }


                intersectableObject.asPolyPoints(arrayOfModelPointsArray, 1);

            }// end of loop


            if (arrayOfModelPointsArray.length == 0) {
                this.dispatchError("No objects found for Fill");
            }


            if (this.subExpressions.length > 1) {
                var lastExpression = this.subExpressions[this.subExpressions.length - 1];
                var atomicValues = lastExpression.getVariableAtomicValues();
                if (atomicValues.length == 1) {
                    this.fillAlpha = Math.min(0.95, atomicValues[0]);
                }
            }

            var polygons: ProcessingPolygon2D[] = [];

            var fillablePolyonsAlone: FIlledPolygon2D[] = [];

            for (var i: number = 0; i < arrayOfModelPointsArray.length; i++) {

                var modelPoints: Point[] = arrayOfModelPointsArray[i];
                var fillablePolygon: FIlledPolygon2D = new FIlledPolygon2D(this.cloneArrayElements(modelPoints), this.fillAlpha);
                polygons[polygons.length] = fillablePolygon;

                polygons[polygons.length] = new ProcessingPolygon2D(this.cloneArrayElements(modelPoints)); // This is for sketch

                fillablePolyonsAlone[fillablePolyonsAlone.length] = fillablePolygon;
            }

            this.processingGroup = new ProcessingGroup(polygons);

            this.fillProcessingGroup = new ProcessingGroup(fillablePolyonsAlone);

        }

        private cloneArrayElements(pts: Point[]): Point[] {
            var clonedPts: Point[] = [];

            for (var i: number = 0; i < pts.length; i++) {
                clonedPts.push(new Point(pts[i].x, pts[i].y));
            }


            return clonedPts;
        }


        getName(): string {
            return FillExpression.NAME;
        }


        public getFillableGroup(): ProcessingGroup {
            return this.fillProcessingGroup;
        }

        public equals(other: IBaseExpression): boolean {
            var isEquals = super.equals(other);
            if (isEquals) {
                return this.fillAlpha == other['fillAlpha'];
            }
            return isEquals;
        }

    }


}
