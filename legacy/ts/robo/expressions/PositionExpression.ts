/**
 * Created by rizwan on 6/2/14.
 */

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import AbstractArithmeticExpression = robo.expressions.AbstractArithmeticExpression;
    import PointExpression = robo.expressions.PointExpression;
    import MidPointExpression = robo.expressions.MidPointExpression;
    import ITransformable = robo.core.ITransformable;
    import NumericExpression = robo.expressions.NumericExpression;

    export class PositionExpression extends MidPointExpression
    {
        public static NAME:string = "pos";

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }


        resolve(context:ExpressionContext):void
        {
            if(this.subExpressions.length!=2)
            {
               this.dispatchError("Invalid pos arguments. Check How-to link for examples");
            }

            this.coordinates = [];
            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                var resultExpression:IBaseExpression = this.subExpressions[i];
                resultExpression.resolve(context);
            }


            var transformable:ITransformable = this.getTranformableObject();
            if(transformable==null)
            {
                this.dispatchError("No point exists at this position");
            }


            var atomicValues:number[] = this.subExpressions[1].getVariableAtomicValues();
            if(atomicValues.length!=1)
            {
                this.dispatchError("No point exists at this position");
            }


            var index:number = atomicValues[0];
            var positionValue:Point = transformable.positionIndex(index);

            if(positionValue!=null)
            {
                this.point = positionValue;
                this.coordinates[0] = positionValue.x;
                this.coordinates[1] = positionValue.y;

            }else{

                this.dispatchError("No point exists at this position");
            }
        }


        private getTranformableObject():ITransformable
        {
            var transformable:ITransformable = null;

            try{

                var transformableExpression:IBaseExpression = TransformableToExpressionFactory.determineTranformableExpression(this.subExpressions[0]);
                transformable = ExpressionToTransformableFactory.getTransformable(transformableExpression);

            }catch(err){

                console.log("No tranformable objects found");
            }

            return transformable;
        }


        getName():string
        {
            return PositionExpression.NAME;
        }
    }
}
