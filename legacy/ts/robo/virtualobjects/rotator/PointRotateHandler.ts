/**
 * Created by Mathdisk on 3/31/14.
 */



///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

module robo.virtualobjects.rotator
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


    export class PointRotateHandler extends RotatePartHandler
    {
        private  previewPointPart:GeometryPart=null;

        constructor(virtualRotator:VirtualRotator)
        {
            super(virtualRotator);
        }

        public drawPreviewObject(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            this.virtualRotator.rotatorGroup.removePart(this.previewPointPart);

            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.rotateTransform(angleInDegress,rotateAbout);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var sourcePt:Point = rotatedPoint.getSourcePoint();

            //Preview is done on GeometryGroup and commit is done on UI3D script
            this.previewPointPart = this.virtualRotator.rotatorGroup.point3d(sourcePt.x,sourcePt.y,0);
        }

        public commitTransformableObject(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            this.virtualRotator.rotatorGroup.removePart(this.previewPointPart);

            this.commitPoint(itransformable,angleInDegress,rotateAbout);
        }

        private commitPoint(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.rotateTransform(angleInDegress,rotateAbout);

            //We used to translate model in the command for handling graphSheet offset...we are doing it here
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var sourcePt:Point = rotatedPoint.getSourcePoint();

            var outputMesh:Mesh =this.virtualRotator.ui3DScript.commitPoint3d(new Point3D(sourcePt.x,sourcePt.y,0));
            this.virtualRotator.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitRotate(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            this.commitPoint(itransformable,angleInDegress,rotateAbout);
        }

        public removeInternalDrawings():void
        {
            this.virtualRotator.rotatorGroup.removePart(this.previewPointPart);
            this.previewPointPart= null;
        }

        public drawOn2D(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            var rotatedPoint:TransformablePoint = <TransformablePoint>itransformable.rotateTransform(angleInDegress,rotateAbout);
            rotatedPoint = <TransformablePoint>rotatedPoint.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            graphSheet2D.drawPoint(rotatedPoint.getSourcePoint());
        }
    }

}