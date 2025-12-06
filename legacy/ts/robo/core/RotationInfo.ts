/**
 * Created by Mathdisk on 3/15/14.
 */

///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.core {
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;


    export class RotationInfo {
        public axis:Point3D;
        public degree:number = 0;
        public standardAxis:Vector3D;
        public pivot:Point3D;

        public  byLineAlignment:Boolean = false;


        constructor(standardAxis:Vector3D=null) {

            if(standardAxis==null)
             this.standardAxis = new Vector3D(0, 1, 0);

            this.axis = new Point3D(0, 1, 0);
            this.degree = 0;
            this.standardAxis = new Vector3D(0, 1, 0);
        }


    }

}