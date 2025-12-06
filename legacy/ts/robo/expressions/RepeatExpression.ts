/**
 * Created by rizwan on 4/7/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import Point= away.geom.Point;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;
    import ITransformable = robo.core.ITransformable;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import IIntersectable = robo.core.IIntersectable;
    import ProcessingGroup = robo.core.ProcessingGroup;

    export class RepeatExpression extends GroupExpression
    {
        public static NAME:string = "repeat";

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }

        resolve(context:ExpressionContext):void
        {
            if(this.subExpressions.length<3)
            {
                this.dispatchError("Repeat expression must have 3 parameters ie repeatable,start and end (variable and step size is optional parameters)");
            }

            var repeatableExpression:IBaseExpression = this.subExpressions[0];
            var startExpression:IBaseExpression = this.subExpressions[1];
            var endExpression:IBaseExpression = this.subExpressions[2];

            startExpression.resolve(context);
            endExpression.resolve(context);

            var startValue:number = startExpression.getVariableAtomicValues()[0];
            var endValue:number = endExpression.getVariableAtomicValues()[0];
            var minValue:number = Math.min(startValue,endValue);
            var maxValue:number = Math.max(startValue,endValue);


            var stepSize:number = 1;
            if(this.subExpressions.length>3)
            {
                var stepExpression:IBaseExpression = this.subExpressions[3];
                stepExpression.resolve(context);
                stepSize = stepExpression.getVariableAtomicValues()[0];
                if(isNaN(stepSize))
                {
                    this.dispatchError("Invalid step Size");
                }
            }

            var variableName:string = "x";
            if(this.subExpressions.length>4)
            {
                var variableExpression:IBaseExpression = this.subExpressions[4];
                variableExpression.resolve(context);
                if(variableExpression.getName()!=VariableReferenceExpression.NAME)
                {
                    this.dispatchError("Invalid variable name");
                }
                variableName = (<VariableReferenceExpression>variableExpression).getVariableName();
            }



            var transformables:ITransformable[] = [];
            var itemCount:number = (maxValue-minValue)/stepSize;

            //what type of Expression?
            if(itemCount>30)
            {
                this.dispatchError("Too many Items to create, increase the step Size ");
            }

            for(var value:number=minValue;value<=maxValue;value+=stepSize)
            {
                var valueExpression:NumericExpression = new NumericExpression(value);
                context.addReference(variableName,valueExpression);

                //The repeat expression will use the same varibale but the with updated value,because addReference overrides the value of the variable
                repeatableExpression.resolve(context);

                var transformable:ITransformable = ExpressionToTransformableFactory.getOutputTransformable(repeatableExpression);
                transformables.push(transformable);
            }

            this.processingGroup = new ProcessingGroup(transformables);
            this.coordinates = this.processingGroup.getAsAtomicValues();
        }


        getName():string
        {
            return RepeatExpression.NAME;
        }

        public equals(other:IBaseExpression):boolean
        {
            return false;
        }
    }
}