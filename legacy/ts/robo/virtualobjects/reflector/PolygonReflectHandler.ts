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
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class PolygonReflectHandler extends  ReflectPartHandler
    {
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualReflector:VirtualReflector)
        {
            super(virtualReflector);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualReflector.transformerGroup);// 20 is  the max internal instances to  manage
        }

        public drawPreviewObject(itransformable:ITransformable,reflectAbout:Point[],ratio:number):void
        {
            var rotatedPolygon:ProcessingPolygon2D = <ProcessingPolygon2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],ratio);
            rotatedPolygon =  <ProcessingPolygon2D>rotatedPolygon.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewLinePart:GeometryPart = this.virtualReflector.transformerGroup.polyline(rotatedPolygon.points);
            this.lineOutputInstanceManager.manageMesh(previewLinePart);

        }

        public commitTransformableObject(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.lineOutputInstanceManager.clearAll();
            this.commitPolygon(itransformable,reflectAbout);
        }

        private commitPolygon(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            var rotatedPolygon:ProcessingPolygon2D = <ProcessingPolygon2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            rotatedPolygon =  <ProcessingPolygon2D>rotatedPolygon.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualReflector.ui3DScript.commitPolyLine(rotatedPolygon.points);
            this.virtualReflector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.commitPolygon(itransformable,reflectAbout);
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,reflectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            var rotatedPolygon:ProcessingPolygon2D = <ProcessingPolygon2D>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            rotatedPolygon =  <ProcessingPolygon2D>rotatedPolygon.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var polyPoints:Point[] = rotatedPolygon.points;
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
