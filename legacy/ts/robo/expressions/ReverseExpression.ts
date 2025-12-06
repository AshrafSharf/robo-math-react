/**
 * Created by rizwan on 3/31/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import VariableReferenceExpression = robo.expressions.VariableReferenceExpression;


    import LineExpression = robo.expressions.LineExpression;
    import ParallelExpression = robo.expressions.ParallelExpression;
    import PolygonExpression = robo.expressions.PolygonExpression;
    import ArcExpression = robo.expressions.ArcExpression;
    import PerpExpression = robo.expressions.PerpExpression;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;


    export class ReverseExpression extends GroupExpression {
        public static NAME: string = "reverse";
        processingGroup: ProcessingGroup;
        public partIndex = 1;

        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);
        }


        resolve(context: ExpressionContext): void {

            var allAtomicValues = [];
            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);
                var atomicValues  = this.subExpressions[i].getVariableAtomicValues();
                allAtomicValues = allAtomicValues.concat(atomicValues);
            }

            if (allAtomicValues.length < 2) {
                this.dispatchError(" No coordinate values found to reverse ");
                return;
            }

            var points = [];
            for(var k=0;k<allAtomicValues.length;k+=2) {
                var pt = new Point(allAtomicValues[k], allAtomicValues[k+1]);
                points.push(pt);
            }

            points.reverse();

            this.processingGroup =  new ProcessingGroup([ProcessingPointPair2D.fromPoints2(points,[])]);
        }


        private getVariableValueExp(context: ExpressionContext, expression: IBaseExpression): IBaseExpression {

            if (expression.getName() == VariableReferenceExpression.NAME) {
                var variableReferenceExpression: VariableReferenceExpression = <VariableReferenceExpression>expression;
                return context.getReference(variableReferenceExpression.getVariableName());
            }

            return expression;
        }

        private getVariableValue(context: ExpressionContext, expression: IBaseExpression) {

            if (expression.getName() == VariableReferenceExpression.NAME) {
                var variableReferenceExpression: VariableReferenceExpression = <VariableReferenceExpression>expression;
                return variableReferenceExpression.getVariableName();
            }

            return '';
        }

        getName(): string {
            return ReverseExpression.NAME;
        }

        public equals(other: IBaseExpression): boolean {
            return false;
        }

        getVariableAtomicValues(): number[] {
            return this.getIndexedVariableAtomicValues(0);
        }

        public getTransformable(): ITransformable {
            return this.processingGroup;
        }

        getIndexedVariableAtomicValues(index) {
            return this.processingGroup.getAsAtomicValues().slice(0);
        }

    }
}
