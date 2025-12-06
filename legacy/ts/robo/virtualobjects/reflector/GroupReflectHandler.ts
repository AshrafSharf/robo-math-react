/**
 * Created by Mathdisk on 3/31/14.
 */



///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

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
    import ProcessingGroup = robo.core.ProcessingGroup;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class GroupReflectHandler extends  ReflectPartHandler
    {
        private groupOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualReflector:VirtualReflector)
        {
            super(virtualReflector);

            this.groupOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualReflector.transformerGroup);// 20 is  the max internal instances to  manage

        }

        public drawPreviewObject(itransformable:ITransformable,reflectAbout:Point[],ratio:number):void
        {
            var reflectedGroup:ProcessingGroup = <ProcessingGroup>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],ratio);
            reflectedGroup =  <ProcessingGroup>reflectedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)
            var previewGroupPart:GeometryPart = this.virtualReflector.transformerGroup.processingGroup(reflectedGroup);
            this.groupOutputInstanceManager.manageMesh(previewGroupPart);

        }

        public commitTransformableObject(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.groupOutputInstanceManager.clearAll();
            this.commit(itransformable,reflectAbout);
        }

        private commit(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            var reflectedGroup:ProcessingGroup = <ProcessingGroup>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            reflectedGroup =  <ProcessingGroup>reflectedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)
            var outputMesh:Mesh = this.virtualReflector.ui3DScript.commitProcessingGroup(reflectedGroup);
            this.virtualReflector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.commit(itransformable,reflectAbout);
        }

        public removeInternalDrawings():void
        {
            this.groupOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,reflectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {

        }

    }

}