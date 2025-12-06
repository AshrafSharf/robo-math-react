/**
 * Created by Mathdisk on 3/17/14.
 */

module robo.command {


    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Point3D =  robo.core.Point3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    export class PointCommand extends  BaseRoboCommand{

        pencil3DObj:Pencil3D;
        public point:Point;

        //constructoed by the parser
        constructor(point:Point)
        {
            super();

            this.point = this.translatePoint(point);
        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

            this.pencil3DObj = engine.pencilObj;

            this.dependentVirtualElements.addAll([engine.pencilObj]);
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.pencil3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.point.x,this.point.y);

            this.pencil3DObj.drawPoint(pt1,0);
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            var pt1:Point3D = new Point3D(this.point.x,this.point.y);
            this.pencil3DObj.drawPoint(pt1,value);
        }

        postPlay():void
        {
            super.postPlay();
        }

        getLabelPosition():Point
        {
            var offsetVal:number = 0.40;
            return new Point(this.point.x+offsetVal,this.point.y+offsetVal);
        }

        public doDirectPlay():void{

            this.pencil3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.point.x,this.point.y);
            this.pencil3DObj.directCommitPoint(pt1);
        }

        getIndicatorPosition():Point3D{

            return new Point3D(this.point.x,this.point.y,0);
        }


        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{

            //always send the cloned pts
            graphSheet2D.drawPoint(this.point.clone());
        }
    }
}
