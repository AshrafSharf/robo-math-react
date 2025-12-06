/**
 * Created by Mathdisk on 3/23/14.
 */




module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import ITransformable = robo.core.ITransformable;
    import TransformablePoint = robo.core.TransformablePoint;

    export class RangeExpression extends AbstractArithmeticExpression
    {
        public static NAME:string = "range";
        public subExpressions:IBaseExpression[] = [];


        private minValue:number=0;

        private maxValue:number=10;

        private stepValue:number=0.1;

        constructor(subExpressions:IBaseExpression[])
        {
            super();

            this.subExpressions = subExpressions;
        }


        resolve(context:ExpressionContext):void
        {
            var coordinates:number[] =[];

            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
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
                this.dispatchError("Point expression must have two coordinates ");
            }


            this.minValue= coordinates[0];
            this.maxValue = coordinates[1];


        }

        getName():string
        {
            return RangeExpression.NAME;
        }


        //helper
        public  getMinValue():number
        {
            return this.minValue;
        }

        public  getMaxValue():number
        {
            return this.maxValue;
        }



    }
}