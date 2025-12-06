/**
 * Created by Mathdisk on 2/24/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.virtualobjects
{
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import PMath = robo.util.PMath;
    import UI3DScript = robo.geom.UI3DScript;
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Point3D = robo.core.Point3D;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingLine3D = robo.core.ProcessingLine3D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import ColorConstants = robo.util.ColorConstants;
    import Mesh = away.entities.Mesh;
    import BitmapData = away.base.BitmapData;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import IIntersectable = robo.core.IIntersectable;
    import ColorMaterial = away.materials.ColorMaterial;
    import ProcessingPolygon2D=robo.core.ProcessingPolygon2D;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import GraphSheet3D = robo.geom.GraphSheet3D;

    export  class ProcessingGroupBuilder extends BaseVirtualObject
    {
        private ui3DScript:UI3DScript;
        public outputMesh:Mesh;
        private processingGroupGeoGroup:GeometryGroup;
        private boundryContainer:BoundryConstrainer;
        private groupOutputInstanceManager:GeomPartInstanceRemoveManager;



        public static MAX_FILL_ALPHA:number = 0.7;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
            this.boundryContainer = new BoundryConstrainer([0,1]);

            this.createGeoGroup();
        }


        private createGeoGroup():void
        {
            this.processingGroupGeoGroup = new GeometryGroup(this.ui3DScript);
            this.groupOutputInstanceManager = new GeomPartInstanceRemoveManager(this.processingGroupGeoGroup);// 20 is  the max internal instances to  manage
        }

        public  drawGroup(processingGroup:ProcessingGroup,ratio:number):void
        {

            if (ratio < 1) {
                this.drawPreviewObject(processingGroup,ratio);
            }

            if (ratio == 1) {
                this.commitTransformableObject(processingGroup);
            }

        }

        private drawPreviewObject(processingGroup:ProcessingGroup,ratio:number):void
        {

            var translatedGroup:ProcessingGroup =  <ProcessingGroup>processingGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
            var previewGroupPart:GeometryPart = this.processingGroupGeoGroup.processingGroup(translatedGroup);
            this.groupOutputInstanceManager.manageMesh(previewGroupPart);

        }

        public commitTransformableObject(processingGroup:ProcessingGroup):void
        {
            this.groupOutputInstanceManager.clearAll();
            this.commit(processingGroup);
        }

        private commit(processingGroup:ProcessingGroup):void
        {

            var translatedGroup:ProcessingGroup =  <ProcessingGroup>processingGroup.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
            var outputMesh:Mesh = this.ui3DScript.commitProcessingGroup(translatedGroup);
            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitCreate(processingGroup:ProcessingGroup):void
        {
            this.commit(processingGroup);
        }

        public removeInternalDrawings():void
        {
            this.groupOutputInstanceManager.clearAll();
        }


    }


}