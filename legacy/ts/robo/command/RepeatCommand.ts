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
    import ProcessingGroupBuilder = robo.virtualobjects.ProcessingGroupBuilder;

    /** creates a Processing Group **/
    export class RepeatCommand extends  BaseRoboCommand
    {
        private processingGroup:ProcessingGroup;
        private processingGroupBuilder:ProcessingGroupBuilder;
        constructor(processingGroup:ProcessingGroup)
        {
            super();
            this.processingGroup = processingGroup;


        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);
            this.processingGroupBuilder = engine.processingGroupBuilder;
        }


        prePlay():void
        {
            super.prePlay();



            this.processingGroupBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }




        // value always ranges from 0 to 1
        play(ratio:number):void
        {
            super.play(ratio);

            this.processingGroupBuilder.drawGroup(this.processingGroup,ratio);
        }


        postPlay():void
        {
            super.postPlay();
        }

        public doDirectPlay():void{


            this.processingGroupBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.processingGroupBuilder.directCommitCreate(this.processingGroup);
        }


        public doDrawOn2D(graphSheet2D:GraphSheet2D):void
        {
            //            this.virtualRotator.doDrawOn2D(this.transformable,this.angleInDegress,this.rotateAbout,graphSheet2D);
        }

    }

}