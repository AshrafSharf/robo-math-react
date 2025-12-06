/**
 * Created by rizwan on 3/19/14.
 */
module robo.virtualobjects
{
    import PMath = robo.util.PMath;
    import UI3DScript = robo.geom.UI3DScript
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Point3D = robo.core.Point3D;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingLine3D = robo.core.ProcessingLine3D;
    import Ruler3D = robo.virtualobjects.Ruler3D;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Point = away.geom.Point;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import BitmapData = away.base.BitmapData;
    import SetSquareUVMapper = robo.virtualobjects.SetSquareUVMapper;
    import Mesh = away.entities.Mesh;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;


    export class SetSquare3D extends BaseVirtualObject
    {
        private ui3DScript:UI3DScript;
        private horizontalLength:number;
        private verticalLength:number = 7;// almost fixed

        private origin:Point3D = new Point3D(0,0,0);
        private rootGroup:GeometryGroup;
        public setSquarePart:GeometryPart;

        private PERP_LINE_START_RATIO:number = 0.5;
        private PARALLEL_LINE_START_RATIO:number = 0.8;

        private PERP_SETSQUARE_MOVEMENT:number = 0.3;
        private PERP_SETSQUARE_ROTATE:number = 0.5;
        private PERP_SETSQUARE_REST:number = 0.8;

        private PARALLEL_SETSQUARE_MOVEMENT:number = 0.2;
        private PARALLEL_SETSQUARE_ROTATE:number = 0.35;
        private PARALLEL_RULER_TRANSFORM:number = 0.65;

        private RULER_HIDE_RATIO:number = 0.3;
        private DRAW_LINE_RATIO:number = 0.9;

        private currentRotationInDegress:number = 0;
        private previousRotationInDegrees:number = 0;
        private totalAngleInDeg:number = 0;

        private currentOriginPosition:Point3D;
        private originalFromPoint:Point3D;

        private _rulerObj:Ruler3D;
        private _pencilObj:Pencil3D;

        private perpLineConstrainer:BoundryConstrainer;
        private parallelLineConstrainer:BoundryConstrainer;

        private drawRulerLineConstrainer:BoundryConstrainer;
        private drawSetSquareLineConstrainer:BoundryConstrainer;

        private parallelSetSquareConstrainer1:BoundryConstrainer;
        private parallelSetSquareConstrainer2:BoundryConstrainer;
        private parallelRulerConstrainer:BoundryConstrainer;

        private lineInputs:Point3D[];
        private lineThickness:number = 1;// We have changed from Arc to line
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.initSetSquarePart(ui3DScript);
            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.rootGroup,6);// 6 is internal instances to  manage

            this.perpLineConstrainer = new BoundryConstrainer([0,this.PERP_LINE_START_RATIO,1]);
            this.parallelLineConstrainer = new BoundryConstrainer([0,this.PARALLEL_LINE_START_RATIO,1]);

            this.drawRulerLineConstrainer = new BoundryConstrainer([0,1]);
            this.drawSetSquareLineConstrainer = new BoundryConstrainer([0,this.RULER_HIDE_RATIO,this.DRAW_LINE_RATIO,1]);

            this.parallelSetSquareConstrainer1 = new BoundryConstrainer([0,this.PARALLEL_SETSQUARE_MOVEMENT,this.PARALLEL_SETSQUARE_ROTATE,this.PARALLEL_RULER_TRANSFORM,1]);
            this.parallelSetSquareConstrainer2 = new BoundryConstrainer([0,2.5*this.PARALLEL_SETSQUARE_MOVEMENT,2.5*this.PARALLEL_SETSQUARE_ROTATE,1]);
            this.parallelRulerConstrainer = new BoundryConstrainer([0,0.5,0.7,1]);

        }

        private initSetSquarePart(ui3DScript:UI3DScript):void
        {
            this.ui3DScript = ui3DScript;
            this.rootGroup = new GeometryGroup(ui3DScript);

            var thickness:number = 1;
            var innerOriginPoint:Point3D = new Point3D(this.origin.x+thickness/2,this.origin.y-thickness/2,0);
            var innerLeftPoint:Point3D = innerOriginPoint.copy();
            var innerRightPoint:Point3D = new Point3D(innerOriginPoint.x,innerOriginPoint.y-(this.verticalLength),0);

            var rotatedLeftPoint:Point3D = innerLeftPoint.moveUp(this.verticalLength).rotate(-30,new Point3D(0,0,1),innerRightPoint);
            var verticallyMovedLeftPt:Point3D = innerLeftPoint.moveRight(2*this.verticalLength);
            var line1:ProcessingLine3D = new ProcessingLine3D(rotatedLeftPoint,innerRightPoint);
            var line2:ProcessingLine3D = new ProcessingLine3D(innerLeftPoint,verticallyMovedLeftPt);
            var innerBottomPoint:Point3D = line1.intersect(line2);
            this.horizontalLength = innerLeftPoint.distanceTo(innerBottomPoint);

            var linearExtrudePts:Point3D[] = [];

            var divisions:number = 80;
            for(var i:number=0;i<divisions;i++)
            {
                var ratio:number = PMath.map(i,0,divisions-1,0,1);
                var pt:Point3D = innerLeftPoint.lerp(innerRightPoint,ratio);
                linearExtrudePts.push(pt);
            }


            divisions = 20;
            for(var i:number=0;i<divisions;i++)
            {
                var  ratio:number = PMath.map(i,0,divisions-1,0,1);
                var pt:Point3D = innerBottomPoint.lerp(innerLeftPoint,ratio);
                linearExtrudePts.push(pt);
            }


            linearExtrudePts.push(innerLeftPoint.moveLeft(thickness/2));
            this.setSquarePart =  this.rootGroup.linearExtrude(linearExtrudePts,"Z",0.1,thickness);
            this.setSquarePart.color(0xfff000,1);
            this.setSquarePart.pivot(this.origin);

            var initialPos:Point3D = new Point3D(10,0,0);
            this.setPosition(initialPos);
        }


        private setPosition(newOrigin:Point3D):void
        {
            this.setSquarePart.setPosition(newOrigin);

            this.currentOriginPosition = newOrigin.copy();
        }


        private rotateSquare(angleInDegree:number):void
        {
            var relativeAngleInDeg:number = angleInDegree - this.previousRotationInDegrees;

            this.setSquarePart.relativeYaw(relativeAngleInDeg);

            this.previousRotationInDegrees = angleInDegree;
        }


        public drawPerpLine(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number,ratio:number)
        {
            ratio = this.perpLineConstrainer.constrain(ratio);

            if(ratio<=this.PERP_LINE_START_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.PERP_LINE_START_RATIO,0,1);
                this.alignSetSquarePerpLine(fromPoint,toPoint,inputPt,lineLength,onToOneRatio);
            }


            if(ratio>=this.PERP_LINE_START_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,this.PERP_LINE_START_RATIO,1,0,1);
                this.drawLineUsingRuler(this.lineInputs,onToOneRatio);
            }

            if(ratio==1)
            {
                this.perpLineConstrainer.reset();
            }
        }


        public drawParallelLine(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number,ratio:number)
        {
            ratio = this.parallelLineConstrainer.constrain(ratio);

            if(ratio<=this.PARALLEL_LINE_START_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.PARALLEL_LINE_START_RATIO,0,1);
                this.alignSetSquareParallelLine(fromPoint,toPoint,inputPt,lineLength,onToOneRatio);
            }


            if(ratio>=this.PARALLEL_LINE_START_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,this.PARALLEL_LINE_START_RATIO,1,0,1);
                this.drawLineUsingSetSquare(fromPoint,toPoint,inputPt,this.lineInputs,onToOneRatio);
            }

            if(ratio==1)
            {
                this.parallelLineConstrainer.reset();
            }
        }


        private validateLineInputs(lineInputs:Point3D[]):Point3D[]
        {
            var setSquarePos:Point3D = this.setSquarePart.position;
            var originPoint:Point3D = setSquarePos;
            var inclinedPt:Point3D = this.getInclinedPoint(originPoint);
            var oppositeInclinedSetSquarePt:Point = new Point(inclinedPt.x,inclinedPt.y);

            var fromPoint:Point3D = setSquarePos;
            var toPoint:Point3D = this.getRotatedOppositeSidePoint(originPoint);
            var lineObj:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);

            var oppositeEdgeRulerPt:Point =  this.rulerObj.getOppositeEdgePoint(lineInputs[0],lineInputs[1]);
            if(lineObj.isInside(oppositeEdgeRulerPt)!=lineObj.isInside(oppositeInclinedSetSquarePt))
            {
                return lineInputs;
            }
            this.rulerObj.drawLineAsReverse = true;
            return lineInputs.reverse();
        }




        private drawLineUsingRuler(lineInputs:Point3D[],ratio:number)
        {
            ratio = this.drawRulerLineConstrainer.constrain(ratio);
            this.rulerObj.drawLine(lineInputs[0],lineInputs[1],ratio);

            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {
                this.drawRulerLineConstrainer.reset();
                this.rulerObj.drawLineAsReverse = false;
            }
        }


        private  getPerpLineInputs(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number):Point3D[]
        {
            var lineObj:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var perpLinePts:Point[] =  lineObj.getPerpLinePassingThroughPoint(new Point(inputPt.x,inputPt.y),lineLength);

            var pt1:Point = perpLinePts[0];
            var pt2:Point = perpLinePts[1];

            var inputs:Point3D[] = [new Point3D(pt1.x,pt1.y),new Point3D(pt2.x,pt2.y)];
            return inputs;
        }


        private  getParallelLineInputs(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number):Point3D[]
        {
            var lineObj:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var perpLinePts:Point[]= lineObj.getParallelLinePassingThroughPoint(new Point(inputPt.x,inputPt.y),lineLength);

            var pt1:Point = perpLinePts[0];
            var pt2:Point = perpLinePts[1];

            var inputs:Point3D[] = [new Point3D(pt1.x,pt1.y),new Point3D(pt2.x,pt2.y)];
            return inputs;
        }


        private alignSetSquarePerpLine(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number,ratio:number):void
        {
            if(ratio==0)
            {
                this.currentRotationInDegress = this.calculateRotationAngle(fromPoint,toPoint,inputPt,90);
                this.totalAngleInDeg += this.currentRotationInDegress;

                this.showOrHide(1);
                this.originalFromPoint = this.currentOriginPosition;
            }

            if(ratio<=this.PERP_SETSQUARE_MOVEMENT)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.PERP_SETSQUARE_MOVEMENT,0,1);
                var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
                var newFromPoint:Point3D = this.originalFromPoint.lerp(projectPoint,onToOneRatio);
                this.setPosition(newFromPoint);
                return;
            }


            if(ratio<=this.PERP_SETSQUARE_ROTATE)
            {
                var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
                this.setPosition(projectPoint);

                var onToOneRatio:number = PMath.map(ratio,this.PERP_SETSQUARE_MOVEMENT,this.PERP_SETSQUARE_ROTATE,0,1);
                var angleInDegrees:number = (this.currentRotationInDegress*onToOneRatio);
                this.rotateSquare(angleInDegrees);

                return;
            }

            if(ratio<=this.PERP_SETSQUARE_REST)
            {
                this.rotateSquare(this.currentRotationInDegress);
                return;
            }

            if(ratio==1)
            {
                this.previousRotationInDegrees = 0;

                var perpLineInputs:Point3D[] = this.getPerpLineInputs(fromPoint,toPoint,inputPt,lineLength);
                this.lineInputs = this.validateLineInputs(perpLineInputs);
            }
        }


        /*private alignSetSquareParallelLine(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number,ratio:number):void
        {
            if(ratio==0)
            {
                this.currentRotationInDegress = this.calculateRotationAngle(fromPoint,toPoint,inputPt,0);
                this.totalAngleInDeg += this.currentRotationInDegress;

                this.showOrHide(1);
                this.originalFromPoint = this.currentOriginPosition;
            }

            if(ratio<=this.PERP_SETSQUARE_MOVEMENT)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.PERP_SETSQUARE_MOVEMENT,0,1);
                var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
                var newFromPoint:Point3D = this.originalFromPoint.lerp(projectPoint,onToOneRatio);
                this.setPosition(newFromPoint);

                return;
            }


            if(ratio<=this.PERP_SETSQUARE_ROTATE)
            {
                var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
                this.setPosition(projectPoint);
                this.originalFromPoint = this.currentOriginPosition;

                var onToOneRatio:number = PMath.map(ratio,this.PERP_SETSQUARE_MOVEMENT,this.PERP_SETSQUARE_ROTATE,0,1);
                var angleInDegrees:number = (this.currentRotationInDegress*onToOneRatio);
                this.rotateSquare(angleInDegrees);
                return;
            }

            if(ratio<=this.PERP_SETSQUARE_REST)
            {
                this.rotateSquare(this.currentRotationInDegress);

                var onToOneRatio:number = PMath.map(ratio,this.PERP_SETSQUARE_ROTATE,this.PERP_SETSQUARE_REST,0,1);
                var newOriginPos:Point3D = this.calculateOffsetOriginPoint(fromPoint,toPoint,inputPt);
                var newFromPoint:Point3D = this.originalFromPoint.lerp(newOriginPos,onToOneRatio);
                this.setPosition(newFromPoint);

                return;
            }

            if(ratio<=1)
            {
                var newOriginPos:Point3D = this.calculateOffsetOriginPoint(fromPoint,toPoint,inputPt);
                this.setPosition(newOriginPos);
            }

            if(ratio==1)
            {
                var parallelLineInputs:Point3D[] = this.getParallelLineInputs(fromPoint,toPoint,inputPt,lineLength);
                this.lineInputs = this.validateLineInputs(parallelLineInputs);

                this.previousRotationInDegrees = 0;
            }
        }*/



        private calculateRotationAngle(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,standardAngle:number):number
        {
            var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
            var inclinedPoint:Point3D = this.getInclinedPoint(projectPoint);
            var towardsPoint:Point3D = inputPt.copy();

            if(this.isPointsAreSame(projectPoint,towardsPoint)==true)
            {
                towardsPoint = this.calculateNormalPt(fromPoint,toPoint,projectPoint);
            }

            var angleInDegrees:number = this.findAngleBetweenThreePoints(inclinedPoint,projectPoint,towardsPoint,standardAngle);
            return angleInDegrees;
        }


        private  getProjectPoint(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D):Point3D
        {
            var lineObj:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var outputPt:Point = lineObj.project(inputPt.x,inputPt.y);
            return new Point3D(outputPt.x,outputPt.y,0);
        }


        private  getInclinedPoint(originPos:Point3D):Point3D
        {
            var angleInradians:number = PMath.radians(this.totalAngleInDeg);
            var xPos:number = originPos.x + (this.horizontalLength*Math.cos(angleInradians));
            var yPos:number = originPos.y + (this.horizontalLength*Math.sin(angleInradians));
            return new Point3D(xPos,yPos,0);
        }


        private findAngleBetweenThreePoints(inclinedPoint:Point3D,projectPoint:Point3D,towardsPoint:Point3D,standardAngle:number):number
        {
            var angleInradians:number = Geometric2DUtil.angle(inclinedPoint.x,inclinedPoint.y,projectPoint.x,projectPoint.y,towardsPoint.x,towardsPoint.y);
            var angleInDegrees:number = PMath.degrees(angleInradians) + standardAngle;

            if(angleInDegrees>360)
            {
                angleInDegrees -= 360;
            }

            var balanceAng:number = 360 - angleInDegrees;
            if(balanceAng<angleInDegrees)
                return -balanceAng;

            return angleInDegrees;
        }



        private isPointsAreSame(projectPt:Point3D,throughPt:Point3D):boolean
        {
            var dist:number = projectPt.distanceTo(throughPt);

            if(PMath.roundDecimal(dist,1)==0)
            {
                return true;
            }
            return false;
        }


        private  calculateNormalPt(fromPoint:Point3D,toPoint:Point3D,projectPoint:Point3D):Point3D
        {
            var leftPoint:Point3D = (fromPoint.x < toPoint.x) ? fromPoint : toPoint;
            var rightPoint:Point3D = (fromPoint.x < toPoint.x) ? toPoint : fromPoint;

            var lineObj:ProcessingLine2D = new ProcessingLine2D(leftPoint.x,leftPoint.y,rightPoint.x,rightPoint.y);
            var perpLine:ProcessingLine2D = lineObj.perp(new Point(projectPoint.x,projectPoint.y));
            perpLine = perpLine.normalize(this.verticalLength);

            var normal:Point3D = new Point3D(perpLine.x2,perpLine.y2,0);
            return normal;
        }


        private  calculateOffsetOriginPoint(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D):Point3D
        {
            var lineObj:ProcessingLine2D = new ProcessingLine2D(fromPoint.x,fromPoint.y,toPoint.x,toPoint.y);
            var parallelLine:ProcessingLine2D = lineObj.parallel(inputPt.x,inputPt.y);

            var normalizedLine1:ProcessingLine2D = parallelLine.normalize(this.verticalLength/2);
            var endPoint1:Point3D = new Point3D(normalizedLine1.x2,normalizedLine1.y2);

            var normalizedLine2:ProcessingLine2D = parallelLine.normalize(-this.verticalLength/2);
            var endPoint2:Point3D = new Point3D(normalizedLine2.x2,normalizedLine2.y2);

            var inclinedPoint:Point3D =  this.getRotatedOppositeSidePoint(endPoint1);
            if(this.isPointsAreSame(inclinedPoint,endPoint2)==true)
            {
                return endPoint1;
            }
            return endPoint2;
        }


        private getRotatedOppositeSidePoint(originPos:Point3D):Point3D
        {
            var angleInradians:number = PMath.radians(this.totalAngleInDeg-90);
            var xPos:number = originPos.x + (this.verticalLength*Math.cos(angleInradians));
            var yPos:number = originPos.y + (this.verticalLength*Math.sin(angleInradians));
            return new Point3D(xPos,yPos,0);
        }


        public showOrHide(ratio:number):void
        {
            //ratio = Math.min(this.maximumOpacity,ratio);
            this.setSquarePart.setTransparency(ratio);
        }


        public attachImage(imageBitmapData:BitmapData):void
        {
            this.setSquarePart.attachImage(imageBitmapData);

            var uvArray:number[] = this.setSquarePart.getUVData();
            var setSquareUVMapper:SetSquareUVMapper = new SetSquareUVMapper();
            setSquareUVMapper.fillUVData(uvArray);

            this.setSquarePart.updateUVData(uvArray);
        }


        public get rulerObj():Ruler3D
        {
            return this._rulerObj;
        }

        public set rulerObj(value:Ruler3D)
        {
            this._rulerObj = value;
        }


        public reset():void
        {
            this.setSquarePart.clearRotation();

            var initialPos:Point3D = new Point3D(10,0,0);
            this.setPosition(initialPos);

            this.totalAngleInDeg = 0;
            this.currentRotationInDegress = 0;
            this.previousRotationInDegrees = 0;

            this.perpLineConstrainer.reset();
            this.parallelLineConstrainer.reset();

            this.drawRulerLineConstrainer.reset();
            this.drawSetSquareLineConstrainer.reset();

            this.parallelSetSquareConstrainer1.reset();
            this.parallelSetSquareConstrainer2.reset();
            this.parallelRulerConstrainer.reset();
        }


        public directCommitPerpLine(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number):void
        {
            var perpLineInputs:Point3D[] = this.getPerpLineInputs(fromPoint,toPoint,inputPt,lineLength);
            var lineInput:Point3D[] = this.validateLineInputs(perpLineInputs);

            var fromPt:Point3D = <Point3D>lineInput[0];
            var toPt:Point3D = <Point3D>lineInput[1];
            this.rulerObj.directCommitLine(fromPt,toPt);  
        }

        public directCommitParallelLine(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number):void
        {
            var parallellineInputs:Point3D[] = this.getParallelLineInputs(fromPoint,toPoint,inputPt,lineLength);
            var lineInput:Point3D[] = this.validateLineInputs(parallellineInputs);

            var fromPt:Point3D = <Point3D>lineInput[0];
            var toPt:Point3D = <Point3D>lineInput[1];
            this.directCommitLine(fromPt,toPt);
        }


        public get pencilObj():Pencil3D
        {
            return this._pencilObj;
        }

        public set pencilObj(value:Pencil3D)
        {
            this._pencilObj = value;
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
            var previewLinePart:GeometryPart =  this.rootGroup.line(fromPoint,toPoint,this.lineThickness);

            this.lineOutputInstanceManager.manageMesh(previewLinePart);
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


        private alignSetSquareParallelLine(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number,ratio:number):void
        {
            var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
            var distance:number = projectPoint.distanceTo(inputPt);

            if(PMath.isEqual(distance,0,0.01)){
                this.alignSetSquareParallelLineWithOutRuler(fromPoint,toPoint,inputPt,lineLength,ratio);
            }else
                this.alignSetSquareParallelLineWithRuler(fromPoint,toPoint,inputPt,lineLength,ratio);

        }

        private alignSetSquareParallelLineWithRuler(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number,ratio:number):void
        {
            ratio = this.parallelSetSquareConstrainer1.constrain(ratio);

            if(ratio==0)
            {
                this.rulerObj.showOrHide(1);
                this.currentRotationInDegress = this.calculateRotationAngle(fromPoint,toPoint,inputPt,0);
                this.totalAngleInDeg += this.currentRotationInDegress;
                this.originalFromPoint = this.currentOriginPosition;
            }

            if(ratio<=this.PARALLEL_SETSQUARE_MOVEMENT)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.PARALLEL_SETSQUARE_MOVEMENT,0,1);
                var projectPoint:Point3D = this.getOffsetProjectPoint(fromPoint,toPoint,inputPt);
                var newFromPoint:Point3D = this.originalFromPoint.lerp(projectPoint,onToOneRatio);
                this.rulerObj.showOrHide(1);
                this.setPosition(newFromPoint);

                return;
            }


            if(ratio<=this.PARALLEL_SETSQUARE_ROTATE)
            {
                var offsetProjectPoint:Point3D = this.getOffsetProjectPoint(fromPoint,toPoint,inputPt);
                this.setPosition(offsetProjectPoint);
                this.originalFromPoint = this.currentOriginPosition;

                var onToOneRatio:number = PMath.map(ratio,this.PARALLEL_SETSQUARE_MOVEMENT,this.PARALLEL_SETSQUARE_ROTATE,0,1);
                var angleInDegrees:number = (this.currentRotationInDegress*onToOneRatio);
                this.rotateSquare(angleInDegrees);

                return;
            }

            if(ratio<this.PARALLEL_RULER_TRANSFORM)
            {
                var onToOneRatio:number = PMath.map(ratio,this.PARALLEL_SETSQUARE_ROTATE,this.PARALLEL_RULER_TRANSFORM,0,1);
                this.rotateSquare(this.currentRotationInDegress);

                var startPt:Point3D = this.currentOriginPosition;
                var endPt:Point3D = this.getInclinedPoint(startPt);
                this.rulerObj.transformRuler(startPt,endPt,onToOneRatio);

                return;
            }

            if(ratio<=1)
            {
                var onToOneRatio:number = PMath.map(ratio,this.PARALLEL_RULER_TRANSFORM,1,0,1);

                this.rulerObj.resetTransformConstrainer();
                this.translateSetSquareWithRuler(fromPoint,toPoint,inputPt,onToOneRatio);
            }


            if(ratio==1)
            {
                var parallelLineInputs:Point3D[] = this.getParallelLineInputs(fromPoint,toPoint,inputPt,lineLength);
                this.lineInputs = this.validateLineInputs(parallelLineInputs);

                this.previousRotationInDegrees = 0;
                this.parallelSetSquareConstrainer1.reset();
                this.rulerObj.resetTranslateConstrainer();
            }
        }


        private alignSetSquareParallelLineWithOutRuler(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineLength:number,ratio:number):void
        {
            var SETSQUARE_MOVEMENT:number = 2.5*this.PARALLEL_SETSQUARE_MOVEMENT;
            var SETSQUARE_ROTATE:number = 2.5*this.PARALLEL_SETSQUARE_ROTATE;

            ratio = this.parallelSetSquareConstrainer2.constrain(ratio);

            if(ratio==0)
            {
                this.currentRotationInDegress = this.calculateRotationAngle(fromPoint,toPoint,inputPt,0);
                this.totalAngleInDeg += this.currentRotationInDegress;
                this.originalFromPoint = this.currentOriginPosition;
            }

            if(ratio<=SETSQUARE_MOVEMENT)
            {
                var onToOneRatio:number = PMath.map(ratio,0,SETSQUARE_MOVEMENT,0,1);
                var projectPoint:Point3D = this.getOffsetProjectPoint(fromPoint,toPoint,inputPt);
                var newFromPoint:Point3D = this.originalFromPoint.lerp(projectPoint,onToOneRatio);
                this.setPosition(newFromPoint);

                return;
            }


            if(ratio<=SETSQUARE_ROTATE)
            {
                var offsetProjectPoint:Point3D = this.getOffsetProjectPoint(fromPoint,toPoint,inputPt);
                this.setPosition(offsetProjectPoint);
                this.originalFromPoint = this.currentOriginPosition;

                var onToOneRatio:number = PMath.map(ratio,SETSQUARE_MOVEMENT,SETSQUARE_ROTATE,0,1);
                var angleInDegrees:number = (this.currentRotationInDegress*onToOneRatio);
                this.rotateSquare(angleInDegrees);

                return;
            }


            if(ratio==1)
            {
                var parallelLineInputs:Point3D[] = this.getParallelLineInputs(fromPoint,toPoint,inputPt,lineLength);
                this.lineInputs = this.validateLineInputs(parallelLineInputs);

                this.previousRotationInDegrees = 0;
                this.parallelSetSquareConstrainer2.reset();
            }
        }




        private translateSetSquareWithRuler(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,ratio:number):void
        {
            ratio = this.parallelRulerConstrainer.constrain(ratio);

            var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
            var directionPt:Point3D = inputPt.subtract(projectPoint);

            var setSquareLen:number = 6;

            if(ratio<=0.5)
            {
                if(directionPt.length()>setSquareLen)
                {
                    directionPt.normalizeSelf();
                    directionPt.multiplyScalarSelf(setSquareLen);
                }

                var startPt:Point3D = this.originalFromPoint;
                var endPt:Point3D = startPt.add(directionPt);

                var onToOneRatio:number = PMath.map(ratio,0,0.5,0,1);
                var newFromPoint:Point3D = startPt.lerp(endPt,onToOneRatio);
                this.setPosition(newFromPoint);

                return;
            }


            if(ratio<=0.7)
            {
                //ruler part
                var normalizeValue:number = directionPt.length();
                if(normalizeValue>setSquareLen)
                {
                    normalizeValue = setSquareLen;

                    var cloneDirPt:Point3D = directionPt.clone();
                    cloneDirPt.normalizeSelf();
                    cloneDirPt.multiplyScalarSelf(normalizeValue);

                    var startPt:Point3D = this.originalFromPoint.add(cloneDirPt);
                    var endPt:Point3D = this.originalFromPoint.add(directionPt);

                    var onToOneRatio:number = PMath.map(ratio,0.5,0.7,0,1);
                    this.rulerObj.translateRuler(startPt,endPt,onToOneRatio);
                }

                return;
            }

            if(ratio<=1)
            {
                var cloneDirPt:Point3D = directionPt.clone();
                var normalizeValue:number = directionPt.length();
                if(normalizeValue>setSquareLen)
                {
                    normalizeValue = setSquareLen;
                }
                cloneDirPt.normalizeSelf();
                cloneDirPt.multiplyScalarSelf(normalizeValue);

                var startPt:Point3D = this.originalFromPoint.add(cloneDirPt);
                var endPt:Point3D = this.originalFromPoint.add(directionPt);

                var onToOneRatio:number = PMath.map(ratio,0.7,1,0,1);
                var newFromPoint:Point3D = startPt.lerp(endPt,onToOneRatio);
                this.setPosition(newFromPoint);
            }

            if(ratio==1)
            {
                this.parallelRulerConstrainer.reset();
            }
        }


        private getOffsetProjectPoint(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D):Point3D
        {
            var lineDirectionPt:Point3D = toPoint.subtract(fromPoint);
            lineDirectionPt.normalizeSelf();
            var scalarValue:number = 1.2 + (this.verticalLength/2);
            lineDirectionPt.multiplyScalarSelf(scalarValue);

            var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
            var offsetProjectPt:Point3D = projectPoint.subtract(lineDirectionPt);
            var inclinedPt:Point3D = this.getRotatedOppositeSidePoint(offsetProjectPt);

            var lineObj:ProcessingLine2D = new ProcessingLine2D(offsetProjectPt.x,offsetProjectPt.y,inclinedPt.x,inclinedPt.y);
            var ratioAt:number = lineObj.ratioAt(projectPoint.x,projectPoint.y);
            if(PMath.isEqual(ratioAt,0.5,0.2))
            {
                return offsetProjectPt;
            }

            offsetProjectPt = projectPoint.add(lineDirectionPt);
            return offsetProjectPt;
        }

        private drawLineUsingSetSquare(fromPoint:Point3D,toPoint:Point3D,inputPt:Point3D,lineInputs:Point3D[],ratio:number)
        {
            var startPoint:Point3D = lineInputs[0];
            var endPoint:Point3D = lineInputs[1];
            ratio = this.drawSetSquareLineConstrainer.constrain(ratio);

            if(ratio==0)
            {
                this.pencilObj.alignTo(startPoint);
            }


            if(ratio<=this.RULER_HIDE_RATIO)
            {
                var onToOneRatio:number = PMath.map(ratio,0,this.RULER_HIDE_RATIO,1,0);
                var projectPoint:Point3D = this.getProjectPoint(fromPoint,toPoint,inputPt);
                var distance:number = projectPoint.distanceTo(inputPt);

                if(PMath.isEqual(distance,0,0.01)==false)
                {
                    this.rulerObj.showOrHide(onToOneRatio);
                }

                return;
            }


            if(ratio<=this.DRAW_LINE_RATIO)
            {
                var lineDrawRatio:number = PMath.map(ratio,this.RULER_HIDE_RATIO,this.DRAW_LINE_RATIO,0,1);
                var newToPoint:Point3D = Point3D.interpolate(startPoint,endPoint,lineDrawRatio);

                //By this time, the pencil would have moved to the new From point...
                var pencilPos:Point3D = this.pencilObj.getDirectionVector(endPoint,lineDrawRatio);
                this.pencilObj.move(pencilPos);

                this.internalDrawLine(startPoint,newToPoint);
            }

            if(ratio==1)
            {
                this.pencilObj.alignTo(endPoint);
                this.commitLine(startPoint,endPoint);

                this.drawSetSquareLineConstrainer.reset();
            }
        }

    }
}