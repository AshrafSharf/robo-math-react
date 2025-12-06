/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;

    export class YPointExpression extends XPointExpression
    {
       public static NAME:string = "Y";

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }

        public assignValue(coordinates)
        {
            this.value = coordinates[1];
        }

        getName():string
        {
            return YPointExpression.NAME;
        }
    }
}