/**
 * Created by MohammedAzeem on 3/17/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.primitives
{
    import Mesh = away.entities.Mesh;
    import SphereGeometry = away.primitives.SphereGeometry;
    import MaterialBase = away.materials.MaterialBase;
    import Vector3D = away.geom.Vector3D;

    export class Sphere extends  Mesh
    {
        private sphereGeometry:SphereGeometry;

        public  constructor(material:MaterialBase=null)
        {
            this.sphereGeometry = new SphereGeometry();
            super(this.sphereGeometry, material);

        }

        public get radius():number
        {
            return this.sphereGeometry.radius;
        }

        public set radius(value:number)
        {
            this.sphereGeometry.radius=value;

        }

        public  get segmentsH():number
        {
            return this.sphereGeometry.segmentsH;
        }

        public  set segmentsH(value:number)
        {
            this.sphereGeometry.segmentsH=value;
        }

        public get segmentsW():number
        {
            return this.sphereGeometry.segmentsW;
        }

        public set segmentsW(value:number)
        {
            this.sphereGeometry.segmentsW=value;
        }

        public dispose():void
        {
            this.sphereGeometry.dispose();

            super.dispose();
        }

        public setPosition(point3D:Vector3D):void
        {
            this.x = point3D.x;
            this.y = point3D.y;
            this.z = point3D.z;

        }
    }
}
