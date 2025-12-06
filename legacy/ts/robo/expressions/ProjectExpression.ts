/**
 * Created by MohammedAzeem on 4/11/14.
 */
module robo.expressions {


    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import Point = away.geom.Point;
    import Geometric2DUtil = robo.core.Geometric2DUtil;


    export class ProjectExpression extends TransformationExpression
    {
        public static NAME:string = "project";


        private projectAbt1:Point;
        private projectAbt2:Point;

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);

        }

        resolve(context:ExpressionContext):void
        {
            this.coordinates = [];


            if(this.subExpressions.length<2)
            {
                this.dispatchError("Insufficient arguments To Project, Check How-to link for examples");
            }

            this.subExpressions[0].resolve(context);

            var expressionToRotate:IBaseExpression = null;
            expressionToRotate = TransformableToExpressionFactory.determineTranformableExpression(this.subExpressions[0]);

            this.transformable = ExpressionToTransformableFactory.getTransformable(expressionToRotate);
            if(!this.transformable)
            {
                this.dispatchError("No Projectable Object Found")
            }


            var projecttionArguments:number[] = [];
            for (var i:number = 1; i < this.subExpressions.length; i++) {

                var resultExpression:IBaseExpression = this.subExpressions[i];
                resultExpression.resolve(context);

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();
                for (var j:number=0;j<atomicValues.length;j++)
                {
                    projecttionArguments[projecttionArguments.length] = atomicValues[j];
                }
            }

            if(projecttionArguments.length!=4)
            {
                this.dispatchError("Insufficient arguments To Reflect, Check How-to link for examples");
            }

            this.projectAbt1 = new Point(projecttionArguments[0],projecttionArguments[1]);
            this.projectAbt2 = new Point(projecttionArguments[2],projecttionArguments[3]);

            this.outputTransformable = this.transformable.projectTransform(this.projectAbt1,this.projectAbt2,1);
            this.coordinates = this.outputTransformable.getAsAtomicValues(); // this coordinates for composable expressions


        }

        getName():string
        {
            return ProjectExpression.NAME;
        }



        public getProjectAbout():Point[]
        {
            return [this.projectAbt1,this.projectAbt2];
        }


    }
}