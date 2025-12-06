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

    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import Point3D = robo.core.Point3D;
    import GraphSheet3D = robo.geom.GraphSheet3D;

    export class MarkerExpression extends AbstractNonArithmeticExpression {
        public static NAME: string = "marker";
        makers:Point[]=[];
        private subExpressions:IBaseExpression[] = [];

        constructor(subExpressions: IBaseExpression[]) {
            super();
            this.subExpressions = subExpressions;
        }

        resolve(context: ExpressionContext): void {

            var allAtomicValues = [];
            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);
                var atomicValues  = this.subExpressions[i].getVariableAtomicValues();
                allAtomicValues = allAtomicValues.concat(atomicValues);
            }

            if (allAtomicValues.length < 2) {
                this.dispatchError(" No coordinate values found to Mark ");
                return;
            }

            var points = [];
            for(var k=0;k<allAtomicValues.length;k+=2) {
                var pt = new Point(allAtomicValues[k], allAtomicValues[k+1]);
                points.push(pt);
            }

         this.makers = points;
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
            return MarkerExpression.NAME;
        }

        public equals(other: IBaseExpression): boolean {
            return false;
        }

        getVariableAtomicValues(): number[] {
            return [];
        }

        public getTransformable(): ITransformable {
            return null;
        }

        getMarkers() {
            return this.makers.map((pt)=> {
                var pt3D:Point3D = new Point3D(pt.x,pt.y,0)
                GraphSheet3D.translateInlinePoint3DForGraphSheetOffset(pt3D);
                return pt3D;
            })
        }

    }
}
