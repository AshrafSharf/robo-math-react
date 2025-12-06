/**
 * Created by Mathdisk on 5/28/14.
 */

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
    import TransformablePoint = robo.core.TransformablePoint;
    import GraphSheet2D = robo.twod.GraphSheet2D;


    export class DilatePartHandler
    {
        public virtualTransformer:VirtualDilator;

        constructor(virtualTranslator:VirtualDilator)
        {
           this.virtualTransformer = virtualTranslator;

           this.virtualTransformer.dilatePartHandler=this;
        }

        public drawPreviewObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {

        }

        public commitTransformableObject(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {

        }


        public directCommitTransform(itransformable:ITransformable,scaleValue:number,dilateAbout:Point):void
        {

        }

        public removeInternalDrawings():void
        {

        }


        public drawOn2D(itransformable:ITransformable,scaleValue:number,dilateAbout:Point,graphSheet2D:GraphSheet2D):void
        {

        }
    }


}
