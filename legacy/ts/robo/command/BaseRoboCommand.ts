/**
 * Created by Mathdisk on 3/19/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.command {


   import IRoboCommand = robo.command.IRoboCommand;
   import Engine3D = robo.geom.Engine3D; // soft ref
   import Point = away.geom.Point;
    import Point3D = robo.core.Point3D;
    import StringUtil = robo.util.StringUtil;
    import PMath = robo.util.PMath;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Mesh = away.entities.Mesh;
    import GraphSheet3D = robo.geom.GraphSheet3D; // soft ref
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import ITransformable = robo.core.ITransformable;


    export class BaseRoboCommand implements IRoboCommand{

        public  timeInSeconds:number=3;
        private expressionId:number=-1;
        public labelName:string="";
        public engine:Engine3D;
        public showLabel:boolean = true;
        private color:number=0xDC3912;
        public virtualObjectExecutionContext:VirtualObjectsExecutionContext;
        private errorMessage:string;
        public commandText:string;
        public dependentVirtualElements:ArrayHelper;
        public maxSpeed:number=11;
        private xLabelOffset:number=0;
        private yLabelOffset:number=0;

        constructor()
        {
            this.dependentVirtualElements = new ArrayHelper();
        }

        prePlay():void
        {
            $.gevent.publish('highlight-expression',{expressionId:this.expressionId});

            if(!StringUtil.isEmpty(this.commandText))
            {
                $.gevent.publish('robo-show-displayText',{displayText:this.commandText,timeInSeconds:this.timeInSeconds});
            }

            this.engine.hideVirtualElements(this.dependentVirtualElements);

            this.assignLabelOffsetInVirtualObj();
            this.virtualObjectExecutionContext.labelVisible = this.showLabel;

            var color = this.getColor();
            this.engine.fill(color);
        }

        preCalculate():void
        {

        }

        postPlay():void
        { 
            this.virtualObjectExecutionContext.setLabelName(this.labelName);

            this.storeIndicatorPosition();

            if(this.showLabel== true && this.labelName.length>0)
            {
                var labelPos:Point = this.getOffsetLabelPosition();
                var labelMesh:Mesh = this.engine.label3D(this.labelName,new Point3D(labelPos.x,labelPos.y,0));
                this.virtualObjectExecutionContext.setLabelMesh(labelMesh);
            }

            if(!StringUtil.isEmpty(this.commandText))
            {
                $.gevent.publish('robo-hide-displayText',{displayText:this.commandText});
            }
        }

        storeIndicatorPosition():void
        {
            var indicatorPosition:Point3D = this.getIndicatorPosition();

            this.virtualObjectExecutionContext.setIndicatorPosition(indicatorPosition);
        }


        init(engine:Engine3D,commandContext:VirtualObjectsExecutionContext):void
        {
            this.engine = engine;

            this.virtualObjectExecutionContext = commandContext;
        }


        public getTimeInSeconds():number
        {
            return this.timeInSeconds;
        }

        setTimeInSeconds(timeInSeconds:number):void
        {
            this.timeInSeconds = Math.abs(this.maxSpeed - timeInSeconds);//apply the speed in reverse
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {

        }


        getExpressionId():number
        {
            return this.expressionId;
        }

        public setExpressionId(expressionId:number):void
        {
            this.expressionId = expressionId;
        }


        getLabelName():string
        {
            return this.labelName;
        }

        setLabelName(labelName:string):void
        {
            this.labelName = labelName;
        }

        getOffsetLabelPosition():Point{

            var currentLabelPosition:Point = this.getLabelPosition();

            currentLabelPosition.x += (this.xLabelOffset ? this.xLabelOffset : 0);
            currentLabelPosition.y += (this.yLabelOffset ? this.yLabelOffset : 0);

            return currentLabelPosition;
        }

        getIndicatorPosition():Point3D{

            var currentLabelPosition:Point = this.getLabelPosition();

            return new Point3D(currentLabelPosition.x,currentLabelPosition.y,0);
        }


        getLabelPosition():Point
        {
            return new Point();
        }


        setColor(colorVal:number):void
        {
            this.color  = colorVal;


        }

        getColor():number
        {
            return this.color;
        }

        //only fillcommand will override this
        getAlpha():number
        {
            return 1;
        }

        getErrorMessage():string{

            return this.errorMessage;
        }

        setCommandText(cmdText:string):void
        {
            this.commandText  = cmdText;
        }

        getCommandText():string
        {
            return this.commandText;
        }


        public translatePoint(pt:Point):Point
        {
            return GraphSheet3D.translatePointForGraphSheetOffset(pt);
        }

        public  translateInlinePoint3DForGraphSheetOffset(pt: Point3D) {
            GraphSheet3D.translateInlinePoint3DForGraphSheetOffset(pt);
        }


        //could be with or without string
        public hasShowLabel(val:any):void{

            this.showLabel=val;
        }

        public static getUtilityCmdNames():ArrayHelper
        {
            var utilityCmdNames:ArrayHelper = new ArrayHelper();
            utilityCmdNames.addAll(["number","interpolate",
                "dist","start","end","mid","X","Y","intersect","project","+","-","/","*","sin",
                "cos","tan","max","min","sqrt","log","acos","asin","atan","pos","group","and","or","diff","xor",
                "repeat","pointtype","reverse"]);

            return utilityCmdNames;
        }


        public setLabelOffset(xOffset:number,yOffset:number):void{

            this.xLabelOffset = PMath.isNaN(xOffset) ? 0 : xOffset ;
            this.yLabelOffset = PMath.isNaN(yOffset) ? 0 : yOffset ;
        }

        public assignLabelOffsetInVirtualObj():void{

            this.virtualObjectExecutionContext.labelOffsetXPos = this.xLabelOffset;
            this.virtualObjectExecutionContext.labelOffsetYPos = this.yLabelOffset;
        }

        public directPlay():void{

            var excludedEl:ArrayHelper = new ArrayHelper();

            this.engine.hideVirtualElements(excludedEl);

            var color = this.getColor();
            this.engine.fill(color);

            this.assignLabelOffsetInVirtualObj();
            this.virtualObjectExecutionContext.labelVisible = this.showLabel;

            this.doDirectPlay();

            this.engine.hideVirtualElements(excludedEl);

            this.storeIndicatorPosition();

            this.virtualObjectExecutionContext.setLabelName(this.labelName);

            if(this.showLabel== true && this.labelName.length>0)
            {
                var labelPos:Point = this.getOffsetLabelPosition();
                var labelMesh:Mesh = this.engine.label3D(this.labelName,new Point3D(labelPos.x,labelPos.y,0));
                this.virtualObjectExecutionContext.setLabelMesh(labelMesh);
            }


        }
        //All commands that needs direct rendering shuld override this
        public doDirectPlay():void
        {

        }


        //canvas 2d draw begin

        public preDrawOn2D(graphSheet2D:GraphSheet2D):void{

            graphSheet2D.setFillColor(this.getColor());
        }

        public drawOn2D(graphSheet2D:GraphSheet2D):void
        {
            this.preDrawOn2D(graphSheet2D);

            this.doDrawOn2D(graphSheet2D);

            this.postDrawOn2D(graphSheet2D);

        }

        //corresponding drawing command should override this command
        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{


        }

        public postDrawOn2D(graphSheet2D:GraphSheet2D):void{

            if(this.showLabel== true && this.labelName.length>0)
            {
                var labelPos:Point = this.getOffsetLabelPosition();
                graphSheet2D.drawLabel(this.labelName,labelPos);
            }
        }


        public translateTransformableForGraphSheetOffset(sourceTransformable:ITransformable):ITransformable
        {
            return sourceTransformable.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
        }

        public reverseTranslatePointForGraphSheetOffset(sourceTransformable:ITransformable):ITransformable
        {
            return sourceTransformable.translatePointForGraphSheetOffset(GraphSheet3D.reverseTranslatePointForGraphSheetOffset);
        }






        //canvas 2d draw end
    }
}
