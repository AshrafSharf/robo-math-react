/**
 * Created by Mathdisk on 3/31/14.
 */

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
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export class VirtualDilator extends BaseVirtualObject
    {
        public ui3DScript:UI3DScript;
        public transformerGroup:GeometryGroup;
        public dilatePartHandler:DilatePartHandler=null;

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

        public dilate(itransformable:ITransformable,scaleValue:number,dilateAbout:Point,ratio:number):void
        {
            if(ratio < 1)
            {
                this.dilatePartHandler.drawPreviewObject(itransformable,scaleValue*ratio,dilateAbout);
            }

            if(ratio==1)
            {
                this.dilatePartHandler.commitTransformableObject(itransformable,scaleValue*ratio,dilateAbout);
            }
        }



        public directCommitTransform(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {
            this.dilatePartHandler.directCommitTransform(itransformable,scaleValue,dilateAbout);
        }

        public removeInternalDrawings():void
        {
            if(this.dilatePartHandler)
            this.dilatePartHandler.removeInternalDrawings();

        }

        public getLabelPosition(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):Point
        {
            var reflectedObject:ITransformable = itransformable.dilateTransform(scaleValue,dilateAbout);

            var translatedObject:ITransformable =  reflectedObject.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            return translatedObject.getLabelPosition();
        }

        public doDrawOn2D(itransformable:ITransformable,scaleValue:number,dilateAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            this.dilatePartHandler.drawOn2D(itransformable,scaleValue,dilateAbout,graphSheet2D);
        }
    }

}

