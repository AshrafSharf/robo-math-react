/**
 * Created by Mathdisk on 3/19/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


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
    import VirtualDilator = robo.virtualobjects.dilator.VirtualDilator;
    import ITransformable = robo.core.ITransformable;
    import DilatePartHandler = robo.virtualobjects.dilator.DilatePartHandler;
    import PolygonDilateHandler = robo.virtualobjects.dilator.PolygonDilateHandler;
    import SplineDilateHandler = robo.virtualobjects.dilator.SplineDilateHandler;
    import ArcDilatePartHandler = robo.virtualobjects.dilator.ArcDilatePartHandler;
    import PointDilateHandler = robo.virtualobjects.dilator.PointDilateHandler;
    import LineDilatePartHandler = robo.virtualobjects.dilator.LineDilatePartHandler;
    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingCircle=robo.core.ProcessingCircle;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import GroupDilateHandler = robo.virtualobjects.dilator.GroupDilateHandler;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ProcessingGraphTrace = robo.core.ProcessingGraphTrace;
    import ProcessingParametricGraphTrace = robo.core.ProcessingParametricGraphTrace;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import ProcessingPair2DDilateHandler = robo.virtualobjects.dilator.ProcessingPair2DDilateHandler;

    export class DilateCommand extends  BaseRoboCommand
    {
        private virtualTransformer:VirtualDilator;
        private transformable:ITransformable;
        private scaleValue:number;
        private dilateAbout:Point;

        //constructoed by the parser
        constructor(itransformable:ITransformable,scaleValue:number,dilateAbout:Point)
        {
            super();

            this.transformable = itransformable;
            this.scaleValue = scaleValue;
            this.dilateAbout = dilateAbout;
        }


        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);
            this.virtualTransformer = engine.virtualDilator;
        }



        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }

        prePlay():void
        {
            super.prePlay();

            this.assignPartHandler();

            this.virtualTransformer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(ratio:number):void
        {
            super.play(ratio);

            this.virtualTransformer.dilate(this.transformable,this.scaleValue,this.dilateAbout,ratio);
        }

        postPlay():void
        {
            super.postPlay();
        }


        public doDirectPlay():void{

            this.assignPartHandler();

            this.virtualTransformer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.virtualTransformer.directCommitTransform(this.transformable,this.scaleValue,this.dilateAbout);
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void
        {
            this.assignPartHandler();

            this.virtualTransformer.doDrawOn2D(this.transformable,this.scaleValue,this.dilateAbout,graphSheet2D);
        }


        private assignPartHandler():void
        {
            var instance:DilatePartHandler = null;

            switch(this.transformable.getType())
            {
                case TransformablePoint.TRANSFORMABLE_TYPE:
                    instance = new PointDilateHandler(this.virtualTransformer);
                    break;
                case ProcessingLine2D.TRANSFORMABLE_TYPE:
                    instance = new LineDilatePartHandler(this.virtualTransformer);
                    break;
                case ProcessingCircle.TRANSFORMABLE_TYPE:
                    instance = new ArcDilatePartHandler(this.virtualTransformer);
                    break;
                case ProcessingPolygon2D.TRANSFORMABLE_TYPE:
                    instance = new PolygonDilateHandler(this.virtualTransformer);
                    this.showLabel=false;
                    break;
                case ProcessingSpline2D.TRANSFORMABLE_TYPE:
                    instance = new SplineDilateHandler(this.virtualTransformer);
                    break;
                case ProcessingGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineDilateHandler(this.virtualTransformer);
                    break;
                case ProcessingParametricGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineDilateHandler(this.virtualTransformer);
                    break;
                case ProcessingGroup.TRANSFORMABLE_TYPE:
                    instance = new GroupDilateHandler(this.virtualTransformer);
                    this.showLabel=false;
                    break;
                case ProcessingPointPair2D.TRANSFORMABLE_TYPE:
                    instance = new ProcessingPair2DDilateHandler(this.virtualTransformer);
                    break;
            }
        }

        getLabelPosition():Point
        {
            var labelPosition:Point = this.virtualTransformer.getLabelPosition(this.transformable,this.scaleValue,this.dilateAbout);

            return labelPosition;
        }
    }
}