/**
 * Created by Mathdisk on 3/18/14.
 */
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.geom {


    import Point3D = robo.core.Point3D;
    import RotationInfo=robo.core.RotationInfo;
    import Geometric3DUtil = robo.core.Geometric3DUtil;
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Mesh = away.entities.Mesh;
    import MaterialBase = away.materials.MaterialBase;
    import ColorMaterial = away.materials.ColorMaterial;
    import Geometry = away.base.Geometry;
    import UI3DScript = robo.geom.UI3DScript;


    export class HeightBasedGeometryPart extends GeometryPart {

        private height:number = 0;//


        constructor(height:number, ui3DScript:UI3DScript, part:Mesh) {

            super(ui3DScript, part);
            this.height = height;

        }

        public  alignTo(startPt:Point3D, endPt:Point3D):void {
            //now convert everything to UI
            var startPtVect:Vector3D = this.toUIVector(startPt);
            var endPtVect:Vector3D = this.toUIVector(endPt);


            var uiHeight:number = this.toUILength(this.height);

            var rotationInfo:RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtVect), Point3D.fromVector3D(endPtVect));
            var transformationMatrix:Matrix3D = new Matrix3D();

            transformationMatrix.appendTranslation(0, uiHeight / 2, 0);//natural pos, cylinder,cone,capsule are all aligned in the middle (so h/2)
            transformationMatrix.appendRotation(rotationInfo.degree, rotationInfo.axis.toVector3D());//rotate about

            //the actual translation
            //	startPt = graphSheet3D.graphsheet3DBound.toDefaultView(startPt); // We are dealing with Away3D generated cylinder,so we must give the coordinates only in away3d's default coordinate
            transformationMatrix.appendTranslation(startPtVect.x, startPtVect.y, startPtVect.z);

            this.part._iMatrix3D = transformationMatrix;

            this.originalUIPosition = GeometryPart.partUIPosition(this.part).clone();
        }

    }

}