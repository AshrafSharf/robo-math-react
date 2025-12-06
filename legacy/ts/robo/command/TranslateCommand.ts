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
    import VirtualTranslator = robo.virtualobjects.translator.VirtualTranslator;
    import ITransformable = robo.core.ITransformable;
    import TranslatePartHandler = robo.virtualobjects.translator.TranslatePartHandler;
    import PolygonTranslateHandler = robo.virtualobjects.translator.PolygonTranslateHandler;
    import SplineTranslateHandler = robo.virtualobjects.translator.SplineTranslateHandler;
    import ArcTranslatePartHandler = robo.virtualobjects.translator.ArcTranslatePartHandler;
    import PointTranslateHandler = robo.virtualobjects.translator.PointTranslateHandler;
    import LineTranslatePartHandler = robo.virtualobjects.translator.LineTranslatePartHandler;
    import ProcessingPair2DTranslateHandler = robo.virtualobjects.translator.ProcessingPair2DTranslateHandler;


    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import ProcessingGraphTrace = robo.core.ProcessingGraphTrace;
    import ProcessingParametricGraphTrace = robo.core.ProcessingParametricGraphTrace;
    import GroupTranslateHandler = robo.virtualobjects.translator.GroupTranslateHandler;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;



    export class TranslateCommand extends BaseRoboCommand {

        private virtualTransformer: VirtualTranslator;
        private transformable: ITransformable;
        private transValue: Point;
        private transAbout: Point;

        //constructoed by the parser
        constructor(itransformable: ITransformable, transValue: Point, transAbout: Point) {
            super();

            this.transformable = itransformable;
            this.transValue = transValue;
            this.transAbout = transAbout;
        }


        //initialized by the engine
        public init(engine: Engine3D, virtualObjectsExecutionContext: VirtualObjectsExecutionContext): void {
            super.init(engine, virtualObjectsExecutionContext);
            this.virtualTransformer = engine.virtualTranslator;
        }


        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate(): void {

        }


        prePlay(): void {
            super.prePlay();

            this.assignPartHandler();

            this.virtualTransformer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(ratio: number): void {
            super.play(ratio);

            this.virtualTransformer.translate(this.transformable, this.transValue, this.transAbout, ratio);
        }

        postPlay(): void {
            super.postPlay();
        }

        public doDirectPlay(): void {

            this.assignPartHandler();

            this.virtualTransformer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.virtualTransformer.directCommitTransform(this.transformable, this.transValue, this.transAbout);
        }


        public doDrawOn2D(graphSheet2D: GraphSheet2D): void {
            this.assignPartHandler();

            this.virtualTransformer.doDrawOn2D(this.transformable, this.transValue, this.transAbout, graphSheet2D);
        }


        private assignPartHandler(): void {
            var instance: TranslatePartHandler = null;

            switch (this.transformable.getType()) {

                case TransformablePoint.TRANSFORMABLE_TYPE:
                    instance = new PointTranslateHandler(this.virtualTransformer);
                    break;
                case ProcessingLine2D.TRANSFORMABLE_TYPE:
                    instance = new LineTranslatePartHandler(this.virtualTransformer);
                    break;
                case ProcessingCircle.TRANSFORMABLE_TYPE:
                    instance = new ArcTranslatePartHandler(this.virtualTransformer);
                    break;
                case ProcessingPolygon2D.TRANSFORMABLE_TYPE:
                    instance = new PolygonTranslateHandler(this.virtualTransformer);
                    this.showLabel = false;
                    break;
                case ProcessingSpline2D.TRANSFORMABLE_TYPE:
                    instance = new SplineTranslateHandler(this.virtualTransformer);
                    break;
                case ProcessingGroup.TRANSFORMABLE_TYPE:
                    instance = new GroupTranslateHandler(this.virtualTransformer);
                    this.showLabel = false;
                    break;
                case ProcessingGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineTranslateHandler(this.virtualTransformer);
                    break;
                case ProcessingParametricGraphTrace.TRANSFORMABLE_TYPE:
                    instance = new SplineTranslateHandler(this.virtualTransformer);
                    break;
                case ProcessingPointPair2D.TRANSFORMABLE_TYPE:
                    instance = new ProcessingPair2DTranslateHandler(this.virtualTransformer);
                    break;

            }
        }

        getLabelPosition(): Point {
            var labelPosition: Point = this.virtualTransformer.getLabelPosition(this.transformable, this.transValue, this.transAbout);

            return labelPosition;
        }
    }

}