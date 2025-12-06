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
    import ProcessingLine3D = robo.core.ProcessingLine3D;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Ruler3D = robo.virtualobjects.Ruler3D;
    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import BitmapData  = away.base.BitmapData;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;

    export  class PolygonBuilder extends BaseVirtualObject
    {
        private ui3DScript:UI3DScript;
        private origin:Point3D = new Point3D(0,0,0);
        private polygonGroup:GeometryGroup;

        private MOVEMENT_RATIO:number=0.3;
        private ROTATE_RATIO:number=0.5;
        private DRAW_RATIO:number=0.9;

        private _pencil3d:Pencil3D = null;
        private _ruler3d:Ruler3D = null;
        private _lineThickness:number=1;

        private previewLinePart:GeometryPart = null;
        private  boundryConstrainer:BoundryConstrainer;

        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;
        private activeSegment:number=0;

        private activePointIndex:number = 0;
        private boundries:number[] = [];

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
            this.polygonGroup = new GeometryGroup(this.ui3DScript);

            this.boundryConstrainer = new BoundryConstrainer([0,1]);
            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.polygonGroup);
        }



       /* public drawPolygonUsingPencil(pointList:Point[],ratio:number):void
        {






            var currSegNo:number = Math.ceil(pointList.length*ratio);
            if(currSegNo==0 )
                  return;

            var segStartPoint:Point = pointList[currSegNo-1];
            var segEndPoint:Point = pointList[currSegNo%pointList.length];
            var curr_ratio = (pointList.length*ratio)-(currSegNo-1);

            if(this.activeSegment!=currSegNo){

                var prevSegNo:number = currSegNo-1;
                if(prevSegNo!=0){

                    var prevStartPoint:Point = pointList[prevSegNo-1];
                    var prevEndPoint:Point = pointList[prevSegNo%pointList.length];

                    // this.commitLine(prevStartPt3D,prevEndPt3D);
                }
                this.pencil3d.alignTo(new Point3D(segStartPoint.x,segStartPoint.y));
            }

            var startPoint:Point3D=new Point3D(segStartPoint.x,segStartPoint.y);
            var endPoint:Point3D=new Point3D(segEndPoint.x,segEndPoint.y);

            var pencilPos:Point3D = this.pencil3d.getDirectionVector(endPoint,curr_ratio);
            this.pencil3d.move(pencilPos);

            var newToPoint:Point3D = Point3D.interpolate(startPoint,endPoint,curr_ratio);
          //  this.internalDrawLine(startPoint,newToPoint);


            var toIndex:number = (pointList.length-1) * ratio;

            toIndex = toIndex|0; // force it to int

            var pointPortion:Point[] =  pointList.slice(0,toIndex+1);

            this.internalDrawLine(pointPortion);

            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {

                this.lineOutputInstanceManager.clearAll();

                this.commitLine(pointList);
            }

        }

*/

        public drawPolygonUsingPencil(pointList:Point[],ratio:number):void
        {

            var len:number=pointList.length-1;
            var currSegNo:number = Math.ceil(len*ratio);

            if(currSegNo==0 )
                return;

            var segStartPoint:Point = pointList[currSegNo-1];

            var segEndPoint:Point = pointList[currSegNo];

            var curr_ratio = (len*ratio)-(currSegNo-1);

            if(this.activeSegment!=currSegNo){

                this.pencil3d.alignTo(new Point3D(segStartPoint.x,segStartPoint.y));

                this.activeSegment = currSegNo;
            }

            var pencilPos:Point3D = this.pencil3d.getDirectionVector(new Point3D(segEndPoint.x,segEndPoint.y),curr_ratio);

           this.pencil3d.move(pencilPos);

            var toIndex:number = len * ratio;

            toIndex = toIndex|0; // force it to int

            var pointPortion:Point[] =  pointList.slice(0,toIndex+1);

            var newToPoint:Point3D = Point3D.interpolate(new Point3D(segStartPoint.x,segStartPoint.y),new Point3D(segEndPoint.x,segEndPoint.y),curr_ratio);

            pointPortion.push(new Point(newToPoint.x,newToPoint.y));

            this.internalDrawLine(pointPortion);


            //BaseVirtualObject.DEFAULT_COMMIT_RATIO is 1
            if(ratio==1)
            {

                this.lineOutputInstanceManager.clearAll();

                this.commitLine(pointList);

            }

        }




        private initializePolygonUsingRulerBoundryConstrainer(pointList:Point[]):void
        {
            var totalDistance:number = 0;
            var minimumSegLength:number = 2;
            var numberOfPoints:number = pointList.length;
            for(var i:number=0;i<numberOfPoints;i++)
            {

                //changed logic.. no need for joining first point by safi
                if(i!=(numberOfPoints-1)){

                    var startPt:Point = pointList[i];
                    //var endPt:Point = ((i+1) < numberOfPoints) ? pointList[i+1] : pointList[0];

                    var endPt:Point = pointList[i+1];


                    var segmentLen:number = Point.distance(startPt,endPt);
                    totalDistance += (segmentLen>minimumSegLength) ? segmentLen : minimumSegLength;
                }


            }

            this.boundries = [];
            this.boundries[this.boundries.length] = 0;
            var currentBoundry:number = 0;
            for(var j:number=0;j<numberOfPoints;j++)
            {
                var startPt:Point = pointList[j];
                var endPt:Point = ((j+1) < numberOfPoints) ? pointList[j+1] : pointList[0];

                var segmentLen:number = Point.distance(startPt,endPt);
                segmentLen = (segmentLen>minimumSegLength) ? segmentLen : minimumSegLength;

                currentBoundry += (segmentLen/totalDistance);
                this.boundries[this.boundries.length] = PMath.roundDecimal(currentBoundry,8);
            }

            this.boundryConstrainer = new BoundryConstrainer(this.boundries);
        }


        public drawPolygonUsingRuler(pointList:Point[],ratio:number):void
        {
            if(this.boundries.length==0)
            {
                this.initializePolygonUsingRulerBoundryConstrainer(pointList);
            }

            ratio = PMath.roundDecimal(ratio,8);
            var constRatio:number = this.boundryConstrainer.constrain(ratio);
            var pointIndex:number = this.boundries.indexOf(constRatio);
            if(pointIndex!=-1 && pointIndex!=0)
            {
                this.drawLine(pointList,1,this.activePointIndex);
                this.activePointIndex = pointIndex;
            }


            var startValue:number = this.boundries[this.activePointIndex];
            var endValue:number = this.boundries[this.activePointIndex+1];
            var lineRatio:number = PMath.map(constRatio,startValue,endValue,0,1);
            this.drawLine(pointList,lineRatio,this.activePointIndex);

            if(ratio==1)
            {
                this.activePointIndex = 0;
                this.boundries = [];
            }
        }


        private drawLine(pointList:Point[],ratio:number,currentIndex:number):void
        {
            var lastItemIndex:number = pointList.length-1;

            var nextIndex:number = currentIndex+1;
            if(nextIndex==pointList.length)
                return ;


            var startPoint:Point = pointList[currentIndex];
            var endPoint:Point = pointList[nextIndex];

            var startPoint3D:Point3D = new Point3D(startPoint.x,startPoint.y);
            var endPoint3D:Point3D = new Point3D(endPoint.x,endPoint.y);


            this.ruler3d.drawLine(startPoint3D,endPoint3D,ratio);
        }

       /* public drawPolygonUsingRuler(pointList:Point[],ratio:number):void
        {
            var lastItemIndex:number = pointList.length-1;
            var currSegNo:number = Math.ceil(pointList.length*ratio);
            if(currSegNo==0 )
                return ;

            //find current segment ratio
            var curr_seg_ratio = (pointList.length*ratio)-(currSegNo-1);
            var constRatio:number = this.boundryConstrainer.constrain1(curr_seg_ratio);

            console.log("ratio: "+ratio+" ,constRatio: "+constRatio);

            var constSegNo:number = (constRatio==1 && ratio!=1) ? currSegNo-1 : currSegNo;

            var currentIndex:number = constSegNo-1;
            var nextIndex:number = (currentIndex==lastItemIndex) ? 0 : currentIndex+1;

            var startPoint:Point = pointList[currentIndex];
            var endPoint:Point = pointList[nextIndex];

            var startPoint3D:Point3D = new Point3D(startPoint.x,startPoint.y);
            var endPoint3D:Point3D = new Point3D(endPoint.x,endPoint.y);
            this.ruler3d.drawLine(startPoint3D,endPoint3D,constRatio);

            if(ratio==1)
            {
                this.boundryConstrainer.reset();
            }
        }*/

        /*public drawPolygonUsingRuler(pointList:Point[],ratio:number):void
        {
            // find current segment numner
            var currSegNo:number = Math.ceil(pointList.length*ratio);
            if(currSegNo==0 )
                return ;

            //find current segment ratio
            var curr_seg_ratio = (pointList.length*ratio)-(currSegNo-1);
            curr_seg_ratio = this.boundryConstrainer.constrain(curr_seg_ratio);

            // get current segment start point and end point
            var segStartPoint:Point = pointList[currSegNo-1];
            var segEndPoint:Point = pointList[currSegNo%pointList.length];

            //conver to 3d point
            var startPoint:Point3D=new Point3D(segStartPoint.x,segStartPoint.y);
            var endPoint:Point3D=new Point3D(segEndPoint.x,segEndPoint.y);

            // due to boundary constraint problem, not able give  start ratio(0) and end ratio(1) to line drawing
            // so need to force start and  end ratio
            //if activeSegment not equal to current segment number, commit the previuos segment and
            // start current segment drawing by giving ratio 0
            if(this.activeSegment!=currSegNo){

                // commit previous  segment
                var prevSegNo:number = currSegNo-1;
                if(prevSegNo!=0){// if any previous segment, commit previious segemnt

                    var prevStartPoint:Point = pointList[prevSegNo-1];
                    var prevEndPoint:Point = pointList[prevSegNo%pointList.length];

                    var prevStartPt3D:Point3D = new Point3D(prevStartPoint.x,prevStartPoint.y);
                    var prevEndPt3D:Point3D = new Point3D(prevEndPoint.x,prevEndPoint.y);

                    this.commitLine(prevStartPt3D,prevEndPt3D);
                }

                //current segmet start
                this.ruler3d.drawLine(startPoint,endPoint,0);
                this.ruler3d.drawLine(startPoint,endPoint,curr_seg_ratio);

                this.activeSegment = currSegNo;
                return;
            }


            if(curr_seg_ratio!=1){//

                this.ruler3d.drawLine(startPoint,endPoint,curr_seg_ratio);
            }


            //end of animation
            if(ratio==1)
            {
                //commit last segment
                var prevStartPoint:Point = pointList[pointList.length-1];
                var prevEndPoint:Point = pointList[0];

                var prevStartPt3D:Point3D = new Point3D(prevStartPoint.x,prevStartPoint.y);
                var prevEndPt3D:Point3D = new Point3D(prevEndPoint.x,prevEndPoint.y);

                this.commitLine(prevStartPt3D,prevEndPt3D);

                //reset active segment
                this.activeSegment = 0;
            }
        }*/


        /** Object commitment must be done using a seperate method called commit line **/
        public commitLine(points:Point[]):void
        {
            var outputMesh:Mesh = this.ui3DScript.commitPolyLine(points);
            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }


        public drawPolygonWithText(points:Point[],textValue:String,textPos:Point,ratio:number){

            this.drawPolygonUsingPencil(points,ratio);


            if(ratio==1){

                this.commitText3d(textValue,new Point3D(textPos.x,textPos.y));
            }
        }

        private commitText3d(textValue:String,textPosition:Point3D):void
            {
                if(this.virtualObjectsExecutionContext.labelVisible== false)
                return;

                var numVal:number=+textValue;
            var trim_textValue:string = PMath.roundDecimal(numVal,1)+"";

              this.addLabelOffset(textPosition);
            var outputMesh = this.ui3DScript.commitText3d(trim_textValue,textPosition,16);

            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        private addLabelOffset(textPos:Point3D):void{

            textPos.x += this.virtualObjectsExecutionContext.labelOffsetXPos;
            textPos.y += this.virtualObjectsExecutionContext.labelOffsetYPos;
        }
        private internalDrawLine(points:Point[]):void
        {
            this.previewLinePart = this.polygonGroup.polyline(points);
            this.lineOutputInstanceManager.manageMesh(this.previewLinePart);
        }


        public  get pencil3d():Pencil3D
        {
            return  this._pencil3d;
        }


        public set pencil3d(value:Pencil3D)
        {
            this._pencil3d = value;
        }


        public  get ruler3d():Ruler3D
        {
            return  this._ruler3d;
        }

        public  set ruler3d(value:Ruler3D)
        {
            this._ruler3d = value;
        }


        public  get lineThickness():number
        {
            return  this._lineThickness;
        }


        public  set lineThickness(value:number)
        {
            this._lineThickness = value;
        }


        public reset():void
        {
            this.boundries = [];
            this.boundryConstrainer.reset();
            this.activeSegment = 0;
            this.activePointIndex = 0;

            this.removeInternalDrawings();
        }

        public removeInternalDrawings():void
        {
            this.polygonGroup.removePart(this.previewLinePart);
            this.lineOutputInstanceManager.clearAll();
        }


        public directCommitPolygon(pointList:Point[]):void{

            this.commitLine(pointList);

          /* for (var i = 0; i < pointList.length; i++) {

                var start:Point = pointList[i];
                var end:Point = pointList[(i+1)%pointList.length];

                this.commitLine(new Point3D(start.x,start.y),new Point3D(end.x,end.y));
            }*/
        }
        public directCommitPolygonWithText(pointList:Point[],textValue:String,textPos:Point):void{

            this.commitLine(pointList);

            this.commitText3d(textValue,new Point3D(textPos.x,textPos.y));

        }

    }
}

