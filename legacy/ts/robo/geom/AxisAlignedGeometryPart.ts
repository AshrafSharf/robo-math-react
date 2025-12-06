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

    export class AxisAlignedGeometryPart extends GeometryPart {

        private  axis:string; // need to know on which axis it was extruded,inorder to find the corect axis of rotation and degree


        public  constructor(axis:string, ui3DScript:UI3DScript, part:Mesh) {

            super(ui3DScript, part);
            this.axis = axis;
        }


        public  alignTo(startPt:Point3D, endPt:Point3D):void {
            //now convert everything to UI
            var startPtVect:Vector3D = this.toUIVector(startPt);
            var endPtVect:Vector3D = this.toUIVector(endPt);


            var uiMappedAxis:string = GeometryPart.getMappedAxis(this.axis);
            uiMappedAxis = uiMappedAxis.toLowerCase();

            var standardVector:Point3D = null;
            switch (uiMappedAxis) {
                case 'x':
                    standardVector = new Point3D(1, 0, 0);
                    break;

                case 'y':
                    standardVector = new Point3D(0, 1, 0);
                    break;

                case 'z':
                    standardVector = new Point3D(0, 0, 1);
                    break;


            }


            var rotationInfo:RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtVect), Point3D.fromVector3D(endPtVect), standardVector);
            var transformationMatrix:Matrix3D = new Matrix3D();

            transformationMatrix.appendRotation(rotationInfo.degree, rotationInfo.axis.toVector3D());//rotate about
            transformationMatrix.appendTranslation(startPtVect.x, startPtVect.y, startPtVect.z);

            this.part._iMatrix3D = transformationMatrix;

        }

    }


}