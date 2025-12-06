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
    import ProcessingCircle = robo.core.ProcessingCircle;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class ArcTranslatePartHandler extends  TranslatePartHandler
    {
        private arcInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualTranslator:VirtualTranslator)
        {
            super(virtualTranslator);
            this.arcInstanceManager = new GeomPartInstanceRemoveManager(this.virtualTransformer.transformerGroup);
        }


        public drawPreviewObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            var processingCircle:ProcessingCircle = <ProcessingCircle>itransformable.translateTransform(transValue,transAbout);
            processingCircle =  <ProcessingCircle>processingCircle.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var origin2d:Point = new Point(processingCircle.ox,processingCircle.oy);
            var origin:Point3D = new Point3D(origin2d.x,origin2d.y,0);
            var normal:Point3D = new Point3D(0,0,1);
            var axisVt:Point3D = new Point3D(1,0,0);
            var radius:number = processingCircle.radius;
            var fromAngleInDegrees:number = processingCircle.getUIFromAngle();
            var toAngleInDegrees:number = processingCircle.getUIToAngle();

            var previewEllipticArcPart:GeometryPart = this.virtualTransformer.transformerGroup.ellipticArc3d(origin,normal,axisVt,radius,radius,PMath.radians(fromAngleInDegrees),PMath.radians(toAngleInDegrees));
            this.arcInstanceManager.manageMesh(previewEllipticArcPart);

        }

        public commitTransformableObject(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.arcInstanceManager.clearAll();
            this.commitArc(itransformable,transValue,transAbout);
        }

        private commitArc(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            var processingCircle:ProcessingCircle = <ProcessingCircle>itransformable.translateTransform(transValue,transAbout);
            processingCircle =  <ProcessingCircle>processingCircle.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var origin2d:Point = new Point(processingCircle.ox,processingCircle.oy);
            var origin:Point3D = new Point3D(origin2d.x,origin2d.y,0);
            var normal:Point3D = new Point3D(0,0,1);
            var axisVt:Point3D = new Point3D(1,0,0);
            var radius:number = processingCircle.radius;
            var fromAngleInDegrees:number = processingCircle.getUIFromAngle();
            var toAngleInDegrees:number = processingCircle.getUIToAngle();

            var outputMesh:Mesh = this.virtualTransformer.ui3DScript.commitEllipticArc3d(origin,normal,axisVt,radius,radius,PMath.radians(fromAngleInDegrees),PMath.radians(toAngleInDegrees));
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.commitArc(itransformable,transValue,transAbout);
        }

        public removeInternalDrawings():void
        {
            this.arcInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,transValue:Point,transAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            var processingCircle:ProcessingCircle = <ProcessingCircle>itransformable.translateTransform(transValue,transAbout);
            processingCircle =  <ProcessingCircle>processingCircle.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var origin:Point = new Point(processingCircle.ox,processingCircle.oy);
            var radius:number = processingCircle.radius/2;
            var fromAngleInDegrees:number = processingCircle.getUIFromAngle();
            var toAngleInDegrees:number = processingCircle.getUIToAngle();

            graphSheet2D.drawArc(origin,radius,fromAngleInDegrees,toAngleInDegrees);
        }
    }
}