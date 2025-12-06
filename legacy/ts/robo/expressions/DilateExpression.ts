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
    import ITransformable = robo.core.ITransformable;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import IIntersectable = robo.core.IIntersectable;


    export class DilateExpression extends TransformationExpression
    {
        public static NAME:string = "dilate";


        private scaleFactor:number;
        private dilateAbout:Point;

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);

        }

        resolve(context:ExpressionContext):void
        {


            this.coordinates =[];

            if(this.subExpressions.length<2)
            {
                this.dispatchError("Insufficient arguments to Dilate, Check How-to link for examples");
            }



            this.subExpressions[0].resolve(context);

            var expressionToDilate:IBaseExpression = null;
            expressionToDilate = TransformableToExpressionFactory.determineTranformableExpression(this.subExpressions[0]);



            var dilateArguments:number[] = [];


            for (var i:number = 1; i < this.subExpressions.length; i++) {

                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number=0; j < atomicValues.length; j++)
                {
                    dilateArguments[dilateArguments.length] = atomicValues[j];
                }
            }


            if(dilateArguments.length==1){//4 and 5
                dilateArguments.push(0);//rotation or trans about position,by default 0,0
                dilateArguments.push(0);
            } else if(dilateArguments.length==2){// just gave x..?
                dilateArguments.push(0);//rotation about position,by default 0,0

            }


            this.transformable = ExpressionToTransformableFactory.getTransformable(expressionToDilate);

            this.scaleFactor = dilateArguments[0];

            this.dilateAbout =new Point(dilateArguments[1],dilateArguments[2]);

            if(!this.transformable)
            {
                this.dispatchError("No Dilate Object Found")
            }


           this.outputTransformable = this.transformable.dilateTransform(this.scaleFactor,this.dilateAbout);

            this.coordinates = this.outputTransformable.getAsAtomicValues(); // this coordinates for composable expressions


        }





        getName():string
        {
            return DilateExpression.NAME;
        }

        public getScaleValue():number
        {
            return this.scaleFactor;
        }

        public getDilateAbout():Point
        {
            return this.dilateAbout;
        }




    }
}