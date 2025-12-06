/**
 * Created by MohammedAzeem on 3/31/14.
 */
module robo.expressions {


    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import MidPointExpression = robo.expressions.MidPointExpression;




    export class EndPointExpression extends MidPointExpression
    {
        public static NAME:string = "end";

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }


        //overrided by Start and End Expressions
        public getAtomicValues(context:ExpressionContext,resultExpression:IBaseExpression):number[]{

            return resultExpression.getEndValue();
        }


        private getValidTypes():string[]{

            return ['Line/Arc/Polygon'];
        }

        //override
        public initPoint():void
        {
            if (this.coordinates.length < 2)
            {
                this.dispatchError("The Start Expression doesn't have 2 coordinate values, either "+this.getValidTypes().join("")+" is allowed");
            }


            var l2_x:number = this.coordinates[0];//line1 end
            var l2_y:number = this.coordinates[1];

            this.point = new Point(l2_x, l2_y);
        }

        getName():string
        {
            return EndPointExpression.NAME;
        }
    }

}