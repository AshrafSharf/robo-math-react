/**
 * Created by rizwan on 7/5/14.
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
    import SplineCurve = THREE.Spline;
    import Point3D = robo.core.Point3D;
    import QuotedStringExpression = robo.expressions.QuotedStringExpression;

    declare var math;

    /**
     * Should use "t"
     */
    export class ProcessingParametricGraphTrace extends ProcessingSpline2D {
        public static TRANSFORMABLE_TYPE: number = 8;

        private graphingExpression1: any;
        private graphingExpression2: any;
        private variableName: any;
        private contextPrimitiveValues: any;

        constructor(graphingExpression1, graphingExpression2, variableName: string, contextPrimitiveValues: any, inputPoints: Point[], smoothness: number = 12, explictSmoothCheck: boolean = true) {
            super(inputPoints, smoothness, explictSmoothCheck);

            this.graphingExpression1 = graphingExpression1;
            this.graphingExpression2 = graphingExpression2;
            this.variableName = variableName;
            this.contextPrimitiveValues = contextPrimitiveValues;
        }


        public getType(): number {
            return ProcessingParametricGraphTrace.TRANSFORMABLE_TYPE;
        }

        public getStartValue(): number[] {
            return [this.inputPoints[0].x, this.inputPoints[0].y];
        }

        public getEndValue(): number[] {
            var lastIndex = this.inputPoints.length - 1;
            return [this.inputPoints[lastIndex].x, this.inputPoints[lastIndex].y];
        }

        public getLabelPosition(): Point {
            var offsetVal: number = 0.25;
            return new Point();
        }

        public positionIndex(inputValue: number): Point {
            var graphSheet3D = robo.geom.GraphSheet3D.getInstance();


            var compiledExpression1 = math.compile((<QuotedStringExpression>this.graphingExpression1).getComment());
            var compiledExpression2 = math.compile((<QuotedStringExpression>this.graphingExpression2).getComment());

            var scope = this.contextPrimitiveValues;
            scope["t"] = inputValue; //

            var outPut1 = compiledExpression1.eval(scope);
            var outPut2 = compiledExpression2.eval(scope);

            return new Point(outPut1, outPut2);
        }


        public reverse(): ITransformable {
            var newInputPoints: Point[] = this.inputPoints.slice(0).reverse();
            return new ProcessingParametricGraphTrace(this.graphingExpression1, this.graphingExpression2, this.variableName, this.contextPrimitiveValues, newInputPoints, this.smoothness);
        }
    }
}
