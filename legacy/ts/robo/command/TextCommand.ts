/**
 * Created by rizwan on 4/1/14.
 */

module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Engine3D = robo.geom.Engine3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class TextCommand extends  BaseRoboCommand
    {
        constructor(displayText:string)
        {
            super();

            this.commandText = displayText;
        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);
        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }

        prePlay():void
        {
            super.prePlay();

            this.showLabel = false;
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);
        }


        postPlay():void
        {
            super.postPlay();
        }

        setCommandText(cmdText:string):void
        {

        }

        storeIndicatorPosition():void
        {

        }


        public doDirectPlay():void{

            this.showLabel = false;
        }

        public drawOn2D(graphSheet2D:GraphSheet2D):void
        {

        }
    }

}
