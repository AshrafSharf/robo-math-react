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


    export class RotateExpression extends TransformationExpression
    {
        public static NAME:string = "rotate";


        private rotateDegrees:number;
        private rotateAbout:Point;

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);

        }

        resolve(context:ExpressionContext):void
        {


            this.coordinates =[];

            if(this.subExpressions.length<2)
            {
                this.dispatchError("Insufficient arguments To Rotate, Check How-to link for examples");
            }



            this.subExpressions[0].resolve(context);

            var expressionToRotate:IBaseExpression = null;
            expressionToRotate = TransformableToExpressionFactory.determineTranformableExpression(this.subExpressions[0]);



            var rotationArguments:number[] = [];


            for (var i:number = 1; i < this.subExpressions.length; i++) {

                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number=0; j < atomicValues.length; j++)
                {
                    rotationArguments[rotationArguments.length] = atomicValues[j];
                }
            }


            if(rotationArguments.length==1){//4 and 5
                rotationArguments.push(0);//rotation or trans about position,by default 0,0
                rotationArguments.push(0);
            } else if(rotationArguments.length==2){// just gave x..?
                rotationArguments.push(0);//rotation about position,by default 0,0

            }


            this.transformable = ExpressionToTransformableFactory.getTransformable(expressionToRotate);

            this.rotateDegrees = rotationArguments[0];

            this.rotateAbout =new Point(rotationArguments[1],rotationArguments[2]);

            if(!this.transformable)
            {
                this.dispatchError("No Rotatable Object Found")
            }


            this.outputTransformable = this.transformable.rotateTransform(this.rotateDegrees,this.rotateAbout);
            this.coordinates = this.outputTransformable.getAsAtomicValues(); // this coordinates for composable expressions

        }





        getName():string
        {
            return RotateExpression.NAME;
        }

        public getRotateInDegress():number
        {
            return this.rotateDegrees;
        }

        public getRotateAbout():Point
        {
            return this.rotateAbout;
        }




    }
}