/**
 * Created by MohammedAzeem on 3/17/14.
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
    import TorusGeometry = away.primitives.TorusGeometry;
    import MaterialBase = away.materials.MaterialBase;

    export class Torus extends  Mesh
    {
        private torusGeometry:TorusGeometry;

        public  constructor(material:MaterialBase=null)
        {
            this.torusGeometry = new TorusGeometry();
            super(this.torusGeometry, material);
        }

        /**
         * The radius of the torus.
         */
        public get radius() : number
        {
            return this.torusGeometry.radius;
        }

        public set radius(value : number)
        {
            this.torusGeometry.radius = value;
        }

            /**
             * The radius of the inner tube of the torus.
             */
        public get tubeRadius() : number
        {
            return this.torusGeometry.tubeRadius;
        }

        public set tubeRadius(value : number)
        {
            this.torusGeometry.tubeRadius =value;
        }

            /**
             * Defines the number of horizontal segments that make up the torus. Defaults to 16.
             */
        public get segmentsR() : number
        {
            return this.torusGeometry.segmentsR;
        }

        public set segmentsR(value : number)
        {
            this.torusGeometry.segmentsR=value;
        }

            /**
             * Defines the number of vertical segments that make up the torus. Defaults to 8.
             */
        public get segmentsT() : number
        {
            return this.torusGeometry.segmentsT;
        }

        public set segmentsT(value : number)
        {
            this.torusGeometry.segmentsT = value;
        }

            /**
             * Defines whether the torus poles should lay on the Y-axis (true) or on the Z-axis (false).
             */
        public get yUp() : boolean
        {
            return this.torusGeometry.yUp;
        }

        public set yUp(value : boolean)
        {
            this.torusGeometry.yUp = value;
        }

    }

}