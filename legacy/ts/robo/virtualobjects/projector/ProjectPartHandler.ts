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
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import TransformablePoint = robo.core.TransformablePoint;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class ProjectPartHandler
    {
        public virtualProjector:VirtualProjector;

        constructor(virtualProjector:VirtualProjector)
        {
            this.virtualProjector = virtualProjector;
            this.virtualProjector.projectPartHandler = this;
        }

        public drawPreviewObject(itransformable:ITransformable,projectAbout:Point[],ratio:number):void
        {

        }

        public commitTransformableObject(itransformable:ITransformable,projectAbout:Point[]):void
        {

        }


        public directCommitTransform(itransformable:ITransformable,projectAbout:Point[]):void
        {

        }

        public removeInternalDrawings():void
        {

        }

        public drawOn2D(itransformable:ITransformable,projectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {

        }
    }
}
