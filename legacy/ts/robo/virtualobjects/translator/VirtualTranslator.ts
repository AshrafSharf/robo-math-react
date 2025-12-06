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
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class VirtualTranslator extends BaseVirtualObject
    {
        public ui3DScript:UI3DScript;
        public transformerGroup:GeometryGroup;
        public translatePartHandler:TranslatePartHandler=null;

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

        public translate(itransformable:ITransformable,transValue:Point,transAbout:Point,ratio:number):void
        {
            if(ratio < 1)
            {
                var tweenTransX:number = PMath.lerp(0,transValue.x,ratio);
                var tweenTransY:number = PMath.lerp(0,transValue.y,ratio);
                this.translatePartHandler.drawPreviewObject(itransformable,new Point(tweenTransX,tweenTransY),transAbout);
            }

            if(ratio==1)
            {
                this.translatePartHandler.commitTransformableObject(itransformable,transValue,transAbout);
            }
        }


        public directCommitTransform(itransformable:ITransformable,transValue:Point,transAbout:Point):void
        {
            this.translatePartHandler.directCommitTransform(itransformable,transValue,transAbout);
        }

        public removeInternalDrawings():void
        {
            if(this.translatePartHandler)
            this.translatePartHandler.removeInternalDrawings();
        }

        public getLabelPosition(itransformable:ITransformable,transValue:Point,transAbout:Point):Point
        {
            var reflectedObject:ITransformable = itransformable.translateTransform(transValue,transAbout);

            var translatedObject:ITransformable =  reflectedObject.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            return translatedObject.getLabelPosition();
        }

        public doDrawOn2D(itransformable:ITransformable,transValue:Point,transAbout:Point,graphSheet2D:GraphSheet2D):void
        {
            this.translatePartHandler.drawOn2D(itransformable,transValue,transAbout,graphSheet2D);
        }
    }

}

