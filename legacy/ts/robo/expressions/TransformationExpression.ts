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


    export class TransformationExpression extends AbstractNonArithmeticExpression
    {
        public subExpressions:IBaseExpression[] = [];
        //input used by command
        public transformable:ITransformable;


        //out put used by wrapping expressions
        public coordinates:number[] = [];// gets populated  after calling resolve
        public outputTransformable:ITransformable;





        constructor(subExpressions:IBaseExpression[])
        {
          super();
          this.subExpressions = subExpressions;

        }

        public getVariableAtomicValues():number[]
        {
            return this.coordinates.slice(0);
        }


        public getTransformable():ITransformable
        {
            return this.transformable;
        }



        public getTransformableExpression():IBaseExpression
        {
            return TransformableToExpressionFactory.getExpression(this.outputTransformable,GraphSheet3D.getInstance());
        }



        public isTransformable():Boolean
        {
            return true;
        }


        public getStartValue():number[]{
            return  this.outputTransformable.getStartValue();
        }

        public getEndValue():number[]{
            return this.outputTransformable.getEndValue();
        }

        public getIntersectableObject():IIntersectable{
            var tempTrans:any = this.outputTransformable;
            return <IIntersectable>tempTrans;
        }


        public reverse():IBaseExpression
        {
            if(this.outputTransformable==null)
            {
                this.dispatchError("The object doesnt support reverse option");
            }
            var reversedObject:ITransformable = this.outputTransformable.reverse();
            return TransformableToExpressionFactory.getExpression(reversedObject,GraphSheet3D.getInstance());

        }


        public getOutputTransformable():ITransformable
        {
            return this.outputTransformable;
        }



    }

}




