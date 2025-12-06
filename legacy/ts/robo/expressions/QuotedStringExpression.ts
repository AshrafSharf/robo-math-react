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


    export class QuotedStringExpression extends AbstractNonArithmeticExpression
    {

        public static NAME:string="quotedstring";
        private quotedComment:string="";


        constructor(quotedComment:string)
        {
            super();
            this.quotedComment = quotedComment;
        }

        resolve(context:ExpressionContext):void
        {


        }


        getName():string
        {
            return QuotedStringExpression.NAME;
        }

        public getVariableAtomicValues():number[]
        {
           return [];
        }

        public getComment():string
        {
            return this.quotedComment;
        }




    }


}