/**
 * Created by rizwan on 3/31/14.
 */


module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point = away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import NumericExpression = robo.expressions.NumericExpression;
    import PerpExpression = robo.expressions.PerpExpression;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;
    import LineExpression = robo.expressions.LineExpression;
    import ArcExpression = robo.expressions.ArcExpression;
    import ParallelExpression = robo.expressions.ParallelExpression;
    import PolygonExpression = robo.expressions.PolygonExpression;
    import Geometric2DUtil = robo.core.Geometric2DUtil;


    export class IntersectExpression extends AbstractArithmeticExpression {
        public static NAME: string = "intersect";
        private subExpressions: IBaseExpression[] = [];

        private point: Point = new Point(0, 0);
        private intersectPts: Point[];

        constructor(subExpressions: IBaseExpression[]) {
            super();

            this.subExpressions = subExpressions;

            if (this.subExpressions.length == 2 || this.subExpressions.length == 3)
                return;

            this.dispatchError("Intersect expression must have atleast two coordinates, last value is optional either '0' or '1'");
        }


        private validateSubExpressions(context: ExpressionContext) {
            var expression1: IBaseExpression = this.subExpressions[ 0 ];
            var expression2: IBaseExpression = this.subExpressions[ 1 ];
            var expression3: IBaseExpression = this.subExpressions[ 2 ];

            var variableValueExpression1: IBaseExpression = this.getVariableValueExp(context, expression1);
            var variableValueExpression2: IBaseExpression = this.getVariableValueExp(context, expression2);

            var isValidExp1: boolean = this.checkExpressionType(variableValueExpression1);
            var isValidExp2: boolean = this.checkExpressionType(variableValueExpression2);

            if (!isValidExp1 || !isValidExp2) {
                this.dispatchError("Invalid intersect arguments. Argument must be either combination of Line,Arc,Polygon");
            }

            if (expression3 != null && expression3.getName() != NumericExpression.NAME) {
                this.dispatchError("Last argument must be a number");
            }

            if (expression3 == null)
                return;

            var lastarg: number = expression3.getVariableAtomicValues()[ 0 ];

            if (lastarg < 1)
                this.dispatchError("Last argument must be greater than or equal to 1");

            if (this.is_int(lastarg) == false)
                this.dispatchError("Last argument must be a number");
        }


        private getVariableValueExp(context: ExpressionContext, expression: IBaseExpression): IBaseExpression {

            if (expression.getName() == VariableReferenceExpression.NAME) {
                var variableReferenceExpression: VariableReferenceExpression = <VariableReferenceExpression>expression;

                return context.getReference(variableReferenceExpression.getVariableName());
            }

            return expression;
        }

        private checkExpressionType(exp: IBaseExpression): boolean {
            if (this.hasValidIntersectInputExptession(exp))
                return true;


            var transformationExpressions = [
                DilateExpression.NAME,
                ReflectExpression.NAME,
                RotateExpression.NAME,
                TranslateExpression.NAME
            ];
            if (transformationExpressions.indexOf(exp.getName()) != -1) {
                var transformationExpression: TransformationExpression = <TransformationExpression> exp;
                var outputTransformatinExp: IBaseExpression = transformationExpression.getTransformableExpression();
                var outputTransformatinExp: IBaseExpression = transformationExpression.getTransformableExpression();
                return this.hasValidIntersectInputExptession(outputTransformatinExp);
            }
            return false;
        }

        hasValidIntersectInputExptession(exp: IBaseExpression): boolean {
            if (exp == undefined)
                return false;

            switch (exp.getName()) {
                case LineExpression.NAME:
                case DashLineExpression.NAME:
                case PerpExpression.NAME:
                case ArcExpression.NAME:
                case ParallelExpression.NAME:
                case PolygonExpression.NAME:
                    return true;
            }

            return false;
        }


        resolve(context: ExpressionContext): void {
            this.validateSubExpressions(context);

            this.subExpressions[ 0 ].resolve(context);
            this.subExpressions[ 1 ].resolve(context);

            var variableValueExpression1: IBaseExpression = this.getVariableValueExp(context, this.subExpressions[ 0 ]);
            var variableValueExpression2: IBaseExpression = this.getVariableValueExp(context, this.subExpressions[ 1 ]);

            this.calculateIntersectPoints(variableValueExpression1, variableValueExpression2);

            if (this.intersectPts.length == 0) {
                this.dispatchError("No intersection point exists");
            }

            var intersectItem: number = 1;
            if (this.subExpressions.length == 3) {

                this.subExpressions[ 2 ].resolve(context);
                var numberRefExpression: NumericExpression = <NumericExpression>this.subExpressions[ 2 ];
                intersectItem = numberRefExpression.getNumericValue();
            }

            if (intersectItem > this.intersectPts.length)
                this.dispatchError("Not more than " + this.intersectPts.length + " intersect point exists");

            var intersectPt: Point = this.intersectPts[ intersectItem - 1 ];//zero based index
            this.intersectPts = [ new Point(intersectPt.x, intersectPt.y) ];
        }

        private calculateIntersectPoints(expression1: IBaseExpression, expression2: IBaseExpression): void {
            this.intersectPts = [];

            var processingIntersectableObj1: any = expression1.getIntersectableObject();
            var processingIntersectableObj2: any = expression2.getIntersectableObject();

            if (processingIntersectableObj1 != null && processingIntersectableObj2 != null) {
                this.intersectPts = processingIntersectableObj1.intersect(processingIntersectableObj2);
                this.intersectPts = Geometric2DUtil.filterUniquePoints(this.intersectPts);
            }
        }

        private is_int(value: number): boolean {

            return (value.toString().indexOf(".") == -1) ? true : false;
        }


        getName(): string {
            return IntersectExpression.NAME;
        }


        public getVariableAtomicValues(): number[] {
            var pt: Point = this.intersectPts[ 0 ];
            return [ pt.x, pt.y ];
        }
    }
}
