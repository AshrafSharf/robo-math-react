/**
 * Created by MohammedAzeem on 4/11/14.
 */
/**
 * Created by MohammedAzeem on 4/11/14.
 */
module robo.expressions {


    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import Point = away.geom.Point;
    import Geometric2DUtil = robo.core.Geometric2DUtil;


    export class ReflectExpression extends TransformationExpression
    {
        public static NAME:string = "reflect";

        private reflectAbout1:Point;
        private reflectAbout2:Point;

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }

        resolve(context:ExpressionContext):void
        {
            this.coordinates = [];


            if(this.subExpressions.length<2)
            {
                this.dispatchError("Insufficient arguments To Reflect, Check How-to link for examples");
            }

            this.subExpressions[0].resolve(context);

            var expressionToRotate:IBaseExpression = null;
            expressionToRotate = TransformableToExpressionFactory.determineTranformableExpression(this.subExpressions[0]);

            this.transformable = ExpressionToTransformableFactory.getTransformable(expressionToRotate);
            if(!this.transformable)
            {
                this.dispatchError("No Reflectable Object Found")
            }


            var reflectionArguments:number[] = [];
            for (var i:number = 1; i < this.subExpressions.length; i++) {

                var resultExpression:IBaseExpression = this.subExpressions[i];
                resultExpression.resolve(context);

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();
                for (var j:number=0;j<atomicValues.length;j++)
                {
                    reflectionArguments[reflectionArguments.length] = atomicValues[j];
                }
            }

            if(reflectionArguments.length!=4)
            {
                this.dispatchError("Insufficient arguments To Reflect, Check How-to link for examples");
            }

            this.reflectAbout1 = new Point(reflectionArguments[0],reflectionArguments[1]);
            this.reflectAbout2 = new Point(reflectionArguments[2],reflectionArguments[3]);

            this.outputTransformable = this.transformable.reflectTransform(this.reflectAbout1,this.reflectAbout2,1);
            this.coordinates = this.outputTransformable.getAsAtomicValues(); // this coordinates for composable expressions
        }


        getName():string
        {
            return ReflectExpression.NAME;
        }


        public getReflectAbout():Point[]
        {
            return [this.reflectAbout1,this.reflectAbout2];
        }
    }
}