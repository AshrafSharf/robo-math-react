/**
 * Created by Mathdisk on 3/15/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *
 * Note the as3 version of cylinder has getters and setter which i removed by mistake, the other primitives can
 * have exactly the same as as3 version.Just make sure not to have :void on setters..
 */
module robo.primitives
{

    import Mesh = away.entities.Mesh;
    import CylinderGeometry = away.primitives.CylinderGeometry;
    import MaterialBase = away.materials.MaterialBase;

    export class Cylinder extends  Mesh
    {
        private cylinderGeometry:CylinderGeometry;

    public  constructor(material:MaterialBase=null)
    {
        this.cylinderGeometry = new CylinderGeometry();
        super(this.cylinderGeometry, material);
    }


    public get radius():number
    {
        return this.cylinderGeometry.bottomRadius;
    }

    public  set radius(value:number)
    {
       this.cylinderGeometry.bottomRadius=value;
       this.cylinderGeometry.topRadius=0;
    }

    public  get height():number
    {
       return this.cylinderGeometry.height;
    }

        public  set height(value:number)
        {
            this.cylinderGeometry.height=value;
        }

        public  get bottomRadius():number
        {
            return this.cylinderGeometry.bottomRadius;
        }

        public set bottomRadius(value:number)
        {
            this.cylinderGeometry.bottomRadius=value;

        }


        public get topRadius():number
        {
            return this.cylinderGeometry.topRadius;
        }

        public  set topRadius(value:number)
        {
            this.cylinderGeometry.topRadius=value;
        }

        public  get segmentsH():number
        {
            return this.cylinderGeometry.segmentsH;
        }

        public  set segmentsH(value:number)
        {
            this.cylinderGeometry.segmentsH=value;
        }

        public  get segmentsW():number
        {
            return this.cylinderGeometry.segmentsW;
        }

        public set segmentsW(value:number)
        {
            this.cylinderGeometry.segmentsW=value;
        }

        public  set yUp(value:boolean)
        {
            this.cylinderGeometry.yUp=value;
        }


        public dispose():void
        {

            this.cylinderGeometry.dispose();

            super.dispose();
        }

            /**
             * Defines whether the top end of the cylinder is closed (true) or open.
             */
        public get topClosed() : boolean
        {
            return this.cylinderGeometry.topClosed;
        }

        public set topClosed(value : boolean)
        {
            this.cylinderGeometry.topClosed = value;
        }

            /**
             * Defines whether the bottom end of the cylinder is closed (true) or open.
             */
        public get bottomClosed() : boolean
        {
            return this.cylinderGeometry.bottomClosed;
        }

        public  set bottomClosed(value : boolean)
        {
            this.cylinderGeometry.bottomClosed = value;
        }

    }

}