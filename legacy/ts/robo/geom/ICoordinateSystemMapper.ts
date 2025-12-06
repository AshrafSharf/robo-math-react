/**
 * Created by Mathdisk on 3/12/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.geom {
    import Vector3D = away.geom.Vector3D;

    export interface ICoordinateSystemMapper {
        mappedX(xVal:number, yVal:number, zVal:number):number;
        mappedY(xVal:number, yVal:number, zVal:number):number;
        mappedZ(xVal:number, yVal:number, zVal:number):number;

        systemMappedX(xVal:number, yVal:number, zVal:number):number;
        systemMappedY(xVal:number, yVal:number, zVal:number):number;
        systemMappedZ(xVal:number, yVal:number, zVal:number):number;

        transformBasedOnCoordinateSystem(vector3D:Vector3D):Vector3D;



        getXLabel():string;
        getYLabel():string;
        getZLabel():string;



        xzPlaneNormalVector():Vector3D;

        mappedPlaneNormalVector(planeNormal:Vector3D):Vector3D;


        isYup():Boolean;


        mappedPlaneName(planeName:string):string;
    }

}