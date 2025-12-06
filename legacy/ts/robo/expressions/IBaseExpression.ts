/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {


    import ExpressionContext = robo.expressions.ExpressionContext;
    import IIntersectable = robo.core.IIntersectable;
    import Point= away.geom.Point;
    import ITransformable = robo.core.ITransformable;

    export interface IBaseExpression
    {
        resolve(context:ExpressionContext):void;
        getName():string;
        add(otherExpression:IBaseExpression):IBaseExpression;
        subtract(otherExpression:IBaseExpression):IBaseExpression;
        divide(otherExpression:IBaseExpression):IBaseExpression;
        multiply(otherExpression:IBaseExpression):IBaseExpression;
        power(otherExpression:IBaseExpression):IBaseExpression;
        getVariableAtomicValues():number[];
        getExpresionId():number;
        setExpressionId(expressionId:number):void;
        setExpressionCommandText(commandText:string):void;
        getExpressionCommandText():string;
        getStartValue():number[];
        getEndValue():number[];
        equals(other:IBaseExpression):boolean;
        getComparableExpression():IBaseExpression;
        getLabel():string;
        getIntersectableObject():IIntersectable;
        dilate(scaleValue:Point,dilateAbout:Point):number[];
        rotate(angleInDegress:number,rotateAbout:Point):number[];
        translate(tranValue:Point,tranAbout:Point):number[];
        reflect(reflectAbout:Point):number[];
        getTransformableExpression():IBaseExpression;
        getTransformable():ITransformable;
        getOutputTransformable():ITransformable;
        isTransformable():Boolean;
        dispatchError(errMessage:string):void;
        reverse():IBaseExpression;
        getTraceableCoordinates():number[];
        getIndexedVariableAtomicValues(index);
        alwaysExecute():boolean;

    }


}
