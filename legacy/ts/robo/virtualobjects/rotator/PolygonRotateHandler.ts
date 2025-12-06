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
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class PolygonRotateHandler extends  RotatePartHandler
    {
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualRotator:VirtualRotator)
        {
            super(virtualRotator);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualRotator.rotatorGroup);// 20 is  the max internal instances to  manage

        }

        public drawPreviewObject(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            var rotatedPolygon:ProcessingPolygon2D = <ProcessingPolygon2D>itransformable.rotateTransform(angleInDegress,rotateAbout);
            rotatedPolygon =  <ProcessingPolygon2D>rotatedPolygon.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewLinePart:GeometryPart = this.virtualRotator.rotatorGroup.polyline(rotatedPolygon.points);
            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public commitTransformableObject(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            this.lineOutputInstanceManager.clearAll();
            this.commitPolygon(itransformable,angleInDegress,rotateAbout);
        }

        private commitPolygon(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            var rotatedPolygon:ProcessingPolygon2D = <ProcessingPolygon2D>itransformable.rotateTransform(angleInDegress,rotateAbout);
            rotatedPolygon =  <ProcessingPolygon2D>rotatedPolygon.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualRotator.ui3DScript.commitPolyLine(rotatedPolygon.points);
            this.virtualRotator.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }



        public directCommitRotate(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            this.commitPolygon(itransformable,angleInDegress,rotateAbout);
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            var rotatedPolygon:ProcessingPolygon2D = <ProcessingPolygon2D>itransformable.rotateTransform(angleInDegress,rotateAbout);
            rotatedPolygon =  <ProcessingPolygon2D>rotatedPolygon.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var polyPoints:Point[] = rotatedPolygon.points;
            var len:number = polyPoints.length;
            for (var i = 0; i < len; i++)
            {
                var start:Point = polyPoints[i];
                var end:Point = polyPoints[(i+1)%len];

                //always send the cloned pts
                graphSheet2D.drawLine(start.clone(),end.clone());
            }
        }

    }

}