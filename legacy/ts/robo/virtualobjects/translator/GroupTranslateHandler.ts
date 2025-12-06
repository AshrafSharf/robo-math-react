/**
 * Created by Mathdisk on 3/31/14.
 */



///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

module robo.virtualobjects.translator
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


    export class GroupTranslateHandler extends  TranslatePartHandler
    {
        private groupOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualTranslator:VirtualTranslator)
        {
            super(virtualTranslator);

            this.groupOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualTransformer.transformerGroup);// 20 is  the max internal instances to  manage


        }

        public drawPreviewObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {

            var translatedGroup:ProcessingGroup = <ProcessingGroup>itransformable.translateTransform(transValue,transAbout);
            translatedGroup =  <ProcessingGroup>translatedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewGroupPart:GeometryPart = this.virtualTransformer.transformerGroup.processingGroup(translatedGroup);

            this.groupOutputInstanceManager.manageMesh(previewGroupPart);

        }

        public commitTransformableObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.groupOutputInstanceManager.clearAll();
            this.commit(itransformable,transValue,transAbout);
        }

        private commit(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            var translatedGroup:ProcessingGroup = <ProcessingGroup>itransformable.translateTransform(transValue,transAbout);
            translatedGroup =  <ProcessingGroup>translatedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualTransformer.ui3DScript.commitProcessingGroup(translatedGroup);
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.commit(itransformable,transValue,transAbout);
        }

        public removeInternalDrawings():void
        {
            this.groupOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,transValue:Point,transAbout:Point,graphSheet2D:GraphSheet2D):void
        {

        }

    }

}