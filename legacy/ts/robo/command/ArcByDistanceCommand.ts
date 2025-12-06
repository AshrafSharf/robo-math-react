/**
 * Created by rizwan on 4/10/14.
 */
module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Point3D =  robo.core.Point3D;

    import Compass3D = robo.virtualobjects.Compass3D;
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import ProcessingCircle = robo.core.ProcessingCircle;
    import PMath = robo.util.PMath;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class ArcByDistanceCommand extends  BaseRoboCommand{

        compass3DObj:Compass3D;

        private copyStartPt:Point;
        private copyEndPt:Point;

        private originPt:Point;
        private fromAngleInDegrees:number;
        private toAngleInDegrees:number;

        //constructoed by the parser
        constructor(copyStartPt:Point,copyEndPt:Point,originPt:Point,fromAngleInDegrees:number,toAngleInDegrees:number)
        {
            super();

            this.copyStartPt = this.translatePoint(copyStartPt);
            this.copyEndPt = this.translatePoint(copyEndPt);

            this.originPt = this.translatePoint(originPt);
            this.fromAngleInDegrees = 360-fromAngleInDegrees;
            this.toAngleInDegrees = this.fromAngleInDegrees - toAngleInDegrees;

        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

            this.compass3DObj = engine.compassObj;

            this.dependentVirtualElements.addAll([engine.compassObj]);
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();
            this.compass3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var copyStart:Point3D = new Point3D(this.copyStartPt.x,this.copyStartPt.y);
            var copyEnd:Point3D = new Point3D(this.copyEndPt.x,this.copyEndPt.y);
            var origin:Point3D = new Point3D(this.originPt.x,this.originPt.y);
            this.compass3DObj.drawArcByDistance(copyStart,copyEnd,origin,this.fromAngleInDegrees,this.toAngleInDegrees,0);
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            var copyStart:Point3D = new Point3D(this.copyStartPt.x,this.copyStartPt.y);
            var copyEnd:Point3D = new Point3D(this.copyEndPt.x,this.copyEndPt.y);
            var origin:Point3D = new Point3D(this.originPt.x,this.originPt.y);
            this.compass3DObj.drawArcByDistance(copyStart,copyEnd,origin,this.fromAngleInDegrees,this.toAngleInDegrees,value);
        }


        postPlay():void
        {
            super.postPlay();
        }

        getLabelPosition():Point
        {
            var fromAngleInDeg:number = this.fromAngleInDegrees;
            var toAngleInDeg:number = this.toAngleInDegrees;
            var radius:number = Point.distance(this.copyStartPt,this.copyEndPt);//this.copyStartPt.distanceTo(this.copyEndPt);

            //processing circle always consider as reverse position
            var circle1:ProcessingCircle = new ProcessingCircle(this.originPt.x,this.originPt.y,radius,fromAngleInDeg,toAngleInDeg);
            var midAngle:number = fromAngleInDeg + (toAngleInDeg-fromAngleInDeg)/2;
            var labelPos:Point = circle1.pointAt(PMath.radians(midAngle));

            //return labelPos;
            var offsetVal:number = 0.3;
            return new Point(labelPos.x+offsetVal,labelPos.y+offsetVal);
        }

        public doDirectPlay():void{

            this.compass3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var copyStart:Point3D = new Point3D(this.copyStartPt.x,this.copyStartPt.y);
            var copyEnd:Point3D = new Point3D(this.copyEndPt.x,this.copyEndPt.y);
            var origin:Point3D = new Point3D(this.originPt.x,this.originPt.y);
            var radius:number = copyStart.distanceTo(copyEnd);
            this.compass3DObj.directCommitArc(origin,radius/2,this.fromAngleInDegrees,this.toAngleInDegrees);
        }

        //corresponding drawing command should override this command
        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{
            var copyStart:Point3D = new Point3D(this.copyStartPt.x,this.copyStartPt.y);
            var copyEnd:Point3D = new Point3D(this.copyEndPt.x,this.copyEndPt.y);
            var origin:Point3D = new Point3D(this.originPt.x,this.originPt.y);
            var radius:number = copyStart.distanceTo(copyEnd);
            graphSheet2D.drawArc(this.originPt.clone(),radius/2,this.fromAngleInDegrees,this.toAngleInDegrees);
        }
    }
}

