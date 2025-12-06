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

    export class AssignmentExpression extends AbstractNonArithmeticExpression
    {

        public static NAME:string="assignment";
        private variableName:string="";

        public  lhsExpression:IBaseExpression;
        public  rhsExpression:IBaseExpression;

        constructor(lhsExpression:IBaseExpression,rhsExpression:IBaseExpression)
        {
            super();
            this.lhsExpression = lhsExpression;
            this.rhsExpression = rhsExpression;
        }

        resolve(context:ExpressionContext):void
        {
            if(this.lhsExpression.getName()!=VariableReferenceExpression.NAME)
            {
                throw Error("Left side of the variable must be a name");
            }

          //dont call the lhs resolve, it is simply a string

            this.rhsExpression.resolve(context);

            var resRhs:IBaseExpression = this.rhsExpression;

            var variableExp:VariableReferenceExpression = <VariableReferenceExpression>this.lhsExpression;
            var variableName:string = variableExp.getVariableName();

            context.addReference(variableName,resRhs);
        }

        alwaysExecute():boolean {
            return this.rhsExpression.alwaysExecute();
        }


        getName():string
        {
            return AssignmentExpression.NAME;
        }


        public getComparableExpression():IBaseExpression
        {
            return this.rhsExpression;
        }

        public getLabel():string
        {
            if(this.lhsExpression.getName()!=VariableReferenceExpression.NAME)
            {
                return "";
            }

            var variableReferenceExpression:VariableReferenceExpression = <VariableReferenceExpression>this.lhsExpression;

            var labelName:string = variableReferenceExpression.getVariableName();

            return labelName;
        }
    }
}
