/**
 * Created by rizwan on 5/15/14.
 */

module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references
    import StringUtil = robo.util.StringUtil;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import IIntersectable = robo.core.IIntersectable;
    import FillerVirtualObject = robo.virtualobjects.FillerVirtualObject;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import ProcessingGroup = robo.core.ProcessingGroup;




    export class FillRoboCommand extends  BaseRoboCommand{


        private virtualObjectExecutionContexts:VirtualObjectsExecutionContext[]=[];
        private fillerVirtualObject:FillerVirtualObject;

        private static MAX_ALPHA_VALUE:number=0.7;

        public processingGroup:ProcessingGroup;



        constructor(processingGroup:ProcessingGroup)
        {
            super();

            this.processingGroup = this.translateForDrawing(processingGroup);


        }

        private translateForDrawing(processingGroup:ProcessingGroup):ProcessingGroup
        {
            var translatedGroup:ProcessingGroup = <ProcessingGroup>processingGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            return translatedGroup;
        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

            virtualObjectExecutionContext.setMaxAlphaValue(FillRoboCommand.MAX_ALPHA_VALUE);

            this.fillerVirtualObject = engine.fillerVirtualObject;
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.fillerVirtualObject.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            this.showLabel = false;
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);
            this.fillerVirtualObject.fillSurface(this.processingGroup,value);
        }



        postPlay():void
        {
            super.postPlay();
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

            this.showLabel = false;
            this.fillerVirtualObject.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.fillerVirtualObject.directFillSurface(this.processingGroup);
        }


        storeIndicatorPosition():void
        {

        }

        getCurrentColor() {
            if(this.processingGroup.hasCurrentColor()) {
                return this.processingGroup.getFillColor();
            }
            return this.engine.getCurrentColor();
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{




        }






        getAlpha():number
        {
            return 0.7;
        }
    }
}

