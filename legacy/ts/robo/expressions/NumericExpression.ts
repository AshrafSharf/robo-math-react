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


    export class NumericExpression extends AbstractArithmeticExpression
    {
        public value:number=0;
        public static NAME:string="number";

        constructor(value:number)
        {
            super();
            this.value = value;
        }

        resolve(context:ExpressionContext):void
        {
             //this is already a number , cant do anything  beyound that
        }


        getName():string
        {
            return NumericExpression.NAME;
        }

        public getNumericValue():number
        {
            return this.value;
        }


        add(otherExpression:IBaseExpression):IBaseExpression
        {
            var othervalues:number[] = otherExpression.getVariableAtomicValues();

            if(othervalues.length==1)
            {
                return new NumericExpression(this.value+othervalues[0]);
            }

            if(othervalues.length==2) // This is point
            {
                return new PointExpression([new NumericExpression(this.value+othervalues[0]),new NumericExpression(this.value+othervalues[1])]);
            }

            throw Error("Cannot perform addition  with Non Numerical values");
        }


        subtract(otherExpression:IBaseExpression):IBaseExpression
        {
            var othervalues:number[] = otherExpression.getVariableAtomicValues();

            if(othervalues.length==1)
            {
                return new NumericExpression(this.value-othervalues[0]);
            }

            if(othervalues.length==2) // This is point
            {
                return new PointExpression([new NumericExpression(this.value-othervalues[0]),new NumericExpression(this.value-othervalues[1])]);
            }

            throw Error("Cannot perform subtraction  with Non Numerical values");
        }

        //modifed by ashraf, numeric expression can also divide point expression

        divide(otherExpression:IBaseExpression):IBaseExpression
        {
            var othervalues:number[] = otherExpression.getVariableAtomicValues();

            if(othervalues.length==1)
            {
                return new NumericExpression(this.value/othervalues[0]);
            }

            if(othervalues.length==2) // This is point
            {
                return new PointExpression([new NumericExpression(this.value/othervalues[0]),new NumericExpression(this.value/othervalues[1])]);
            }

            throw Error("Cannot perform division  with Non Numerical values");

        }

        //modifed by ashraf, numeric expression can also multiply  point expression

        multiply(otherExpression:IBaseExpression):IBaseExpression
        {
            var othervalues:number[] = otherExpression.getVariableAtomicValues();

            if(othervalues.length==1)
            {
                return new NumericExpression(this.value*othervalues[0]);
            }

            if(othervalues.length==2) // This is point with 2 values...
            {
                return new PointExpression([new NumericExpression(this.value*othervalues[0]),new NumericExpression(this.value*othervalues[1])]);
            }


            throw Error("Cannot perform multiplication  with Non Numerical values");
        }


        private extractOtherExpressionValue(operName:string,otherExpression:IBaseExpression):number
        {
            var expName:string = otherExpression.getName();
            switch(expName)
            {
                case NumericExpression.NAME:
                {
                    var otherNumericExp:NumericExpression = <NumericExpression>otherExpression;
                    return otherNumericExp.getNumericValue();
                }

                case VariableReferenceExpression.NAME:
                {
                    var otherVariableExpression:VariableReferenceExpression = <VariableReferenceExpression>otherExpression;
                    if(otherVariableExpression.getVariableAtomicValues().length>1)
                    {
                        throw Error("Cannot "+operName+ "  with Non Numbers");
                        return 0;
                    }

                    return otherVariableExpression.getVariableAtomicValues()[0];
                }
            }



            throw Error("Cannot "+operName+ "  with Non Numbers");
            return 0;

        }

        public getVariableAtomicValues():number[]
        {
            return [this.getNumericValue()];
        }



    }


}