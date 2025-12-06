/**
 * Created by Mathdisk on 3/23/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import ExpressionError = roboexpressions.ExpressionError;
    import PMath = robo.util.PMath;
    import IIntersectable = robo.core.IIntersectable;
    import Point = away.geom.Point;
    import ITransformable = robo.core.ITransformable;

    export class AbstractArithmeticExpression implements IBaseExpression {
        resultantExpression: IBaseExpression;
        private expressionId: number = -1;
        private commandText: string;

        constructor() {

        }

        public getExpresionId(): number {
            return this.expressionId;
        }

        public setExpressionId(expressionId: number): void {
            this.expressionId = expressionId;
        }

        public setExpressionCommandText(commandText: string): void {
            this.commandText = commandText;
        }

        public getExpressionCommandText(): string {
            return this.commandText;
        }

        resolve(context: ExpressionContext): void {
        }

        getName(): string {
            return "Abstract";
        }

        alwaysExecute():boolean {
            return false;
        }

        add(otherExpression: IBaseExpression): IBaseExpression {
            var lhsAtomicValues: number[] = this.getVariableAtomicValues();
            var rhsAtomicValues: number[] = otherExpression.getVariableAtomicValues();


            if (lhsAtomicValues.length == 1 && rhsAtomicValues.length == 1) {
                // I am using fully qualfied class name because Abstract arithmetic is base class, do new subclass wont work
                this.resultantExpression = new robo.expressions.NumericExpression(lhsAtomicValues[0] + rhsAtomicValues[0]);
            }

            if (lhsAtomicValues.length == 2 && rhsAtomicValues.length == 2) {
                // I am using fully qualfied class name because Abstract arithmetic is base class, do new subclass name will not  work,because during definition time import would hve resolved to undefined
                var PTExpression = robo.expressions.PointExpression;
                var NumExpression = robo.expressions.NumericExpression;


                var xValue: NumericExpression = new NumExpression(lhsAtomicValues[0] + rhsAtomicValues[0]);
                var yValue: NumericExpression = new NumExpression(lhsAtomicValues[1] + rhsAtomicValues[1]);
                this.resultantExpression = new PTExpression([xValue, yValue]);
            }
            return this.resultantExpression;

        }

        subtract(otherExpression: IBaseExpression): IBaseExpression {
            var lhsAtomicValues: number[] = this.getVariableAtomicValues();
            var rhsAtomicValues: number[] = otherExpression.getVariableAtomicValues();

            if (lhsAtomicValues.length == 1 && rhsAtomicValues.length == 1) {
                this.resultantExpression = new robo.expressions.NumericExpression(lhsAtomicValues[0] - rhsAtomicValues[0]);
            }

            if (lhsAtomicValues.length == 2 && rhsAtomicValues.length == 2) {
                // I am using fully qualfied class name because Abstract arithmetic is base class, do new subclass name will not  work,because during definition time import would hve resolved to undefined
                var PTExpression = robo.expressions.PointExpression;
                var NumExpression = robo.expressions.NumericExpression;


                var xValue: NumericExpression = new NumExpression(lhsAtomicValues[0] - rhsAtomicValues[0]);
                var yValue: NumericExpression = new NumExpression(lhsAtomicValues[1] - rhsAtomicValues[1]);
                this.resultantExpression = new PTExpression([xValue, yValue]);
            }
            return this.resultantExpression;
        }


        divide(otherExpression: IBaseExpression): IBaseExpression {
            var lhsAtomicValues: number[] = this.getVariableAtomicValues();
            var rhsAtomicValues: number[] = otherExpression.getVariableAtomicValues();

            if (lhsAtomicValues.length != 1 || rhsAtomicValues.length != 1) {
                this.dispatchError("Only Number can be Multiplied");
            }

            this.resultantExpression = new robo.expressions.NumericExpression(lhsAtomicValues[0] / rhsAtomicValues[0]);
            return this.resultantExpression;
        }


        multiply(otherExpression: IBaseExpression): IBaseExpression {
            var lhsAtomicValues: number[] = this.getVariableAtomicValues();
            var rhsAtomicValues: number[] = otherExpression.getVariableAtomicValues();

            if (lhsAtomicValues.length != 1 || rhsAtomicValues.length != 1) {
                this.dispatchError("Only Number can be Multiplied");
            }

            this.resultantExpression = new robo.expressions.NumericExpression(lhsAtomicValues[0] * rhsAtomicValues[0]);
            return this.resultantExpression;
        }

        power(otherExpression: IBaseExpression): IBaseExpression {
            var lhsAtomicValues: number[] = this.getVariableAtomicValues();
            var rhsAtomicValues: number[] = otherExpression.getVariableAtomicValues();

            if (lhsAtomicValues.length != 1 || rhsAtomicValues.length != 1) {
                this.dispatchError("Not a numerical value");
            }

            this.resultantExpression = new robo.expressions.NumericExpression(Math.pow(lhsAtomicValues[0], rhsAtomicValues[0]));
            return this.resultantExpression;
        }

        public getVariableAtomicValues(): number[] {
            return this.resultantExpression.getVariableAtomicValues();
        }

        dispatchError(errMessage: string): void {
            var expressionError: ExpressionError = new ExpressionError(this.getExpresionId(), "Expression Error", errMessage);

            throw expressionError;
        }


        public getIntersectableObject(): IIntersectable {

            return null;
        }


        public getStartValue(): number[] {

            return [];
        }

        public getEndValue(): number[] {

            return [];
        }

        public equals(other: IBaseExpression): boolean {
            if (!other)
                return false;

            var currentExp: IBaseExpression = this.getComparableExpression();
            var otherExp: IBaseExpression = other.getComparableExpression();

            if (currentExp.getName() != otherExp.getName())
                return false;

            if (this.getLabel() != other.getLabel())
                return false;

            var currentAtomicValues: number[] = currentExp.getVariableAtomicValues();
            var otherAtomicValues: number[] = otherExp.getVariableAtomicValues();


            if (currentAtomicValues.length == otherAtomicValues.length) {
                for (var i: number = 0; i < currentAtomicValues.length; i++) {
                    if (PMath.isEqual(currentAtomicValues[i], otherAtomicValues[i]) == false) {
                        return false;
                    }
                }
                return true;// All values are equal
            }
            return false;
        }

        public getComparableExpression(): IBaseExpression {
            return this;
        }

        public getLabel(): string {
            return "";
        }

        public dilate(scaleValue: Point, dilateAbout: Point): number[] {
            return [];
        }

        public rotate(angleInDegress: number, rotateAbout: Point): number[] {
            return [];
        }

        public translate(tranValue: Point, tranAbout: Point): number[] {
            return [];
        }

        public reflect(reflectAbout: Point): number[] {
            return [];
        }

        public getTransformableExpression(): IBaseExpression {
            return null;
        }

        public isTransformable(): Boolean {
            return false;
        }

        public getTransformable(): ITransformable {
            return null;
        }

        public reverse(): IBaseExpression {
            return null;
        }

        public getOutputTransformable(): ITransformable {
            return this.getTransformable();
        }

        public getTraceableCoordinates(): number[] {
            return this.getVariableAtomicValues();
        }

        getIndexedVariableAtomicValues(index){
            return this.getVariableAtomicValues();
        }

    }
}
