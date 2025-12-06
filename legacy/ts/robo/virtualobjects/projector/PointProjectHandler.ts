/**
 * Created by rizwan on 5/30/14.
 */

module robo.virtualobjects.projector
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

    export class PointProjectHandler extends ProjectPartHandler
    {
        private  previewPointPart:GeometryPart=null;

        constructor(virtualProjector:VirtualProjector)
        {
            super(virtualProjector);
        }

        public drawPreviewObject(itransformable:ITransformable,projectAbout:Point[],ratio:number):void
        {
            this.virtualProjector.transformerGroup.removePart(this.previewPointPart);
            var projectPoint:TransformablePoint = <TransformablePoint>itransformable.projectTransform(projectAbout[0],projectAbout[1],ratio);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            projectPoint = <TransformablePoint>projectPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
            var sourcePt:Point = projectPoint.getSourcePoint();

            //Preview is done on GeometryGroup and commit is done on UI3D script
            this.previewPointPart = this.virtualProjector.transformerGroup.point3d(sourcePt.x,sourcePt.y,0);
        }


        public commitTransformableObject(itransformable:ITransformable,projectAbout:Point[]):void
        {
            this.virtualProjector.transformerGroup.removePart(this.previewPointPart);

            this.commitPoint(itransformable,projectAbout);
        }

        private commitPoint(itransformable:ITransformable,projectAbout:Point[]):void
        {
            var projectPoint:TransformablePoint = <TransformablePoint>itransformable.projectTransform(projectAbout[0],projectAbout[1],1);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            projectPoint = <TransformablePoint>projectPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
            var sourcePt:Point = projectPoint.getSourcePoint();


            var outputMesh:Mesh = this.virtualProjector.ui3DScript.commitPoint3d(new Point3D(sourcePt.x,sourcePt.y,0));
            this.virtualProjector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,projectAbout:Point[]):void
        {
            this.commitPoint(itransformable,projectAbout);
        }

        public removeInternalDrawings():void
        {
            this.virtualProjector.transformerGroup.removePart(this.previewPointPart);
            this.previewPointPart= null;
        }

        public drawOn2D(itransformable:ITransformable,projectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.projectTransform(projectAbout[0],projectAbout[1],1);
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            graphSheet2D.drawPoint(rotatedPoint.getSourcePoint());
        }
    }
}
