/**
 * Created by rizwan on 4/28/14.
 */

module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Engine3D = robo.geom.Engine3D;
    import Point3D = robo.core.Point3D;
    import Mesh = away.entities.Mesh;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class TextOnGraphsheetCommand extends  BaseRoboCommand
    {
        private textPosition:Point;
        private displayText:string;

        constructor(displayText:string,textPosition:Point)
        {
            super();

            this.displayText = displayText;

            this.textPosition = this.translatePoint(textPosition);
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

            var labelPosition:Point = this.textPosition;
            var labelMesh:Mesh = this.engine.label3D(this.displayText,new Point3D(labelPosition.x,labelPosition.y,0));
            this.virtualObjectExecutionContext.setLabelMesh(labelMesh);
            this.virtualObjectExecutionContext.fadeOut(0,this.engine.getCurrentColor());

            this.showLabel = false;
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            this.virtualObjectExecutionContext.fadeOut(value,this.engine.getCurrentColor());
        }


        postPlay():void
        {
            super.postPlay();
        }


        getLabelPosition():Point
        {
            var offsetVal:number = 0.25;
            return new Point(this.textPosition.x+offsetVal,this.textPosition.y+offsetVal);
        }


        public doDirectPlay():void{

            var labelPosition:Point = this.textPosition;
            var labelMesh:Mesh = this.engine.label3D(this.displayText,new Point3D(labelPosition.x,labelPosition.y,0));
            this.virtualObjectExecutionContext.setLabelMesh(labelMesh);

            this.showLabel = false;
        }

        public doDrawOn2D(graphSheet2D:GraphSheet2D):void
        {
            var labelPosition:Point = this.textPosition;
            graphSheet2D.drawLabel(this.displayText,labelPosition.clone());
        }
    }

}
