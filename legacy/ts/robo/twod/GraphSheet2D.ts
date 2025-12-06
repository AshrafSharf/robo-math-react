/**
 * Created by Mathdisk on 4/26/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.twod {

    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Point = away.geom.Point;

    import TextField = away.entities.TextField;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import PMath = robo.util.PMath;

    export class GraphSheet2D {

        drawingSurface:HTMLCanvasElement;
        private _height:number=0;
        private _width:number=0;
        private graphsheet2DBounds:GraphSheet2DBounds;
        private graphSheet2DAxes:GraphSheet2DAxes;
        private context:any;
        private curColor:number;

        private fontStyle:string="20px Arial";

        public static X_ORIGIN:number=GraphSheet3D.X_ORIGIN;
        public static Y_ORIGIN:number=GraphSheet3D.Y_ORIGIN;

        constructor(snapShotCanvas)
        {
            this.drawingSurface = snapShotCanvas;

            this._width = $(snapShotCanvas).width();
            this._height = $(snapShotCanvas).height();

            this.graphsheet2DBounds = new GraphSheet2DBounds(this);
            this.graphSheet2DAxes = new GraphSheet2DAxes(this,this.graphsheet2DBounds);
            this.context = this.drawingSurface.getContext("2d");
        }

        public drawLabel(labelName:string,labelPos:Point):void{

            //do this before drawing
            this.toCanvasMappedModelPos([labelPos]);

            var twodViewpt = this.graphsheet2DBounds.toView(labelPos);

            this.preDraw();
            this.context.font = this.fontStyle;
            this.context.fillText(labelName, twodViewpt.x, twodViewpt.y);
            this.postDraw();
        }


        public drawLine(startPt:Point,endPt:Point):void
        {
            //do this before drawing
            this.toCanvasMappedModelPos([startPt,endPt]);

            var startViewpt = this.graphsheet2DBounds.toView(startPt);
            var endViewpt = this.graphsheet2DBounds.toView(endPt);
            var modelThickness:number=0.1;

            this.preDraw();
            this.context.moveTo(startViewpt.x,startViewpt.y);
            this.context.lineTo(endViewpt.x,endViewpt.y);
            this.context.lineWidth = this.graphsheet2DBounds.toUILength(modelThickness);
            this.context.stroke();
            this.postDraw();
        }

        public drawPoint(pt:Point):void
        {
            //do this before drawing
            this.toCanvasMappedModelPos([pt]);

            var twodViewpt = this.graphsheet2DBounds.toView(pt);

            var modelRadius:number =0.2;
            var uiRadius:number = this.graphsheet2DBounds.toUILength(modelRadius);
            var fromAngle=0;
            var toAngle=2*Math.PI;

            this.preDraw();
            this.context.arc(twodViewpt.x,twodViewpt.y,uiRadius,fromAngle,toAngle);
            this.context.fill();
            this.postDraw();
        }

        public drawArc(originPt:Point,radius:number,fromDeg:number,toDeg:number):void{

            //do this before drawing
            this.toCanvasMappedModelPos([originPt]);

            var modelThickness:number=0.1;
            //start and end angles to reversed in flash coordinates
            var fromAngle:number = toDeg < fromDeg ? PMath.radians(toDeg) : PMath.radians(fromDeg);
            var toAngle:number = toDeg < fromDeg ? PMath.radians(fromDeg) : PMath.radians(toDeg);

            var uiRadius:number = this.graphsheet2DBounds.toUILength(2*radius);
            var uiCenterPt:Point = this.graphsheet2DBounds.toView(originPt);
            var noFill:boolean=true;

            this.preDraw(noFill);
            this.context.lineWidth = this.graphsheet2DBounds.toUILength(modelThickness);
            this.context.arc(uiCenterPt.x,uiCenterPt.y,uiRadius,fromAngle,toAngle);
            this.context.stroke();
            this.postDraw();
        }

        public drawPolygonWithFill(listOfPts:Point[]){

             this.preDraw();
            for (var i = 0; i < listOfPts.length; i++) {

                var startpt:Point=listOfPts[i].clone();
                var endpt:Point=listOfPts[(i+1)%listOfPts.length].clone();

                this.toCanvasMappedModelPos([startpt,endpt]);

                var startViewpt = this.graphsheet2DBounds.toView(startpt);
                var endViewpt = this.graphsheet2DBounds.toView(endpt);
                var modelThickness:number=0.1;


                if(i==0)
                this.context.moveTo(startViewpt.x,startViewpt.y);

                this.context.lineTo(endViewpt.x,endViewpt.y);
                this.context.lineWidth = this.graphsheet2DBounds.toUILength(modelThickness);


            }

            this.context.closePath();
            this.context.fill();

            this.postDraw();

        }
        public setFillColor(color:number):void{

            this.curColor = color;
        }

        public get height():number
        {
            return this._height;
        }

        public set height(value:number)
        {
            this._height = value;
        }

        public get width():number
        {
            return this._width;
        }

        public set width(value:number)
        {
            this._width = value;
        }


        public drawAxis(canShowGrid:boolean):void{

            this.clearAll();

            this.graphSheet2DAxes.draw(this.context,canShowGrid);
        }


        private clearAll():void{

            this.context.clearRect(0, 0, this.width, this.height);
        }


        private preDraw(noFill:boolean=false):void{
            this.context.save();
            this.context.beginPath();
            if(noFill==false)
            this.context.fillStyle =""+this.curColor;
            this.context.strokeStyle = ""+this.curColor;
        }

        private postDraw():void{
            this.context.restore();
        }

        public setDrawingBounds(exportSettings):void{

            this.clearAll();//clear old context

            //for drawing we need to consider playsurface width and height
            //user's given  expoertWidth and exportHeight are considered only for scale the canvas, check resizeCanvas method

            var sheetWidth:number = exportSettings.sheetWidth;
            var sheetHeight:number = exportSettings.sheetHeight;

            this._width = sheetWidth;
            this._height = sheetHeight;

            this.graphsheet2DBounds.doInit();

            this.context.canvas.width = sheetWidth;
            this.context.canvas.height = sheetHeight;

            this.resizeCanvas(exportSettings);
        }

        private resizeCanvas(exportSettings):void{

            var exportWidth:number = exportSettings.exportWidth;
            var exportHeight:number = exportSettings.exportHeight;

            var canvasWidth:number = this.context.canvas.width;
            var canvasHeight:number = this.context.canvas.height;

          //  this.context.dilate(exportWidth/canvasWidth,exportHeight/canvasHeight);

            
        }


        //will chnage only the  y sign value of model points
        //Note : use it only to change the input model points
        public toCanvasMappedModelPos(listOfPts:Point[]):void{

            var len:number = listOfPts.length;
            for(var i:number=0;i<len;i++){
                var pt:Point = listOfPts[i];
                pt.y= pt.y*-1;
            }
        }

    }

}