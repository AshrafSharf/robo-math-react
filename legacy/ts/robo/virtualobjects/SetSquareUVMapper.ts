/**
 * Created by rizwan on 3/20/14.
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
    import Point = away.geom.Point;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import UVMapContainer = robo.virtualobjects.util.UVMapContainer;



    export class SetSquareUVMapper
    {
        private verticalEdgeUVContainers:UVMapContainer[];
        private horizontalEdgeUVContainers:UVMapContainer[];

        constructor()
        {
            this.calculateUVValues();
        }


        private calculateUVValues():void
        {
            this.calculateVerticalEdgeUVs();

            this.calculateHorizontalEdgeUVs();
        }

        private  calculateVerticalEdgeUVs():void
        {
            var gap:number = 70;
            var inner_gap:number = gap/3;

            var topCornerWidth:number = PMath.map(0.4995,0,12.365,0,512);
            var bottomCornerWidth:number = PMath.map(1.99,0,12.365,0,512);

            var divisons:number = 78;
            var startX:number = 1.7*topCornerWidth;
            var startY:number = 512-0;
            var eachRectWidth:number = (512-topCornerWidth-bottomCornerWidth)/divisons;
            this.verticalEdgeUVContainers = [];

            var stpt1:Point;
            var stpt2:Point;
            for(var i:number=0;i<divisons;i++)
            {
                stpt1 = new Point(startX+(i*eachRectWidth),startY);
                stpt2 = new Point(startX+((i+1)*eachRectWidth),startY);
                var mapcontainer:UVMapContainer = this.getSquareUVMapContainer(stpt1,stpt2,inner_gap,4);
                this.verticalEdgeUVContainers.push(mapcontainer);
            }

            var newStartPt:Point = stpt2.clone();
            var newEndPt:Point = new Point(stpt2.x,stpt2.y-gap);
            var cornerPt:Point = new Point(512,startY);

            var mapcontainer:UVMapContainer = this.getTriangleUVMapContainer(newStartPt,newEndPt,cornerPt,inner_gap,3);
            this.verticalEdgeUVContainers.push(mapcontainer);
        }


        private  calculateHorizontalEdgeUVs():void
        {
            var topCornerHeight:number = PMath.map(0.5011,0,7.139,0,295);
            var bottomCornerHeight:number =  PMath.map(1.169,0,7.139,0,295);
            var gap:number = 295-topCornerHeight-bottomCornerHeight+0;
            var divisons:number = 18;
            var innerYGap:number = gap/divisons;

            var startX:number = 0;
            var startY:number = 510-topCornerHeight;

            var innerXGap:number = 70/3;
            this.horizontalEdgeUVContainers = [];

            var stpt1:Point = new Point(startX,512-0);
            var stpt2:Point = new Point(startX,startY);

            var mapcontainer:UVMapContainer = this.getSquareUVMapContainer2(stpt1,stpt2,innerXGap,4);
            this.horizontalEdgeUVContainers.push(mapcontainer);

            for(var i:number=0;i<divisons;i++)
            {
                stpt1 = new Point(startX,startY-(i*innerYGap));
                stpt2 = new Point(startX,startY-((i+1)*innerYGap));

                var mapcontainer:UVMapContainer = this.getSquareUVMapContainer2(stpt1,stpt2,innerXGap,4);
                this.horizontalEdgeUVContainers.push(mapcontainer);
            }

            var endpt2:Point = new Point(stpt2.x+70,stpt2.y);
            var bttmPt:Point = new Point(stpt2.x,512-295);

            var mapcontainer:UVMapContainer = this.getTriangleUVMapContainer2(stpt2,endpt2,bttmPt,innerXGap,4);
            this.horizontalEdgeUVContainers.push(mapcontainer);
        }




        private getSquareUVMapContainer(startPt1:Point,start2:Point,inner_gap:number,iterationLen:number):UVMapContainer
        {
            var mapcontainer:UVMapContainer = new UVMapContainer();

            var leftSidePoints:Point[] = [];
            var rightSidePoints:Point[] = [];

            for(var i:number=0;i<iterationLen;i++)
            {
                var leftPt:Point = new Point(startPt1.x,startPt1.y-(i*inner_gap));
                var rightPt:Point = new Point(start2.x,start2.y-(i*inner_gap));

                leftSidePoints.push(leftPt);
                rightSidePoints.push(rightPt);
            }

            var rectCount:number = iterationLen-1;
            var uvMalList:any[] = mapcontainer.getAllUVMapList();
            for(var i:number=0;i<rectCount;i++)
            {
                var points:Point[] = [leftSidePoints[i],leftSidePoints[i+1],rightSidePoints[i],rightSidePoints[i+1]];
                this.findUVMapValues(points,uvMalList[i]);
            }

            return mapcontainer;
        }


        private  getSquareUVMapContainer2(startPt1:Point,start2:Point,innerXGap:number,iterationLen:number):UVMapContainer
        {
            var mapcontainer:UVMapContainer = new UVMapContainer();

            //1st set
            var left1:Point = new Point(startPt1.x,startPt1.y);
            var left2:Point = new Point(startPt1.x+(1*innerXGap),startPt1.y);
            var left3:Point = new Point(startPt1.x+(2*innerXGap),startPt1.y);
            var left4:Point = new Point(startPt1.x+(3*innerXGap),startPt1.y);

            //2st set
            var right1:Point = new Point(start2.x,start2.y);
            var right2:Point = new Point(start2.x+(1*innerXGap),start2.y);
            var right3:Point = new Point(start2.x+(2*innerXGap),start2.y);
            var right4:Point = new Point(start2.x+(3*innerXGap),start2.y);


            this.findUVMapValues([right1,right2,left1,left2],mapcontainer.uvMapList1);
            this.findUVMapValues([right2,right3,left2,left3],mapcontainer.uvMapList2);
            this.findUVMapValues([right3,right4,left3,left4],mapcontainer.uvMapList3);

            return mapcontainer;
        }



        private  getTriangleUVMapContainer(startPt1:Point,endPt1:Point,start2:Point,inner_gap:number,iterationLen:number):UVMapContainer
        {
            var mapcontainer:UVMapContainer = new UVMapContainer();

            //1st set
            var left1:Point = Point.interpolate(endPt1,startPt1,PMath.map(0*inner_gap,0,70,0,1));
            var left2:Point = Point.interpolate(endPt1,startPt1,PMath.map(1*inner_gap,0,70,0,1));
            var left3:Point = Point.interpolate(endPt1,startPt1,PMath.map(2*inner_gap,0,70,0,1));
            var left4:Point = Point.interpolate(endPt1,startPt1,PMath.map(3*inner_gap,0,70,0,1));

            //2st set
            var right1:Point = Point.interpolate(endPt1,start2,PMath.map(0*inner_gap,0,70,0,1));
            var right2:Point = Point.interpolate(endPt1,start2,PMath.map(1*inner_gap,0,70,0,1));
            var right3:Point = Point.interpolate(endPt1,start2,PMath.map(2*inner_gap,0,70,0,1));
            var right4:Point = Point.interpolate(endPt1,start2,PMath.map(3*inner_gap,0,70,0,1));

            this.findUVMapValues([left1,left2,right1,right2],mapcontainer.uvMapList1);
            this.findUVMapValues([left2,left3,right2,right3],mapcontainer.uvMapList2);
            this.findUVMapValues([left3,left4,right3,right4],mapcontainer.uvMapList3);

            return mapcontainer;
        }



        private  getTriangleUVMapContainer2(startPt1:Point,endPt1:Point,start2:Point,innerXGap:number,iterationLen:number):UVMapContainer
        {
            var mapcontainer:UVMapContainer = new UVMapContainer();

            //1st set
            var left1:Point = new Point(startPt1.x,startPt1.y);
            var left2:Point = new Point(startPt1.x+(1*innerXGap),startPt1.y);
            var left3:Point = new Point(startPt1.x+(2*innerXGap),startPt1.y);
            var left4:Point = new Point(startPt1.x+(3*innerXGap),startPt1.y);

            //2st set
            var right1:Point = Point.interpolate(endPt1,start2,PMath.map(0*innerXGap,0,70,0,1));
            var right2:Point = Point.interpolate(endPt1,start2,PMath.map(1*innerXGap,0,70,0,1));
            var right3:Point = Point.interpolate(endPt1,start2,PMath.map(2*innerXGap,0,70,0,1));
            var right4:Point = Point.interpolate(endPt1,start2,PMath.map(3*innerXGap,0,70,0,1));

            this.findUVMapValues([right1,right2,left1,left2],mapcontainer.uvMapList1);
            this.findUVMapValues([right2,right3,left2,left3],mapcontainer.uvMapList2);
            this.findUVMapValues([right3,right4,left3,left4],mapcontainer.uvMapList3);

            return mapcontainer;
        }



        private  findUVMapValues(points:Point[],uvMapList:Point[]):void
        {
            for(var i:number=0;i<points.length;i++)
            {
                var pt:Point = points[i];
                var uv_x:number = PMath.map(pt.x,0,512,0,1);
                var uv_y:number = PMath.map(512-pt.y,0,512,0,1);

                uvMapList.push(new Point(uv_x,uv_y));
            }
        }



        public  fillUVData(uvArray:number[]):void
        {
            var iterationLen:number = uvArray.length;
            for(var i:number=0;i<iterationLen;i+=12)
            {
                for(var j:number=0; j<12; j++ )
                {
                    var index=i+j;

                    if(index%2==0)
                        uvArray[index] = 0.8;
                    else
                        uvArray[index] = 0.1;
                }
            }

            var i:number = 5;
            this.updateSection2(uvArray,i,this.verticalEdgeUVContainers[0]);
            var iterationLen:number = this.verticalEdgeUVContainers.length-1;
            for(i;i<iterationLen;i++)
            {
                this.updateSection(uvArray,i+1,this.verticalEdgeUVContainers[i-4]);
            }

            i = 1;
            iterationLen = this.horizontalEdgeUVContainers.length-2;
            for(i;i<iterationLen;i++)
            {
                this.updateSection(uvArray,99-i,this.horizontalEdgeUVContainers[i+1]);
            }

            this.updateSection4(uvArray,99-iterationLen,this.horizontalEdgeUVContainers[i+1]);
        }



        private  updateSection(uvlist:number[],section:number,uvcontainer:UVMapContainer):void
        {
            var face:number = 4;
            var numUVPerFace:number = 36;
            var startIndex:number = (section*face)*numUVPerFace;

            this.updateRectangleUV(uvlist,startIndex,uvcontainer.uvMapList3);
            this.updateRectangleUV(uvlist,startIndex+12,uvcontainer.uvMapList2);
            this.updateRectangleUV(uvlist,startIndex+24,uvcontainer.uvMapList1);
        }

        private  updateSection2(uvlist:number[],section:number,uvcontainer:UVMapContainer):void
        {
            var face:number = 4;
            var numUVPerFace:number = 36;
            var startIndex:number = (section*face)*numUVPerFace;

            this.updateRectangleUV(uvlist,startIndex+12,uvcontainer.uvMapList2);
            this.updateRectangleUV(uvlist,startIndex+24,uvcontainer.uvMapList1);
        }


        private  updateSection4(uvlist:number[],section:number,uvcontainer:UVMapContainer):void
        {
            var face:number = 4;
            var numUVPerFace:number = 36;
            var startIndex:number = (section*face)*numUVPerFace;

            var index:number = startIndex+24;
            var uvMapList:Point[] = uvcontainer.uvMapList1;

            index = index+5;

            //TRIANGLE 1
            var p:Point = uvMapList[1];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;

            var p:Point = uvMapList[2];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;

            var p:Point = uvMapList[3];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;
        }


        private  updateRectangleUV(uvlist:number[],index:number,uvMapList:Point[]):void
        {
            var p:Point = uvMapList[1];
            uvlist[index] = p.x;
            uvlist[++index]=p.y;

            var p:Point = uvMapList[0];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;

            var p:Point = uvMapList[2];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;

            //TRIANGLE 1
            var p:Point = uvMapList[1];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;

            var p:Point = uvMapList[2];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;

            var p:Point = uvMapList[3];
            uvlist[++index]=p.x;
            uvlist[++index]=p.y;
        }
    }
}
