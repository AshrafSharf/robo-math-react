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
    import StringUtil = robo.util.StringUtil;

    import Engine3D = robo.geom.Engine3D;
    import PMath = robo.util.PMath;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import PointPairBuilder = robo.virtualobjects.PointPairBuilder;


    export class DashLineCommand extends BaseRoboCommand {

        private virtualObjectExecutionContexts: VirtualObjectsExecutionContext[] = [];
        pointPairBuilder: PointPairBuilder;
        processingPointPair2D:ProcessingPointPair2D;
        point1:Point;
        point2:Point;

        //constructoed by the parser
        constructor(processingPointPair2D: ProcessingPointPair2D, points:Point[]) {
            super();
            this.processingPointPair2D = processingPointPair2D;
            this.point1 = this.translatePoint(points[0]);
            this.point2 = this.translatePoint(points[1]);
        }

        //initialized by the engine
        public init(engine: Engine3D, virtualObjectsExecutionContext: VirtualObjectsExecutionContext): void {
            super.init(engine, virtualObjectsExecutionContext);
            this.pointPairBuilder = engine.pointPairBuilder;
        }

        prePlay(): void {
            super.prePlay();
            this.virtualObjectExecutionContexts = this.engine.getVirtualObjectExecutionContextByLabels([]);
            this.pointPairBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(value: number): void {
            super.play(value);
            this.pointPairBuilder.directCommitPointPairs(this.processingPointPair2D.modelPointPairs, value);
        }

        getLabelPosition():Point
        {
            var midpoint:Point3D = this.getIndicatorPosition();
            var offsetVal:number = 0.25;
            return new Point(midpoint.x+offsetVal,midpoint.y+offsetVal);
        }

        public doDirectPlay(): void {

            this.virtualObjectExecutionContexts  =  this.engine.getVirtualObjectExecutionContextByLabels([]);
            this.pointPairBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.pointPairBuilder.directCommitPointPairs(this.processingPointPair2D.modelPointPairs);
        }

        getIndicatorPosition():Point3D{
            var midpoint:Point = Point.interpolate(this.point1,this.point2,0.5);
            return new Point3D(midpoint.x,midpoint.y,0);
        }


        storeIndicatorPosition(): void {
        }

        public drawOn2D(graphSheet2D: GraphSheet2D): void {
        }


    }

}
