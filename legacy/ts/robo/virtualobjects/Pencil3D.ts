/**
 * Created by Mathdisk on 2/24/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.virtualobjects
{
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import PMath = robo.util.PMath;
    import UI3DScript = robo.geom.UI3DScript;
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Point3D = robo.core.Point3D;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingLine3D = robo.core.ProcessingLine3D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import ColorConstants = robo.util.ColorConstants;
    import Mesh = away.entities.Mesh;
    import BitmapData = away.base.BitmapData;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;

    export  class Pencil3D extends BaseVirtualObject
    {
        private  _topGeoPart:GeometryPart;//cylinder
        private  _bottomStartGeoPart:GeometryPart;//cone
        private  _bottomEndGeoPart:GeometryPart;//cone

        private  _topSmallEgdeGeoPart:GeometryPart;//cylinder
        private  _topBigEgdeGeoPart:GeometryPart;//cylinder

        private  pencilRadius:number = 0.15;
        private  pencilHeight:number = 4;
        private  pencilOrigin:Point3D = new Point3D(8,5,0);

        private  pencilGroup:GeometryGroup;

        private  topPoint:Point3D;
        private  bottomPartStart:Point3D;
        private  bottomPartEnd:Point3D;
        private  mainPartEnd:Point3D;
        private topSmallEdgePoint:Point3D;
        private topBigEdgePoint:Point3D;

        public roboOutputColor:number=ColorConstants.blue;
        private ui3DScript:UI3DScript;
        public outputMesh:Mesh;
        private pencilVerticalMovementConstrainer:BoundryConstrainer;
        private arcOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
            this.pencilVerticalMovementConstrainer = new BoundryConstrainer([0,0.5,1]);

            this.calcualtePoints();
            this.createPencil();
        }

        private calcualtePoints():void
        {
            this.topPoint = new Point3D(this.pencilOrigin.x,this.pencilOrigin.y,this.pencilHeight);
            this.mainPartEnd = this.getTipStart(this.topPoint);

            this.bottomPartEnd = this.getBottomByTop(this.topPoint);
            this.bottomPartStart = this.bottomPartEnd.moveBack(0.3);

            //top egdes
            var smaledgeoffset:number=0.1,bigedgeoffset:number=0.5;
            this.topSmallEdgePoint = this.topPoint.moveBack(smaledgeoffset);//this.bottomPartEnd.lerp(this.topPoint,0.1);
            this.topBigEdgePoint = this.topSmallEdgePoint.moveBack(bigedgeoffset);
        }

        private createPencil():void
        {
            this.pencilGroup = new GeometryGroup(this.ui3DScript);
            this.topGeoPart = this.pencilGroup.cylinder(this.topPoint,this.mainPartEnd,this.pencilRadius,false,false);

            var bottomPartRadius:number = this.pencilRadius*0.35;
            this.bottomStartGeoPart = this.pencilGroup.cone(this.mainPartEnd,this.bottomPartStart,this.pencilRadius,bottomPartRadius);
            this.bottomEndGeoPart = this.pencilGroup.cone(this.bottomPartStart,this.bottomPartEnd,bottomPartRadius);
            this.topSmallEgdeGeoPart = this.pencilGroup.cylinder(this.topPoint,this.topSmallEdgePoint,this.pencilRadius,true,false);
            this.topBigEgdeGeoPart = this.pencilGroup.cylinder(this.topSmallEdgePoint,this.topBigEdgePoint,this.pencilRadius,true,true);

            var pencilColor:number = 0xFF0000;
            var edgeColor:number = 0xF5BA98;
            var niPColor:number = 0x25252D;
            var topSmallEdgeCol:number = 0xffffff;
            var topBigEdgeCol:number = 0x0B61CB;
            this.topGeoPart.color(pencilColor,1);
            this.bottomStartGeoPart.color(edgeColor,1);
            this.bottomEndGeoPart.color(niPColor,1);
            this.topSmallEgdeGeoPart.color(topSmallEdgeCol,1);
            this.topBigEgdeGeoPart.color(topBigEdgeCol,1);
        }

        public get topGeoPart():GeometryPart
        {
            return this._topGeoPart;
        }

        public set topGeoPart(value:GeometryPart)
        {
            this._topGeoPart = value;
        }

        public get bottomStartGeoPart():GeometryPart
        {
            return this._bottomStartGeoPart;
        }

        public set bottomStartGeoPart(value:GeometryPart)
        {
            this. _bottomStartGeoPart = value;
        }

        public get bottomEndGeoPart():GeometryPart
        {
            return this._bottomEndGeoPart;
        }

        public set bottomEndGeoPart(value:GeometryPart)
        {
            this. _bottomEndGeoPart = value;
        }

        public set topSmallEgdeGeoPart(value:GeometryPart)
        {
            this. _topSmallEgdeGeoPart = value;
        }

        public get topSmallEgdeGeoPart():GeometryPart
        {
            return this._topSmallEgdeGeoPart;
        }

        public set topBigEgdeGeoPart(value:GeometryPart)
        {
            this. _topBigEgdeGeoPart = value;
        }

        public get topBigEgdeGeoPart():GeometryPart
        {
            return this._topBigEgdeGeoPart;
        }


        private getBottomByTop(topPt:Point3D):Point3D
        {
            var bottomPt:Point3D = new Point3D(topPt.x,topPt.y,0);

            return bottomPt;
        }


        private getTipStart(topPt:Point3D):Point3D
        {
            var bottomPt:Point3D = this.getBottomByTop(topPt);

            var tipStart:Point3D = bottomPt.lerp(topPt,0.2);// 0.2 from bottom

            return tipStart;
        }

        // dont expose used by Ruler
        public getDirectionVector(toPoint:Point3D,ratio):Point3D
        {
            var currentDirectionVec:Point3D = toPoint.subtract(this.pencilOrigin);
            currentDirectionVec.normalizeSelf();

            var distance:number = toPoint.distanceTo(this.pencilOrigin);
            currentDirectionVec.multiplyScalarSelf(distance*ratio);

            return currentDirectionVec;
        }

        public drawPoint(pt:Point3D,ratio:number=1):void
        {
            var verticalDistance:number = 0.2;
            var currentDirectionVec:Point3D = pt.subtract(this.pencilOrigin);
            var distance:number = pt.distanceTo(this.pencilOrigin);
            currentDirectionVec.normalizeSelf();

            if(ratio<=0.8)
            {
                var onToOneRatio:number = PMath.map(ratio,0,0.8,0,1);
                currentDirectionVec.multiplyScalarSelf(distance*onToOneRatio); // this is the actual distance the objects have to move for now
                currentDirectionVec=currentDirectionVec.moveBack(verticalDistance); //move the pencil a bit up
                this.move(currentDirectionVec);
                return;

            }

            if(ratio<=1)
            {
                var directionSplitRatio:number = PMath.map(ratio,0.8,1,0,1);//give in the range of 0  t0 1

                directionSplitRatio = this.pencilVerticalMovementConstrainer.constrain(directionSplitRatio); // make sure it passes the boundry 0.5

                if(directionSplitRatio<0.5)
                {
                    //move down
                    var onToOneRatio:number = PMath.map(directionSplitRatio,0,0.5,0,1);//first half
                    currentDirectionVec.multiplyScalarSelf(distance);
                    currentDirectionVec=currentDirectionVec.moveFront(verticalDistance*onToOneRatio);
                    this.move(currentDirectionVec);

                }

                //PENCIL_COMMIT_RATIO is 0.5
                if(directionSplitRatio==0.5)// Put the actual point now
                {
                    this.alignTo(pt.copy());
                    this.outputMesh =this.ui3DScript.commitPointMarker(pt);
                    this.virtualObjectsExecutionContext.addOutputMesh(this.outputMesh);

                }

                if(directionSplitRatio>0.5)
                {
                    //move up
                    var onToOneRatio:number = PMath.map(directionSplitRatio,0.5,1,0,1);//second half from 0.5
                    currentDirectionVec.multiplyScalarSelf(distance);
                    currentDirectionVec=currentDirectionVec.moveBack(verticalDistance*onToOneRatio);
                    this.move(currentDirectionVec);
                }

            }

            if(ratio==1)
            {
               this.pencilVerticalMovementConstrainer.reset();
               this.alignTo(pt.copy());
            }
        }


        public alignTo(newDest:Point3D):void // this is the top pont
        {
            this.pencilOrigin = newDest.copy();
            this.calcualtePoints();

            this.topGeoPart.alignTo(this.topPoint,this.mainPartEnd);
            this.bottomStartGeoPart.alignTo(this.mainPartEnd,this.bottomPartStart);
            this.bottomEndGeoPart.alignTo(this.bottomPartStart,this.bottomPartEnd);

            this.topSmallEgdeGeoPart.alignTo(this.topPoint,this.topSmallEdgePoint);
            this.topBigEgdeGeoPart.alignTo(this.topSmallEdgePoint,this.topBigEdgePoint);
        }


        public move(direction:Point3D):void
        {
            this.topGeoPart.moveRight(direction.y); // because of coordinate system y and xa re swapped
            this.topGeoPart.moveForward(direction.x);
            this.topGeoPart.moveUp(direction.z);

            this.bottomStartGeoPart.moveRight(direction.y);
            this.bottomStartGeoPart.moveForward(direction.x);
            this.bottomStartGeoPart.moveUp(direction.z);

            this.bottomEndGeoPart.moveRight(direction.y);
            this.bottomEndGeoPart.moveForward(direction.x);
            this.bottomEndGeoPart.moveUp(direction.z);

            this.topSmallEgdeGeoPart.moveRight(direction.y);
            this.topSmallEgdeGeoPart.moveForward(direction.x);
            this.topSmallEgdeGeoPart.moveUp(direction.z);

            this.topBigEgdeGeoPart.moveRight(direction.y);
            this.topBigEgdeGeoPart.moveForward(direction.x);
            this.topBigEgdeGeoPart.moveUp(direction.z);
        }

        public showOrHide(ratio:number):void
        {
            this.topGeoPart.setTransparency(ratio);
            this.bottomStartGeoPart.setTransparency(ratio);
            this.bottomEndGeoPart.setTransparency(ratio);
            this.topSmallEgdeGeoPart.setTransparency(ratio);
            this.topBigEgdeGeoPart.setTransparency(ratio);

        }

        public reset():void
        {
            //this.pencilOrigin = new Point3D(8,5,0);
            //this.move(this.pencilOrigin);

            this.pencilVerticalMovementConstrainer.reset();
        }

        public getOriginPt():Point3D{

            return this.pencilOrigin;
        }


        public directCommitPoint(pt:Point3D):void
        {
            this.outputMesh = this.ui3DScript.commitPointMarker(pt);
            this.virtualObjectsExecutionContext.addOutputMesh(this.outputMesh);
        }

        public drawArc(pencilPos:Point3D,ratio:number)
        {
            var newDist:Point3D = this.pencilOrigin.lerp(pencilPos,ratio);
            this.alignTo(newDist);
        }
    }
}
