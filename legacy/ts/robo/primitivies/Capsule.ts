/**
 * Created by rizwan on 3/17/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.primitives
{
    import Mesh = away.entities.Mesh;
    import CapsuleGeometry = away.primitives.CapsuleGeometry;
    import MaterialBase = away.materials.MaterialBase;

    export class Capsule extends  Mesh
    {
        private capsuleGeometry:CapsuleGeometry;

        public  constructor(material:MaterialBase=null)
        {
            this.capsuleGeometry = new CapsuleGeometry();
            super(this.capsuleGeometry, material);
        }


         public get radius():number
         {
             return this.capsuleGeometry.radius;
         }

          public set radius(value:number)
          {
             this.capsuleGeometry.radius = value;
          }


        public get height():number
        {
            return this.capsuleGeometry.height;
        }

        public set height(value:number)
        {
            this.capsuleGeometry.height = value;
        }

            /**
             * Defines the number of horizontal segments that make up the capsule. Defaults to 16.
             */
        public get segmentsW():number
        {
            return this.capsuleGeometry.segmentsW;
        }

        public  set segmentsW(value:number)
        {
            this.capsuleGeometry.segmentsW=value;
        }

            /**
             * Defines the number of vertical segments that make up the capsule. Defaults to 12.
             */
        public  get segmentsH():number
        {
            return this.capsuleGeometry.segmentsH;
        }

        public  set segmentsH(value:number)
        {
            this.capsuleGeometry.segmentsH=value;
        }

            /**
             * Defines whether the capsule poles should lay on the Y-axis (true) or on the Z-axis (false).
             */
        public  get yUp():boolean
        {
            return this.capsuleGeometry.yUp;
        }

        public set yUp(value:boolean)
        {
            this.capsuleGeometry.yUp = value;
        }

    }
}

