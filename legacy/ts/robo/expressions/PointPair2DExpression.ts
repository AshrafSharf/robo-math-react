/**
 * Created by Mathdisk on 3/23/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import PlotExpression = robo.expressions.PlotExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import ITransformable = robo.core.ITransformable;


    export class PointPair2DExpression extends PlotExpression {
        public static NAME: string = "placeholderPointpair";

        constructor(modelPointPairs) {
            super([]);
            this.processingPointPair2D = new ProcessingPointPair2D(modelPointPairs);
        }

        resolve(context: ExpressionContext): void {

        }

        public getProcessingPointPair2D(): ProcessingPointPair2D {
            return this.processingPointPair2D;
        }

        public getTransformable(): ITransformable {
            return this.processingPointPair2D;
        }

    }
}