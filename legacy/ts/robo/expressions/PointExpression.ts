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
    import ITransformable = robo.core.ITransformable;
    import TransformablePoint = robo.core.TransformablePoint;

    export class PointExpression extends AbstractArithmeticExpression
    {
        public static NAME:string = "point";
        public subExpressions:IBaseExpression[] = [];

        public point:Point = new Point(0, 0);


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


            var xValue:number = coordinates[0];
            var yValue:number = coordinates[1];
            this.point = new Point(xValue, yValue);
        }

        getName():string
        {
            return PointExpression.NAME;
        }


        //helper
        public  getPoint():Point
        {
            return this.point;
        }


        add(otherExpression:IBaseExpression):IBaseExpression
        {
            var otherval:Point = this.extractPointValue("add", otherExpression);
            var resultantPt:Point = this.point.add(otherval);
            var numericExpression1:NumericExpression = new NumericExpression(resultantPt.x);
            var numericExpression2:NumericExpression = new NumericExpression(resultantPt.y);
            return this.resolvedPointExpression(numericExpression1,numericExpression2);
        }

        subtract(otherExpression:IBaseExpression):IBaseExpression
        {
            var otherval:Point = this.extractPointValue("subtract", otherExpression);
            var resultantPt:Point = this.point.subtract(otherval);
            var numericExpression1:NumericExpression = new NumericExpression(resultantPt.x);
            var numericExpression2:NumericExpression = new NumericExpression(resultantPt.y);
            return this.resolvedPointExpression(numericExpression1,numericExpression2);
        }


        divide(otherExpression:IBaseExpression):IBaseExpression
        {
            if(otherExpression.getVariableAtomicValues().length>1)
            {
                this.dispatchError("Point can only be divided by a scalar ");
            }

            var divisor:number = otherExpression.getVariableAtomicValues()[0];
            var pt:Point = this.getPoint().clone();
            var resultPt:Point = new Point(pt.x/divisor,pt.y/divisor);

            var numericExpression1:NumericExpression = new NumericExpression(resultPt.x);
            var numericExpression2:NumericExpression = new NumericExpression(resultPt.y);

            return this.resolvedPointExpression(numericExpression1,numericExpression2);

        }

        multiply(otherExpression:IBaseExpression):IBaseExpression
        {
            if(otherExpression.getVariableAtomicValues().length>1)
            {
                this.dispatchError("Point can only be multiplied  by a scalar ");
            }

            var scaleBy:number = otherExpression.getVariableAtomicValues()[0];
            var pt:Point = this.getPoint().clone();
            var resultPt:Point = new Point(pt.x*scaleBy,pt.y*scaleBy);
            var numericExpression1:NumericExpression = new NumericExpression(resultPt.x);
            var numericExpression2:NumericExpression = new NumericExpression(resultPt.y);

            return this.resolvedPointExpression(numericExpression1,numericExpression2);
        }

        power(otherExpression:IBaseExpression):IBaseExpression
        {
            this.dispatchError("Power for Point not supported");

            return null;
        }

        private resolvedPointExpression(numericExpression1:NumericExpression,numericExpression2:NumericExpression):PointExpression
        {
            var newResolvedPointExpression:PointExpression = new PointExpression([numericExpression1,numericExpression2]);
            newResolvedPointExpression.point = new Point(numericExpression1.getNumericValue(), numericExpression1.getNumericValue());

            return newResolvedPointExpression;
        }

        private extractPointValue(operName:string, otherExpression:IBaseExpression):Point
        {
            var coordinates:number[] = [];

            var atomicValues:number[] = otherExpression.getVariableAtomicValues();

            for (var j:number = 0; j < atomicValues.length; j++)
            {
                coordinates[coordinates.length] = atomicValues[j];
            }

            if (coordinates.length != 2)
            {
                throw new Error("To "+operName+ " the  Expression must have 2 coordinate values ");
            }

            var pt:Point = new Point(coordinates[0], coordinates[1]);
            return pt;
        }


        public getVariableAtomicValues():number[]
        {
            var pt:Point = this.getPoint();
            return [pt.x, pt.y];
        }


        public getFriendlyToStr():string{
            var pt:Point = this.getPoint();
            return "("+pt.x+","+pt.y+")";
        }

        public getTransformableExpression():IBaseExpression
        {
            return this;
        }

        public isTransformable():Boolean
        {
            return true;
        }

        public getTransformable():ITransformable
        {
            var pt:Point = this.getPoint();
            return  <ITransformable>new TransformablePoint(pt.x,pt.y);
        }



    }
}