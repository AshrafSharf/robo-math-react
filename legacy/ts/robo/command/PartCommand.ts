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
    import StringUtil = robo.util.StringUtil;

    import Engine3D = robo.geom.Engine3D;
    import PMath = robo.util.PMath;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import Vector3D = away.geom.Vector3D;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ProcessingGroupBuilder = robo.virtualobjects.ProcessingGroupBuilder;


    export class PartCommand extends BaseRoboCommand {

        processingGroup: ProcessingGroup;
        private processingGroupBuilder: ProcessingGroupBuilder;
        private virtualObjectExecutionContexts: VirtualObjectsExecutionContext[] = [];

        //constructoed by the parser
        constructor(processingGroup: ProcessingGroup) {
            super();
            this.processingGroup = processingGroup;
            this.timeInSeconds = 0.1;
        }

        //initialized by the engine
        public init(engine: Engine3D, virtualObjectsExecutionContext: VirtualObjectsExecutionContext): void {
            super.init(engine, virtualObjectsExecutionContext);
            this.processingGroupBuilder = engine.processingGroupBuilder;
        }

        prePlay(): void {
            super.prePlay();
            this.showLabel = false;
            this.processingGroupBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(value: number): void {
            super.play(value);
            this.showLabel = false;
            this.processingGroupBuilder.drawGroup(this.processingGroup, 1);
        }


        getLabelPosition(): Point {
            return new Point(0, 0);
        }

        public doDirectPlay(): void {
            this.showLabel = false;
            this.processingGroupBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.processingGroupBuilder.directCommitCreate(this.processingGroup);
        }

        storeIndicatorPosition(): void {
        }

        public drawOn2D(graphSheet2D: GraphSheet2D): void {
        }

        public getTimeInSeconds():number
        {
            return 0.1;
        }

    }

}
