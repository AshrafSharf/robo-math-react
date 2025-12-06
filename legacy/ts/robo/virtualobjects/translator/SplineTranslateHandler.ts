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
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class SplineTranslateHandler extends  TranslatePartHandler
    {
        private lineOutputInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualTranslator:VirtualTranslator)
        {
            super(virtualTranslator);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualTransformer.transformerGroup);// 20 is  the max internal instances to  manage
        }

        public drawPreviewObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            var translatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.translateTransform(transValue,transAbout);
            translatedSpline =  <ProcessingSpline2D>translatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewLinePart:GeometryPart = this.virtualTransformer.transformerGroup.spline(translatedSpline.outPutAsPoint3D());
            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public commitTransformableObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.lineOutputInstanceManager.clearAll();
            this.commitSpline(itransformable,transValue,transAbout);
        }

        private commitSpline(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            var translatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.translateTransform(transValue,transAbout);
            translatedSpline =  <ProcessingSpline2D>translatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh:Mesh = this.virtualTransformer.ui3DScript.commitSpline(translatedSpline.outPutAsPoint3D());
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.commitSpline(itransformable,transValue,transAbout);
        }

        public removeInternalDrawings():void
        {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,transValue:Point,transAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            var translatedSpline:ProcessingSpline2D = <ProcessingSpline2D>itransformable.translateTransform(transValue,transAbout);
            translatedSpline =  <ProcessingSpline2D>translatedSpline.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var polyPoints:Point[] = translatedSpline.splineOutputPoints;
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