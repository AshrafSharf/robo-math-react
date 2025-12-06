/**
 * Created by Mathdisk on 3/19/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>




module robo.command {

    import BaseRoboCommand = robo.command.BaseRoboCommand;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Point = away.geom.Point;
    import Point3D =  robo.core.Point3D;

    import Pencil3D = robo.virtualobjects.Pencil3D;
    import Engine3D = robo.geom.Engine3D;
    import PMath = robo.util.PMath;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import Vector3D = away.geom.Vector3D;
    import VirtualTracer = robo.virtualobjects.VirtualTracer;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;

    export class TraceCommand extends  BaseRoboCommand
    {
        public static SPEED_POINT_MULTIPLIER:number = 1.5;
        public static POINTS_PER_SECONDS:number = 3;



        private splineModelPoints:Point3D[]=[]; // This is the value we should use fo drawing
        private pencilObj:Pencil3D;
        private virtualTracer:VirtualTracer;
        private splineCurve:ProcessingSpline2D;


        //constructoed by the parser
        constructor(spliceCurve:ProcessingSpline2D)
        {
            super();
            this.splineCurve = <ProcessingSpline2D>spliceCurve.getTranslatedObject(GraphSheet3D.translatePointForGraphSheetOffset)
            this.calculatePoints();

        }

        private calculatePoints():void
        {
            var outputPts:Point[]= this.splineCurve.splineOutputPoints;
            for(var i:number=0;i<outputPts.length;i++)
            {
                var pt:Point =  outputPts[i];
                this.splineModelPoints.push(new Point3D( pt.x, pt.y, 0 ));
            }

        }

        //initialized by the engine
        public init(engine:Engine3D,virtualObjectsExecutionContext:VirtualObjectsExecutionContext):void
        {
            super.init(engine,virtualObjectsExecutionContext);

            this.virtualTracer = engine.virtualTracer;
            this.pencilObj = engine.pencilObj;
            this.virtualTracer.pencil3d = this.pencilObj;

           this.dependentVirtualElements.addAll([engine.pencilObj]);

        }



        // use the parameters to figure out the actual values of Point1 and Point2
        preCalculate():void
        {

        }


        prePlay():void
        {
            super.prePlay();

            this.virtualTracer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);

            this.showLabel= false;// donot show labels

        }




        // value always ranges from 0 to 1
        play(value:number):void
        {
            super.play(value);

            this.virtualTracer.drawTraceUsingPencil(this.splineModelPoints,value);
        }

        postPlay():void
        {
            super.postPlay();
        }

        public doDirectPlay():void{

            this.showLabel = false;
            this.virtualTracer.setVirtualObjectsExecutionContext(this.virtualObjectExecutionContext);
            this.virtualTracer.directCommitTrace(this.splineModelPoints);

        }




        public doDrawOn2D(graphSheet2D:GraphSheet2D):void{


            var len:number = this.splineModelPoints.length;
            for (var i = 0; i < len; i++) {

                var start3d:Point3D=this.splineModelPoints[i];
                var end3d:Point3D=this.splineModelPoints[(i+1)%len];

                var start:Point=new Point(start3d.x,start3d.y);
                var end:Point=new Point(end3d.x,end3d.y);

                //always send the cloned pts
                graphSheet2D.drawLine(start,end);

            }
        }

    }

}