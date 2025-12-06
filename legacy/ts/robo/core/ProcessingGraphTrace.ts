/**
 * Created by rizwan on 7/5/14.
 */

module robo.core {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Matrix = away.geom.Matrix;
    import Point = away.geom.Point;
    import PMath = robo.util.PMath;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import SplineCurve = THREE.Spline;
    import Point3D = robo.core.Point3D;


    export class ProcessingGraphTrace extends ProcessingSpline2D
    {
        public static TRANSFORMABLE_TYPE:number = 7;

        private graphingExpression:any;
        private variableName:any;
        private contextValues:any;

        constructor(graphingExpression,variableName:string,contextValues:any,inputPoints:Point[],smoothness:number=12,explictSmoothCheck:boolean=true)
        {
            super(inputPoints,smoothness,explictSmoothCheck);

            this.graphingExpression = graphingExpression;
            this.variableName = variableName;
            this.contextValues = contextValues;
        }


        public getType():number
        {
            return ProcessingGraphTrace.TRANSFORMABLE_TYPE;
        }

        public getStartValue():number[]
        {
            var graphSheet3D = robo.geom.GraphSheet3D.getInstance();
            var minValue:number = graphSheet3D.getGraphSheetModelMinX();

            var point:Point = this.positionIndex(minValue);
            return [point.x,point.y];
        }

        public getEndValue():number[]
        {
            var graphSheet3D = robo.geom.GraphSheet3D.getInstance();
            var maxValue:number = graphSheet3D.getGraphSheetModelMaxX();

            var point:Point = this.positionIndex(maxValue);
            return [point.x,point.y];
        }

        public getLabelPosition():Point
        {
            var offsetVal:number = 0.25;
            return new Point();
        }

        public positionIndex(index:number):Point
        {
            var value:number = index;
            var valueExpression:robo.expressions.NumericExpression = new robo.expressions.NumericExpression(value);

            var graphSheet3D = robo.geom.GraphSheet3D.getInstance();
            var context:robo.expressions.ExpressionContext = new robo.expressions.ExpressionContext(graphSheet3D);

            for(var key in this.contextValues)
            {
                var retVal:any = this.contextValues[key];
                context.addReference(key,retVal);
            }
            context.addReference(this.variableName,valueExpression);

            //The repeat expression will use the same varibale but the with updated value,because addReference overrides the value of the variable
            this.graphingExpression.resolve(context);
            var atomicValues:number[] = this.graphingExpression.getVariableAtomicValues();

            var point:Point = new Point(value,atomicValues[0]);
            return point;
        }

        public reverse():ITransformable
        {
            var newInputPoints:Point[]= this.inputPoints.slice(0).reverse();
            return new ProcessingGraphTrace(this.graphingExpression,this.variableName,this.contextValues,newInputPoints,this.smoothness);
        }

    }
}
