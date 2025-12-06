/**
 * Created by rizwan on 4/1/14.
 */


module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point3D = robo.core.Point3D;
    import Engine3D = robo.geom.Engine3D;
    import Point = away.geom.Point;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import MarkerBuilder = robo.virtualobjects.MarkerBuilder;

    export class MarkerCommand extends BaseRoboCommand {
        points = [];
        private virtualObjectExecutionContexts: VirtualObjectsExecutionContext[] = [];
        markerBuilder: MarkerBuilder

        //constructoed by the parser
        constructor(points: Point3D[]) {
            super();
            this.points = points;

            // if the last point is same as first one, ignore the last point
            if (points.length > 2) {
                if (points[0].equals(points[points.length - 1])) {
                    this.points = points.slice(0, points.length - 1);
                }
            }

            this.points = this.removeDuplicates(this.points);
        }
        removeDuplicates(allPoints) {
            // remove duplicates
            var filteredPoints = [];
            filteredPoints.push(allPoints[0]);
            for(var i=1;i<allPoints.length;i++) {
                if(filteredPoints[filteredPoints.length-1].equals(allPoints[i])) {
                    continue;
                }
                filteredPoints.push(allPoints[i])
            }

            return filteredPoints;
        }

        //initialized by the engine
        public init(engine: Engine3D, virtualObjectsExecutionContext: VirtualObjectsExecutionContext): void {
            super.init(engine, virtualObjectsExecutionContext);
            this.markerBuilder = engine.markerBuilder;
        }

        prePlay(): void {
            super.prePlay();
            this.showLabel = false;
            this.virtualObjectExecutionContexts = this.engine.getVirtualObjectExecutionContextByLabels([]);
            this.markerBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
        }


        // value always ranges from 0 to 1
        play(value: number): void {
            super.play(value);
            this.markerBuilder.directCommitMarkers(this.points);
            this.showLabel = false;
        }

        getLabelPosition(): Point {
            return new Point(0, 0);
        }

        public doDirectPlay(): void {
            this.virtualObjectExecutionContexts = this.engine.getVirtualObjectExecutionContextByLabels([]);
            this.markerBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.markerBuilder.directCommitMarkers(this.points);
        }


        storeIndicatorPosition(): void {

        }

        public drawOn2D(graphSheet2D: GraphSheet2D): void {

        }

    }

}
