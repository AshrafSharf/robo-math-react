/**
 * Created by MohammedAzeem on 3/19/14.
 */


module robo.virtualobjects
{
    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import PMath = robo.util.PMath;
    import Point3D = robo.core.Point3D;
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import UI3DScript = robo.geom.UI3DScript;
    import ColorConstants = robo.util.ColorConstants;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import Mesh = away.entities.Mesh;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import GraphSheet3D = robo.geom.GraphSheet3D; // soft ref
    import BaseShapeItem = robo.shapeitems.BaseShapeItem;
    import ArcByDistanceShapeItem = robo.shapeitems.ArcByDistanceShapeItem;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;


    export  class Compass3D extends BaseVirtualObject
    {
        //define all the inputs
        private  _compassRadius:number = 0.1;//starting
        private  _compassHeight:number = 5.5;
        private  _compassThickness:number = 0.1;
        private  _canvas:UI3DScript;
        private _restingOrigin:Point3D = new Point3D(-10,0,0);

        private _compassOrigin:Point3D;
        private _compassHeadOrigin:Point3D;

        private _compassHeadTopCylinderPart:GeometryPart;
        private _compassHeadBottomCylinderPart:GeometryPart;
        private _compassHeadCapsulePart:GeometryPart;

        private  _compassSkrewRingPart:GeometryPart;
        private  _compassSkrewCapsulePart:GeometryPart;
        private  textPart:GeometryPart;

        private _currentExpansion:number=0;
        private _currentRotation:number=0;

        private _expandInDegress:number = 0;
        private _tipTolerance:number=1.5;

        private _compassGroup:GeometryGroup;
        private _leftEdge:CompassEdge;
        private _rightEdge:CompassEdge;

        public _MOVEMENT_RATIO:number=0.4;
        public _DRAW_RATIO:number=1;

        private _arcColor:number = ColorConstants.red;
        private arcOutputInstanceManager:GeomPartInstanceRemoveManager;
        private arcByDistanceBoundryContainer:BoundryConstrainer;
        private measureDistaceBoundryContainer:BoundryConstrainer;

        public pencilObj:Pencil3D=null;
        private arcByPencilBoundryConstrainer:BoundryConstrainer;

        private previousShapeItem:BaseShapeItem;
        private lastMovedPoint:Point3D;


        constructor(canvas:UI3DScript,compassOrigin:Point3D=null)
        {
            super();

            this._canvas = canvas;

            if(this._compassOrigin!=null)
                this._compassOrigin = compassOrigin.copy();
            else
                this._compassOrigin = this._restingOrigin.copy();

            this.calculateCompassHead();

            this._compassGroup = new GeometryGroup(canvas);
            this.arcOutputInstanceManager = new GeomPartInstanceRemoveManager(this._compassGroup,10);

            canvas.fill(ColorConstants.orange);
            this.arcByDistanceBoundryContainer = new BoundryConstrainer([0,0.2,0.3,0.4,0.5,0.7,0.85,1]);
            this.measureDistaceBoundryContainer =  new BoundryConstrainer([0,0.4,0.5,1]);
            this.arcByPencilBoundryConstrainer = new BoundryConstrainer([0,0.5,0.6,0.9,1]);

            this.leftEdge = new CompassEdge(this,this._compassHeadOrigin.moveLeft(this._compassThickness),this._compassThickness,this._compassHeight,true);
            this.rightEdge = new CompassEdge(this,this._compassHeadOrigin.moveRight(this._compassThickness),this._compassThickness,this._compassHeight,false);

            this.calculateExpandInDegrees();
            this.constructCompassHead();
            this.expandAndRotate(0.1,0);

        }


        private calculateCompassHead()
        {
            this._compassHeadOrigin = new Point3D(this._compassOrigin.x+this._compassRadius,this._compassOrigin.y,this._compassHeight);
        }

        private calculateExpandInDegrees()
        {
            if(this._compassRadius>this._compassHeight)
            {
                this._compassHeight = this._compassRadius;
            }

            //height*cos(tt)=radius;  cos(tt)=radius/height;  tt=acos(radius/height)
            var expandAngle:number = Math.acos(this._compassRadius/this._compassHeight);
            this._expandInDegress = 90-this._tipTolerance-PMath.degrees(expandAngle);//a;
        }


        private constructCompassHead()
        {
            var headOrigin:Point3D = this.calculateTopOrigin(this._currentExpansion);

            this._compassHeadTopCylinderPart = this._compassGroup.cylinder(headOrigin,headOrigin.moveBack(0.7),0.1);
            this._compassHeadTopCylinderPart.color(ColorConstants.orange,1);

            headOrigin = headOrigin.moveFront(0.2);
            this._compassHeadBottomCylinderPart = this._compassGroup.cylinder(headOrigin.moveUp(0.15),headOrigin.moveDown(0.15),0.3);
            this._compassHeadBottomCylinderPart.color(ColorConstants.blue,1);

            this._compassHeadCapsulePart = this._compassGroup.capsule(headOrigin.moveUp(0.15),headOrigin.moveDown(0.15),0.08);
            this._compassHeadCapsulePart.color(ColorConstants.green,1);

            var capsuleStart:Point3D = headOrigin.moveFront(1).moveLeft(0.75);
            var capsuleEnd:Point3D = capsuleStart.moveRight(1.5);
            this._compassSkrewCapsulePart = this._compassGroup.capsule(capsuleStart,capsuleEnd,0.05);
            this._compassSkrewCapsulePart.color(ColorConstants.orangered,1);

            var ringEnd:Point3D = capsuleStart.lerp(capsuleEnd,0.2);
            this._compassSkrewRingPart = this._compassGroup.ring(capsuleStart,ringEnd,0.1);
            this._compassSkrewRingPart.color(ColorConstants.white,1);
        }


        private moveCompassHead()
        {
            var headOrigin:Point3D = this.calculateTopOrigin(this._currentExpansion);

            this._compassHeadTopCylinderPart.alignTo(headOrigin,headOrigin.moveBack(0.7));

            headOrigin = headOrigin.moveFront(0.2);
            this._compassHeadBottomCylinderPart.alignTo(headOrigin.moveUp(0.15),headOrigin.moveDown(0.15));

            this._compassHeadCapsulePart.alignTo(headOrigin.moveUp(0.15),headOrigin.moveDown(0.15));

            var capsuleStart:Point3D = headOrigin.moveFront(1).moveLeft(0.75);
            var capsuleEnd:Point3D = capsuleStart.moveRight(1.5);
            this._compassSkrewCapsulePart.alignTo(capsuleStart,capsuleEnd);

            var ringEnd:Point3D = capsuleStart.lerp(capsuleEnd,0.2);
            this._compassSkrewRingPart.alignTo(capsuleStart,ringEnd);
        }

        public expandAndRotate(compassRadius:number, rotationDegrees:number)
        {
            this._currentRotation = rotationDegrees;
            this._compassRadius = Math.max(compassRadius,0.1);

            this.calculateExpandInDegrees();

            //first rotate the left edge because it creates the rotation pivot
            this._leftEdge.expandAndRotate(this._expandInDegress,rotationDegrees);
            this._rightEdge.expandAndRotate(-this._expandInDegress,rotationDegrees);

            var newCompassHeadPos:Point3D = Point3D.midPoint(this._leftEdge.alignedEdgeStart,this._rightEdge.alignedEdgeStart);
            this._compassHeadTopCylinderPart.setPosition(newCompassHeadPos.moveBack(0.5));

            this.positionScrewAndCapsule();
        }


        private positionScrewAndCapsule()
        {
            var newCompassHeadPos:Point3D = Point3D.midPoint(this._leftEdge.alignedEdgeStart,this._rightEdge.alignedEdgeStart);
            this._compassHeadTopCylinderPart.setPosition(newCompassHeadPos.moveBack(0.5));
            var screwCapsulePartStart:Point3D = this._leftEdge.alignedEdgeStart.lerp(this._leftEdge.alignedEdgeEnd,0.2);
            var screwCapsulePartEnd:Point3D = this._rightEdge.alignedEdgeStart.lerp(this._rightEdge.alignedEdgeEnd,0.2);
            var screwCapsuluePos:Point3D = Point3D.midPoint(screwCapsulePartStart,screwCapsulePartEnd);
            this._compassSkrewCapsulePart.alignTo(screwCapsulePartStart,screwCapsulePartEnd);
            this._compassSkrewCapsulePart.setPosition(screwCapsuluePos);

            this._compassSkrewRingPart.alignTo(screwCapsulePartStart,screwCapsulePartEnd);
            this._compassSkrewRingPart.setPosition(screwCapsuluePos);

            //compass Head bottom Cylinder Part
            var screwVect:Point3D = new Point3D(screwCapsulePartEnd.x-screwCapsulePartStart.x,
                screwCapsulePartEnd.y-screwCapsulePartStart.y,screwCapsulePartEnd.z-screwCapsulePartStart.z);
            screwVect.normalizeSelf();
            var screwVect1:Point3D = new Point3D(screwCapsuluePos.x-newCompassHeadPos.x,
                screwCapsuluePos.y-newCompassHeadPos.y,screwCapsuluePos.z-newCompassHeadPos.z);
            screwVect1.normalizeSelf();

            var res:Point3D = screwVect.crossProduct(screwVect1);
            var compassHeadBottomCylinderPartStart:Point3D = newCompassHeadPos.add(res);
            var compassHeadBottomCylinderPartEnd:Point3D = newCompassHeadPos.subtract(res);

            this._compassHeadBottomCylinderPart.alignTo(compassHeadBottomCylinderPartStart,compassHeadBottomCylinderPartEnd);
            this._compassHeadBottomCylinderPart.setPosition(newCompassHeadPos);

            this._compassHeadCapsulePart.alignTo(compassHeadBottomCylinderPartStart,compassHeadBottomCylinderPartEnd);
            this._compassHeadCapsulePart.setPosition(newCompassHeadPos);
        }

        /**
         * Used by compass Edge, dont expose to script...
         */
        public calculateTopOrigin(expandInDegress:number):Point3D
        {
            var angInRadian:number  = PMath.radians(expandInDegress);
            var currentOrigin:Point3D = this._compassHeadOrigin;
            var newOrigin:Point3D = currentOrigin.copy();
            newOrigin.z = currentOrigin.z*Math.cos(angInRadian);
            return newOrigin;
        }

        /**
         * Used by compass Edge, dont expose to script...
         */
        public calculateRotationPivot():Point3D
        {
            return this._leftEdge.alignedEdgeEnd;
        }

        /**
         * Receives in degrees
         */
        public  internalDrawArc( fromAngleInDegrees:number, toAngleInDegrees:number)
        {
            var origin:Point3D = new Point3D(this._compassOrigin.x,this._compassOrigin.y,0);
            var normal:Point3D = new Point3D(0,0,1);
            var axisVt:Point3D = new Point3D(1,0,0);

            var previewEllipticArcPart:GeometryPart =  this._compassGroup.ellipticArc3d(origin,normal,axisVt,2*this._compassRadius,2*this._compassRadius,PMath.radians(fromAngleInDegrees),PMath.radians(toAngleInDegrees));
            this.arcOutputInstanceManager.manageMesh(previewEllipticArcPart);
        }

        /**
         * Receives in degrees
         */
        public commitArc(fromAngleInDegrees:number, toAngleInDegrees:number)
            {
            var origin:Point3D = new Point3D(this._compassOrigin.x,this._compassOrigin.y,0);
            var normal:Point3D = new Point3D(0,0,1);
            var axisVt:Point3D = new Point3D(1,0,0);

            this.arcOutputInstanceManager.clearAll();
            var outputMesh:Mesh = this._canvas.commitEllipticArc3d(origin,normal,axisVt,2*this._compassRadius,2*this._compassRadius,PMath.radians(fromAngleInDegrees),PMath.radians(toAngleInDegrees));
            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);


            this.previousShapeItem = null;
        }

        /**
         * if you want to move to a given position directly
         *
         */
        public moveTo(newOrigin:Point3D)
        {
            this._compassOrigin = newOrigin.copy();
            this.calculateCompassHead();
            this.moveCompassHead();
            this.leftEdge.moveTo(this._compassHeadOrigin.moveLeft( this._compassThickness));
            this.rightEdge.moveTo(this._compassHeadOrigin.moveRight( this._compassThickness));

            this.positionScrewAndCapsule();


            this.lastMovedPoint = newOrigin;
        }


        /**
         * The ratio must be 0 to 1.The method internally divides them into two segments,0 t0 this._MOVEMENT_RATIO (defaults to 0.4) is used for movement and this._MOVEMENT_RATIO  to 1 is used for drawing
         */
        public drawArc(newOrigin:Point3D,newRadius:number,fromAngleInDegrees:number, toAngleInDegrees:number,ratio:number,textAngle:number=NaN)
        {
            if(ratio<=this._MOVEMENT_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this._MOVEMENT_RATIO,0,1);

                var rotationAngle:number = (Math.abs(fromAngleInDegrees)>360) ? (fromAngleInDegrees%360) : fromAngleInDegrees;
                var balanceAng:number = 360 - rotationAngle;
                if(balanceAng<rotationAngle)
                    rotationAngle =  -balanceAng;

                this.moveEffect(onToOneRatio,newOrigin.copy(),newRadius,rotationAngle);

                return;
            }

            if(ratio <=this._DRAW_RATIO) // MOVEMENT RATIO
            {
                this.moveTo( newOrigin.copy());
                this.expandAndRotate(newRadius,fromAngleInDegrees);
                // now assign all target to actual values

                this._compassRadius = newRadius;
                this._compassOrigin = newOrigin.copy();

                var onToOneRatio:number = PMath.map(ratio,this._MOVEMENT_RATIO,this._DRAW_RATIO,0,1);
                var targetAngle:number = PMath.lerp(fromAngleInDegrees,toAngleInDegrees,onToOneRatio);

                this.internalDrawArc(fromAngleInDegrees,targetAngle);
                this.expandAndRotate(this._compassRadius,targetAngle);

                var textPosition:Point3D = this.getCompassHeadTextPosition();
                if(isNaN(textAngle)==false)
                    this.drawMeasurAngleArcText(textAngle,textPosition);
                else
                    this.drawArcText(fromAngleInDegrees,toAngleInDegrees,textPosition,onToOneRatio);

            }

            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {
                this.commitArc(fromAngleInDegrees, toAngleInDegrees);
                this.compassGroup.removePart(this.textPart);
            }
        }


        private drawArcText(fromAngleInDegrees:number,toAngleInDegrees:number,textPosition:Point3D,onToOneRatio:number):void
        {
            var givenFromAngleInDegrees:number = 360-fromAngleInDegrees;
            var givenToAngleInDegrees:number = givenFromAngleInDegrees + (fromAngleInDegrees-toAngleInDegrees);

            var angleVal:number = PMath.lerp(givenFromAngleInDegrees,givenToAngleInDegrees,onToOneRatio);
            var normalizedAngle:number = PMath.roundDecimal(angleVal,0)%360;
            normalizedAngle = (normalizedAngle<0) ? (360+normalizedAngle) : normalizedAngle;
            var textValue:string = normalizedAngle+"";

            this.compassGroup.removePart(this.textPart);
            this.textPart = this.compassGroup.text(textValue,textPosition,14);
        }


        private drawMeasurAngleArcText(angleVal:number,textPosition:Point3D,textSize:number=14):void
        {
            var textValue:string = PMath.roundDecimal(Math.abs(angleVal),0)+"";

            this.compassGroup.removePart(this.textPart);
            this.textPart = this.compassGroup.text(textValue,textPosition,textSize);
        }

        private getCompassHeadTextPosition():Point3D
        {
            var textPosition:Point3D = this.compassHeadTopCylinderPart.position;
            textPosition = textPosition.moveBack(0.5);
            textPosition = textPosition.moveRight(0.1);
            return textPosition;
        }


        public showOrHide(ratio:number=1)
        {
            //for all geometry parts, call the seTransparecny method
            this._compassHeadTopCylinderPart.setTransparency(ratio);
            this._compassHeadBottomCylinderPart.setTransparency(ratio);
            this._compassHeadCapsulePart.setTransparency(ratio);
            this._compassSkrewRingPart.setTransparency(ratio);
            this._compassSkrewCapsulePart.setTransparency(ratio);

            this.leftEdge.showOrHide(ratio);
            this.rightEdge.showOrHide(ratio);

            this.compassGroup.removePart(this.textPart);
        }


        /** expects value to be from 0 to targetAngleInDegrees (targetAngleInDegrees is generallly the from angle, towards which the compass should move) **/
        private moveEffect(onToOneRatio:number,targetPoint:Point3D,targetRadius:number,targetFromAngleInDegress:number)
        {
            var newDist:Point3D = this._compassOrigin.lerp(targetPoint,onToOneRatio);

            this.moveTo(newDist);

            this.expandAndRotate(targetRadius*onToOneRatio,targetFromAngleInDegress*onToOneRatio); //
        }


        private moveWithSameRadiusAndRotationEffect(onToOneRatio:number,targetPoint:Point3D,targetRadius:number,targetFromAngleInDegress:number)
        {
            var newDist:Point3D = this._compassOrigin.lerp(targetPoint,onToOneRatio);

            this.moveTo(newDist);

            this.expandAndRotate(targetRadius,targetFromAngleInDegress); //target radius and angle are not in
        }

        private moveWithSameRadiusEffect(onToOneRatio:number,targetPoint:Point3D,targetRadius:number,targetFromAngleInDegress:number)
        {
            var newDist:Point3D = this._compassOrigin.lerp(targetPoint,onToOneRatio);

            this.moveTo(newDist);

            this.expandAndRotate(targetRadius,targetFromAngleInDegress*onToOneRatio); //target radius alone is not interpolated
        }

        public get arcColor():number
        {
            return this._arcColor;
        }

        public set arcColor(value:number)
        {
            this._arcColor = value;
        }

        public get compassGroup():GeometryGroup
        {
            return this._compassGroup;
        }

        public set compassGroup(value:GeometryGroup)
        {
            this._compassGroup = value;
        }

        public get compassHeadTopCylinderPart():GeometryPart
        {
            return this._compassHeadTopCylinderPart;
        }

        public set compassHeadTopCylinderPart(value:GeometryPart)
        {
            this._compassHeadTopCylinderPart = value;
        }

        public get compassHeadBottomCylinderPart():GeometryPart
        {
            return this._compassHeadBottomCylinderPart;
        }

        public set compassHeadBottomCylinderPart(value:GeometryPart)
        {
            this._compassHeadBottomCylinderPart = value;
        }

        public get compassHeadCapsulePart():GeometryPart
        {
            return this._compassHeadCapsulePart;
        }

        public set compassHeadCapsulePart(value:GeometryPart)
        {
            this._compassHeadCapsulePart = value;
        }

        public get compassSkrewRingPart():GeometryPart
        {
            return  this._compassSkrewRingPart;
        }

        public set compassSkrewRingPart(value:GeometryPart)
        {
            this._compassSkrewRingPart = value;
        }

        public get compassSkrewCapsulePart():GeometryPart
        {
            return  this._compassSkrewCapsulePart;
        }

        public set compassSkrewCapsulePart(value:GeometryPart)
        {
            this. _compassSkrewCapsulePart = value;
        }

        public get leftEdge():CompassEdge
        {
            return this._leftEdge;
        }

        public set leftEdge(value:CompassEdge)
        {
            this._leftEdge = value;
        }

        public get rightEdge():CompassEdge
        {
            return this._rightEdge;
        }

        public set rightEdge(value:CompassEdge)
        {
            this._rightEdge = value;
        }

        private canStartFromOldPosition(copyStartPt:Point3D,copyEndPt:Point3D,newOrigin:Point3D,fromAngleInDegrees:number, toAngleInDegrees:number,ratio:number):boolean
        {
            var currentShapeItem:BaseShapeItem = new ArcByDistanceShapeItem(copyStartPt,copyEndPt,newOrigin,fromAngleInDegrees, toAngleInDegrees);
            if(currentShapeItem.equals(this.previousShapeItem))
            {
               return true;
            }
           return false;
        }

        public skipCopyStepAndRemapIfApplicable(copyStartPt:Point3D,copyEndPt:Point3D,newOrigin:Point3D,fromAngleInDegrees:number, toAngleInDegrees:number,ratio:number):number
        {
            var currentShapeItem:BaseShapeItem = new ArcByDistanceShapeItem(copyStartPt,copyEndPt,newOrigin,fromAngleInDegrees, toAngleInDegrees);
            if(currentShapeItem.equals(this.previousShapeItem))
            {
               ratio = PMath.map(ratio,0,1,0.7,1);//start from 0.7, skip 0.4
            }

            ratio = this.arcByDistanceBoundryContainer.constrain(ratio);
            return ratio;
        }


        /**
         *
         * if we reach this method,lastMovedPoint will be available
         * @param copyStartPt
         * @param copyEndPt
         * @param newOrigin
         * @param fromAngleInDegrees
         * @param toAngleInDegrees
         * @param ratio
         */
        public drawArcByRetainedDistance(copyStartPt:Point3D,copyEndPt:Point3D,newOrigin:Point3D,fromAngleInDegrees:number, toAngleInDegrees:number,ratio:number)
        {
            ratio =  this.arcByDistanceBoundryContainer.constrain(ratio);

            //move compass to the copy start location
            //rotate compass with the given copy points angle
            //expand compass from copyStart to copyEnd pt
            if(ratio<=0.4)
            {
                var onToOneRatio:number = PMath.map(ratio,0,0.4,0,1);
                var givenRotationAngle:number = this.getNormalizedAngle(copyStartPt,copyEndPt);
                var givenRadius:number = copyStartPt.distanceTo(copyEndPt)/2;

                this.moveWithSameRadiusAndRotationEffect(onToOneRatio,newOrigin,givenRadius,this._currentRotation);
                return;
            }


            if(ratio<=0.7)//rotate with the given fromAngle
            {
                var fromAngle:number = this._currentRotation%360;
                var toAngle:number = fromAngleInDegrees%360;

                /*var totalRotationAng:number = toAngle - fromAngle;
                var balanceAng:number = 360 - totalRotationAng;
                if(balanceAng<totalRotationAng)
                    toAngle =  -balanceAng;*/

                var onToOneRatio:number = PMath.map(ratio,0.4,0.7,0,1);
                var givenRotationAngle:number = PMath.lerp(fromAngle,toAngle,onToOneRatio);

                this.moveTo(newOrigin);
                this.expandAndRotate(this._compassRadius,givenRotationAngle);

                return;
            }


            if(ratio<=1)// draw arc upto toANgle
            {
                var onToOneRatio:number = PMath.map(ratio,0.7,1,0,1);
                var targetAngle:number = PMath.lerp(fromAngleInDegrees,toAngleInDegrees,onToOneRatio);

                this.moveTo(newOrigin);
                this.internalDrawArc(fromAngleInDegrees,targetAngle);
                this.expandAndRotate(this._compassRadius,targetAngle);

                var textPosition:Point3D = this.getCompassHeadTextPosition();
                this.drawArcText(fromAngleInDegrees,toAngleInDegrees,textPosition,onToOneRatio);
            }


            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {
                this.commitArc(fromAngleInDegrees, toAngleInDegrees);
                this.compassGroup.removePart(this.textPart);
                this.arcByDistanceBoundryContainer.reset();
                this.previousShapeItem = new ArcByDistanceShapeItem(copyStartPt,copyEndPt,newOrigin,fromAngleInDegrees, toAngleInDegrees);
            }
        }


        public drawArcByDistance(copyStartPt:Point3D,copyEndPt:Point3D,newOrigin:Point3D,fromAngleInDegrees:number, toAngleInDegrees:number,ratio:number)
        {
           var canStartFromOldPosition:boolean = this.canStartFromOldPosition(copyStartPt,copyEndPt,newOrigin,fromAngleInDegrees, toAngleInDegrees,ratio);

            if(canStartFromOldPosition)
            {
                this.drawArcByRetainedDistance(copyStartPt,copyEndPt,newOrigin,fromAngleInDegrees, toAngleInDegrees,ratio);
                return;
            }

            ratio =  this.arcByDistanceBoundryContainer.constrain(ratio);

            //move compass to the copy start location
            //rotate compass with the given copy points angle
            //expand compass from copyStart to copyEnd pt
            if(ratio<=0.4)
            {
                var onToOneRatio:number = PMath.map(ratio,0,0.4,0,1);
                var givenRotationAngle:number = this.getNormalizedAngle(copyStartPt,copyEndPt);
                var givenRadius:number = copyStartPt.distanceTo(copyEndPt)/2;

                this.moveEffect(onToOneRatio,copyStartPt.copy(),givenRadius,givenRotationAngle);
                return;
            }


            if(ratio<=0.5)//take rest
            {
                return;
            }


            if(ratio<=0.7)//move to the given start location
            {
                var onToOneRatio:number = PMath.map(ratio,0.5,0.7,0,1);

                var givenRotationAngle:number = this.getNormalizedAngle(copyStartPt,copyEndPt);
                var newOriginPt:Point3D = copyStartPt.lerp(newOrigin,onToOneRatio);

                this.moveTo(newOriginPt);
                this.expandAndRotate(this._compassRadius,givenRotationAngle);

                return;
            }

            if(ratio<=0.85)//rotate with the given fromAngle
            {
                //var fromAngle:number = this.getNormalizedAngle(copyStartPt,copyEndPt);
                var fromAngle:number = this._currentRotation;
                var toAngle:number = fromAngleInDegrees%360;

                var totalRotationAng:number = toAngle;
                var balanceAng:number = 360 - totalRotationAng;
                if(balanceAng<totalRotationAng)
                    toAngle =  -balanceAng;

                var onToOneRatio:number = PMath.map(ratio,0.7,0.85,0,1);
                var givenRotationAngle:number = PMath.lerp(fromAngle,toAngle,onToOneRatio);

                this.moveTo(newOrigin);
                this.expandAndRotate(this._compassRadius,givenRotationAngle);

                return;
            }


            if(ratio<=1)// draw arc upto toANgle
            {
                var onToOneRatio:number = PMath.map(ratio,0.85,1,0,1);
                var targetAngle:number = PMath.lerp(fromAngleInDegrees,toAngleInDegrees,onToOneRatio);

                this.moveTo(newOrigin);
                this.internalDrawArc(fromAngleInDegrees,targetAngle);
                this.expandAndRotate(this._compassRadius,targetAngle);

                var textPosition:Point3D = this.getCompassHeadTextPosition();
                this.drawArcText(fromAngleInDegrees,toAngleInDegrees,textPosition,onToOneRatio);
            }


            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {
                this.commitArc(fromAngleInDegrees, toAngleInDegrees);
                this.compassGroup.removePart(this.textPart);
                this.arcByDistanceBoundryContainer.reset();
                this.previousShapeItem = new ArcByDistanceShapeItem(copyStartPt,copyEndPt,newOrigin,fromAngleInDegrees, toAngleInDegrees);
            }
        }

        private getNormalizedAngle(fromPt:Point3D,toPoint:Point3D):number
        {
            var baseLine:ProcessingLine2D = new ProcessingLine2D(fromPt.x, fromPt.y, toPoint.x, toPoint.y);
            var rotationAngle:number = PMath.degrees( baseLine.angle());

            var balanceAng:number = 360 - rotationAngle;
            if(balanceAng<rotationAngle)
                rotationAngle =  -balanceAng;

            return rotationAngle;
        }


        public measureDistance(startPt:Point3D,endPt:Point3D,originPt:Point3D,ratio:number)
        {
            ratio = this.measureDistaceBoundryContainer.constrain(ratio);

            if(ratio<=0.4)//measure distance from start to end
            {
                var onToOneRatio:number = PMath.map(ratio,0,0.4,0,1);

                var givenRotationAngle:number = this.getNormalizedAngle(startPt,endPt);
                var givenRadius:number = startPt.distanceTo(endPt)/2;

                this.moveEffect(onToOneRatio,startPt,givenRadius,givenRotationAngle);
                return;
            }


            if(ratio<=0.5)//take rest
            {
                return;
            }


            if(ratio<=1)// show measured distance at origin position
            {
                var onToOneRatio:number = PMath.map(ratio,0.5,1,0,1);

                var givenRotationAngle:number = this.getNormalizedAngle(startPt,endPt);
                var givenRadius:number = startPt.distanceTo(endPt)/2;

                this.moveTo(originPt);
                this.expandAndRotate(givenRadius,-onToOneRatio*givenRotationAngle);
            }

            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {
                this.measureDistaceBoundryContainer.reset();
            }
        }


        public reset():void
        {
            this.moveTo(this._restingOrigin);
            this.expandAndRotate(0.1,0);

            this._currentExpansion = 0;
            this._currentRotation = 0;
            this._expandInDegress = 0;
            this.previousShapeItem = null;

            this.arcByDistanceBoundryContainer.reset();
            this.measureDistaceBoundryContainer.reset();
            this.arcByPencilBoundryConstrainer.reset();
        }

        public clearPreviousShapeItem():void
        {
            this.previousShapeItem = null;
        }

        public removeInternalDrawings():void
        {
            this.compassGroup.removePart(this.textPart);
            this.arcOutputInstanceManager.clearAll();
        }


        public directCommitArc(origin:Point3D,radius:number,fromAngleInDegrees:number, toAngleInDegrees:number):void
        {
            this._compassOrigin = origin;
            this._compassRadius = radius;
            this.commitArc(fromAngleInDegrees, toAngleInDegrees);
        }


        public drawArcUsingPencil(arcObject:ProcessingCircle,textAngle:number,ratio:number)
        {
            ratio = this.arcByPencilBoundryConstrainer.constrain(ratio);
            var fromAngleInDegrees:number = arcObject.fromAngle;
            var toAngleInDegrees:number = arcObject.toAngle;

            if(ratio<=0.6)
            {
                var fromAngle:number = PMath.radians(fromAngleInDegrees);
                var startPt:Point = arcObject.pointAt(fromAngle);

                this.pencilObj.drawArc(new Point3D(startPt.x,startPt.y),ratio);
                return;
            }

            if(ratio<=0.9)
            {
                var onToOneRatio:number = PMath.map(ratio,0.6,0.9,0,1);

                // now assign all target to actual values
                this._compassRadius = arcObject.radius/2;
                this._compassOrigin = new Point3D(arcObject.ox,arcObject.oy);

                var targetAngle:number = PMath.lerp(fromAngleInDegrees,toAngleInDegrees,onToOneRatio);
                this.internalDrawArc(fromAngleInDegrees,targetAngle);

                var currentPt:Point = arcObject.pointAt(PMath.radians(targetAngle));
                this.pencilObj.drawArc(new Point3D(currentPt.x,currentPt.y),ratio);

                var currentTextAngle:number = PMath.map(onToOneRatio,0, 1, 0, textAngle);
                var textRadius:number = ((currentTextAngle+"").length>2) ? 5.5 : 5.2;
                var xPos:number = arcObject.ox + (textRadius * Math.cos(PMath.radians(targetAngle)));
                var yPos:number = arcObject.oy + (textRadius * Math.sin(PMath.radians(targetAngle)));
                var textPosition:Point3D = new Point3D(xPos,yPos);

                this.drawMeasurAngleArcText(currentTextAngle,textPosition,30);

                return;
            }

            if(ratio<=1)
            {
                var endAngle:number = PMath.radians(toAngleInDegrees);
                var endPt:Point = arcObject.pointAt(endAngle);

                this.pencilObj.drawArc(new Point3D(endPt.x,endPt.y),ratio);
            }

            if(ratio==1)
            {
                this.commitArc(fromAngleInDegrees, toAngleInDegrees);
                this.arcByPencilBoundryConstrainer.reset();
            }
        }
    }
}