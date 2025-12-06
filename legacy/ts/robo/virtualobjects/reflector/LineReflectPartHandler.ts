/**
 * Created by rizwan on 5/30/14.
 */

module robo.virtualobjects.reflector
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


    export class LineReflectPartHandler extends  ReflectPartHandler
    {
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;
        private _lineThickness:number=1;// We have changed from Arc to line

        constructor(virtualReflector:VirtualReflector)
        {
            super(virtualReflector);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualReflector.transformerGroup);
        }


        public drawPreviewObject(itransformable:ITransformable,reflectAbout:Point[],ratio:number):void
        {
            var rotatedLine:ProcessingLine2D = <ProcessingLine2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],ratio);
            rotatedLine =  <ProcessingLine2D>rotatedLine.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var startPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.startPoint);
            var endPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.endPoint);

            var previewLinePart:GeometryPart = this.virtualReflector.transformerGroup.line(startPt,endPt,this._lineThickness);
            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public commitTransformableObject(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.lineOutputInstanceManager.clearAll();
            this.commitLine(itransformable,reflectAbout);
        }

        private commitLine(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            var rotatedLine:ProcessingLine2D = <ProcessingLine2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            rotatedLine =  <ProcessingLine2D>rotatedLine.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var startPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.startPoint);
            var endPt:Point3D = BaseVirtualObject.fromPointToPoint3D(rotatedLine.endPoint);
            var outputMesh:Mesh = this.virtualReflector.ui3DScript.commitLine(startPt,endPt);
            this.virtualReflector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.commitLine(itransformable,reflectAbout);
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,reflectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            var rotatedLine:ProcessingLine2D = <ProcessingLine2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            rotatedLine =  <ProcessingLine2D>rotatedLine.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            graphSheet2D.drawLine(rotatedLine.startPoint,rotatedLine.endPoint);
        }
    }

}
