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


    export class TranslateExpression extends TransformationExpression
    {
        public static NAME:string = "translate";

        private transValue:Point;
        private transAbout:Point;


        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }


        resolve(context:ExpressionContext):void
        {
            this.coordinates =[];


            if(this.subExpressions.length<2)
            {
                this.dispatchError("Insufficient arguments To Translate, Check How-to link for examples");
            }

            this.subExpressions[0].resolve(context);

            var expressionToRotate:IBaseExpression = TransformableToExpressionFactory.determineTranformableExpression(this.subExpressions[0]);
            this.transformable = ExpressionToTransformableFactory.getTransformable(expressionToRotate);

            if(!this.transformable)
            {
                this.dispatchError("No Translatable Object Found")
            }

            var translationArguments:number[] = [];
            for (var i:number = 1; i < this.subExpressions.length; i++) {

                var resultExpression:IBaseExpression = this.subExpressions[i];
                resultExpression.resolve(context);

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();
                for (var j:number=0; j < atomicValues.length; j++)
                {
                    translationArguments[translationArguments.length] = atomicValues[j];
                }
            }

            if(translationArguments.length==2){// User hasnt given translation about
                translationArguments.push(0);// trans about position,by default 0,0
                translationArguments.push(0);
            } else if(translationArguments.length==3){// just gave x..?
                translationArguments.push(0);//trans about position,by default 0,0
            }


            if(translationArguments.length!=4)
            {
                this.dispatchError("Insufficient arguments To Translate, Check How-to link for examples");
            }

            this.transValue = new Point(translationArguments[0],translationArguments[1]);
            this.transAbout =new Point(translationArguments[2],translationArguments[3]);

            this.outputTransformable = this.transformable.translateTransform(this.transValue,this.transAbout);
            this.coordinates = this.outputTransformable.getAsAtomicValues(); // this coordinates for composable expressions
        }


        getName():string
        {
            return TranslateExpression.NAME;
        }

        public getTranslateValue():Point
        {
            return this.transValue;
        }

        public getTranslateAbout():Point
        {
            return this.transAbout;
        }



    }

}