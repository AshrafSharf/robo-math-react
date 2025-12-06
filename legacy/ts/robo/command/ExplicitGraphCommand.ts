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
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import Vector3D = away.geom.Vector3D;
    import VirtualTracer = robo.virtualobjects.VirtualTracer;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;

    export class ExplicitGraphCommand extends BaseRoboCommand {
        public static SPEED_POINT_MULTIPLIER: number = 1.5;
        public static POINTS_PER_SECONDS: number = 3;

        processingPair2D: ProcessingPointPair2D;
        private pencilObj: Pencil3D;
        private virtualTracer: VirtualTracer;


        //constructoed by the parser
        constructor(processingPair2D: ProcessingPointPair2D) {
            super();
            this.processingPair2D = <ProcessingPointPair2D>processingPair2D.getTranslatedObject(GraphSheet3D.translatePointForGraphSheetOffset);
        }


        //initialized by the engine
        public init(engine: Engine3D, virtualObjectsExecutionContext: VirtualObjectsExecutionContext): void {
            super.init(engine, virtualObjectsExecutionContext);

            this.virtualTracer = engine.virtualTracer;
            this.pencilObj = engine.pencilObj;
            this.virtualTracer.pencil3d = this.pencilObj;

            this.dependentVirtualElements.addAll([engine.pencilObj]);

        }


        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate(): void {

        }


        prePlay(): void {
            super.prePlay();

            this.virtualTracer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.showLabel = false;// donot show labels

        }


        // value always ranges from 0 to 1
        play(value: number): void {
            super.play(value);

            this.virtualTracer.drawPointPairsUsingPencil(this.processingPair2D.modelPointPairs, value);
        }

        postPlay(): void {
            super.postPlay();
        }

        public doDirectPlay(): void {
            this.showLabel = false;
            this.virtualTracer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.virtualTracer.directCommitPointPairs(this.processingPair2D.modelPointPairs);
        }

        public doDrawOn2D(graphSheet2D: GraphSheet2D): void {

        }

    }

}
