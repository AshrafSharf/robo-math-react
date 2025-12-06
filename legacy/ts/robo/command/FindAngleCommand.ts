/**
 * Created by MohammedAzeem on 4/7/14.
 */

module robo.command {


    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Point3D =  robo.core.Point3D;

    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import Protractor3D = robo.virtualobjects.Protractor3D;
    import Compass3D = robo.virtualobjects.Compass3D;
    import Vector3D = away.geom.Vector3D;
    import Geometric3DUtil = robo.core.Geometric3DUtil;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class FindAngleCommand extends  BaseRoboCommand{

        protractorObj:Protractor3D;
        parameters:any[];

        public l1StartPt:Point3D;
        public l1EndPt:Point3D;
        public l2StartPt:Point3D;
        public l2EndPt:Point3D;

        //constructoed by the parser
        constructor(l1StartPt:Point,l1EndPt:Point,l2StartPt:Point,l2EndPt:Point)
        {
            super();
            this.l1StartPt = this.getTranslatedPoint3D(l1StartPt);//internall uses 'translatePoint' method
            this.l1EndPt = this.getTranslatedPoint3D(l1EndPt);
            this.l2StartPt = this.getTranslatedPoint3D(l2StartPt);
            this.l2EndPt = this.getTranslatedPoint3D(l2EndPt);

        }

        private getTranslatedPoint3D(point2d:Point):Point3D{

            var translatedPt:Point = this.translatePoint(point2d);
            return new Point3D(translatedPt.x,translatedPt.y);
        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

            this.protractorObj = engine.protractorObj;

            this.dependentVirtualElements.addAll([engine.protractorObj,engine.pencilObj]);
        }


        prePlay():void
        {
            super.prePlay();

            var compass3DObj:Compass3D = this.protractorObj.compassObj;
            compass3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.protractorObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            this.protractorObj.measureAngle(this.l1StartPt.clone(),this.l1EndPt.clone(),this.l2StartPt.clone(),this.l2EndPt.clone(),0);
            this.showLabel= false;// donot show labels
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            var angleBtwnTwoLines:number = this.getAngleBetweenTwoLines();
            if(angleBtwnTwoLines==0)
                return;

            this.protractorObj.measureAngle(this.l1StartPt.clone(),this.l1EndPt.clone(),this.l2StartPt.clone(),this.l2EndPt.clone(),value);
        }


        private getAngleBetweenTwoLines():number
        {
            var point1:Point3D = this.l1EndPt.subtract(this.l1StartPt);
            var point2:Point3D = this.l2EndPt.subtract(this.l2StartPt);

            var angleBtwnTwoLines:number = Geometric3DUtil.angleBetween(point1,point2);
            return angleBtwnTwoLines;
        }


        postPlay():void
        {
            super.postPlay();
        }

        public doDirectPlay():void{

            var compass3DObj:Compass3D = this.protractorObj.compassObj;
            compass3DObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.protractorObj.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.showLabel= false;// donot show labels

            this.protractorObj.directCommitAngleArc(this.l1StartPt.clone(),this.l1EndPt.clone(),this.l2StartPt.clone(),this.l2EndPt.clone());
        }

        getIndicatorPosition():Point3D{

            var rotatedPoint:Point3D = this.calculateRotatedPointFromBaseLine(this.l1StartPt.clone(),this.l1EndPt.clone(),this.l2StartPt.clone(),this.l2EndPt.clone());

            return rotatedPoint;
        }

        private calculateRotatedPointFromBaseLine(fromPoint1:Point3D, toPoint1:Point3D, fromPoint2:Point3D, toPoint2:Point3D):Point3D
        {
            var line1:ProcessingLine2D = new ProcessingLine2D(fromPoint1.x, fromPoint1.y, toPoint1.x, toPoint1.y);
            var line2:ProcessingLine2D = new ProcessingLine2D(fromPoint2.x, fromPoint2.y, toPoint2.x, toPoint2.y);

            var intersecPt:Point = line1.intersectAsLine(line2);
            if(intersecPt==null)
            {
                intersecPt  = new Point(fromPoint1.x,fromPoint1.y);
            }

            var vect1:Vector3D = new Vector3D(toPoint1.x-intersecPt.x,toPoint1.y-intersecPt.y,0);
            var vect2:Vector3D = new Vector3D(toPoint2.x-intersecPt.x,toPoint2.y-intersecPt.y,0);
            var resVect:Vector3D = vect1.add(vect2);
            resVect.normalize(1);

            var outputPt:Point = intersecPt.add(new Point(resVect.x,resVect.y));
            return new Point3D(outputPt.x,outputPt.y);

        }

        //corresponding drawing command should override this command
        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{

            this.showLabel= false;// donot show labels

            //lot of methods need to be make private from protractorObj, instead add one method and also reused in
            //FindPolyAngleCommand "doDrawOn2D" method
            this.protractorObj.directCommitAngleArcOn2D(this.l1StartPt.clone(),this.l1EndPt.clone(),this.l2StartPt.clone(),this.l2EndPt.clone(),graphSheet2D);

        }
    }
}
