/**
 * Created by rizwan on 4/7/14.
 */

module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import StringUtil = robo.util.StringUtil;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class ShowCommand extends  BaseRoboCommand{

        private showExpressionLabels:string[];
        private virtualObjectExecutionContexts:VirtualObjectsExecutionContext[]=[];
        private alphaValue:number=1;

        constructor(showExpressionLabels:string[],alphaValue:number=1)
        {
            super();

            this.showExpressionLabels  = showExpressionLabels;
            this.alphaValue = alphaValue;
        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.virtualObjectExecutionContexts  =  this.engine.getVirtualObjectExecutionContextByLabels(this.showExpressionLabels);

            this.engine.showMeshesFor(this.showExpressionLabels,this.alphaValue);

            this.showLabel = false;
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            var alphaRatio:number = this.alphaValue *value;

            super.play(alphaRatio);

            for(var i:number=0;i<this.virtualObjectExecutionContexts.length;i++)
            {
                this.virtualObjectExecutionContexts[i].fadeOut(alphaRatio,this.engine.getCurrentColor());
            }
        }

        postPlay():void
        {
            if(!StringUtil.isEmpty(this.commandText))
            {
                $.gevent.publish('robo-hide-displayText',{displayText:this.commandText});
            }
        }


        getLabelPosition():Point
        {
            return new Point(0,0);
        }

        public doDirectPlay():void{

            this.virtualObjectExecutionContexts  =  this.engine.getVirtualObjectExecutionContextByLabels(this.showExpressionLabels);

            for(var i:number=0;i<this.virtualObjectExecutionContexts.length;i++)
            {
                this.virtualObjectExecutionContexts[i].fadeOut(this.alphaValue,this.engine.getCurrentColor());
            }

            this.engine.showMeshesFor(this.showExpressionLabels,this.alphaValue);

            this.showLabel = false;
        }


        storeIndicatorPosition():void
        {

        }

        public drawOn2D(graphSheet2D:GraphSheet2D):void
        {

        }

    }
}
