/**
 * Created by Mathdisk on 2/24/14.
 */


module robo.virtualobjects
{

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point3D = robo.core.Point3D;

    import PMath = robo.util.PMath;
    import UI3DScript = robo.geom.UI3DScript
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import BitmapData  = away.base.BitmapData;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;


    export  class Ruler3D extends BaseVirtualObject
    {
        private rulerLength:number = 10;// almost fixed
        private rulerWidth:number = 1;
        private rulerThickness:number = 0.2;

        private ui3DScript:UI3DScript;
        private origin:Point3D = new Point3D(0,0,0);
        private rulerGroup:GeometryGroup;
        private rulerPart:GeometryPart;

        private _drawLineAsReverse:boolean = false;

        private MOVEMENT_RATIO:number = 0.3;
        private ROTATE_RATIO:number = 0.5;
        private DRAW_RATIO:number = 0.9;

        private TRANSFORM_MOVEMENT_RATIO:number = 0.4;
        private TRANSFORM_ROTATE_RATIO:number = 0.8;

        private TRANSLATE_RULER_RATIO:number = 0.8;

        private currentRelativeRotationInDegress:number = 0;
        private runningRelativeRotationInDegress:number = 0;
        private currentAbsoluteRotationInDegress:number = 0;

        private currentOriginPosition:Point3D;
        private originalFromPoint:Point3D = new Point3D();
        private originalToPoint:Point3D = new Point3D();

        private _pencil3d:Pencil3D = null;
        private _lineThickness:number=1;// We have changed from Arc to line

        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;

        private drawLineBoundryConstrainer:BoundryConstrainer;
        private splitLineboundryConstrainer:BoundryConstrainer;

        private translateRulerBoundryConstrainer:BoundryConstrainer;
        private transformRulerBoundryConstrainer:BoundryConstrainer;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
            this.createRuler();

            this.splitLineboundryConstrainer = new BoundryConstrainer([0,0.5,1]);
            this.drawLineBoundryConstrainer = new BoundryConstrainer([0,this.MOVEMENT_RATIO,this.ROTATE_RATIO,this.DRAW_RATIO,1]);
            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.rulerGroup,6);// 6 is internal instances to  manage

            this.transformRulerBoundryConstrainer = new BoundryConstrainer([0,this.TRANSFORM_MOVEMENT_RATIO,this.TRANSFORM_ROTATE_RATIO,1]);
            this.translateRulerBoundryConstrainer = new BoundryConstrainer([0,0.8,1]);

            this.maximumOpacity = 0.9;  

        }

        private createRuler():void
        {
            this.rulerGroup = new GeometryGroup(this.ui3DScript);
            this.rulerPart = this.rulerGroup.cuboid(this.origin,this.rulerLength,this.rulerThickness,this.rulerWidth);

            this.originalFromPoint = new Point3D(this.rulerLength,this.rulerLength/2,this.origin.z);
            this.originalToPoint = new Point3D(this.rulerLength,-this.rulerLength/2,this.origin.z);

            this.alignTo(this.originalFromPoint,this.originalToPoint);
        }

        private alignTo(fromPoint:Point3D,toPoint:Point3D):void
        {
            var lineAngleInDegress:number = this.calculateLineAngle(fromPoint,toPoint);
            var angleInradians:number = PMath.radians(lineAngleInDegress);

            this.setPosition(fromPoint,toPoint);
            this.rotateRuler(lineAngleInDegress);
        }

        private moveTo(midPoint:Point3D,fromPoint:Point3D,toPoint:Point3D):void
        {
            var offsetDistance:number = (this.rulerWidth/2)+0.1;//0.1 for pen thickness
            var line2d1:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var perpx:number = line2d1.normal().x; // (-b,a is perp)
            var perpy:number = line2d1.normal().y;
            var p:Point = new Point(perpx,perpy);
            p.normalize(offsetDistance);

            midPoint.x += p.x;
            midPoint.y += p.y;

            this.rulerPart.setPosition(midPoint);
        }


        public  setPosition(fromPoint:Point3D,toPoint:Point3D):void
        {
            var midPoint:Point3D = Point3D.midPoint(fromPoint,toPoint);

            var offsetDistance:number = (this.rulerWidth/2)+0.1;//0.1 for pen thickness
            var line2d1:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var perpx:number = line2d1.normal().x; // (-b,a is perp)
            var perpy:number = line2d1.normal().y;
            var p:Point = new Point(perpx,perpy);
            p.normalize(offsetDistance);

            midPoint.x += p.x;
            midPoint.y += p.y;

            this.rulerPart.setPosition(midPoint);
        }

        public rotateRuler(angleInDegress:number):void
        {
            var rotationAngleInDegrees:number = angleInDegress - this.runningRelativeRotationInDegress;

            this.rulerPart.relativeYaw(rotationAngleInDegrees);

            this.runningRelativeRotationInDegress = angleInDegress;
        }


        private commitRotateRuler(angleInDegress:number):void
        {
            var rotationAngleInDegrees:number = angleInDegress - this.runningRelativeRotationInDegress;

            if(rotationAngleInDegrees<90){

                this.rotateRuler(angleInDegress);

            }else{

                var numberOfIteration:number = Math.floor(rotationAngleInDegrees/90);
                var balanceRotationInDegrees:number = angleInDegress - (numberOfIteration*90);

                for(var i:number=0;i<numberOfIteration;i++){
                    this.rulerPart.relativeYaw(90);
                }

                this.rulerPart.relativeYaw(balanceRotationInDegrees);
                this.runningRelativeRotationInDegress = angleInDegress;
            }
        }



        public drawLine(startPoint:Point3D,endPoint:Point3D,ratio:number):void
        {
            var lineLength:number = startPoint.distanceTo(endPoint);
            if(lineLength<=10)
                this.drawLineUsingRuler(startPoint,endPoint,ratio);
            else
                this.drawSplitLine(startPoint,endPoint,ratio);
        }


        public getOppositeEdgePoint(startPoint:Point3D,endPoint:Point3D):Point
        {
            var angleInDegrees:number = this.calculateLineAngle(startPoint,endPoint);
            var originPoint:Point3D = Point3D.midPoint(startPoint,endPoint);//this.rulerPart.position;

            var angle:number = PMath.radians(angleInDegrees+90);
            var xPos:number = originPoint.x + (this.rulerWidth * Math.cos(angle));
            var yPos:number = originPoint.y + (this.rulerWidth * Math.sin(angle));
            return new Point(xPos,yPos);
        }


        private drawSplitLine(startPoint:Point3D,endPoint:Point3D,ratio:number):void
        {
            ratio =  this.splitLineboundryConstrainer.constrain(ratio);

            if(this.drawLineAsReverse)
            {
                this.drawReverseSplitLine(startPoint,endPoint,ratio);

            }else{

                this.drawRegularSplitLine(startPoint,endPoint,ratio);
            }
        }


        private  drawRegularSplitLine(startPoint:Point3D,endPoint:Point3D,ratio:number):void
        {
            if(ratio<=0.5)
            {
                var onToRatio:number = PMath.map(ratio,0,0.5,0,1);

                var newEndPoint:Point3D = startPoint.lerp(endPoint,0.5);

                this.drawLineUsingRuler(startPoint,newEndPoint,onToRatio);
            }

            if(ratio>=0.5){

                var onToRatio:number = PMath.map(ratio,0.5,1,0,1);

                var newStartPoint:Point3D = startPoint.lerp(endPoint,0.5);

                this.drawLineUsingRuler(newStartPoint,endPoint,onToRatio);
            }
        }


        private  drawReverseSplitLine(startPoint:Point3D,endPoint:Point3D,ratio:number):void
        {
            if(ratio<=0.5)
            {
                var onToRatio:number = PMath.map(ratio,0,0.5,0,1);

                var newStartPoint:Point3D = startPoint.lerp(endPoint,0.5);

                this.drawLineUsingRuler(newStartPoint,endPoint,onToRatio);

            }

            if(ratio>=0.5){

                var onToRatio:number = PMath.map(ratio,0.5,1,0,1);

                var newEndPoint:Point3D = startPoint.lerp(endPoint,0.5);

                this.drawLineUsingRuler(startPoint,newEndPoint,onToRatio);
            }
        }



        private  drawLineUsingRuler(fromPoint:Point3D,toPoint:Point3D,ratio:number):void
        {
            ratio = (ratio!=1) ? this.drawLineBoundryConstrainer.constrain(ratio) : ratio;

            if(ratio==0)
            {
                var lineAngleInDegress:number = this.normalizedLineAngle(fromPoint,toPoint);

                this.currentRelativeRotationInDegress = lineAngleInDegress;
                this.runningRelativeRotationInDegress = 0;

                var startPoint:Point3D = this.getStartPoint(fromPoint,toPoint);
                this.pencil3d.alignTo(startPoint);

                this.showOrHide(1);
            }


            if(ratio<=this.MOVEMENT_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.MOVEMENT_RATIO,0,1);
                var newFromPoint:Point3D = Point3D.interpolate(this.originalFromPoint,fromPoint,onToOneRatio);
                var newToPoint:Point3D = Point3D.interpolate(this.originalToPoint,toPoint,onToOneRatio);

                var midPoint:Point3D = Point3D.midPoint(newFromPoint,newToPoint);
                this.moveTo(midPoint,fromPoint,toPoint);
                return;
            }

            if(ratio<=this.ROTATE_RATIO)
            {
                var midPoint:Point3D = Point3D.midPoint(fromPoint,toPoint);
                this.moveTo(midPoint,fromPoint,toPoint);

                var onToOneRatio:number = PMath.map(ratio,this.MOVEMENT_RATIO,this.ROTATE_RATIO,0,1);
                this.rotateRuler(this.currentRelativeRotationInDegress*onToOneRatio);
                return;
            }

            if(ratio<=this.DRAW_RATIO)
            {
                this.rotateRuler(this.currentRelativeRotationInDegress);

                var startPoint:Point3D = this.getStartPoint(fromPoint,toPoint);
                var endPoint:Point3D = this.getEndPoint(fromPoint,toPoint);

                var lineDrawRatio:number = PMath.map(ratio,this.ROTATE_RATIO,this.DRAW_RATIO,0,1);
                var newToPoint:Point3D = Point3D.interpolate(startPoint,endPoint,lineDrawRatio);

                //By this time, the pencil would have moved to the new From point...
                var pencilPos:Point3D = this.pencil3d.getDirectionVector(endPoint,lineDrawRatio);
                this.pencil3d.move(pencilPos);

                this.internalDrawLine(startPoint,newToPoint);
            }


            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {
                //this.commitRotateRuler(this.currentRelativeRotationInDegress);
                var midPoint:Point3D = Point3D.midPoint(fromPoint,toPoint);
                this.moveTo(midPoint,fromPoint,toPoint);
                this.rotateRuler(this.currentRelativeRotationInDegress);
                this.commitLine(fromPoint,toPoint);

                this.originalFromPoint = fromPoint.copy();
                this.originalToPoint = toPoint.copy();

                this.runningRelativeRotationInDegress = 0;
                this.currentAbsoluteRotationInDegress = this.calculateLineAngle(fromPoint,toPoint);
                this.drawLineBoundryConstrainer.reset();

                var endPoint:Point3D = this.getEndPoint(fromPoint,toPoint);
                this.pencil3d.alignTo(endPoint);
            }
        }



        private calculateLineAngle(fromPoint:Point3D,toPoint:Point3D):number
        {
            var line2d1:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var angleInradians:number = line2d1.angle();

            var angleInDegrees:number = PMath.degrees(angleInradians);
            return angleInDegrees;
        }


        private  normalizedLineAngle(fromPoint:Point3D,toPoint:Point3D):number
        {
            var angleInDegrees:number = this.calculateLineAngle(fromPoint,toPoint);
            angleInDegrees = (angleInDegrees - this.currentAbsoluteRotationInDegress) % 360;

            var multiplier:number = (angleInDegrees>0) ? -1 : 1;
            var balancedAngle:number = 360 + (multiplier * angleInDegrees);
            if(Math.abs(angleInDegrees) > balancedAngle)
            {
                return (multiplier * balancedAngle);
            }

            return angleInDegrees;
        }


        private fillUVData(uvArray:number[]):void
        {
            //11
            uvArray[20] = 0;
            uvArray[21] = 0;

            //15
            uvArray[28] = 1;
            uvArray[29] = 0;
            var uvVal = PMath.map(73.14,0,512,0,1);
            //print(uvVal);
            //9
            uvArray[16] = 0;
            uvArray[17] = uvVal;

            //13
            uvArray[24] = 1;
            uvArray[25] = uvVal;

            for(var i:number=0; i<uvArray.length;i++)
            {
                if(i==20 || i==21 || i==24 || i==25 || i==16 || i==17 || i==28 || i==29)
                {

                }
                else
                {
                    uvArray[i] = 0;
                }
            }
        }

        public showOrHide(ratio:number):void
        {
            ratio = Math.min(this.maximumOpacity,ratio);
            this.rulerPart.setTransparency(ratio);
        }


        /** Object commitment must be done using a seperate method called commit line **/

        public commitLine(fromPoint:Point3D,toPoint:Point3D):void
        {
            this.lineOutputInstanceManager.clearAll();

            var outputMesh:Mesh = this.ui3DScript.commitLine(fromPoint,toPoint,this.lineThickness);

            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }


        private  internalDrawLine(fromPoint:Point3D,toPoint:Point3D):void
        {
            var previewLinePart:GeometryPart = this.rulerGroup.line(fromPoint,toPoint,this.lineThickness);

            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public  attachImage(imageBitmapData:BitmapData):void
        {
            this.rulerPart.attachImage(imageBitmapData);

            var uvArray:number[] = this.rulerPart.getUVData();

            this.fillUVData(uvArray);

            this.rulerPart.updateUVData(uvArray);
        }

        public  get drawLineAsReverse():boolean
        {
            return this._drawLineAsReverse;
        }

        public  set drawLineAsReverse(value:boolean)
        {
            this._drawLineAsReverse = value;
        }

        private getStartPoint(fromPoint:Point3D,toPoint:Point3D):Point3D
        {
            var startPoint:Point3D = fromPoint;

            if(this.drawLineAsReverse)
            {
                startPoint = toPoint;
            }
            return startPoint;
        }

        private getEndPoint(fromPoint:Point3D,toPoint:Point3D):Point3D
        {
            var endPoint:Point3D = toPoint;

            if(this.drawLineAsReverse)
            {
                endPoint = fromPoint;
            }
            return endPoint;
        }

        public  get pencil3d():Pencil3D
        {
            return  this._pencil3d;
        }

        public  set pencil3d(value:Pencil3D)
        {
            this._pencil3d = value;

            if( this.pencil3d!=null)
            {
                var pencilPos:Point3D =  this.pencil3d.getDirectionVector(this.originalFromPoint,1);
                this.pencil3d.move(pencilPos);
            }
        }

        public  get lineThickness():number
        {
          return  this._lineThickness;
        }

        public  set lineThickness(value:number)
        {
            this._lineThickness = value;
        }


      // This is a temporray method to test lighting,material effects

        public getMesh():Mesh
        {
            return this.rulerPart.part;
        }


        public reset():void
        {
            this.rulerPart.clearRotation();

            this.currentAbsoluteRotationInDegress = 0;
            this.currentRelativeRotationInDegress = 0;
            this.runningRelativeRotationInDegress = 0;
            this.drawLineAsReverse = false;

            this.originalFromPoint = new Point3D(this.rulerLength,this.rulerLength/2,this.origin.z);
            this.originalToPoint = new Point3D(this.rulerLength,-this.rulerLength/2,this.origin.z);
            this.alignTo(this.originalFromPoint,this.originalToPoint);

            this.splitLineboundryConstrainer.reset();
            this.drawLineBoundryConstrainer.reset();
            this.translateRulerBoundryConstrainer.reset();
            this.transformRulerBoundryConstrainer.reset();
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }

        public directCommitLine(fromPoint:Point3D,toPoint:Point3D):void
        {
            var outputMesh:Mesh = this.ui3DScript.commitLine(fromPoint,toPoint,this.lineThickness);

            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }


        public transformRuler(fromPoint:Point3D,toPoint:Point3D,ratio:number):void
        {
            var newRatio:number = this.transformRulerBoundryConstrainer.constrain(ratio);

            if(newRatio==0)
            {
                var lineAngleInDegress:number = this.normalizedLineAngle(fromPoint,toPoint);

                this.currentRelativeRotationInDegress = lineAngleInDegress;
                this.runningRelativeRotationInDegress = 0;
            }


            if(newRatio<=this.TRANSFORM_MOVEMENT_RATIO)
            {
                var onToOneRatio:number = PMath.map(newRatio,0,this.TRANSFORM_MOVEMENT_RATIO,0,1);
                var newFromPoint:Point3D = Point3D.interpolate(this.originalFromPoint,fromPoint,onToOneRatio);
                var newToPoint:Point3D = Point3D.interpolate(this.originalToPoint,toPoint,onToOneRatio);

                var midPoint:Point3D = Point3D.midPoint(newFromPoint,newToPoint);
                this.moveTo(midPoint,fromPoint,toPoint);
                return;
            }

            if(newRatio<=this.TRANSFORM_ROTATE_RATIO)
            {
                var midPoint:Point3D = Point3D.midPoint(fromPoint,toPoint);
                this.moveTo(midPoint,fromPoint,toPoint);

                var onToOneRatio:number = PMath.map(newRatio,this.TRANSFORM_MOVEMENT_RATIO,this.TRANSFORM_ROTATE_RATIO,0,1);
                this.rotateRuler(this.currentRelativeRotationInDegress*onToOneRatio);

                return;
            }

            if(newRatio<=1)
            {
                this.rotateRuler(this.currentRelativeRotationInDegress);
                this.currentAbsoluteRotationInDegress = this.calculateLineAngle(fromPoint,toPoint);

                this.originalFromPoint = fromPoint.copy();
                this.originalToPoint = toPoint.copy();
            }
        }


        public resetTransformConstrainer():void{

            this.transformRulerBoundryConstrainer.reset();
            this.runningRelativeRotationInDegress = 0;
        }

        public translateRuler(fromPoint:Point3D,toPoint:Point3D,ratio:number):void
        {
            ratio = this.translateRulerBoundryConstrainer.constrain(ratio);

            if(ratio<=this.TRANSLATE_RULER_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.TRANSLATE_RULER_RATIO,0,1);
                var newFromPoint:Point3D = Point3D.interpolate(this.originalFromPoint,fromPoint,onToOneRatio);
                var newToPoint:Point3D = Point3D.interpolate(this.originalToPoint,toPoint,onToOneRatio);

                var midPoint:Point3D = Point3D.midPoint(newFromPoint,newToPoint);
                this.moveTo(midPoint,fromPoint,toPoint);
                return;
            }

            if(ratio<=1)
            {
                this.originalFromPoint = fromPoint.copy();
                this.originalToPoint = toPoint.copy();
            }
        }


        public resetTranslateConstrainer():void{

            this.translateRulerBoundryConstrainer.reset();
        }
    }
}
