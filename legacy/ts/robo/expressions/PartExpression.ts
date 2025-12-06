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


    export class PartExpression extends GroupExpression {
        public static NAME: string = "part";
        processingGroup: ProcessingGroup;
        public partIndex = 1;

        constructor(subExpressions: IBaseExpression[]) {
            super(subExpressions);
            if (this.subExpressions.length < 3) {
                this.dispatchError(this.getName() + "  expression must have  three parameters starting with either lines/arc/polygons");
                return;
            }
        }


        resolve(context: ExpressionContext): void {

            this.validateSubExpressions(context);
            for (var i: number = 0; i < this.subExpressions.length; i++) {
                this.subExpressions[i].resolve(context);
            }

            var referenceExpA = this.getVariableValueExp(context, this.subExpressions[0]);
            var referenceShape: any = referenceExpA.getIntersectableObject();

            var args: number[] = [];
            var parts = [];
            if (referenceShape && referenceShape.part) {

                for (var j: number = 1; j < this.subExpressions.length; j++) {
                    var atomicValues = this.subExpressions[j].getVariableAtomicValues();

                    for (var k = 0; k < atomicValues.length; k++) {
                        args.push(atomicValues[k]);
                    }

                }

                if (args.length >= 4) {
                    var fromPoint = new Point(args[0], args[1]);
                    var toPoint = new Point(args[2], args[3]);
                    var optionalPartIndexArg = args[4]; // after 4 point coordinates are given the last one would be partIndex
                    if(optionalPartIndexArg){

                        if (optionalPartIndexArg > 2 || optionalPartIndexArg < 1) {
                            this.dispatchError("Part Index Must be either 1 or 2 ");
                            return;
                        }
                        this.partIndex = optionalPartIndexArg -1;
                    }

                    if(this.partIndex==1) {
                        parts = parts = referenceShape.excludeParts(fromPoint, toPoint);
                    }

                    else
                    {
                        parts = referenceShape.includeParts(fromPoint, toPoint);
                    }
                } else {
                    this.dispatchError("Two points should be provided to " + this.getName() + "  expression ");
                }

            }

            this.processingGroup = new ProcessingGroup(parts);
        }


        private validateSubExpressions(context: ExpressionContext) {
            if (this.subExpressions.length < 3) {
                this.dispatchError(this.getName() + "  expression must have 3 arguments with the first one refering to an existing shape");
                return;
            }

            // The first expression must be a variable
            if (this.subExpressions[0].getName() != VariableReferenceExpression.NAME) {
                this.dispatchError(this.getName() + "   must refer ta existing line or arc or polygon");
                return;
            }
            // The variable expression must refer a existing line,arc or circle
            var referenceExp = this.getVariableValueExp(context, this.subExpressions[0])
            var result = this.isValidExpression(referenceExp);
            if (!result) {
                var type = referenceExp.getName();
                this.dispatchError(type + " is not a valid argument to get part from");
            }

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


        isValidExpression(exp: IBaseExpression): boolean {
            if (exp == undefined) {
                return false;
            }
            switch (exp.getName()) {
                case LineExpression.NAME:
                case ArcExpression.NAME:
                case PolygonExpression.NAME:
                case ParallelExpression.NAME:
                case PerpExpression.NAME:
                    return true;
            }

            if(exp instanceof  TransformationExpression) {
                return true;
            }
            return false;
        }

        getName(): string {
            return PartExpression.NAME;
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
