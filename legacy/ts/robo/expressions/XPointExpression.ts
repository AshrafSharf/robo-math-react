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

    export class XPointExpression extends AbstractArithmeticExpression
    {
        public static NAME:string = "X";
        public subExpressions:IBaseExpression[] = [];
        public value:number = 0;

        constructor(subExpressions:IBaseExpression[])
        {
            super();

            this.subExpressions = subExpressions;
        }


        resolve(context:ExpressionContext):void
        {
            var coordinates =[];

            for (var i:number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number=0; j < atomicValues.length; j++)
                {
                    coordinates[coordinates.length] = atomicValues[j];
                }
            }

            if(coordinates.length!=2)
            {
                this.dispatchError("The  Expression doesn't have valid  values ");
            }

            this.assignValue(coordinates);

        }

        public assignValue(coordinates)
        {
            this.value = coordinates[0];
        }

        getName():string
        {
            return XPointExpression.NAME;
        }


        //helper
        public  getValue():number
        {
            return this.value;
        }


        public getVariableAtomicValues():number[]
        {
            var x_val:number = this.getValue();
            return [x_val];
        }
    }
}