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
    import Point3D = robo.core.Point3D;

    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Engine3D = robo.geom.Engine3D;
    import PMath = robo.util.PMath;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import Vector3D = away.geom.Vector3D;
    import VirtualRotator = robo.virtualobjects.rotator.VirtualRotator;
    import ITransformable = robo.core.ITransformable;
    import RotatePartHandler = robo.virtualobjects.rotator.RotatePartHandler;
    import PointRotateHandler = robo.virtualobjects.rotator.PointRotateHandler;
    import LineRotatePartHandler = robo.virtualobjects.rotator.LineRotatePartHandler;
    import PolygonRotateHandler = robo.virtualobjects.rotator.PolygonRotateHandler;
    import ArcRotatePartHandler = robo.virtualobjects.rotator.ArcRotatePartHandler;
    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import SplineRotateHandler = robo.virtualobjects.rotator.SplineRotateHandler;
    import GroupRotateHandler = robo.virtualobjects.rotator.GroupRotateHandler;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ProcessingGraphTrace = robo.core.ProcessingGraphTrace;
    import ProcessingParametricGraphTrace = robo.core.ProcessingParametricGraphTrace;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import ProcessingPair2DRotateHandler = robo.virtualobjects.rotator.ProcessingPair2DRotateHandler;

    export class RotateCommand extends BaseRoboCommand {
        private virtualRotator: VirtualRotator;
        private transformable: ITransformable;
        private angleInDegress: number;
        private rotateAbout: Point;

        //constructoed by the parser
        constructor(itransformable: ITransformable, angleInDegress: number, rotateAbout: Point) {
            super();

            this.transformable = itransformable;
            this.angleInDegress = angleInDegress;
            this.rotateAbout = rotateAbout;
        }


        //initialized by the engine
        public init(engine: Engine3D, virtualObjectsExecutionContext: VirtualObjectsExecutionContext): void {
            super.init(engine, virtualObjectsExecutionContext);
            this.virtualRotator = engine.virtualRotator;
        }


        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate(): void {

        }


        prePlay(): void {
            super.prePlay();

            this.assignPartHandler();

            this.virtualRotator.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(ratio: number): void {
            super.play(ratio);

            this.virtualRotator.rotate(this.transformable, this.angleInDegress, this.rotateAbout, ratio);
        }


        postPlay(): void {
            super.postPlay();
        }

        public doDirectPlay(): void {

            this.assignPartHandler();

            this.virtualRotator.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.virtualRotator.directCommitRotate(this.transformable, this.angleInDegress, this.rotateAbout);
        }


        public doDrawOn2D(graphSheet2D: GraphSheet2D): void {
            this.assignPartHandler();


            this.virtualRotator.doDrawOn2D(this.transformable, this.angleInDegress, this.rotateAbout, graphSheet2D);
        }

        private assignPartHandler(): void {
            var instance: RotatePartHandler = null;

            switch (this.transformable.getType()) {
                case TransformablePoint.TRANSFORMABLE_TYPE:
                    instance = new PointRotateHandler(this.virtualRotator);
                    break;
                case ProcessingLine2D.TRANSFORMABLE_TYPE:
                    instance = new LineRotatePartHandler(this.virtualRotator);
                    break;
                case ProcessingCircle.TRANSFORMABLE_TYPE:
                    instance = new ArcRotatePartHandler(this.virtualRotator);
                    break;
                case ProcessingPolygon2D.TRANSFORMABLE_TYPE:
                    instance = new PolygonRotateHandler(this.virtualRotator);
                    this.showLabel = false;
                    break;
                case ProcessingSpline2D.TRANSFORMABLE_TYPE:
                    instance = new SplineRotateHandler(this.virtualRotator);
                    break;
                case ProcessingGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineRotateHandler(this.virtualRotator);
                    break;
                case ProcessingParametricGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineRotateHandler(this.virtualRotator);
                    break;
                case ProcessingGroup.TRANSFORMABLE_TYPE:
                    instance = new GroupRotateHandler(this.virtualRotator);
                    this.showLabel = false;
                    break;
                case ProcessingPointPair2D.TRANSFORMABLE_TYPE:
                    instance = new ProcessingPair2DRotateHandler(this.virtualRotator);
                    break;
            }
        }

        getLabelPosition(): Point {
            var labelPosition: Point = this.virtualRotator.getLabelPosition(this.transformable, this.angleInDegress, this.rotateAbout);

            return labelPosition;
        }
    }
}

