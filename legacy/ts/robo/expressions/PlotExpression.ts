/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import PointExpression = robo.expressions.PointExpression;
    import NumericExpression = robo.expressions.NumericExpression;
    import Point = away.geom.Point;
    import Point3D = robo.core.Point3D;
    import IIntersectable = robo.core.IIntersectable;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import ITransformable = robo.core.ITransformable;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import MathTrigFunctionExpression = robo.expressions.MathTrigFunctionExpression;
    import ProcessingParametricGraphTrace = robo.core.ProcessingParametricGraphTrace;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;


    declare var math;

    // https://stackoverflow.com/questions/43388716/the-correct-way-to-graph-of-a-function-on-html5-canvas

    export class PlotExpression extends PolygonExpression {

        public static NAME: string = "plot";
        processingPointPair2D: ProcessingPointPair2D = null;


        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);
        }

        resolve(context: ExpressionContext): void {

            if (this.isGraphingExpression(context) == true)// Treat the first argument as a graphing expression : example sin(x)
            {
                this.drawAsGraphExpression(context);
                return;
            }

            this.dispatchError("Not a valid Expression, The expression must be a quoted string like \"sin(x)\" ");
        }

        private isGraphingExpression(context: ExpressionContext): boolean {
            var expression: IBaseExpression = this.subExpressions[0];
            return this.checkIfGraphExpression(expression, context);
        }

        private checkIfGraphExpression(expression: IBaseExpression, context: ExpressionContext): boolean {
            if (expression.getName() == QuotedStringExpression.NAME) {
                return true;
            }
            return false;
        }


        private drawAsGraphExpression(context: ExpressionContext): void {
            MathTrigFunctionExpression.DEGREE_MODE = false;

            try {
                this.coordinates = [];
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
                    this.dispatchError(" Invalid Expression ");
                }


                var minValue: number = GraphSheet3D.getInstance().getGraphSheetModelMinX();
                var maxValue: number = GraphSheet3D.getInstance().getGraphSheetModelMaxX();

                if (this.subExpressions.length > 1) {
                    this.subExpressions[1].resolve(context);
                    minValue = this.subExpressions[1].getVariableAtomicValues()[0];
                }

                if (this.subExpressions.length > 2) {
                    this.subExpressions[2].resolve(context);
                    maxValue = this.subExpressions[2].getVariableAtomicValues()[0];
                }

                var diff = Math.abs(maxValue - minValue);
                if (diff < 0.01) {
                    this.dispatchError(" Distance between Max and Min is too small");
                    return;
                }

                if (diff > 200) {
                    this.dispatchError(" Distance between Max and Min is too big for the GraphSheet to draw");
                    return;
                }


                var scaleSteps: number = 8;

                if (this.subExpressions.length > 3) {
                    this.subExpressions[3].resolve(context);
                    scaleSteps = this.subExpressions[3].getVariableAtomicValues()[0];
                }

                if (scaleSteps <= 0) {
                    this.dispatchError(" Step Scale should be greater than 0");
                    return;
                }

                if (scaleSteps >= 50) {
                    this.dispatchError(" Step Scale should not be greater than 50");
                    return;
                }

                var variableName: string = "x";
                var inverted = false;
                if (lhs == 'x') {
                    inverted = true;
                    variableName = 'y';
                }

                var scope = context.getReferencesCopyAsPrimivitiveValues();

                var evaluator = (inputValue) => {
                    scope[variableName] = inputValue; //
                    return compiledExpression.eval(scope);
                }

                var invScale = 1 / scaleSteps; // inverted scale is the size of a pixel
                var h = 1000; // model width
                var ch = h / 2;
                var top = ch * invScale;     // get top and bottom
                var bottom = -ch * invScale;


                var modelPointPairs = this.generateExplicitGraphPoints(evaluator, {
                    start: minValue, end: maxValue, invScale: invScale,
                    subStepCount: scaleSteps,
                    top: top,
                    bottom: bottom
                });


                if (inverted) {
                    var invertedPairs = [];
                    for (var i: number = 0; i < modelPointPairs.length; i++) {
                        invertedPairs[i] = {};
                        invertedPairs[i].start = new Point3D(modelPointPairs[i].start.y, modelPointPairs[i].start.x, 0);
                        invertedPairs[i].end = new Point3D(modelPointPairs[i].end.y, modelPointPairs[i].end.x, 0);
                    }

                    modelPointPairs = invertedPairs;
                }

                this.processingPointPair2D = new ProcessingPointPair2D(modelPointPairs, this.subExpressions);
                // just get the first 5 points - here the coordinates are used only for dirty checking...

                for (var i: number = 0; i < modelPointPairs.length; i++) {
                    this.coordinates[this.coordinates.length] = modelPointPairs[i].start.y;
                }

            } catch (error) {
                MathTrigFunctionExpression.DEGREE_MODE = true;
                throw error;
            }
        }


        getName(): string {

            return PlotExpression.NAME;
        }

        /**
         * https://stackoverflow.com/questions/43388716/the-correct-way-to-graph-of-a-function-on-html5-canvas
         * @param func
         * @param options
         */
        private generateExplicitGraphPoints(func, options) {

            var pointPairs = [];
            var invScale = options.invScale;
            var subStepCount = options.subStepCount;
            var start = options.start;
            var end = options.end;
            var top = options.top;
            var bottom = options.bottom;

            var subStep = invScale / subStepCount; // get the sub steps between pixels (To check gaps/breaks in the plot)

            var x, y, yy, xx, subX;                    // xx,yy are the coords of prev point

            var currentPointer: Point3D;


            for (x = start; x < end; x += invScale) { // pixel steps
                for (subX = 0; subX <= invScale; subX += subStep) {  // sub steps
                    y = func(x + subX);                    // get y for x
                    if (yy !== undefined) {                // is this not the first point
                        if (y > top || y < bottom) {       // this y outside ?
                            if (yy < top && yy > bottom) { // last yy inside?
                                var newPointPair: any = {};
                                newPointPair.start = new Point3D(currentPointer.x, currentPointer.y, currentPointer.z);
                                // Same approach is used in other places
                                newPointPair.end = new Point3D(x + subX, y, 0);
                                pointPairs.push(newPointPair);
                                currentPointer = newPointPair.end;
                            }
                        } else {                         // this y must be inside
                            if (yy > top || yy < bottom) { // was last yy outside
                                currentPointer = new Point3D(xx, yy, 0);
                            }
                            if (subX === 0) {              // are we at a pixel
                                if (y > bottom && y < top) {  // are we inside
                                    // if the step is large then might be a line break
                                    if (Math.abs(yy - y) > (top - bottom) * (1 / 3)) {
                                        currentPointer = new Point3D(xx, yy, 0);
                                    } else {
                                        var newPointPair: any = {};
                                        newPointPair.start = new Point3D(currentPointer.x, currentPointer.y, currentPointer.z);
                                        newPointPair.end = new Point3D(x, y, 0);
                                        pointPairs.push(newPointPair);
                                        currentPointer = newPointPair.end;
                                    }
                                }
                            }
                        }
                    } else {
                        if (subX === 0) {
                            currentPointer = new Point3D(x, y, 0);
                        }
                    }
                    yy = y;
                    xx = x + subX;
                }
            }

            if (currentPointer) {
                y = func(end);
                if (y) {
                    var newPointPair: any = {};
                    newPointPair.start = new Point3D(currentPointer.x, currentPointer.y, currentPointer.z);
                    newPointPair.end = new Point3D(end, y, 0);
                    pointPairs.push(newPointPair);
                }

            }
            return pointPairs;
        }


        public getProcessingPointPair2D(): ProcessingPointPair2D {
            return this.processingPointPair2D;
        }


        public getTransformable(): ITransformable {
            return this.processingPointPair2D;
        }


    }
}