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

    export class ShowExpression extends AbstractNonArithmeticExpression
    {
        public static NAME:string = "show";
        public subExpressions:IBaseExpression[] = [];

        public showExpressionLabels:string[] = [];

        private alphaValue:number=1;


        constructor(subExpressions:IBaseExpression[])
        {
            super();

            this.subExpressions = subExpressions;

            for (var i:number = 0; i < this.subExpressions.length-1; i++) // modified by ashraf, the last experssion could be aplhaValue
            {
                var expression:IBaseExpression = this.subExpressions[i];

                if(expression.getName()!=VariableReferenceExpression.NAME)
                    this.dispatchError("Show expression must be of type reference expression");
            }
        }

        resolve(context:ExpressionContext):void
        {
            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                this.subExpressions[i].resolve(context);

                if(this.subExpressions[i].getName()==VariableReferenceExpression.NAME)
                {
                    var resultExpression:VariableReferenceExpression = <VariableReferenceExpression>this.subExpressions[i];
                    this.showExpressionLabels.push(resultExpression.getVariableName());
                }

                if(i==this.subExpressions.length-1)//last expression
                {
                    this.determineTransparencyValue(this.subExpressions[i]);
                }


            }

            if(this.showExpressionLabels.length==0)
            {
                this.dispatchError("Show expression must have labels");
            }

        }

        getName():string
        {
            return ShowExpression.NAME;
        }

        private determineTransparencyValue(expression:IBaseExpression):void
        {
            var atmoicValues:number[] = expression.getVariableAtomicValues();
            if(atmoicValues.length==1)
            {
                this.alphaValue = atmoicValues[0];
            }

        }


        //helper
        public  getShowExpressionLabels():string[]
        {
            return this.showExpressionLabels;
        }


        public  equals(other:IBaseExpression):boolean
        {
            return false;

        }

        public getAlphaValue():number
        {
            return this.alphaValue;
        }
    }
}
