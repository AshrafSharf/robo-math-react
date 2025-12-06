/**
 * Created by Mathdisk on 3/17/14.
 */

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

    import SetSquare3D = robo.virtualobjects.SetSquare3D;
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import Ruler3D = robo.virtualobjects.Ruler3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class PerpCommand extends  BaseRoboCommand
    {
        private setSquareObj:SetSquare3D;
        parameters:any[];

        public fromPoint:Point;
        public toPoint:Point;
        public inputPoint:Point;

        private lineLength:number;

        //constructoed by the parser
        constructor(fromPt:Point,toPt:Point,inputPt:Point,lineLength:number)
        {
            super();

            this.lineLength = lineLength;
            this.fromPoint = this.translatePoint(fromPt);
            this.toPoint = this.translatePoint(toPt);
            this.inputPoint = this.translatePoint(inputPt);
        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

            this.setSquareObj = engine.setSquareObj;

            this.dependentVirtualElements.addAll([engine.pencilObj,engine.rulerObj,engine.setSquareObj]);
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {
            this.fromPoint = new Point(2,1);
            this.toPoint = new Point(3,-3);
            this.inputPoint = new Point(0,0);
        }


        prePlay():void
        {
            super.prePlay();
            var ruler3D:Ruler3D  = this.setSquareObj.rulerObj;
            ruler3D.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.fromPoint.x,this.fromPoint.y);
            var pt2:Point3D = new Point3D(this.toPoint.x,this.toPoint.y);
            var pt3:Point3D = new Point3D(this.inputPoint.x,this.inputPoint.y);
            this.setSquareObj.drawPerpLine(pt1,pt2,pt3,this.lineLength,0);
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            var pt1:Point3D = new Point3D(this.fromPoint.x,this.fromPoint.y);
            var pt2:Point3D = new Point3D(this.toPoint.x,this.toPoint.y);
            var pt3:Point3D = new Point3D(this.inputPoint.x,this.inputPoint.y);
            this.setSquareObj.drawPerpLine(pt1,pt2,pt3,this.lineLength,value);
        }


        getLabelPosition():Point
        {
            var offsetVal:number = 0.25;

            var resultPoint:Point = this.inputPoint;
            return new Point(resultPoint.x+offsetVal,resultPoint.y+offsetVal);
        }

        postPlay():void
        {
            super.postPlay();
        }

        public doDirectPlay():void{

            var ruler3D:Ruler3D  = this.setSquareObj.rulerObj;
            ruler3D.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.fromPoint.x,this.fromPoint.y);
            var pt2:Point3D = new Point3D(this.toPoint.x,this.toPoint.y);
            var pt3:Point3D = new Point3D(this.inputPoint.x,this.inputPoint.y);
            this.setSquareObj.directCommitPerpLine(pt1,pt2,pt3,this.lineLength);
        }

        getIndicatorPosition():Point3D{

            return new Point3D(this.inputPoint.x,this.inputPoint.y,0);
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{

            var lineObj:ProcessingLine2D = new ProcessingLine2D(this.fromPoint.x,this.fromPoint.y,this.toPoint.x,this.toPoint.y);
            var perpLinePts:Point[]= lineObj.getPerpLinePassingThroughPoint(this.inputPoint,this.lineLength);

            var pt1:Point = perpLinePts[0];
            var pt2:Point = perpLinePts[1];

            //always send the cloned pts , here receving pts itself a new one , so no need to clone again
            graphSheet2D.drawLine(pt1,pt2);

        }
    }

}
