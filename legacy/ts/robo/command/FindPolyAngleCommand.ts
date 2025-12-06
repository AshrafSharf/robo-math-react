/**
 * Created by rizwan on 4/26/14.
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
    import Geometric2DUtil = robo.core.Geometric2DUtil;

    export class FindPolyAngleCommand extends  BaseRoboCommand{

        protractorObj:Protractor3D;
        parameters:any[];
        public inputPoint3Ds:Point3D[];

        //constructoed by the parser
        constructor(inputPoints:Point[])
        {
            super();

            var uniqueInputPts:Point[]  = Geometric2DUtil.filterUniquePoints(inputPoints);
            this.translateInputPoints(uniqueInputPts);
        }


        private translateInputPoints(inputPoints:Point[]):void
        {
            this.inputPoint3Ds = [];

            for(var i:number=0;i<inputPoints.length;i++)
            {
                var point:Point = inputPoints[i];

                this.inputPoint3Ds[this.inputPoint3Ds.length] = this.getTranslatedPoint3D(point);
            }
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

            this.protractorObj.measurePolyAngle(this.inputPoint3Ds,0);
            this.showLabel= false;// donot show labels
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            this.protractorObj.measurePolyAngle(this.inputPoint3Ds,value);
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

            this.protractorObj.directCommitPolyAngleArc(this.inputPoint3Ds);
        }


        setTimeInSeconds(timeInSeconds:number):void
        {
            var appendSpeed:number = 15;
            var polyAngleMaxSpeed:number = this.maxSpeed + appendSpeed;

            this.timeInSeconds = Math.abs(polyAngleMaxSpeed - timeInSeconds);//apply the speed in reverse
        }

        //corresponding drawing command should override this command
        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{

            this.showLabel= false;// donot show labels

            var lastItemIndex:number = this.inputPoint3Ds.length-1;

            for(var i:number=0;i<this.inputPoint3Ds.length;i++)
            {
                var previousIndex:number = (i==0) ? lastItemIndex : i-1;
                var nextIndex:number = (i==lastItemIndex) ? 0 : i+1;

                this.protractorObj.directCommitAngleArcOn2D(this.inputPoint3Ds[i].clone(),
                    this.inputPoint3Ds[nextIndex].clone(),this.inputPoint3Ds[i].clone(),this.inputPoint3Ds[previousIndex].clone(),graphSheet2D);
            }

        }


        /*getIndicatorPosition():Point3D{

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

        }*/
    }

}
