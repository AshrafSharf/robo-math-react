/**
 * Created by rizwan on 3/25/14.
 */
module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import PointExpression = robo.expressions.PointExpression;
    import NumericExpression = robo.expressions.NumericExpression;
    import Point = away.geom.Point;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import IIntersectable = robo.core.IIntersectable;
    import ITransformable = robo.core.ITransformable;

    export class ParallelExpression extends AbstractNonArithmeticExpression {

        public static NAME:string = "parallel";

        private subExpressions:IBaseExpression[] = [];
        private coordinates:number[] = [];// gets populated  after calling resolve, 6 values x1,y1,x2,y2 and i1, i2

        private parallelLine:ProcessingLine2D;

        constructor(subExpressions:IBaseExpression[]) {

            super();

            this.subExpressions = subExpressions;
        }

        resolve(context:ExpressionContext):void {

            this.coordinates =[];

            for (var i:number = 0; i < this.subExpressions.length; i++)
            {
                this.subExpressions[i].resolve(context);

                var resultExpression:IBaseExpression = this.subExpressions[i];

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();

                for (var j:number=0; j < atomicValues.length; j++)
                {
                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }

            this.validateLineLength();

            if(this.coordinates.length!=7)
            {
                this.dispatchError("The Parallel Expression doesn't have 6 coordinate values ");
            }

            this.calculateParallelLine();
        }


        private validateLineLength():void
        {
            if(this.coordinates.length==7)
            {
                var lastIndex:number = this.coordinates.length-1;
                var lineLength:number = this.coordinates[lastIndex];

                if(lineLength==0)
                {
                    lineLength = 1;
                    this.coordinates[lastIndex] = lineLength;
                }
            }

            if(this.coordinates.length==6)
            {
                this.coordinates[this.coordinates.length] = 10;  //default line length
            }
        }


        getName():string {

            return ParallelExpression.NAME;
        }

        public getVariableAtomicValues():number[]
        {
            var resultLine:ProcessingLine2D = this.getParallelLine();
            return  [resultLine.x1,resultLine.y1,resultLine.x2,resultLine.y2];// this expression clones the array as it is since slice is zero
        }

        //convient method
        public getParallelPoints():Point[]
        {
            var pts:Point[] =[];

            pts[0]= new Point(this.coordinates[0],this.coordinates[1]);
            pts[1]= new Point(this.coordinates[2],this.coordinates[3]);
            pts[2]= new Point(this.coordinates[4],this.coordinates[5]);

            return pts;
        }

        //convient method
        public getLineLength():number
        {
            var lastIndex:number = this.coordinates.length-1;
            var lineLength:number = this.coordinates[lastIndex];
            return lineLength;
        }

        public getParallelLine():ProcessingLine2D
        {
            return this.parallelLine;
        }

        public getIntersectableObject():IIntersectable {

            return this.getParallelLine();
        }


        ////////////////////////////////////////////

        private calculateParallelLine():void
        {
            var fromPoint:Point = new Point(this.coordinates[0], this.coordinates[1]);
            var toPoint:Point = new Point(this.coordinates[2], this.coordinates[3]);
            var inputPt:Point = new Point(this.coordinates[4],this.coordinates[5]);

            var perpLineInputs:Point[] = this.getParallelLineInputs(fromPoint,toPoint,inputPt);
            this.parallelLine = new ProcessingLine2D(perpLineInputs[0].x, perpLineInputs[0].y, perpLineInputs[1].x, perpLineInputs[1].y);
        }


        private  getParallelLineInputs(fromPoint:Point,toPoint:Point,inputPt:Point):Point[]
        {
            var lineLength:number = this.getLineLength();
            var lineObj:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);

            return lineObj.getParallelLinePassingThroughPoint(inputPt,lineLength);
        }

        public getStartValue():number[]
        {
            var perpLine:ProcessingLine2D = this.getParallelLine();
            return [perpLine.x1,perpLine.y1];
        }

        public getEndValue():number[]
        {
            var perpLine:ProcessingLine2D = this.getParallelLine();
            return [perpLine.x2,perpLine.y2];
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
            return  <ITransformable> this.parallelLine.copy();
        }
    }
}
