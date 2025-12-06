/**
 * Created by rizwan on 4/1/14.
 */


module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;

    import StyleConfig = robo.util.StyleConfig;

    export class PointTypeExpression extends AbstractNonArithmeticExpression {
        public static NAME: string = "pointtype";
        private subExpressions: IBaseExpression[] = [];
        private pointTypeValue: string = 'sphere'

        constructor(subExpressions: IBaseExpression[]) {
            super();
            this.subExpressions = subExpressions;
        }

        resolve(context: ExpressionContext): void {
            if (this.subExpressions.length) {
                var resultExpression: IBaseExpression = this.subExpressions[0];
                resultExpression.resolve(context);
                // Lazy loaded
                var QuotedStringExpression = robo.expressions.QuotedStringExpression;
                if (resultExpression.getName() == QuotedStringExpression.NAME) {
                    var quotedStringExpression: QuotedStringExpression = <QuotedStringExpression>resultExpression;
                    this.pointTypeValue = quotedStringExpression.getComment();
                }
            }
            StyleConfig.setPointStyle(this.pointTypeValue)
        }

        getName(): string {
            return PointTypeExpression.NAME;
        }

        public getVariableAtomicValues(): number[] {
            return [];// this expression clones the array as it is since slice is zero
        }

        public equals(other: IBaseExpression): boolean {
            return false;
        }
    }
}
