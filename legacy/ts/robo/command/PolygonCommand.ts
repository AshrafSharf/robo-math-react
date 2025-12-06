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
    import PolygonBuilder = robo.virtualobjects.PolygonBuilder;
    import Engine3D = robo.geom.Engine3D;
    import PMath = robo.util.PMath;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class PolygonCommand extends  BaseRoboCommand
    {
        polygonBuilder:PolygonBuilder;
        public points:Point[];

        public static SPEED_POINT_MULTIPLIER:number = 1.5;
        public static POINTS_PER_SECONDS:number = 3;

        public static RULER_POINTS_LIMIT:number = 9;
        public static ALLOWED_POLYGON_DISTANCE:number = 15;

        public static MIN_TRACE_POINTS:number = 30;

        //constructoed by the parser
        constructor(pts:Point[])
        {
            super();

            //No other place should get affected
            this.translatePoints(pts);
        }


        private translatePoints(pts:Point[]):void
        {
            this.points = new Array<Point>();

            for(var i=0; i<pts.length; i++){

                this.points.push(this.translatePoint(pts[i]));
            }
        }


        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);

            this.polygonBuilder = engine.polygonBuilderObj;

            if(this.points.length>5)
                this.dependentVirtualElements.addAll([engine.pencilObj]);
            else
                this.dependentVirtualElements.addAll([engine.rulerObj,engine.pencilObj]);
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.polygonBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            if(this.points.length<=PolygonCommand.RULER_POINTS_LIMIT)
            {
                this.polygonBuilder.ruler3d.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            }
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            if(this.points.length<=PolygonCommand.RULER_POINTS_LIMIT)
                this.polygonBuilder.drawPolygonUsingRuler(this.points,value);
            else
                this.polygonBuilder.drawPolygonUsingPencil(this.points,value);
        }


        setTimeInSeconds(timeInSeconds:number):void
        {
            if(this.points.length>PolygonCommand.RULER_POINTS_LIMIT){

                this.timeInSeconds = timeInSeconds;

                return;
            }

            var speedMultiplier:number = PolygonCommand.SPEED_POINT_MULTIPLIER;

            var polygonDistance:number = this.getPolygonDistance();
            speedMultiplier = 2*PolygonCommand.SPEED_POINT_MULTIPLIER;
            var modifiedSpeedMultiplier = speedMultiplier * (polygonDistance/PolygonCommand.ALLOWED_POLYGON_DISTANCE);
            speedMultiplier = (modifiedSpeedMultiplier>speedMultiplier) ? modifiedSpeedMultiplier : speedMultiplier;


            var speedFactor:number = this.points.length / PolygonCommand.POINTS_PER_SECONDS;
            var speedBoost:number = speedFactor*speedMultiplier*(this.maxSpeed-timeInSeconds);

            this.timeInSeconds = speedBoost;
        }



        private getPolygonDistance():number
        {
            var totalDistance:number = 0;
            var minimumSegLength:number = 2;
            var numberOfPoints:number = this.points.length;
            for(var i:number=0;i<numberOfPoints;i++)
            {
                var startPt:Point = this.points[i];
                var endPt:Point = ((i+1) < numberOfPoints) ? this.points[i+1] : this.points[0];

                var segmentLen:number = Point.distance(startPt,endPt);
                totalDistance += (segmentLen>minimumSegLength) ? segmentLen : minimumSegLength;
            }
            return totalDistance;
        }

        public doDirectPlay():void
        {
            this.polygonBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.polygonBuilder.directCommitPolygon(this.points);
        }

        getIndicatorPosition():Point3D{

            var pt1:Point = this.points[0];
            var pt2:Point = this.points[1];

            var midpoint:Point = Point.interpolate(pt1,pt2,0.5);
            return new Point3D(midpoint.x,midpoint.y,0);
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void
        {
            var len:number = this.points.length;
            for (var i = 0; i < len; i++) {

                var start:Point=this.points[i];
                var end:Point=this.points[(i+1)%len];

                //always send the cloned pts
                graphSheet2D.drawLine(start.clone(),end.clone());
            }
        }


        getLabelPosition():Point
        {
            var pt1:Point = this.points[0];
            var pt2:Point = this.points[1];

            var midpoint:Point = Point.interpolate(pt1,pt2,0.5);
            return midpoint;
        }
    }
}