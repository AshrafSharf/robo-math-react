/**
 * Created by MohammedAzeem on 3/31/14.
 */

module robo.expressions {


    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import PointExpression = robo.expressions.PointExpression;

    export class MidPointExpression extends PointExpression
    {
        public static NAME:string = "midpoint";
        public coordinates:number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }

        resolve(context:ExpressionContext):void
        {
            this.coordinates = [];

            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];
                var atomicValues:number[] = this.getAtomicValues(context,resultExpression);

                for (var j:number = 0; j < atomicValues.length; j++)
                {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }
           this.initPoint();
        }

        //overrided by Start and End Expressions
        public getAtomicValues(context:ExpressionContext,resultExpression:IBaseExpression):number[]{

            return resultExpression.getVariableAtomicValues();
        }


        public initPoint():void
        {
            if (this.coordinates.length != 4)
            {
                this.dispatchError("The MidPoint Expression doesn't have 4 coordinate values ");
            }

            var l1_x:number = this.coordinates[0];//line1
            var l1_y:number = this.coordinates[1];

            var l2_x:number = this.coordinates[2];//line2
            var l2_y:number = this.coordinates[3];

            var xValue:number = (l1_x + l2_x) / 2;
            var yValue:number = (l1_y + l2_y) / 2;

            this.point = new Point(xValue, yValue);
        }

        getName():string
        {
            return MidPointExpression.NAME;
        }
    }
}
