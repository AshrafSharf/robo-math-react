/**
 * Created by Mathdisk on 3/31/14.
 */



///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

module robo.virtualobjects.projector
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


    export class VirtualProjector extends BaseVirtualObject
    {
        public ui3DScript:UI3DScript;
        public transformerGroup:GeometryGroup;
        public projectPartHandler:ProjectPartHandler=null;

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

        public project(itransformable:ITransformable,projectAbout:Point[],ratio:number):void
        {
            if(ratio < 1)
            {
                this.projectPartHandler.drawPreviewObject(itransformable,projectAbout,ratio);
            }

            if(ratio==1)
            {
                this.projectPartHandler.commitTransformableObject(itransformable,projectAbout);
            }
        }

        public directCommitTransform(itransformable:ITransformable,projectAbout:Point[]):void
        {
            this.projectPartHandler.directCommitTransform(itransformable,projectAbout);
        }

        public removeInternalDrawings():void
        {
            if(this.projectPartHandler)
                this.projectPartHandler.removeInternalDrawings();
        }

        public getLabelPosition(itransformable:ITransformable,projectAbout:Point[]):Point
        {
            var projectedObject:ITransformable = itransformable.projectTransform(projectAbout[0],projectAbout[1],1);

            var projectedObject:ITransformable =  projectedObject.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset);

            return projectedObject.getLabelPosition();
        }

        public doDrawOn2D(itransformable:ITransformable,projectAbout:Point[],graphSheet2D:GraphSheet2D):void
        {
            this.projectPartHandler.drawOn2D(itransformable,projectAbout,graphSheet2D);
        }
    }

}

