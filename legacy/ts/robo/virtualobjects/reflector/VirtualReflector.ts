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
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class VirtualReflector extends BaseVirtualObject
    {
        public ui3DScript:UI3DScript;
        public transformerGroup:GeometryGroup;
        public reflectPartHandler:ReflectPartHandler = null;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
            this.createTransformerGroup();
        }

        public createTransformerGroup():void
        {
            this.transformerGroup = new GeometryGroup(this.ui3DScript);
        }

        public reflect(itransformable:ITransformable,reflectAbout:Point[],ratio:number):void
        {
            if(ratio < 1)
            {
                this.reflectPartHandler.drawPreviewObject(itransformable,reflectAbout,ratio);
            }

            if(ratio==1)
            {
                this.reflectPartHandler.commitTransformableObject(itransformable,reflectAbout);
            }
        }

        public directCommitTransform(itransformable:ITransformable,reflectAbout:Point[]):void
        {
            this.reflectPartHandler.directCommitTransform(itransformable,reflectAbout);
        }

        public removeInternalDrawings():void
        {
            if(this.reflectPartHandler)
                this.reflectPartHandler.removeInternalDrawings();
        }

        public getLabelPosition(itransformable:ITransformable,reflectAbout:Point[]):Point
        {
            var reflectedObject:ITransformable = itransformable.reflectTransform(reflectAbout[0],reflectAbout[1],1);

            var translatedObject:ITransformable =  reflectedObject.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            return translatedObject.getLabelPosition();
        }

        public doDrawOn2D(itransformable:ITransformable,reflectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            this.reflectPartHandler.drawOn2D(itransformable,reflectAbout,graphSheet2D);
        }
    }
}
