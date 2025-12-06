/**
 * Created by Mathdisk on 3/17/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point = away.geom.Point;
    import Point3D = robo.core.Point3D;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ITransformable = robo.core.ITransformable;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import IIntersectable = robo.core.IIntersectable;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Vector3D = away.geom.Vector3D;
    import ClipResult = robo.polyclipping.ClipResult;
    import ClipBuilder = robo.geom.ClipBuilder;
    import PolyClipping = robo.geom.PolyClipping;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;


    export class ClipperExpression extends GroupExpression {

        public clipResult: ClipResult;


        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);
        }


        public getClipType(): number {
            return 1;
        }


        resolve(context: ExpressionContext): void {

            var stepSize: number = 1;

            var arrayOfModelPointsArray: ArrayHelper = new ArrayHelper();
            var clipType: number = this.getClipType();
            var polyObjectsLength: number = this.subExpressions.length;

            for (var i: number = 0; i < polyObjectsLength; i++) {
                var resultExpression: IBaseExpression = this.subExpressions[i];
                resultExpression.resolve(context);
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

                var translatedObject: IIntersectable = intersectableObject.getTranslatedObject(GraphSheet3D.translatePointForGraphSheetOffset);
                translatedObject.asPolyPoints(arrayOfModelPointsArray, stepSize);

            }// end of loop


            if (arrayOfModelPointsArray.length == 0) {
                this.dispatchError("No objects found for Fill");
            }

            //  this.createProcessingGroupByClipBuilder(context, arrayOfModelPointsArray);

            this.createProcessingGroupByPolyClipping(context, arrayOfModelPointsArray);
        }

        private createProcessingGroupByPolyClipping(context, arrayOfModelPointsArray) {
            var polyArrayCollection = [];
            for (var i = 0; i < arrayOfModelPointsArray.length; i++) {
                var modelPoints: Point[] = arrayOfModelPointsArray[i];
                var polygonArray = this.toUIPointArray(context.getGraphSheet3D(), modelPoints);
                polyArrayCollection.push(polygonArray);
            }

            var polyClipping: PolyClipping = new PolyClipping();
            var outputArrayOfUIPointsArray = null;


                switch (this.getClipType()) {
                    case PolyClipping.INTERSECTION:
                        outputArrayOfUIPointsArray = polyClipping.intersection(polyArrayCollection);
                        break;
                    case PolyClipping.DIFFERENCE:
                        outputArrayOfUIPointsArray = polyClipping.cut(polyArrayCollection[0], polyArrayCollection[1]);
                        break;
                    case PolyClipping.UNION:
                        outputArrayOfUIPointsArray = polyClipping.union(polyArrayCollection);
                        break;
                    case PolyClipping.XOR:
                        outputArrayOfUIPointsArray = polyClipping.xor(polyArrayCollection);
                        break;
                    case PolyClipping.SUBTRACT:
                        outputArrayOfUIPointsArray = polyClipping.subtract(polyArrayCollection[0], polyArrayCollection[1]);
                        break;
                }



            var converter = context.getGraphSheet3D();
            var outputPolygons: ProcessingPolygon2D[] = [];

            for (var i = 0; i < outputArrayOfUIPointsArray.length; i++) {

                var polygonCollection = outputArrayOfUIPointsArray[i];

                for (var k = 0; k < polygonCollection.length; k++) {

                    var uiPointCollection = polygonCollection[k];
                    var modelPoints: Point[] = [];

                    for (var j: number = 0; j < uiPointCollection.length; j++) {
                        var ptArray = uiPointCollection[j];

                        var pt3: Point3D = converter.toModelPoint3DByMapper(new Point3D(ptArray[0], 0, ptArray[1]));
                        var reverseTranslatedPt: Point = GraphSheet3D.reverseTranslatePointForGraphSheetOffset(new Point(pt3.x, pt3.y));
                        modelPoints[modelPoints.length] = reverseTranslatedPt;
                    }

                    outputPolygons[outputPolygons.length] = new ProcessingPolygon2D(modelPoints);
                }

            }

            this.processingGroup = new ProcessingGroup(outputPolygons);
        }


        private createProcessingGroupByClipBuilder(context, arrayOfModelPointsArray) {
            var clipBuilder: ClipBuilder = new ClipBuilder();
            this.clipResult = new ClipResult();
            this.clipResult.clipType = this.getClipType();
            this.clipResult.inputArrayOfModelPointsArray = arrayOfModelPointsArray;
            this.clipResult.inputArrayOfUIPointsArray = this.convertTUICoordinatess(context.getGraphSheet3D(), arrayOfModelPointsArray);

            clipBuilder.polyClip(this.clipResult);

            if (this.clipResult.outputArrayOfUIPointsArray.length == 0) {
                this.dispatchError("No region created.");
                return;
            }

            var outputArrayOfUIPointsArray: any = this.clipResult.outputArrayOfUIPointsArray;
            this.createProcessingGroup(context.getGraphSheet3D(), outputArrayOfUIPointsArray);
        }

        private convertTUICoordinatess(converter, arrayOfModelPointsArray: any): any {
            var arrayOfUIPointsArray: any = [];

            for (var i = 0; i < arrayOfModelPointsArray.length; i++) {
                var modelPoints: Point[] = arrayOfModelPointsArray[i];

                var uiPoints: Point[] = [];

                for (var j: number = 0; j < modelPoints.length; j++) {
                    var vect: Vector3D = converter.toUIVector(modelPoints[j].x, modelPoints[j].y, 0);
                    uiPoints.push(new Point(vect.x, vect.z));
                }

                arrayOfUIPointsArray.push(uiPoints);
            }

            return arrayOfUIPointsArray;

        }

        private toUIPointArray(converter, modelPoints: Point[]): any {
            var arrayOfUIPointsArray = [];
            var uiPoints = [];
            for (var j: number = 0; j < modelPoints.length; j++) {
                var vect: Vector3D = converter.toUIVector(modelPoints[j].x, modelPoints[j].y, 0);
                uiPoints.push([vect.x, vect.z]);
            }
            arrayOfUIPointsArray.push(uiPoints);
            return arrayOfUIPointsArray;
        }

        private createProcessingGroup(converter: any, outputArrayOfUIPointsArray): void {

            var outputPolygons: ProcessingPolygon2D[] = [];

            for (var i = 0; i < outputArrayOfUIPointsArray.length; i++) {
                var uiPoints: Point[] = outputArrayOfUIPointsArray[i];

                var modelPoints: Point[] = [];

                for (var j: number = 0; j < uiPoints.length; j++) {
                    var pt: Point = uiPoints[j];
                    var pt3: Point3D = converter.toModelPoint3DByMapper(new Point3D(pt.x, 0, pt.y));
                    var reverseTranslatedPt: Point = GraphSheet3D.reverseTranslatePointForGraphSheetOffset(new Point(pt3.x, pt3.y));
                    modelPoints[modelPoints.length] = reverseTranslatedPt;
                }

                outputPolygons[outputPolygons.length] = new ProcessingPolygon2D(modelPoints);


            }

            this.processingGroup = new ProcessingGroup(outputPolygons);


        }


    }


}
