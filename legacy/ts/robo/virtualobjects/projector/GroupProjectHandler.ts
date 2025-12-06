/**
 * Created by Mathdisk on 3/31/14.
 */



///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

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
    import ProcessingGroup = robo.core.ProcessingGroup;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class GroupProjectHandler extends  ProjectPartHandler
    {
        private groupOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualProjector:VirtualProjector)
        {
            super(virtualProjector);

            this.groupOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualProjector.transformerGroup);// 20 is  the max internal instances to  manage

        }

        public drawPreviewObject(itransformable:ITransformable,projectAbout:Point[],ratio:number):void
        {


            var projectedGroup:ProcessingGroup = <ProcessingGroup>itransformable.projectTransform(projectAbout[0],projectAbout[1],ratio);
            projectedGroup =  <ProcessingGroup>projectedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewGroupPart:GeometryPart = this.virtualProjector.transformerGroup.processingGroup(projectedGroup);

            this.groupOutputInstanceManager.manageMesh(previewGroupPart);

        }

        public commitTransformableObject(itransformable:ITransformable,projectAbout:Point[]):void
        {
            this.groupOutputInstanceManager.clearAll();
            this.commit(itransformable,projectAbout);
        }

        private commit(itransformable:ITransformable,projectAbout:Point[]):void
        {
            var projectedGroup:ProcessingGroup = <ProcessingGroup>itransformable.projectTransform(projectAbout[0],projectAbout[1],1);
            projectedGroup =  <ProcessingGroup>projectedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualProjector.ui3DScript.commitProcessingGroup(projectedGroup);
            this.virtualProjector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,projectAbout:Point[]):void
        {
            this.commit(itransformable,projectAbout);
        }

        public removeInternalDrawings():void
        {
            this.groupOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,projectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {

        }

    }

}