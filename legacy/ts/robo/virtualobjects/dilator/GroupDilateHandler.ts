/**
 * Created by Mathdisk on 3/31/14.
 */



///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

module robo.virtualobjects.dilator
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


    export class GroupDilateHandler extends  DilatePartHandler
    {
        private groupOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualDilator:VirtualDilator)
        {
            super(virtualDilator);

            this.groupOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualTransformer.transformerGroup);// 20 is  the max internal instances to  manage

         }

        public drawPreviewObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {


            var rotatedGroup:ProcessingGroup = <ProcessingGroup>itransformable.dilateTransform(scaleValue,dilateAbout);
            rotatedGroup =  <ProcessingGroup>rotatedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewGroupPart:GeometryPart = this.virtualTransformer.transformerGroup.processingGroup(rotatedGroup);

            this.groupOutputInstanceManager.manageMesh(previewGroupPart);

        }

        public commitTransformableObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            this.groupOutputInstanceManager.clearAll();
            this.commit(itransformable,scaleValue,dilateAbout);
        }

        private commit(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            var dilatedGroup:ProcessingGroup = <ProcessingGroup>itransformable.dilateTransform(scaleValue,dilateAbout);
            dilatedGroup =  <ProcessingGroup>dilatedGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualTransformer.ui3DScript.commitProcessingGroup(dilatedGroup);
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            this.commit(itransformable,scaleValue,dilateAbout);
        }

        public removeInternalDrawings():void
        {
            this.groupOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,scaleValue:number,dilateAbout:Point,graphSheet2D:GraphSheet2D):void
        {

        }

    }

}