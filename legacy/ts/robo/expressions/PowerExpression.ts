/**
 * Created by Mathdisk on 3/23/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;


    export class PowerExpression extends AbstractArithmeticExpression
    {
        private  lhsExpression:IBaseExpression;
        private  rhsExpression:IBaseExpression;

        constructor(lhsExpression:IBaseExpression,rhsExpression:IBaseExpression)
        {
            super();
            this.lhsExpression = lhsExpression;
            this.rhsExpression = rhsExpression;
        }

        resolve(context:ExpressionContext):void
        {
            this.lhsExpression.resolve(context);
            this.rhsExpression.resolve(context);

            this.resultantExpression = this.lhsExpression.power(this.rhsExpression);
        }
        getName():string
        {
            return "^";
        }
    }
}