/**
 * Created by Mathdisk on 3/31/14.
 */



module robo.virtualobjects.dilator
{
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point3D = robo.core.Point3D;
    import PMath = robo.util.PMath;
    import UI3DScript = robo.geom.UI3DScript
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class SplineDilateHandler extends  DilatePartHandler
    {
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualDilator:VirtualDilator)
        {
            super(virtualDilator);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualTransformer.transformerGroup);// 20 is  the max internal instances to  manage

        }

        public drawPreviewObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            var dilatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.dilateTransform(scaleValue,dilateAbout);
            dilatedSpline =  <ProcessingSpline2D>dilatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewLinePart:GeometryPart = this.virtualTransformer.transformerGroup.spline(dilatedSpline.outPutAsPoint3D());
            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public commitTransformableObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            this.lineOutputInstanceManager.clearAll();
            this.commitPolygon(itransformable,scaleValue,dilateAbout);

        }
        private commitPolygon(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            var dilatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.dilateTransform(scaleValue,dilateAbout);
            dilatedSpline =  <ProcessingSpline2D>dilatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualTransformer.ui3DScript.commitSpline(dilatedSpline.outPutAsPoint3D());
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            this.commitPolygon(itransformable,scaleValue,dilateAbout);
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,scaleValue:number,dilateAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            var dilatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.dilateTransform(scaleValue,dilateAbout);
            dilatedSpline =  <ProcessingSpline2D>dilatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var polyPoints:Point[] = dilatedSpline.splineOutputPoints;
            var len:number = polyPoints.length;
            for (var i = 0; i < len; i++)
            {
                var start:Point = polyPoints[i];
                var end:Point = polyPoints[(i+1)%len];

                //always send the cloned pts
                graphSheet2D.drawLine(start.clone(),end.clone());
            }
        }
    }
}