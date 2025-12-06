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
    import PMath = robo.util.PMath;

    export class GraphSheet2DAxes {

        private graphsheet2d:GraphSheet2D;
        private graphsheet2DBounds:GraphSheet2DBounds;

        private gridColor:string = "#C4C4C4";
        private axisColor = "#000000";
        private gridThickness:number = 0.5;
        private originAxisThickness:number = 2;

        private fontSize:number = 18;//also required to to do offset
        private fontName:string="Arial";
        private fontStyle:string=""+this.fontSize+"px "+this.fontName;

        constructor(sheet2d:GraphSheet2D, graphsheet2DBounds:GraphSheet2DBounds) {

            this.graphsheet2d = sheet2d;
            this.graphsheet2DBounds = graphsheet2DBounds;

        }

        public draw(context,showGrid:boolean):void {

            this.translateOrigin();

            var xUIOrigin:number = this.graphsheet2DBounds.getXUIOrigin();
            var yUIOrigin:number = this.graphsheet2DBounds.getYUIOrigin();

            context.save();

            if(showGrid){

                this.drawGrid(context,showGrid);

                //draw middle axis
                this.drawOriginAxis(context, xUIOrigin, yUIOrigin);
            }

            this.restoreOriginTranslation();

            context.restore();
        }


        private drawGrid(context,showGrid):void{

            var xUIOrigin:number = this.graphsheet2DBounds.getXUIOrigin();
            var yUIOrigin:number = this.graphsheet2DBounds.getYUIOrigin();

            var axisThickness:number = 1;

            var axisLabelLen:number = this.axisLabelLength() - 5;

            var labelPosAdj:number = 0;
            var yOrigindown:number = yUIOrigin;
            var yDistance:number = this.graphsheet2DBounds.getYUIScale();
            var textPos:Point;

            //Y down
            while (yOrigindown < this.graphsheet2d.height) {
                yOrigindown += yDistance;
                var yModelPos:number = this.graphsheet2DBounds.toModelY(yOrigindown);

                var yAxisLabel:string = this.formatLabelValue(yModelPos);
                textPos = this.calculateYAxisTextPoint(-1, xUIOrigin,labelPosAdj, yOrigindown, axisLabelLen);
                this.drawText(context, yAxisLabel, this.axisColor, textPos);

                //draws grid
                if(showGrid)
                this.drawLine(context, 0, yOrigindown, this.graphsheet2d.width, yOrigindown, this.gridColor, this.gridThickness);
            }

            //Y UP
            var yOriginUp:number = yUIOrigin;
            while (yOriginUp >= 0) {
                yOriginUp -= yDistance;
                var yModelPos:number = this.graphsheet2DBounds.toModelY(yOriginUp);
                var yAxisLabel:string = this.formatLabelValue(yModelPos);

                textPos = this.calculateYAxisTextPoint(-1, xUIOrigin, labelPosAdj, yOriginUp, axisLabelLen);
                this.drawText(context, yAxisLabel, this.axisColor, textPos);

                //draws grid
                if(showGrid)
                this.drawLine(context, 0, yOriginUp, this.graphsheet2d.width, yOriginUp, this.gridColor, this.gridThickness);
            }

            axisLabelLen = this.axisLabelLength();

            //X Right
            var xRight:number = xUIOrigin;
            var xDistance:number = this.graphsheet2DBounds.getXUIScale();

            while (xRight <= this.graphsheet2d.width) {

                xRight += xDistance;
                var xModelPos:number = this.graphsheet2DBounds.toModelX(xRight);
                var xAxisLabel:string = this.formatLabelValue(xModelPos);

                //draws grid
                if(showGrid)
                this.drawLine(context, xRight, 0, xRight, this.graphsheet2d.height, this.gridColor, this.gridThickness);

                textPos = this.calcuateXAxisTextPoint(1, xRight, labelPosAdj, yUIOrigin, axisLabelLen);
                this.drawText(context, xAxisLabel, this.axisColor, textPos);
            }


            //X left
            var xLeft:number = xUIOrigin;
            var xDistance:number = this.graphsheet2DBounds.getXUIScale();

            while (xLeft >= 0) {

                xLeft -= xDistance;
                var xModelPos:number = this.graphsheet2DBounds.toModelX(xLeft);
                var xAxisLabel:string = this.formatLabelValue(xModelPos);

                //draws grid
                if(showGrid)
                this.drawLine(context, xLeft, 0, xLeft, this.graphsheet2d.height, this.gridColor, this.gridThickness);

                textPos = this.calcuateXAxisTextPoint(-1, xLeft, labelPosAdj, yUIOrigin, axisLabelLen);
                this.drawText(context, xAxisLabel, this.axisColor, textPos);
            }

        }

        private drawOriginAxis(context, xUIOrigin, yUIOrigin):void {

            this.drawLine(context, xUIOrigin, 0, xUIOrigin, this.graphsheet2d.height, this.axisColor, this.originAxisThickness);
            this.drawLine(context, 0, yUIOrigin, this.graphsheet2d.width, yUIOrigin, this.axisColor, this.originAxisThickness);

            //draw X and Y labels in axis with different fontStyle
            var lFontSize:number = 25;
            //lFontSize = lFontSize * (this.graphsheet2DBounds.getXUIScale()/GraphSheet3DBounds.MIN_SCALE);
            var fStyle:String=lFontSize+"px "+this.fontName;
            this.drawText(context,"X",this.axisColor,new Point(this.graphsheet2d.width-lFontSize,yUIOrigin-lFontSize/3),fStyle);
            //this.drawText(context,"X",this.axisColor,new Point(lFontSize/3,yUIOrigin-lFontSize/3),fStyle);//neg X

            this.drawText(context,"Y",this.axisColor,new Point(xUIOrigin-lFontSize,0+lFontSize),fStyle);
            //this.drawText(context,"Y",this.axisColor,new Point(xUIOrigin-lFontSize,this.graphsheet2d.height-lFontSize/4),fStyle);//neg Y

            //draw 0 label
            var originTextCol:string= "#207798";
            this.drawText(context,"0",originTextCol,new Point(xUIOrigin-lFontSize,yUIOrigin-lFontSize/3),fStyle);
        }

        private drawLine(context, xFrom, yFrom, xTo, yTo, color, strokeThickness:number):void {

            context.beginPath();
            context.strokeStyle = color;
            context.moveTo(xFrom, yFrom);
            context.lineTo(xTo, yTo);
            context.lineWidth = strokeThickness;
            context.stroke();
            context.restore();
        }

        private drawText(context, text, textColor, position,fStyle=null):void {

            context.fillStyle = textColor;//font color
            context.font = fStyle==null ? this.fontStyle : fStyle;
            context.fillText(text, position.x, position.y);

        }

        private calcuateXAxisTextPoint(direction:number, xPos:number, labelPosAdj:number, yUIOrigin:number, axisLabelLen:number):Point {

            var extraYOffset:number= this.fontSize<14 ? this.fontSize/3: this.fontSize/1.85;
            var textPoint:Point = new Point(xPos - labelPosAdj, yUIOrigin + axisLabelLen+extraYOffset);
            return textPoint;

        }

        private axisLabelLength():number {
            return 10;
        }

        private labelPositionAdjustment():number {
            return this.fontSize;
        }

        private   formatLabelValue(value:number):string {

            if (PMath.isZero(value))
                return "0";

            var output:string;
            if (Math.abs(value) >= 1) {
                if (value == Math.round(value))// check whether its decimal
                    return value.toString();

                output = PMath.roundDecimal(value, 2).toString();
                return    output;
            }

            output = PMath.roundDecimal(value, 5).toString();
            return output;
        }

        private calculateYAxisTextPoint(direction:number, xUIOrigin:number, labelPosAdj:number, yUIOrigin:number, axisLabelLen:number):Point {

            var textPoint:Point = new Point(xUIOrigin + axisLabelLen, yUIOrigin - labelPosAdj);
            return textPoint;

        }


        public translateOrigin():void {

            //translating origin only for drawing axis at a translated position
            this.graphsheet2DBounds.translateOrigin(this.graphsheet2DBounds.toTranslateXWithOutOrigin(GraphSheet2D.X_ORIGIN), -this.graphsheet2DBounds.toTranslateYWithOutOrigin(GraphSheet2D.Y_ORIGIN));
        }

        public restoreOriginTranslation():void {

            //restore origin back to its original position
            this.graphsheet2DBounds.translateOrigin(this.graphsheet2DBounds.toTranslateXWithOutOrigin(-GraphSheet2D.X_ORIGIN), this.graphsheet2DBounds.toTranslateYWithOutOrigin(GraphSheet2D.Y_ORIGIN));
        }
    }

}