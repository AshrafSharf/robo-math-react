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
    import Vector3D = away.geom.Vector3D;
    import Point3D =  robo.core.Point3D;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Compass3D = robo.virtualobjects.Compass3D;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import PMath = robo.util.PMath;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import Protractor3D = robo.virtualobjects.Protractor3D;
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class AngleCommand extends  BaseRoboCommand{

        protractorObj:Protractor3D;
        pencilObj:Pencil3D;
        parameters:any[];

        public fromPoint:Point;
        public toPoint:Point;
        public measureAngle:number;
        public positionRatio:number;

        //constructoed by the parser
        constructor(startPt:Point,endPt:Point,measureAngle:number,positionRatio:number)
        {
            super();

            this.fromPoint =this.translatePoint(startPt);
            this.toPoint = this.translatePoint(endPt);
            this.measureAngle = measureAngle;
            this.positionRatio = positionRatio;
        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

            this.protractorObj = engine.protractorObj;
            this.pencilObj = engine.pencilObj;

            this.dependentVirtualElements.addAll([engine.pencilObj,engine.protractorObj]);
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            var pencilObj:Pencil3D = this.protractorObj.pencilObj;
            pencilObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            var compass3DObj:Compass3D = this.protractorObj.compassObj;
            compass3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.fromPoint.x,this.fromPoint.y);
            var pt2:Point3D = new Point3D(this.toPoint.x,this.toPoint.y);
            this.protractorObj.drawAngle(pt1,pt2,0,this.positionRatio,this.measureAngle);
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            var pt1:Point3D = new Point3D(this.fromPoint.x,this.fromPoint.y);
            var pt2:Point3D = new Point3D(this.toPoint.x,this.toPoint.y);
            this.protractorObj.drawAngle(pt1,pt2,value,this.positionRatio,this.measureAngle);
        }

        postPlay():void
        {
            super.postPlay();
        }

        getLabelPosition():Point
        {
            var offsetVal:number = 0.3;

            var position:Point3D = this.getIndicatorPosition();

            return new Point(position.x+offsetVal,position.y+offsetVal);
        }

        public doDirectPlay():void{

            var pencilObj:Pencil3D = this.protractorObj.pencilObj;
            pencilObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            var compass3DObj:Compass3D = this.protractorObj.compassObj;
            compass3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var pt1:Point3D = new Point3D(this.fromPoint.x,this.fromPoint.y);
            var pt2:Point3D = new Point3D(this.toPoint.x,this.toPoint.y);

            this.protractorObj.directCommitPointAtAngle(pt1,pt2,this.positionRatio,this.measureAngle);
        }

        getIndicatorPosition():Point3D{

            var rotatedPoint:Point3D = this.calculateRotatedPointFromBaseLine(this.fromPoint,this.toPoint,this.positionRatio,this.measureAngle);

            return rotatedPoint;
        }


        private calculateRotatedPointFromBaseLine( fromPoint:Point, toPoint:Point, lineratio:number,angle:number):Point3D
        {
            angle =- angle;
            var radius = 7/2;
            var rad_diff = 0.2*radius;

            var line2d1:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);

            if(line2d1.length()!=0)
            {
                line2d1=line2d1.normalize(line2d1.length()*lineratio);
            }
            var protectorOrgin:Point3D=new Point3D(line2d1.x2,line2d1.y2,0);
            var midPoint:Vector3D= new Vector3D(protectorOrgin.x,protectorOrgin.y,protectorOrgin.z);

            var linevector:Vector3D=new Vector3D(toPoint.x-fromPoint.x,toPoint.y-fromPoint.y);
            linevector.normalize();
            linevector.scaleBy(radius+2*rad_diff);

            var startpt:Vector3D=midPoint.clone();
            var endpoint:Vector3D=startpt.add(linevector);

            if(lineratio>0.5)
                angle=180-angle;

            var proMarkPt:Point = Geometric2DUtil.rotatePoint(angle,endpoint.x,endpoint.y,midPoint.x,midPoint.y);
            return new Point3D(proMarkPt.x,proMarkPt.y);
        }

        //corresponding drawing command should override this command
        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{

            var pt1:Point3D = new Point3D(this.fromPoint.x,this.fromPoint.y);
            var pt2:Point3D = new Point3D(this.toPoint.x,this.toPoint.y);

            var rotatedPt:Point = this.protractorObj.calculateRotatedPointFromBaseLine(pt1, pt2, this.positionRatio, this.measureAngle);
            graphSheet2D.drawPoint(rotatedPt.clone());

        }

    }
}