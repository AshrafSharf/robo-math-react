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
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import TransformablePoint = robo.core.TransformablePoint;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class PointReflectHandler extends ReflectPartHandler
    {
        private  previewPointPart:GeometryPart=null;

        constructor(virtualReflector:VirtualReflector)
        {
            super(virtualReflector);
        }

        public drawPreviewObject(itransformable:ITransformable,reflectAbout:Point[],ratio:number):void
        {
            this.virtualReflector.transformerGroup.removePart(this.previewPointPart);
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],ratio);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
            var sourcePt:Point = rotatedPoint.getSourcePoint();

            //Preview is done on GeometryGroup and commit is done on UI3D script
            this.previewPointPart = this.virtualReflector.transformerGroup.point3d(sourcePt.x,sourcePt.y,0);
        }


        public commitTransformableObject(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.virtualReflector.transformerGroup.removePart(this.previewPointPart);

            this.commitPoint(itransformable,reflectAbout);
        }

        private commitPoint(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
            var sourcePt:Point = rotatedPoint.getSourcePoint();


            var outputMesh:Mesh = this.virtualReflector.ui3DScript.commitPoint3d(new Point3D(sourcePt.x,sourcePt.y,0));
            this.virtualReflector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.commitPoint(itransformable,reflectAbout);
        }

        public removeInternalDrawings():void
        {
            this.virtualReflector.transformerGroup.removePart(this.previewPointPart);
            this.previewPointPart= null;
        }

        public drawOn2D(itransformable:ITransformable,reflectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            graphSheet2D.drawPoint(rotatedPoint.getSourcePoint());
        }
    }
}
