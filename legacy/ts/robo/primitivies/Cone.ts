/**
 * Created by rizwan on 3/17/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.primitives
{
    import Mesh = away.entities.Mesh;
    import ConeGeometry = away.primitives.ConeGeometry;
    import MaterialBase = away.materials.MaterialBase;

    export class Cone extends  Mesh
    {
        private coneGeometry:ConeGeometry;

        public  constructor(material:MaterialBase=null)
        {
            this.coneGeometry = new ConeGeometry();
            super(this.coneGeometry, material);
        }

        public get radius():number
        {
            return this.coneGeometry.bottomRadius;
        }

        public set radius(value:number)
        {
            this.coneGeometry.bottomRadius=value;
            this.coneGeometry.topRadius=0;
        }

        public get height():number
        {
            return this.coneGeometry.height;
        }

        public set height(value:number)
        {
            this.coneGeometry.height=value;
        }

        public get bottomRadius():number
        {
            return this.coneGeometry.bottomRadius;
        }

        public set bottomRadius(value:number)
        {
            this.coneGeometry.bottomRadius=value;

        }

        public get topRadius():number
        {
            return this.coneGeometry.topRadius;
        }

        public set topRadius(value:number)
        {
            this.coneGeometry.topRadius=value;
        }

        public get segmentsH():number
        {
            return this.coneGeometry.segmentsH;
        }

        public set segmentsH(value:number)
        {
            this.coneGeometry.segmentsH=value;
        }

        public get segmentsW():number
        {
            return this.coneGeometry.segmentsW;
        }

        public set segmentsW(value:number)
        {
            this.coneGeometry.segmentsW=value;
        }

        public set yUp(value:boolean)
        {
            this.coneGeometry.yUp=value;
        }

        public dispose():void
        {
            this.coneGeometry.dispose();

            super.dispose();
        }
    }
}
