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
    import Point = away.geom.Point;


    export class VariableReferenceExpression extends AbstractNonArithmeticExpression
    {
        public static NAME:string="variable";
        private variableName:string="";
        private variableValueExpression:IBaseExpression;

        constructor(variableName:string)
        {
            super();
            this.variableName = variableName;
        }

        resolve(context:ExpressionContext):void
        {
            this.variableValueExpression = context.getReference(this.variableName);

        }


        add(otherExpression:IBaseExpression):IBaseExpression
        {
            if(this.getVariableAtomicValues().length>=1)
            return this.variableValueExpression.add(otherExpression);

            return null;
        }

        subtract(otherExpression:IBaseExpression):IBaseExpression
        {
            if(this.getVariableAtomicValues().length>=1)
                return this.variableValueExpression.subtract(otherExpression);

            return null;
        }

        
        divide(otherExpression:IBaseExpression):IBaseExpression
        {
            if(this.getVariableAtomicValues().length>=1)
                return this.variableValueExpression.divide(otherExpression);

            return null;
        }

        multiply(otherExpression:IBaseExpression):IBaseExpression
        {
            if(this.getVariableAtomicValues().length>=1)
                return this.variableValueExpression.multiply(otherExpression);



            return null;
        }

        power(otherExpression:IBaseExpression):IBaseExpression
        {
            var exponentValue:number = otherExpression.getVariableAtomicValues()[0];

            if(this.getVariableAtomicValues().length>=4) // This means the refered LHS is a line experssion
            {


                    var atomicValues:number[] = this.getVariableAtomicValues();

                    //This is x2-x1 and y2-y1
                    var vector:Point = new Point(atomicValues[2]-atomicValues[0],atomicValues[3]-atomicValues[1]);
                    var base:number = vector.length;

                    var result:number = Math.pow(base,exponentValue);
                    return new NumericExpression(result);


            }

            if(this.getVariableAtomicValues().length>=1)// Just plain numeric
            {
                 var base:number = this.getVariableAtomicValues()[0];
                 var result:number = Math.pow(base,exponentValue);
                 return new NumericExpression(result);
            }

            return null;
        }

        getName():string
        {
            return VariableReferenceExpression.NAME;
        }

        public getVariableAtomicValues():number[]
        {
            if(!this.variableValueExpression)
            {
                this.dispatchError("The value refered by the variable  "+ this.variableName+" does not  exist");
            }
            return this.variableValueExpression.getVariableAtomicValues();
        }

        public getVariableName():string
        {
            return this.variableName;
        }


        public getStartValue():number[]{
            return this.variableValueExpression.getStartValue();
        }

        public getEndValue():number[]{
            return this.variableValueExpression.getEndValue();
        }



        public getTransformableExpression():IBaseExpression
        {
            return this.variableValueExpression;
        }

        public isTransformable():Boolean
        {
            return true;
        }

    }


}