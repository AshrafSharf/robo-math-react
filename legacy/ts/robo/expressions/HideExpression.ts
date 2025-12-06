/**
 * Created by rizwan on 4/7/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;

    export class HideExpression extends AbstractNonArithmeticExpression
    {
        public static NAME:string = "hide";
        public subExpressions:IBaseExpression[] = [];

        public hideExpressionLabels:string[] = [];


        constructor(subExpressions:IBaseExpression[])
        {
            super();

            this.subExpressions = subExpressions;

            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                var expression:IBaseExpression = this.subExpressions[i];

                if(expression.getName()!=VariableReferenceExpression.NAME)
                    this.dispatchError("Hide expression must be of type reference expression");
            }
        }

        resolve(context:ExpressionContext):void
        {
            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                this.subExpressions[i].resolve(context);

                var resultExpression:VariableReferenceExpression = <VariableReferenceExpression>this.subExpressions[i];

                this.hideExpressionLabels.push(resultExpression.getVariableName());
            }

            if(this.hideExpressionLabels.length==0)
            {
                this.dispatchError("Hide expression must have labels");
            }

        }

        getName():string
        {
            return HideExpression.NAME;
        }


        //helper
        public  getHideExpressionLabels():string[]
        {
            return this.hideExpressionLabels;
        }

        public  equals(other:IBaseExpression):boolean
        {
           return false;

        }
    }
}
