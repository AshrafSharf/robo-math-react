/**
 * Created by MohammedAzeem on 3/31/14.
 */
module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import PointExpression = robo.expressions.PointExpression;
    import MidPointExpression = robo.expressions.MidPointExpression;

    export class StartPointExpression extends MidPointExpression
    {
        public static NAME:string = "start";

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }


        //overrided by Start and End Expressions
        public getAtomicValues(context:ExpressionContext,resultExpression:IBaseExpression):number[]{

            return resultExpression.getStartValue();
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

            var l1_x:number = this.coordinates[0];//line1 start
            var l1_y:number = this.coordinates[1];

            this.point = new Point(l1_x, l1_y);
        }

        getName():string
        {
            return StartPointExpression.NAME;
        }
    }
}