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

    export class HideCommand extends  BaseRoboCommand{

        private hideExpressionLabels:string[];
        private virtualObjectExecutionContexts:VirtualObjectsExecutionContext[]=[];

        constructor(hideExpressionLabels:string[])
        {
            super();

            this.hideExpressionLabels  = hideExpressionLabels;
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

            this.virtualObjectExecutionContexts  =  this.engine.getVirtualObjectExecutionContextByLabels(this.hideExpressionLabels);

            this.showLabel = false;
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            for(var i:number=0;i<this.virtualObjectExecutionContexts.length;i++)
            {
                this.virtualObjectExecutionContexts[i].fadeOut(1-value,this.engine.getCurrentColor());
            }
        }

        postPlay():void
        {
            if(!StringUtil.isEmpty(this.commandText))
            {
                $.gevent.publish('robo-hide-displayText',{displayText:this.commandText});
            }

            this.engine.hideMeshesFor(this.hideExpressionLabels);
        }


        getLabelPosition():Point
        {
            return new Point(0,0);
        }

        public doDirectPlay():void{

            this.virtualObjectExecutionContexts  =  this.engine.getVirtualObjectExecutionContextByLabels(this.hideExpressionLabels);

            for(var i:number=0;i<this.virtualObjectExecutionContexts.length;i++)
            {
                this.virtualObjectExecutionContexts[i].fadeOut(0,this.engine.getCurrentColor());
            }

            this.engine.hideMeshesFor(this.hideExpressionLabels);

            this.showLabel = false;
        }


        storeIndicatorPosition():void
        {

        }

        public drawOn2D(graphSheet2D:GraphSheet2D):void
        {

        }


        public getHideExpLabels():string[]{

            return this.hideExpressionLabels;
        }

    }
}
