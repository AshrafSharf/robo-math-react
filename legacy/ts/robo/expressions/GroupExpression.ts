/**
 * Created by Mathdisk on 3/17/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import Point = away.geom.Point;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ITransformable = robo.core.ITransformable;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import IIntersectable = robo.core.IIntersectable;
    import ProcessingGroup = robo.core.ProcessingGroup;


    export class GroupExpression extends AbstractNonArithmeticExpression {

        public static NAME:string = "group";
        public  graphSheet3D:GraphSheet3D;
        public subExpressions:IBaseExpression[] = [];
        public coordinates:number[] = [];// gets populated  after calling resolve,

        public processingGroup:ProcessingGroup;

        constructor(subExpressions:IBaseExpression[])
        {
            super();

            this.subExpressions =subExpressions;

        }

        resolve(context:ExpressionContext):void
        {
            this.graphSheet3D = context.getGraphSheet3D();


            if(this.subExpressions.length<1)
            {
                this.dispatchError("Insufficient arguments To Group, should have atleast 1 item");
            }

            var transformables:ITransformable[]=[];

            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                this.subExpressions[i].resolve(context);

                var expressionToGroup:IBaseExpression = null;
                expressionToGroup = TransformableToExpressionFactory.determineTranformableExpression(this.subExpressions[i]);
                var transformableItem:ITransformable = ExpressionToTransformableFactory.getTransformable(expressionToGroup);

                if(!transformableItem)
                {
                    this.dispatchError("group item must be one of  polygon,arc,line or point ");
                }


                transformables.push(transformableItem);


            }



            this.processingGroup = new ProcessingGroup(transformables);

            this.coordinates = this.processingGroup.getAsAtomicValues();





        }

        getName():string
        {
            return GroupExpression.NAME;
        }

        public getStartValue():number[]{

            return this.processingGroup.getStartValue();
        }


        public getEndValue():number[]{


            return this.processingGroup.getEndValue();
        }

        public getIntersectableObject():IIntersectable {

            return this.processingGroup;
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
            return  <ITransformable>this.processingGroup;
        }

        public getVariableAtomicValues():number[] {

            return  this.processingGroup.getAsAtomicValues();// this expression clones the array as it is since slice is zero
        }


        public getProcessingGroup():ProcessingGroup
        {

            return this.processingGroup;
        }




    }


}