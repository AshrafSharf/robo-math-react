/**
 * Created by rizwan on 5/30/14.
 */

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
    import ProcessingCircle = robo.core.ProcessingCircle;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class ArcReflectPartHandler extends  ReflectPartHandler
    {
        private arcInstanceManager:GeomPartInstanceRemoveManager;

        constructor(virtualReflector:VirtualReflector)
        {
            super(virtualReflector);

            this.arcInstanceManager = new GeomPartInstanceRemoveManager(this.virtualReflector.transformerGroup);
        }


        public drawPreviewObject(itransformable:ITransformable,reflectAbout:Point[],ratio:number):void
        {
            var processingCircle:ProcessingCircle = <ProcessingCircle>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],ratio);
            processingCircle =  <ProcessingCircle>processingCircle.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var origin2d:Point = new Point(processingCircle.ox,processingCircle.oy);
            var origin:Point3D = new Point3D(origin2d.x,origin2d.y,0);
            var normal:Point3D = new Point3D(0,0,1);
            var axisVt:Point3D = new Point3D(1,0,0);
            var radius:number = processingCircle.radius;
            var fromAngleInDegrees:number = processingCircle.getUIFromAngle();
            var toAngleInDegrees:number = processingCircle.getUIToAngle();

            var previewEllipticArcPart:GeometryPart = this.virtualReflector.transformerGroup.ellipticArc3d(origin,normal,axisVt,radius,radius,PMath.radians(fromAngleInDegrees),PMath.radians(toAngleInDegrees));
            this.arcInstanceManager.manageMesh(previewEllipticArcPart);
        }

        public commitTransformableObject(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.arcInstanceManager.clearAll();
            this.commitArc(itransformable,reflectAbout);
        }

        private commitArc(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            var processingCircle:ProcessingCircle = <ProcessingCircle>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            processingCircle =  <ProcessingCircle>processingCircle.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var origin2d:Point = new Point(processingCircle.ox,processingCircle.oy);
            var origin:Point3D = new Point3D(origin2d.x,origin2d.y,0);
            var normal:Point3D = new Point3D(0,0,1);
            var axisVt:Point3D = new Point3D(1,0,0);
            var radius:number = processingCircle.radius;
            var fromAngleInDegrees:number = processingCircle.getUIFromAngle();
            var toAngleInDegrees:number = processingCircle.getUIToAngle();

            var outputMesh:Mesh = this.virtualReflector.ui3DScript.commitEllipticArc3d(origin,normal,axisVt,radius,radius,PMath.radians(fromAngleInDegrees),PMath.radians(toAngleInDegrees));
            this.virtualReflector.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.commitArc(itransformable,reflectAbout);
        }

        public removeInternalDrawings():void
        {
            this.arcInstanceManager.clearAll();
        }

        public drawOn2D(itransformable:ITransformable,reflectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            var processingCircle:ProcessingCircle = <ProcessingCircle>itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);
            processingCircle =  <ProcessingCircle>processingCircle.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            var origin:Point = new Point(processingCircle.ox,processingCircle.oy);
            var radius:number = processingCircle.radius/2;
            var fromAngleInDegrees:number = processingCircle.getUIFromAngle();
            var toAngleInDegrees:number = processingCircle.getUIToAngle();

            graphSheet2D.drawArc(origin,radius,fromAngleInDegrees,toAngleInDegrees);
        }
    }
}
