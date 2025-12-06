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

    import ITransformable = robo.core.ITransformable;


    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingCircle=robo.core.ProcessingCircle;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import ProcessingGroup = robo.core.ProcessingGroup;

    import VirtualProjector = robo.virtualobjects.projector.VirtualProjector;
    import ProjectPartHandler = robo.virtualobjects.projector.ProjectPartHandler;
    import PointProjectHandler = robo.virtualobjects.projector.PointProjectHandler;
    import GroupProjectHandler = robo.virtualobjects.projector.GroupProjectHandler;

    export class ProjectCommand extends  BaseRoboCommand
    {
        private virtualProjector:VirtualProjector;
        private transformable:ITransformable;
        private projectAbout:Point[];

        //constructoed by the parser
        constructor(itransformable:ITransformable,projectAbout:Point[])
        {
            super();

            this.transformable = itransformable;
            this.projectAbout = projectAbout;
        }


        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);
            this.virtualProjector = engine.virtualProjector;
        }


        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.assignPartHandler();

            this.virtualProjector.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(ratio:number):void
        {
            super.play(ratio);

            this.virtualProjector.project(this.transformable,this.projectAbout,ratio);
        }

        postPlay():void
        {
            super.postPlay();
        }

        public doDirectPlay():void{

            this.assignPartHandler();

            this.virtualProjector.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.virtualProjector.directCommitTransform(this.transformable,this.projectAbout);
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void
        {
            this.assignPartHandler();

            this.virtualProjector.doDrawOn2D(this.transformable,this.projectAbout,graphSheet2D);
        }


        private assignPartHandler():void
        {
            var instance:ProjectPartHandler = null;

            switch(this.transformable.getType())
            {
                case TransformablePoint.TRANSFORMABLE_TYPE:
                    instance = new PointProjectHandler(this.virtualProjector);
                    break;

                case ProcessingGroup.TRANSFORMABLE_TYPE:
                    instance = new GroupProjectHandler(this.virtualProjector);
                    this.showLabel=false;
                    break;

            }
        }

        getLabelPosition():Point
        {
            var labelPosition:Point = this.virtualProjector.getLabelPosition(this.transformable,this.projectAbout);

            return labelPosition;
        }
    }
}
