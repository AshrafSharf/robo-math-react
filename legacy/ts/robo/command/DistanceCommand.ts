/**
 * Created by rizwan on 4/15/14.
 */
module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Point3D =  robo.core.Point3D;


    import Engine3D = robo.geom.Engine3D; // Engine is the last object to be constructed, here we are using ony as a soft references

    import PMath = robo.util.PMath;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import PolygonBuilder = robo.virtualobjects.PolygonBuilder;
    export class DistanceCommand extends  BaseRoboCommand{



        private startPt:Point;
        private endPt:Point;
        private originPt:Point;

        private polygonBuilder:PolygonBuilder;
        //constructoed by the parser

        private points:Point[];

        private textPos:Point;
        constructor(startPt:Point,endPt:Point)
        {
            super();

            this.startPt = this.translatePoint(startPt);
            this.endPt = this.translatePoint(endPt);

            this.points=[];

            this.buildaPoints();





        }

        private buildaPoints():void{

            var line:ProcessingLine2D=new ProcessingLine2D(this.startPt.x,this.startPt.y,this.endPt.x,this.endPt.y);

            line=line.normalize(1);

            var normalPoint:Point=line.normal();


            var upNormal:Point=normalPoint.clone();

            upNormal.normalize((line.isInside(normalPoint))?-0.25:0.25);

            var downNormal:Point=normalPoint.clone();

            downNormal.normalize((line.isInside(normalPoint))?-0.75:0.75);

            var midNormal:Point=normalPoint.clone();

            midNormal.normalize((line.isInside(normalPoint))?-0.5:0.5);


            var baseStart:Point=this.startPt.add(midNormal);
            var baseEnd:Point=this.endPt.add(midNormal);

            this.points.push(this.startPt.add(upNormal));

            this.points.push(this.startPt.add(downNormal));

            this.points.push(baseStart);

            this.points.push(baseEnd);

            this.points.push(this.endPt.add(upNormal));

            this.points.push(this.endPt.add(downNormal));

            this.textPos=Point.interpolate(baseStart,baseEnd,0.5);


        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectExecutionContext);

            this.polygonBuilder = engine.polygonBuilderObj;


            this.dependentVirtualElements.addAll([engine.pencilObj]);



        }

        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.polygonBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            this.showLabel= false;// donot show labels
        }


        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);


            var line:ProcessingLine2D=new ProcessingLine2D(this.startPt.x,this.startPt.y,this.endPt.x,this.endPt.y);


            this.polygonBuilder.drawPolygonWithText( this.points, line.length()+"", this.textPos, value);


        }




        postPlay():void
        {
            super.postPlay();
        }

        public doDirectPlay():void{

            this.showLabel= false;// donot show labels

            this.polygonBuilder.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            var line:ProcessingLine2D=new ProcessingLine2D(this.startPt.x,this.startPt.y,this.endPt.x,this.endPt.y);

            this.polygonBuilder.directCommitPolygonWithText( this.points, line.length()+"", this.textPos);



        }

    }

}
