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

    import Ruler3D = robo.virtualobjects.Ruler3D;
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class LineCommand extends  BaseRoboCommand
    {
        ruler3D:Ruler3D;
        public point1:Point;
        public point2:Point;

        //constructoed by the parser
        constructor(point1:Point,point2:Point)
        {
            super();
            //No other place should get affected
            this.point1 = this.translatePoint(point1);
            this.point2 = this.translatePoint(point2);

        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);

            this.ruler3D = engine.rulerObj;

            this.dependentVirtualElements.addAll([engine.pencilObj,engine.rulerObj]);
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();
            this.ruler3D.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.point1.x,this.point1.y);
            var pt2:Point3D = new Point3D(this.point2.x,this.point2.y);
            this.ruler3D.drawLine(pt1,pt2,0);
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            var pt1:Point3D = new Point3D(this.point1.x,this.point1.y);
            var pt2:Point3D = new Point3D(this.point2.x,this.point2.y);

            this.ruler3D.drawLine(pt1,pt2,value);
        }


        getLabelPosition():Point
        {
            var midpoint:Point3D = this.getIndicatorPosition();

            var offsetVal:number = 0.25;
            return new Point(midpoint.x+offsetVal,midpoint.y+offsetVal);
        }

        postPlay():void
        {
            super.postPlay();
        }


        public doDirectPlay():void{

            this.ruler3D.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.point1.x,this.point1.y);
            var pt2:Point3D = new Point3D(this.point2.x,this.point2.y);

            this.ruler3D.directCommitLine(pt1,pt2);
        }

        getIndicatorPosition():Point3D{

            var midpoint:Point = Point.interpolate(this.point1,this.point2,0.5);

            return new Point3D(midpoint.x,midpoint.y,0);
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{
            //always send the cloned pts
            graphSheet2D.drawLine(this.point1.clone(),this.point2.clone());
        }
    }

}
