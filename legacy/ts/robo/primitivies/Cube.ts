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
    import CubeGeometry = away.primitives.CubeGeometry;
    import MaterialBase = away.materials.MaterialBase;

    export class Cube extends  Mesh
    { 
        private cubeGeometry:CubeGeometry;

        public constructor(material:MaterialBase=null)
        {
            this.cubeGeometry = new CubeGeometry();
            super(this.cubeGeometry, material);
        }

        public get depth():number
        {
            return this.cubeGeometry.depth;
        }

        public set depth(value:number)
        {
            this.cubeGeometry.depth = value;
        }

        public get height():number
        {
            return this.cubeGeometry.height;
        }

        public set height(value:number)
        {
            this.cubeGeometry.height = value;
        }

        public get width():number
        {
            return this.cubeGeometry.width;
        }

        public set width(value:number)
        {
            this.cubeGeometry.width=value;
        }

        public get segmentsH():number
        {
            return this.cubeGeometry.segmentsH;
        }

        public set segmentsH(value:number)
        {
            this.cubeGeometry.segmentsH=value;
        }

        public get segmentsW():number
        {
            return this.cubeGeometry.segmentsW;
        }

        public set segmentsW(value:number)
        {
            this.cubeGeometry.segmentsW=value;
        }

        public dispose():void
        {

            this.cubeGeometry.dispose();

            super.dispose();
        }

    }
}