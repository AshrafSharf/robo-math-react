/**
 * Created by Mathdisk on 3/23/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import ExpressionError = roboexpressions.ExpressionError;
    import PMath = robo.util.PMath;
    import IIntersectable = robo.core.IIntersectable;
    import Point= away.geom.Point;
    import ITransformable = robo.core.ITransformable;
    import GraphSheet3D = robo.geom.GraphSheet3D;

    export class AbstractNonArithmeticExpression implements IBaseExpression
    {
        private expressionId:number=-1;
        private commandText:string;


        constructor()
        {

        }

        public getExpresionId():number
        {
            return this.expressionId;
        }

        public setExpressionId(expressionId:number):void
        {
            this.expressionId = expressionId;
        }

        public setExpressionCommandText(commandText:string):void
        {
            this.commandText = commandText;
        }

        public getExpressionCommandText():string
        {
            return this.commandText;
        }

        resolve(context:ExpressionContext):void
        {

        }

        getName():string
        {
            return "Abstract";
        }


        add(otherExpression:IBaseExpression):IBaseExpression
        {
            return null;
        }

        subtract(otherExpression:IBaseExpression):IBaseExpression
        {
            return null;
        }

        divide(otherExpression:IBaseExpression):IBaseExpression
        {
            return null;
        }

        multiply(otherExpression:IBaseExpression):IBaseExpression
        {
            if(otherExpression instanceof NumericExpression)
            {
                var numValue:number = (<NumericExpression>otherExpression).getNumericValue();

                if(numValue==-1)
                {
                    return this.reverse();
                }
            }
            return null;
        }

        power(otherExpression:IBaseExpression):IBaseExpression
        {
            return null;
        }

        public getVariableAtomicValues():number[]
        {
            return [];
        }

        dispatchError(errMessage:string):void
        {
            var expressionError:ExpressionError = new ExpressionError(this.getExpresionId(),"Expression Error",errMessage);

            throw expressionError;
        }

        public getIntersectableObject():IIntersectable{
            return null;
        }

        public getStartValue():number[]{
            return [];
        }

        public getEndValue():number[]{
            return [];
        }

        alwaysExecute():boolean {
            return false;
        }

        /** checks name,atomic values length and actual values for equality **/
        public  equals(other:IBaseExpression):boolean
        {
            if(!other)
                return false;

            var currentExp:IBaseExpression = this.getComparableExpression();
            var otherExp:IBaseExpression = other.getComparableExpression();

            if(currentExp.getName()!=otherExp.getName())
                return false;

            if(this.getLabel()!=other.getLabel())
                return false;

            var currentAtomicValues:number[] = currentExp.getVariableAtomicValues();
            var otherAtomicValues:number[] = otherExp.getVariableAtomicValues();

            if(currentAtomicValues.length==otherAtomicValues.length)
            {
                for(var i:number=0;i<currentAtomicValues.length;i++)
                {
                    if(PMath.isEqual(currentAtomicValues[i],otherAtomicValues[i])==false)
                    {
                        return false;
                    }
                }
                return true;// All values are equal
            }
            return false;
        }

        public getComparableExpression():IBaseExpression
        {
            return this;
        }

        public getLabel():string
        {
            return "";
        }

        public dilate(scaleValue:Point,dilateAbout:Point):number[]
        {
            return [];
        }

        public rotate(angleInDegress:number,rotateAbout:Point):number[]
        {
            return [];
        }
        public translate(tranValue:Point,tranAbout:Point):number[]
        {
            return [];
        }
        public reflect(reflectAbout:Point):number[]
        {
            return [];
        }

        public getTransformableExpression():IBaseExpression
        {
            return null;
        }

        public isTransformable():Boolean
        {
            return false;
        }

        public getTransformable():ITransformable
        {
            return null;
        }

        public reverse():IBaseExpression
        {
            if(this.getTransformable()==null)
            {
                this.dispatchError("The object doesnt support reverse option");
            }
            var reversedObject:ITransformable = this.getTransformable().reverse();
            return TransformableToExpressionFactory.getExpression(reversedObject,GraphSheet3D.getInstance());

        }

        public getOutputTransformable():ITransformable
        {
            return this.getTransformable();
        }

        public getTraceableCoordinates(): number[]
        { return this.getVariableAtomicValues();
        }

        getIndexedVariableAtomicValues(index){
            return this.getVariableAtomicValues();
        }

    }
}
