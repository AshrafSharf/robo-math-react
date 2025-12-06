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
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import StringUtil = robo.util.StringUtil;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class StrokeCommand extends BaseRoboCommand {

        private expressionLabels: string[];
        private virtualObjectExecutionContexts: VirtualObjectsExecutionContext[] = [];
        private thickness: number = 1;

        constructor(expressionLabels: string[], thickness: number) {
            super();

            this.expressionLabels = expressionLabels;
            this.thickness = thickness;
        }

        //initialized by the engine
        public init(engine: Engine3D, virtualObjectExecutionContext: VirtualObjectsExecutionContext): void {
            super.init(engine, virtualObjectExecutionContext);

        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate(): void {

        }


        prePlay(): void {
            super.prePlay();
            this.virtualObjectExecutionContexts = this.engine.getVirtualObjectExecutionContextByLabels(this.expressionLabels);
            this.showLabel = false;
        }


        // value always ranges from 0 to 1
        play(value: number): void {
            var thicknessRatio: number = this.thickness * value;
            super.play(thicknessRatio);

            for (var i: number = 0; i < this.virtualObjectExecutionContexts.length; i++) {
                this.virtualObjectExecutionContexts[i].applyThickness(thicknessRatio);
                this.virtualObjectExecutionContexts[i].applyOverriddenStroke();
            }
        }


        getLabelPosition(): Point {
            return new Point(0, 0);
        }

        public doDirectPlay(): void {

            this.virtualObjectExecutionContexts = this.engine.getVirtualObjectExecutionContextByLabels(this.expressionLabels);

            for (var i: number = 0; i < this.virtualObjectExecutionContexts.length; i++) {
                this.virtualObjectExecutionContexts[i].applyThickness(this.thickness);
                this.virtualObjectExecutionContexts[i].applyOverriddenStroke();
            }


            this.showLabel = false;
        }


        storeIndicatorPosition(): void {

        }

        public drawOn2D(graphSheet2D: GraphSheet2D): void {

        }

    }
}
