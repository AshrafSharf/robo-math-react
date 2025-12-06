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


    export class PointTranslateHandler extends TranslatePartHandler
    {
        private  previewPointPart:GeometryPart=null;

        constructor(virtualTranslator:VirtualTranslator)
        {
            super(virtualTranslator);
        }

        public drawPreviewObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.virtualTransformer.transformerGroup.removePart(this.previewPointPart);

            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.translateTransform(transValue,transAbout);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var sourcePt:Point = rotatedPoint.getSourcePoint();

            //Preview is done on GeometryGroup and commit is done on UI3D script
            this.previewPointPart = this.virtualTransformer.transformerGroup.point3d(sourcePt.x,sourcePt.y,0);
        }


        public commitTransformableObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.virtualTransformer.transformerGroup.removePart(this.previewPointPart);

            this.commitPoint(itransformable,transValue,transAbout);
        }

        private commitPoint(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.translateTransform(transValue,transAbout);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);
            var sourcePt:Point = rotatedPoint.getSourcePoint();

            var outputMesh:Mesh =this.virtualTransformer.ui3DScript.commitPoint3d(new Point3D(sourcePt.x,sourcePt.y,0));
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.commitPoint(itransformable,transValue,transAbout);
        }

        public removeInternalDrawings():void
        {
            this.virtualTransformer.transformerGroup.removePart(this.previewPointPart);
            this.previewPointPart = null;
        }


        public drawOn2D(itransformable:ITransformable,transValue:Point,transAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.translateTransform(transValue,transAbout);
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            graphSheet2D.drawPoint(rotatedPoint.getSourcePoint());
        }
    }

}