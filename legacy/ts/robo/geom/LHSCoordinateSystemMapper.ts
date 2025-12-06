/**
 * Created by Mathdisk on 3/15/14.
 */


///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.geom {
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point3D = robo.core.Point3D;
    import ICoordinateSystemMapper = robo.geom.ICoordinateSystemMapper;
    import DelaunayMesh = robo.util.DelaunayMesh;

    export class LHSCoordinateSystemMapper implements ICoordinateSystemMapper {

        constructor() {

        }

        public  mappedX(xVal:number, yVal:number, zVal:number):number {
            return yVal;//Away3d coordinates X is mapped to Z
        }

        public  mappedY(xVal:number, yVal:number, zVal:number):number {
            return zVal;//Away3d coordinate's Y is mapped to Z
        }

        public  mappedZ(xVal:number, yVal:number, zVal:number):number {
            return xVal;//Away3d coordinate's Z is mapped to X
        }

        public  transformBasedOnCoordinateSystem(vector3D:Vector3D):Vector3D {
            var xVal:number = vector3D.x;
            var yVal:number = vector3D.y;
            var zVal:number = vector3D.z;

            vector3D.x = yVal;
            vector3D.y = zVal;
            vector3D.z = xVal;

            return vector3D;

        }


        public  xzPlaneNormalVector():Vector3D {
            return  new Vector3D(1, 0, 0);
        }


        public   getWidth(width:number, height:number, depth:number):number {

            return height;
        }

        public   getHeight(width:number, height:number, depth:number):number {

            return depth;
        }

        public   getDepth(width:number, height:number, depth:number):number {

            return width;
        }


        public  mappedPlaneNormalVector(planeNormal:Vector3D):Vector3D {

            return new Vector3D(planeNormal.y, planeNormal.z, planeNormal.x, planeNormal.w);
        }


        public  systemMappedX(xVal:number, yVal:number, zVal:number):number {

            return zVal;

        }

        public  systemMappedY(xVal:number, yVal:number, zVal:number):number {

            return xVal;
        }

        public  systemMappedZ(xVal:number, yVal:number, zVal:number):number {
            return yVal;

        }


        public  isYup():Boolean {
            // TODO Auto Generated method stub
            return false;
        }


        /**
         * Maps Model to UI
         */
        public  mappedPlaneName(planeName:string):string {

            /**
             * public static const PLANE_XZ:String = "xz";
             public static const PLANE_XY:String = "xy";
             public static const PLANE_ZY:String = "zy";

             */


            var uiPlaneName:string = "";

            planeName = planeName.toLowerCase();


            switch (planeName) {
                case DelaunayMesh.PLANE_XY:
                    uiPlaneName = DelaunayMesh.PLANE_XZ;
                    break;

                case DelaunayMesh.PLANE_XZ:
                    uiPlaneName = DelaunayMesh.PLANE_ZY;
                    break;

                case DelaunayMesh.PLANE_ZY:
                    uiPlaneName = DelaunayMesh.PLANE_XY;
                    break;

            }

            return uiPlaneName;
        }


        public  getXLabel():string {
            return "Y";
        }

        public  getYLabel():string {
            return "Z";
        }

        public  getZLabel():string {
            return "X";
        }

    }


}