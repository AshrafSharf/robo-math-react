/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;


    export class MathFunctionExpression extends AbstractNonArithmeticExpression
    {

        constructor(args:any)
        {
            super();
        }
        resolve(context:ExpressionContext):void
        {

        }
        getName():string
        {
            return "theactualFunctionName"; // todo
        }



    }


}