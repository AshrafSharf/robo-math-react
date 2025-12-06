/**
 * Created by Mathdisk on 3/17/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *  Responsible for creating command Objects based on  expression
 *
 */
module robo.expressions {

    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingLine2D = robo.core.ProcessingLine2D;

    export class ExpressionToTransformableFactory
    {
        constructor()
        {

        }

        public static  getTransformable(expression:IBaseExpression):ITransformable
        {
           var  expressionName:string = expression.getName();
           var  transformable:ITransformable=null;

           transformable= expression.getTransformable();

           return transformable;


        }



        public static  getOutputTransformable(expression:IBaseExpression):ITransformable
        {
            var  expressionName:string = expression.getName();
            var  transformable:ITransformable=null;

            transformable= expression.getOutputTransformable();

            return transformable;


        }



    }


}