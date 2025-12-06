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
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class VirtualRotator extends BaseVirtualObject
    {
        public ui3DScript:UI3DScript;
        public rotatorGroup:GeometryGroup;
        public rotatePartHandler:RotatePartHandler=null;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
            this.createRotatorGroup();
        }

        public createRotatorGroup():void
        {
            this.rotatorGroup = new GeometryGroup(this.ui3DScript);
        }

        public rotate(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point,ratio:number):void
        {
            if(ratio < 1)
            {
                this.rotatePartHandler.drawPreviewObject(itransformable,angleInDegress*ratio,rotateAbout);
            }

            if(ratio==1)
            {
                this.rotatePartHandler.commitTransformableObject(itransformable,angleInDegress,rotateAbout);
            }
        }



        public directCommitRotate(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):void
        {
            this.rotatePartHandler.directCommitRotate(itransformable,angleInDegress,rotateAbout);
        }

        public removeInternalDrawings():void
        {
            if(this.rotatePartHandler)
            this.rotatePartHandler.removeInternalDrawings();
        }

        public getLabelPosition(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point):Point
        {
            var reflectedObject:ITransformable = itransformable.rotateTransform(angleInDegress,rotateAbout);

            var translatedObject:ITransformable =  reflectedObject.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            return translatedObject.getLabelPosition();
        }

        public doDrawOn2D(itransformable:ITransformable,angleInDegress:number,rotateAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            this.rotatePartHandler.drawOn2D(itransformable,angleInDegress,rotateAbout,graphSheet2D);
        }

    }

}

