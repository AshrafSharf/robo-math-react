/**
 * Created by rizwan on 3/31/14.
 */

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import Point = away.geom.Point;

    export class DistanceExpression extends AbstractArithmeticExpression
    {
        public static NAME:string = "dist";
        private subExpressions:IBaseExpression[] = [];
        private coordinates:number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2

        constructor(subExpressions:IBaseExpression[])
        {
            super();
            this.subExpressions = subExpressions;
        }

        resolve(context:ExpressionContext):void
        {
            this.coordinates =[];

            for (var i:number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number=0; j < atomicValues.length; j++)
                {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }

            if(this.coordinates.length!=4)
            {
                this.dispatchError("The Dist Expression doesn't have 4 coordinate values ");
            }

        }

        getName():string
        {
            return DistanceExpression.NAME;
        }

        public getVariableAtomicValues():number[]
        {
            return  [this.getDistance()];// this expression clones the array as it is since slice is zero
        }

        //convient method
        public getDistance():number
        {
            var point1:Point = new Point(this.coordinates[0],this.coordinates[1]);
            var point2:Point = new Point(this.coordinates[2],this.coordinates[3]);

            var distance:number = Point.distance(point1,point2);
            return distance;
        }

        //convient method
        public getPoints():Point[]
        {
            var point1:Point = new Point(this.coordinates[0],this.coordinates[1]);
            var point2:Point = new Point(this.coordinates[2],this.coordinates[3]);

            return [point1,point2];
        }
    }
}
