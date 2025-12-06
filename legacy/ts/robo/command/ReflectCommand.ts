/**
 * Created by rizwan on 5/30/14.
 */

module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Point3D =  robo.core.Point3D;

    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Engine3D = robo.geom.Engine3D;
    import PMath = robo.util.PMath;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import Vector3D = away.geom.Vector3D;
    import VirtualReflector = robo.virtualobjects.reflector.VirtualReflector;
    import ITransformable = robo.core.ITransformable;
    import ReflectPartHandler = robo.virtualobjects.reflector.ReflectPartHandler;
    import PolygonReflectHandler = robo.virtualobjects.reflector.PolygonReflectHandler;
    import SplineReflectHandler = robo.virtualobjects.reflector.SplineReflectHandler;
    import ProcessingPair2DReflectHandler = robo.virtualobjects.reflector.ProcessingPair2DReflectHandler;
    import ArcReflectPartHandler = robo.virtualobjects.reflector.ArcReflectPartHandler;
    import PointReflectHandler = robo.virtualobjects.reflector.PointReflectHandler;
    import LineReflectPartHandler = robo.virtualobjects.reflector.LineReflectPartHandler;
    import GroupReflectHandler = robo.virtualobjects.reflector.GroupReflectHandler;

    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingCircle=robo.core.ProcessingCircle;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ProcessingGraphTrace = robo.core.ProcessingGraphTrace;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import ProcessingParametricGraphTrace = robo.core.ProcessingParametricGraphTrace;

    export class ReflectCommand extends  BaseRoboCommand
    {
        private virtualReflector:VirtualReflector;
        private transformable:ITransformable;
        private reflectAbout:Point[];

        //constructoed by the parser
        constructor(itransformable:ITransformable,reflectAbout:Point[])
        {
            super();

            this.transformable = itransformable;
            this.reflectAbout = reflectAbout;
        }


        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);
            this.virtualReflector = engine.virtualReflector;
        }


        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.assignPartHandler();

            this.virtualReflector.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(ratio:number):void
        {
            super.play(ratio);

            this.virtualReflector.reflect(this.transformable,this.reflectAbout,ratio);
        }

        postPlay():void
        {
            super.postPlay();
        }

        public doDirectPlay():void{

            this.assignPartHandler();

            this.virtualReflector.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.virtualReflector.directCommitTransform(this.transformable,this.reflectAbout);
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void
        {
            this.assignPartHandler();

            this.virtualReflector.doDrawOn2D(this.transformable,this.reflectAbout,graphSheet2D);
        }


        private assignPartHandler():void
        {
            var instance:ReflectPartHandler = null;

            switch(this.transformable.getType())
            {
                case TransformablePoint.TRANSFORMABLE_TYPE:
                    instance = new PointReflectHandler(this.virtualReflector);
                    break;
                case ProcessingLine2D.TRANSFORMABLE_TYPE:
                    instance = new LineReflectPartHandler(this.virtualReflector);
                    break;
                case ProcessingCircle.TRANSFORMABLE_TYPE:
                    instance = new ArcReflectPartHandler(this.virtualReflector);
                    break;
                case ProcessingPolygon2D.TRANSFORMABLE_TYPE:
                    instance = new PolygonReflectHandler(this.virtualReflector);
                    this.showLabel=false;
                    break;
                case ProcessingSpline2D.TRANSFORMABLE_TYPE:
                    instance = new SplineReflectHandler(this.virtualReflector);
                    break;
                case ProcessingGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineReflectHandler(this.virtualReflector);
                    break;
                case ProcessingParametricGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineReflectHandler(this.virtualReflector);
                    break;
                case ProcessingPointPair2D.TRANSFORMABLE_TYPE:
                    instance = new ProcessingPair2DReflectHandler(this.virtualReflector);
                    break;
                case ProcessingGroup.TRANSFORMABLE_TYPE:
                    instance = new GroupReflectHandler(this.virtualReflector);
                    this.showLabel=false;
                    break;
            }
        }

        getLabelPosition():Point
        {
            var labelPosition:Point = this.virtualReflector.getLabelPosition(this.transformable,this.reflectAbout);

            return labelPosition;
        }
    }
}
