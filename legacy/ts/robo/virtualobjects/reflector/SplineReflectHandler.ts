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

    export class SplineReflectHandler extends  ReflectPartHandler
    {
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualReflector:VirtualReflector)
        {
            super(virtualReflector);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualReflector.transformerGroup);// 20 is  the max internal instances to  manage
        }

        public drawPreviewObject(itransformable:ITransformable,reflectAbout:Point[],ratio:number):void
        {
            var rotatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],ratio);
            rotatedSpline =  <ProcessingSpline2D>rotatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var previewLinePart:GeometryPart = this.virtualReflector.transformerGroup.spline(rotatedSpline.outPutAsPoint3D());
            this.lineOutputInstanceManager.manageMesh(previewLinePart);

        }

        public commitTransformableObject(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.lineOutputInstanceManager.clearAll();
            this.commitSpline(itransformable,reflectAbout);
        }

        private commitSpline(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            var rotatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            rotatedSpline =  <ProcessingSpline2D>rotatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualReflector.ui3DScript.commitSpline(rotatedSpline.outPutAsPoint3D());
            this.virtualReflector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.commitSpline(itransformable,reflectAbout);
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,reflectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            var rotatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            rotatedSpline =  <ProcessingSpline2D>rotatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var polyPoints:Point[] = rotatedSpline.splineOutputPoints;
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
