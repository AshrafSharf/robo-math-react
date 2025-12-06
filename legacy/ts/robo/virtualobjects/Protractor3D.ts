/**
 * Created by Mathdisk on 2/24/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.virtualobjects{

    import UI3DScript = robo.geom.UI3DScript;

    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import PMath = robo.util.PMath;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import GeometryGroup =  robo.geom.GeometryGroup;
    import GeometryPart =robo.geom.GeometryPart ;
    import Point =  away.geom.Point;
    import UVMapContainer = robo.virtualobjects.util.UVMapContainer;
    import Mesh = away.entities.Mesh;
    import BoundryConstrainer = robo.util.BoundryConstrainer;

    import BitmapData  = away.base.BitmapData;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;

    export class Protractor3D extends BaseVirtualObject{

        private protractorGroup:GeometryGroup;
        private protractorPart:GeometryPart;
        private textPart:GeometryPart;
        private protractorOrigin:Point3D = new Point3D();

        private protractorLength:number=7;// almost fixed
        private protractorThickness:number=0.1;
        private origin:Point3D=new Point3D(0,0,0);

        //  move and rotate rati0
        private originalFromPoint:Point3D=new Point3D();
        private originalToPoint:Point3D=new Point3D();

        private  _autoRest:boolean=false;
        private isInverted:boolean;

        private radius:number;
        private rad_diff:number;

        private currentRotationInDegress:number=0;
        private prevRotationInDegress:number=0;

        private prevProtractorAngle:number;
        private _prevAngleToMeasure:number;

        public pencilObj:Pencil3D=null;
        public  compassObj:Compass3D=null;

        private boundryContainer:BoundryConstrainer;
        private drawAngleBoundryContainer:BoundryConstrainer;
        private polyAngleBoundryConstrainer:BoundryConstrainer;

        private  prevPositionRatio:number=0.5;
        private canvas:UI3DScript;
        public commitMesh:Mesh;

        private fromAngle:number;
        private toAngle:number;

        public outputMesh:Mesh;
        public rotatedPoint:Point;
        public arcRadius:number = 0.35;


        private isDrawAngleCommand=false;

        public constructor(canvas:UI3DScript)
        {
            super();

            this.canvas =  canvas;
            this.protractorGroup = new GeometryGroup(canvas);

            this.radius = this.protractorLength/2;
            this.rad_diff = 0.2*this.radius;

            this.prevProtractorAngle = 0;
            this._prevAngleToMeasure = 0;
            this.prevPositionRatio = 0.5;

            this.boundryContainer = new BoundryConstrainer([0,0.4,1]);
            this.drawAngleBoundryContainer = new BoundryConstrainer([0,0.3,0.6,0.8,0.85,0.95,1]);
            this.polyAngleBoundryConstrainer = new BoundryConstrainer([0,1]);

            this.initProtractor();
        }


        private initProtractor():void
        {
            this.createProtractor();

            this.initAlign();
        }


        private createProtractor():void
        {
            var listOfPoints:Point3D[]=this.collectPointsForExtrude();

            this.protractorPart = this.protractorGroup.linearExtrude(listOfPoints,"Z",this.protractorThickness,5*this.rad_diff);
        }


        private collectPointsForExtrude():Point3D[]
        {
            var listOfPoints:Point3D[] =[];

            this.collectSemiCirclePart(listOfPoints);

            return listOfPoints;
        }


        private initAlign():void
        {
            this.moveTo(this.originalFromPoint, this.originalToPoint,this.prevPositionRatio);

            this.prevProtractorAngle = 0;
        }


        private collectSemiCirclePart(listOfPoints:Point3D[]):void
        {
            var innerRadius:number = this.radius - this.rad_diff;

            for(var j:number=0; j <= 180; j++)
            {
                var x:number = this.origin.x-innerRadius*Math.cos(PMath.radians(j));
                var y:number = this.origin.y-innerRadius*Math.sin(PMath.radians(j));

                listOfPoints.push(new Point3D(x,y,this.origin.z));
            }
        }

        private alignTo(fromPoint:Point3D, toPoint:Point3D, lineratio:number):void
        {
            var line2d:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var angleInradians:number = line2d.angle();
            var angleInDegress:number = PMath.degrees(angleInradians);

            this.prevProtractorAngle = angleInDegress;

            this.moveTo(fromPoint,toPoint,lineratio);
            this.rotateYaw(angleInDegress);
        }


        private rotateYaw(angle:number):void
        {
            this.protractorPart.relativeYaw(angle);
        }


        private moveTo(fromPoint:Point3D,toPoint:Point3D,lineratio:number):void
        {
            var line2d1:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);

            if(line2d1.length()!=0)
                line2d1 = line2d1.normalize(line2d1.length()*lineratio);

            var midPoint:Vector3D = new Vector3D(line2d1.x2,line2d1.y2);
            this.protractorOrigin = new Point3D(midPoint.x,midPoint.y,0);
            this.protractorPart.setPosition(this.protractorOrigin);
        }


        private rotateProtractor( angleInDegress:number):void
        {
            var relativeAng:number = angleInDegress-this.prevRotationInDegress;

            this.rotateYaw(relativeAng);

            this.prevRotationInDegress = angleInDegress;
        }

        private canFlipProtractor(currAng:number):boolean
        {
            var isinverted:boolean = this.isInvertedAngle(currAng);
            if(this.isInverted==isinverted)
            {
                return false;
            }

            this.isInverted = isinverted;
            return true;
        }


        private isInvertedAngle(angle:number):boolean
        {
            if( angle > 180 || ( angle < 0 && angle >= -180 ))
                return true;

            return false;
        }

        public showOrHide( ratio:number):void
        {
            ratio = Math.min(this.maximumOpacity,ratio);

            this.protractorPart.setTransparency(ratio);

            this.protractorGroup.removePart(this.textPart);
        }


        private converToRealCoordinate(p:Point3D):Point3D
        {
            return new Point3D(p.x,-p.y,p.z);
        }


        public findIntersectinPt(fromPoint1:Point3D, toPoint1:Point3D, fromPoint2:Point3D, toPoint2:Point3D):Point{

            var line1:ProcessingLine2D = new ProcessingLine2D(fromPoint1.x, fromPoint1.y, toPoint1.x, toPoint1.y);
            var line2:ProcessingLine2D = new ProcessingLine2D(fromPoint2.x, fromPoint2.y, toPoint2.x, toPoint2.y);

            var intersecPt:Point = line1.intersectAsLine(line2);
            if(intersecPt==null)
            {
                intersecPt  = new Point(fromPoint1.x,fromPoint1.y);
            }
            return intersecPt;
        }

        private getLineFromIntersectPt(fromPoint:Point3D, toPoint:Point3D,intersecPt:Point):ProcessingLine2D{

            var line1:ProcessingLine2D=new ProcessingLine2D(intersecPt.x,intersecPt.y,fromPoint.x, fromPoint.y);

            var line2:ProcessingLine2D=new ProcessingLine2D(intersecPt.x,intersecPt.y,toPoint.x, toPoint.y);

            var outputLine:ProcessingLine2D=line1;

            if(outputLine.length()<line2.length()){

                outputLine=line2;
            }
            return outputLine;
        }

        public findFromAndToAngle(norm_line1:ProcessingLine2D,norm_line2:ProcessingLine2D):number[]{

            //from angle
            var lineAngle1:number = norm_line1.angle();
            var lineAngle2:number = norm_line2.angle();

            lineAngle1 = PMath.degrees(lineAngle1);
            lineAngle2 = PMath.degrees(lineAngle2);

            var diffBetAngle:number = Math.abs(Math.abs(lineAngle2)-Math.abs(lineAngle1));

            if(diffBetAngle>180){

                if(lineAngle1>180 && lineAngle1!=0){

                    lineAngle1=lineAngle1-360;
                }

                if(lineAngle2>180 && lineAngle2!=0){

                    lineAngle2=lineAngle2-360;
                }
            }
            return [lineAngle1,lineAngle2];
        }

        public measureAngle(fromPoint1:Point3D, toPoint1:Point3D, fromPoint2:Point3D, toPoint2:Point3D, animationRatio:number):void
        {
            //if the prevoius command is drawAngle command, reset the protractor
            if(this.isDrawAngleCommand==true){

                this.isDrawAngleCommand=false;

                this.reset();

            }
            var intersecPt:Point = this.findIntersectinPt(fromPoint1,toPoint1,fromPoint2,toPoint2);
            var norm_line1:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint1,toPoint1,intersecPt);
            var norm_line2:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint2,toPoint2,intersecPt);

            var outputAngles:number[] = this.findFromAndToAngle(norm_line1,norm_line2);
            this.fromAngle = outputAngles[0];
            this.toAngle = outputAngles[1];

            var MOVE_ROTATE_RATIO:number=0.5;
            animationRatio = this.boundryContainer.constrain(animationRatio);

            if(animationRatio <= MOVE_ROTATE_RATIO)
            {
                var moveRatio:number = PMath.map(animationRatio, 0, MOVE_ROTATE_RATIO, 0, 1);
                this.moveAndRotateFindAngle(moveRatio, fromPoint1, toPoint1, new Point3D(intersecPt.x,intersecPt.y));

                return;
            }

            if(animationRatio <= 1)
            {
                var arcDrawRatio:number = PMath.map(animationRatio, MOVE_ROTATE_RATIO, 1, 0, 1);
                var processingCircle:ProcessingCircle = new ProcessingCircle(intersecPt.x,intersecPt.y,2*this.arcRadius,this.fromAngle,this.toAngle);

                var textAngle:number = Math.abs(this.toAngle-this.fromAngle);
                this.compassObj.drawArcUsingPencil(processingCircle,textAngle,arcDrawRatio);
            }


            if(animationRatio==1)
            {
                var angleBtn = Math.abs(this.toAngle-this.fromAngle);
                var textPos:Point = this.findTextPosition(this.fromAngle,this.toAngle,intersecPt,toPoint1);
                this.commitText3d(angleBtn,new Point3D(textPos.x,textPos.y));
                this.boundryContainer.reset();
            }
        }

        private addLabelOffset(textPos:Point3D):void{

            textPos.x += this.virtualObjectsExecutionContext.labelOffsetXPos;
            textPos.y += this.virtualObjectsExecutionContext.labelOffsetYPos;
        }


        public findTextPosition(from_angle:number,to_angle:number,intersecPt:Point,toPoint1:Point3D):Point{

            return this.getLabelPosition(from_angle,to_angle,intersecPt);

            var baseline:ProcessingLine2D = new ProcessingLine2D(intersecPt.x,intersecPt.y,toPoint1.x,toPoint1.y);

            baseline = baseline.normalize(1);

            var pt = new Point(baseline.x2,baseline.y2);

            var angleBtn = Math.abs(to_angle-from_angle);

            var rotateAngle = -(angleBtn/2);

            if(from_angle<to_angle){

                rotateAngle = -rotateAngle;
            }

            var textPos:Point = Geometric2DUtil.rotatePoint(rotateAngle,pt.x,pt.y,intersecPt.x,intersecPt.y);
            return textPos;
        }


        getLabelPosition(fromAngle:number,toAngle:number,intersecPt:Point):Point
        {
            var fromAngleInDeg:number = fromAngle;
            var toAngleInDeg:number = toAngle;

            //processing circle always consider as reverse position
            var circle1:ProcessingCircle = new ProcessingCircle(intersecPt.x,intersecPt.y,2.5*this.arcRadius,fromAngleInDeg,toAngleInDeg);
            var midAngle:number = fromAngleInDeg + (toAngleInDeg-fromAngleInDeg)/2;
            midAngle = (midAngle<0) ? 360+midAngle : midAngle;
            //return labelPos;
            var xOffsetVal:number = (midAngle> 90 && midAngle<270) ? -0.5:-0.1;
            var yOffsetVal:number = (midAngle>30 && midAngle<150) ? 0.3 : ((midAngle>210 && midAngle<330) ? 0.3 : 0);

            var labelPos:Point = circle1.pointAt(PMath.radians(midAngle));
            return new Point(labelPos.x+xOffsetVal,labelPos.y+yOffsetVal);
        }


        private commitText3d(angleVal:number,textPosition:Point3D):void
        {
           if(this.virtualObjectsExecutionContext.labelVisible== false)
              return;

            var textValue:string = PMath.roundDecimal(angleVal,1)+"";

            this.addLabelOffset(textPosition);

            var outputMesh = this.canvas.commitText3d(textValue,textPosition,16);

            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }


        //this aniamtion is used for measure angle animation
        private  moveAndRotateFindAngle(animationRatio:number,fromPoint:Point3D , toPoint:Point3D,intersectPt:Point3D):void
        {
            var drawratio:number = animationRatio;

            var MOVEMENT_RATIO:number=0.3;
            var ROTATE_RATIO:number=0.85;

            if(drawratio==0)
            {
                var currProtAng:number = this.fromAngle;

                //  protrator rotate opposite direction, so add 180 to rotate opposite
                if(this.fromAngle<this.toAngle){

                   currProtAng=currProtAng+180;
                }

                this.currentRotationInDegress = currProtAng - this.prevProtractorAngle;
                this.currentRotationInDegress = this.restrictAngle(this.currentRotationInDegress);


                this.prevProtractorAngle = currProtAng;
                this.prevRotationInDegress=0;
            }


            var onToOneRatio:number;

            if(drawratio <= MOVEMENT_RATIO)
            {
                onToOneRatio= PMath.map(drawratio, 0, MOVEMENT_RATIO, 0, 1);

                var newFromPoint:Point3D = Point3D.interpolate(this.originalFromPoint, intersectPt, onToOneRatio);

                var newToPoint:Point3D = Point3D.interpolate(this.originalToPoint, toPoint, onToOneRatio);

                this.moveTo(newFromPoint, newToPoint, 0);

                return ;
            }

            if(drawratio <= ROTATE_RATIO)
            {
                this.moveTo(intersectPt, toPoint, 0);

                onToOneRatio= PMath.map(drawratio, MOVEMENT_RATIO, ROTATE_RATIO, 0, 1);

                this.rotateProtractor(this.currentRotationInDegress*onToOneRatio);

                return ;
            }

             if(drawratio <= 1)
            {
                this.rotateProtractor(this.currentRotationInDegress);

                if(this._autoRest)
                {
                    this.alignTo( this.originalFromPoint, this.originalToPoint, 0);

                    this.showOrHide(1);// show
                }

                this.originalFromPoint = fromPoint.copy();

                this.originalToPoint = toPoint.copy();
            }
        }


        private  restrictAngle(angle:number):number
        {
            var outputAngle:number=angle;
            if(angle>=360){

                outputAngle=angle-360;
                return outputAngle;
            }

            if(angle<0 && Math.abs(angle)>=360){

                outputAngle=angle+360;
                return outputAngle;
            }
            return outputAngle;

        }

        //this  method called from user
        public drawAngle( fromPoint:Point3D, toPoint:Point3D, animationRatio:number, postionRatio:number, angleToMeasure:number ):void
        {

            this.isDrawAngleCommand=true;
            //get animation ratio from boundry constrain..
            // use this boundry ratio furtur
            animationRatio = this.drawAngleBoundryContainer.constrain(animationRatio);

            // do   some initialzation and calulation
            if(animationRatio == 0)
            {
                // if measure angle greater than 180, flip the protractor
                if(this.canFlipProtractor(angleToMeasure))
                {
                    if((this._prevAngleToMeasure<=180 && angleToMeasure>180) ||  (this._prevAngleToMeasure>=0 && angleToMeasure<0) )
                    {
                        this.rotateYaw(-90);
                        this.rotateYaw(-90);
                    }

                    if((this._prevAngleToMeasure>180 && angleToMeasure<=180) ||  (this._prevAngleToMeasure<0 && angleToMeasure>=0) )
                    {
                        this.rotateYaw(90);
                        this.rotateYaw(90);
                    }

                    this._prevAngleToMeasure = angleToMeasure;
                    this.prevPositionRatio = postionRatio;
                }
            }
           this.moveAndRotateForDrawAngle(animationRatio, fromPoint, toPoint, postionRatio, angleToMeasure);
        }



        private  moveAndRotateForDrawAngle(animationRatio:number,fromPoint:Point3D , toPoint:Point3D,
                                         postionRatio:number, angleToMeasure:number ):void{

            var baseLine:ProcessingLine2D= new ProcessingLine2D(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);

            var drawratio:number = animationRatio;

            var MOVEMENT_RATIO:number=0.3;
            var ROTATE_RATIO:number = 0.5;
            var DRAW_TEXT_RATIO:number = 0.8;
            var REST_RATIO:number=0.85;
            var PENCIL_DRAW_RATIO:number=0.95;

            if(drawratio==0)
            {
                var currProtAng:number = PMath.degrees( baseLine.angle());

                this.currentRotationInDegress = currProtAng - this.prevProtractorAngle;
                this.currentRotationInDegress=this.restrictAngle(this.currentRotationInDegress);

                this.prevProtractorAngle = currProtAng;
                this.prevRotationInDegress=0;

                this.rotatedPoint =  this.calculateRotatedPointFromBaseLine(fromPoint, toPoint, postionRatio,
                    angleToMeasure);
                this.showOrHide(1);
            }

            var onToOneRatio:number;
            if(drawratio <=  MOVEMENT_RATIO)
            {
                onToOneRatio = PMath.map(drawratio, 0,  MOVEMENT_RATIO, 0, 1);
                var orginalFromPt:Point3D = this.originalFromPoint;
                var orginalToPt:Point3D = this.originalToPoint;

                if(this.originalFromPoint.equals(fromPoint) && this.originalToPoint.equals(toPoint) )
                {
                    orginalToPt = orginalFromPt;
                }

                var newFromPoint:Point3D = Point3D.interpolate(orginalFromPt, fromPoint, onToOneRatio);
                var newToPoint:Point3D = Point3D.interpolate(orginalToPt, toPoint, onToOneRatio);
                this.moveTo(newFromPoint, newToPoint, postionRatio);

                return ;
            }

            if(drawratio <=  ROTATE_RATIO)
            {
                this.moveTo(fromPoint, toPoint, postionRatio);
                onToOneRatio = PMath.map(drawratio,  MOVEMENT_RATIO,  ROTATE_RATIO, 0, 1);
                this.rotateProtractor(this.currentRotationInDegress*onToOneRatio);

                return ;
            }

            if(drawratio <= DRAW_TEXT_RATIO)
            {
                //do nothing
                this.rotateProtractor(this.currentRotationInDegress);
                onToOneRatio = PMath.map(drawratio,  ROTATE_RATIO,  DRAW_TEXT_RATIO, 0, 1);

                var currentTextAngle:number = PMath.lerp(0,angleToMeasure,onToOneRatio);
                var radiusOffset:number = ((currentTextAngle+"").length>2) ? 0.5 : 0;
                var textPosition:Point =  this.calculateRotatedPointFromBaseLine(fromPoint, toPoint, postionRatio, currentTextAngle,radiusOffset);

                this.drawMeasurAngleArcText(currentTextAngle,new Point3D(textPosition.x,textPosition.y),30);

                return ;
            }

            if(drawratio <= REST_RATIO)
            {
                //do nothing
                this.rotateProtractor(this.currentRotationInDegress);
                var startPt:Point3D = fromPoint;

                if(postionRatio>0.5)
                    startPt = toPoint;

                this.pencilObj.alignTo(startPt);
                return;
            }


            if(drawratio <=  PENCIL_DRAW_RATIO)
            {
                 //rotated  point from base line
                 onToOneRatio = PMath.map(drawratio,  REST_RATIO,  PENCIL_DRAW_RATIO, 0, 1);
                 this.pencilObj.drawPoint(new Point3D(this.rotatedPoint.x,this.rotatedPoint.y),onToOneRatio);
                 return ;
            }


            if(drawratio == 1)
            {
                if(this._autoRest)
                {
                    this.alignTo( this.originalFromPoint, this.originalToPoint, postionRatio);
                    this.showOrHide(1);// show
                }
                this.copyInputPoints(fromPoint,toPoint,postionRatio);
                this.boundryContainer.reset();
            }
        }


        private drawMeasurAngleArcText(angleVal:number,textPosition:Point3D,textSize:number=14):void
        {
            var textValue:string = PMath.roundDecimal(Math.abs(angleVal),0)+"";

            this.protractorGroup.removePart(this.textPart);
            this.textPart = this.protractorGroup.text(textValue,textPosition,textSize);
        }



        private copyInputPoints(fromPoint:Point3D,toPoint:Point3D,postionRatio:Number):void
        {
            if(this.originalFromPoint.equals(fromPoint) && this.originalToPoint.equals(toPoint) )
            {
                if(postionRatio>0.5)
                {
                    this.originalFromPoint = toPoint.copy();
                    this.originalToPoint = fromPoint.copy();

                    return;
                }
            }

            this.originalFromPoint = fromPoint.copy();
            this.originalToPoint = toPoint.copy();
        }

        public directCommitPointAtAngle(fromPoint:Point3D , toPoint:Point3D,
                                         postionRatio:number, angleToMeasure:number):void
        {
            var rotatedPt:Point = this.calculateRotatedPointFromBaseLine(fromPoint, toPoint, postionRatio, angleToMeasure);
            this.pencilObj.directCommitPoint(new Point3D(rotatedPt.x,rotatedPt.y));

        }


       /* private drawLineAndArc(animationRatio:number,fromPoint:Point3D , toPoint:Point3D,postionRatio:number, angleToMeasure:number ):void
        {
            var baseLine:ProcessingLine2D= new ProcessingLine2D(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);
            var baseLineLength:number = baseLine.length();
            var normalizedBaseLine:ProcessingLine2D = baseLine.normalize(baseLineLength*postionRatio);

            //  rotated  point from base line
            //if animation ratio is less  than equal to 0.7, draw line
            if(animationRatio <= this.LINE_ANIMATION_RATIO)
            {
                // it will give line ratio between 0-1;
                var lineDrawRatio:number = PMath.map(animationRatio , this.MOVE_ROTATE_PROTRACTOR_RATIO, this.LINE_ANIMATION_RATIO, 0, 1);
                var rotatedPoint:Point = this.calculateRotatedPointFromBaseLine(fromPoint,toPoint,postionRatio,angleToMeasure);

                var fromPt:Vector3D=new Vector3D(normalizedBaseLine.x2, normalizedBaseLine.y2);
                var toPt:Vector3D=new Vector3D(rotatedPoint.x, rotatedPoint.y);

                var lineDirection:Vector3D=new Vector3D(toPt.x-fromPt.x,toPt.y-fromPt.y);
                lineDirection.normalize();
                lineDirection.scaleBy(10);
                toPt = fromPt.add(lineDirection);

                if(this.rulerObj)
                {
                    this. rulerObj.showOrHide(1);
                    this.rulerObj.drawLine( new Point3D(fromPt.x,fromPt.y), new Point3D(toPt.x,toPt.y), lineDrawRatio);
                }
            }

            //if animation ratio is greater  than equal to 0.7, draw arc
            if(animationRatio>=this.LINE_ANIMATION_RATIO)
            {
                if(this.compassObj)
                {
                    this.rulerObj.showOrHide(0);
                    var baseLineAngle:number = baseLine.angle();
                    var baseLineAngleInDegree:number = PMath.degrees(baseLineAngle);
                    var arcDrawRatio:number = PMath.map(animationRatio, this.LINE_ANIMATION_RATIO, 1, 0, 1);

                    var fromAngle:number=baseLineAngleInDegree;
                    var toAngle:number=(baseLineAngleInDegree-angleToMeasure);

                    if(postionRatio>0.5)
                    {
                        fromAngle=fromAngle-180;
                        toAngle=fromAngle+angleToMeasure;
                    }

                    this.compassObj.drawArc( new Point3D( normalizedBaseLine.x2, normalizedBaseLine.y2),
                        baseLineLength/10,  fromAngle, toAngle, arcDrawRatio);
                }
            }
        }*/

        public calculateRotatedPointFromBaseLine( fromPoint:Point3D, toPoint:Point3D, lineratio:number,angle:number,radiusOffset:number=0):Point
        {
            angle =- angle;

            var line2d1:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);

            if(line2d1.length()!=0)
            {
                line2d1=line2d1.normalize(line2d1.length()*lineratio);
            }
            var protectorOrgin:Point3D=new Point3D(line2d1.x2,line2d1.y2,0);
            var midPoint:Vector3D = new Vector3D(protectorOrgin.x,protectorOrgin.y,protectorOrgin.z);

            var linevector:Vector3D = new Vector3D(toPoint.x-fromPoint.x,toPoint.y-fromPoint.y);
            linevector.normalize();
            var scaleValue:number = (this.radius+2*this.rad_diff) + radiusOffset;
            linevector.scaleBy(scaleValue);

            var startpt:Vector3D = midPoint.clone();
            var endpoint:Vector3D = startpt.add(linevector);

            if(lineratio>0.5)
                angle=180-angle;

            var proMarkPt:Point = Geometric2DUtil.rotatePoint(angle,endpoint.x,endpoint.y,midPoint.x,midPoint.y);
            return proMarkPt;
        }


        public attachImage(imageBitmapData:BitmapData):void
        {
            this.protractorPart.attachImage(imageBitmapData);

            var uvlist:number[]=this.protractorPart.getUVData();

            // apply defult uv for all
            var uv_x:number=PMath.map(512/2,0,512,0,1);
            var uv_y:number=PMath.map(260,0,512,0,1);

            var len=uvlist.length;
            for(var i:number=0; i<len; i=i+24){

                for(var j:number=0; j<24; j=j+1){

                    var index:number=i+j;

                    if(index%2==0)
                        uvlist[index]=uv_x;
                    if(index%2!=0)
                        uvlist[index]=uv_y;
                }
            }

            //then apply image uv for top section
            var uvmapContainerList:UVMapContainer[]= this.getUVmapList();
            var len:number=uvmapContainerList.length;
            for(var i:number=0; i<len; i++){

                var faceNum:number=i+1;
                var uvcontainer:UVMapContainer=uvmapContainerList[i];
                this.updateSection(uvlist,faceNum,uvcontainer,len);
            }
            this.protractorPart.updateUVData(uvlist);
        }


        private getUVmapList():UVMapContainer[]
        {
            var x_radius:number=256;
            var y_radius:number=267;

            var start:Point=new Point(0,512-366);
            var center:Point=new Point(256,start.y);

            var gap:number=220;
            var inner_gap:number=gap/3;

            var uvmapContainers:UVMapContainer[]=[];
            var mapcontainer:UVMapContainer=new UVMapContainer();
            uvmapContainers.push(mapcontainer);

            var end:number=0;
            for(var i:number=180; i>=end; i=i-1)
            {
                var uvPoint:Point;

                uvPoint=this.calculateUV(i,center,x_radius,y_radius,0);
                mapcontainer.uvMapList1.push(uvPoint);

                uvPoint=this.calculateUV(i,center,x_radius,y_radius,inner_gap);
                mapcontainer.uvMapList1.push(uvPoint);
                mapcontainer.uvMapList2.push(uvPoint);

                uvPoint=this.calculateUV(i,center,x_radius,y_radius,2*inner_gap);
                mapcontainer.uvMapList2.push(uvPoint);
                mapcontainer.uvMapList3.push(uvPoint);

                uvPoint=this.calculateUV(i,center,x_radius,y_radius,3*inner_gap);
                mapcontainer.uvMapList3.push(uvPoint);

                if(i!=end)
                {
                    var pre_mapcontainer:UVMapContainer=uvmapContainers[uvmapContainers.length-1];
                    if(pre_mapcontainer.uvMapList1.length>2)
                    {
                        mapcontainer=new UVMapContainer();
                        mapcontainer.uvMapList1.push(pre_mapcontainer.uvMapList1[2]);
                        mapcontainer.uvMapList1.push(pre_mapcontainer.uvMapList1[3]);

                        mapcontainer.uvMapList2.push(pre_mapcontainer.uvMapList2[2]);
                        mapcontainer.uvMapList2.push(pre_mapcontainer.uvMapList2[3]);

                        mapcontainer.uvMapList3.push(pre_mapcontainer.uvMapList3[2]);
                        mapcontainer.uvMapList3.push(pre_mapcontainer.uvMapList3[3]);

                        uvmapContainers.push(mapcontainer);
                    }
                }
            }
            return uvmapContainers;
        }

        private calculateUV(i:number, center:Point, x_radius:number ,y_radius:number, inner_gap:number):Point
        {
            var x_px:number=center.x+(x_radius-inner_gap)*Math.cos(PMath.radians(i));
            var y_px:number=center.y+(y_radius-inner_gap)*Math.sin(PMath.radians(i));

            var uv_x:number=PMath.map(x_px,0,512,0,1);
            var uv_y:number=PMath.map(512-y_px,0,512,0,1);

            return new Point(uv_x,uv_y);
        }

        private updateSection( uvlist:number[], section:number,uvMapcontainer:UVMapContainer, len:number):void
        {
            var face:number=4;
            var numUVPerFace:number=36;
            var startIndex:number=(section*face)*numUVPerFace;

            if(len==section)
            {
                startIndex=startIndex+24;
            }

            this.updateRectangleUV(uvlist,startIndex,uvMapcontainer.uvMapList3);
            this.updateRectangleUV(uvlist,startIndex+12,uvMapcontainer.uvMapList2);
            this.updateRectangleUV(uvlist,startIndex+24,uvMapcontainer.uvMapList1);
        }


        private  updateRectangleUV( uvlist:number[], index:number, uvMapList:Point[]):void
        {
            var _index:number = index;

            //TRIANGLE 1
            var p:Point = uvMapList[1];
            uvlist[_index]=p.x;
            uvlist[++_index]=p.y;

            p=uvMapList[0];
            uvlist[++_index]=p.x;
            uvlist[++_index]=p.y;

            p=uvMapList[2];
            uvlist[++_index]=p.x;
            uvlist[++_index]=p.y;


            //TRIANGLE 2
            p=uvMapList[1];
            uvlist[++_index]=p.x;
            uvlist[++_index]=p.y;

            p=uvMapList[2];
            uvlist[++_index]=p.x;
            uvlist[++_index]=p.y;

            p=uvMapList[3];
            uvlist[++_index]=p.x;
            uvlist[++_index]=p.y;
        }

        public  get autoRest():boolean
        {
            return this._autoRest;
        }

        public  set autoRest(value:boolean)
        {
            this._autoRest = value;
        }

        public reset():void
        {
            this.protractorPart.clearRotation();
            this.boundryContainer.reset();
            this.drawAngleBoundryContainer.reset();
            this.polyAngleBoundryConstrainer.reset();

            this.currentRotationInDegress=0;
            this.prevRotationInDegress=0;

            this.prevProtractorAngle = 0;
            this._prevAngleToMeasure = 0;
            this.prevPositionRatio = 0.5;
            this.isInverted = false;

            this.originalFromPoint=new Point3D();
            this.originalToPoint=new Point3D();
            this.initAlign();
        }

        public directCommitAngleArc(fromPoint1:Point3D, toPoint1:Point3D, fromPoint2:Point3D, toPoint2:Point3D):void{

            var intersecPt:Point = this.findIntersectinPt(fromPoint1,toPoint1,fromPoint2,toPoint2);
            var norm_line1:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint1,toPoint1,intersecPt);
            var norm_line2:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint2,toPoint2,intersecPt);

            var outputAngles:number[] = this.findFromAndToAngle(norm_line1,norm_line2);
            var fromAngle:number = outputAngles[0];
            var toAngle:number = outputAngles[1];

            this.compassObj.drawArc(new Point3D(intersecPt.x,intersecPt.y),this.arcRadius,fromAngle,toAngle,1);

            var angleBtn = Math.abs(toAngle-fromAngle);
            var textPos:Point = this.findTextPosition(fromAngle,toAngle,intersecPt,toPoint1);
            this.commitText3d(angleBtn,new Point3D(textPos.x,textPos.y) );
        }




        public measurePolyAngle(inputPoints:Point3D[], ratio:number):void
        {
            if(this.isDrawAngleCommand==true){

                this.isDrawAngleCommand=false;

                this.reset();

            }
            var lastItemIndex:number = inputPoints.length-1;
            var currSegNo:number = Math.ceil(inputPoints.length*ratio);
            if(currSegNo==0 )
                return ;

            //find current segment ratio
            var curr_seg_ratio = (inputPoints.length*ratio)-(currSegNo-1);
            var constRatio:number = this.polyAngleBoundryConstrainer.constrain1(curr_seg_ratio);
            var constSegNo:number = (constRatio==1 && ratio!=1) ? currSegNo-1 : currSegNo;

            var currentIndex:number = constSegNo-1;
            var previousIndex:number = (currentIndex==0) ? lastItemIndex : currentIndex-1;
            var nextIndex:number = (currentIndex==lastItemIndex) ? 0 : currentIndex+1;

            this.measureAngle(inputPoints[currentIndex],inputPoints[nextIndex],inputPoints[currentIndex],inputPoints[previousIndex],constRatio);

            if(ratio==1)
            {
                this.polyAngleBoundryConstrainer.reset();
            }
        }


        public removeInternalDrawings():void
        {
            this.protractorGroup.removePart(this.textPart);
        }

        public   angleBetweenLines(fromPoint1:Point3D, toPoint1:Point3D, fromPoint2:Point3D, toPoint2:Point3D):number{


        var intersecPt:Point = this.findIntersectinPt(fromPoint1,toPoint1,fromPoint2,toPoint2);
        var norm_line1:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint1,toPoint1,intersecPt);
        var norm_line2:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint2,toPoint2,intersecPt);

        var outputAngles:number[] = this.findFromAndToAngle(norm_line1,norm_line2);
        var from_angle = outputAngles[0];
        var to_angle = outputAngles[1];

          return Math.abs(to_angle-from_angle);


    }






        public directCommitPolyAngleArc(inputPoints:Point3D[]):void{

            var lastItemIndex:number = inputPoints.length-1;

            for(var i:number=0;i<inputPoints.length;i++)
            {
                var previousIndex:number = (i==0) ? lastItemIndex : i-1;
                var nextIndex:number = (i==lastItemIndex) ? 0 : i+1;

                this.directCommitAngleArc(inputPoints[i],inputPoints[nextIndex],inputPoints[i],inputPoints[previousIndex]);
            }
        }


        //lot of methods need to be make private from protractorObj, instead add one method and also reused in
        //FindPolyAngleCommand "doDrawOn2D" method
        //Note : drawing in canvas2d
        public directCommitAngleArcOn2D(fromPoint1:Point3D, toPoint1:Point3D, fromPoint2:Point3D, toPoint2:Point3D,graphsheet2d):void{

            var intersecPt:Point = this.findIntersectinPt(fromPoint1,toPoint1,fromPoint2,toPoint2);
            var norm_line1:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint1,toPoint1,intersecPt);
            var norm_line2:ProcessingLine2D = this.getLineFromIntersectPt(fromPoint2,toPoint2,intersecPt);

            var outputAngles:number[] = this.findFromAndToAngle(norm_line1,norm_line2);
            var fromAngle:number = outputAngles[0];
            var toAngle:number = outputAngles[1];

            graphsheet2d.drawArc(intersecPt.clone(),this.arcRadius,fromAngle,toAngle);

            var angleBtn = Math.abs(toAngle-fromAngle);
            var textPos:Point = this.findTextPosition(fromAngle,toAngle,intersecPt,toPoint1);

            var textValue:string = PMath.roundDecimal(angleBtn,1)+"";

            var offsetLabelPos:Point3D = new Point3D(textPos.x,textPos.y);

            this.addLabelOffset(offsetLabelPos);

            graphsheet2d.drawLabel(textValue,new Point(offsetLabelPos.x,offsetLabelPos.y));
        }

    }
}