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
    import ProcessingLine2D =robo.core.ProcessingLine2D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class LineDilatePartHandler extends  DilatePartHandler
    {
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;
        private _lineThickness:number=1;// We have changed from Arc to line

        constructor(virtualDilator:VirtualDilator)
        {
            super(virtualDilator);
            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualTransformer.transformerGroup);
        }



        public drawPreviewObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            var rotatedLine:ProcessingLine2D = <ProcessingLine2D>itransformable.dilateTransform(scaleValue,dilateAbout);
            rotatedLine =  <ProcessingLine2D>rotatedLine.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var startPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.startPoint);
            var endPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.endPoint);

            var previewLinePart:GeometryPart = this.virtualTransformer.transformerGroup.line(startPt,endPt,this._lineThickness);
            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public commitTransformableObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            this.lineOutputInstanceManager.clearAll();
            this.commitLine(itransformable,scaleValue,dilateAbout);
        }

        private commitLine(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            var rotatedLine:ProcessingLine2D = <ProcessingLine2D>itransformable.dilateTransform(scaleValue,dilateAbout);
            rotatedLine =  <ProcessingLine2D>rotatedLine.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var startPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.startPoint);
            var endPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.endPoint);
            var outputMesh:Mesh = this.virtualTransformer.ui3DScript.commitLine(startPt,endPt);
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            this.commitLine(itransformable,scaleValue,dilateAbout);
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }


        public drawOn2D(itransformable:ITransformable,scaleValue:number,dilateAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            var rotatedLine:ProcessingLine2D = <ProcessingLine2D>itransformable.dilateTransform(scaleValue,dilateAbout);
            rotatedLine =  <ProcessingLine2D>rotatedLine.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            graphSheet2D.drawLine(rotatedLine.startPoint,rotatedLine.endPoint);
        }
    }
}