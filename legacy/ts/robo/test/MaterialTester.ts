/**
 * Created by Mathdisk on 3/22/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


/**
 *
 *  This is the only class that is directly invoked from the Html.This class also acts as a facade.
 *  No class should be directly used from javascript view classes except this one.
 *  This class also should be last one in the definitions.ts (beause this is the one that creates all other instances)
 */
module robo.test {


    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Matrix3D = away.geom.Matrix3D;
    import Graphsheet3D=robo.geom.GraphSheet3D;
    import UI3DScript = robo.geom.UI3DScript;
    import Mesh = away.entities.Mesh;
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Ruler3D = robo.virtualobjects.Ruler3D;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import SetSquare3D = robo.virtualobjects.SetSquare3D;
    import Paper3D = robo.virtualobjects.Paper3D;
    import Protractor3D = robo.virtualobjects.Protractor3D;
    import Compass3D = robo.virtualobjects.Compass3D;
    import  Cast = away.utils.Cast;
    import BitmapData = away.base.BitmapData;
    import IRoboCommand = robo.command.IRoboCommand;
    import LineCommand =  robo.command.LineCommand;
    import CommandSequenceEffect = robo.sequence.CommandSequenceEffect;
    import TimerSequenceController = robo.sequence.TimerSequenceController;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Point = away.geom.Point;
    import TextureMaterial = away.materials.TextureMaterial;



    // controlls all the virtual objects
    // creates command objects
    // builds sequence Commands
    // uses TimerSequenceController to fire off sequences

    export class MaterialTester {

        private ui3DScript:UI3DScript;
        private _playSurfaceHTMLElement:HTMLElement;

        private static  SCALE_TEXTURE="assets/scale_texture.png";
        private static  PROTRACTOR_TEXTURE="assets/protractor_texture.png";
        private static  SETSQUARE_TEXTURE="assets/setsquare_texture.png";
        private static  PAPER_TEXTURE="assets/paper_texture.jpg";


        private scaleTextureBitmapData	: BitmapData;
        private protractorTextureBitmapData	:BitmapData;
        private setSquareTextureBitmapData	: BitmapData;
        private paperTextureBitmapData	: BitmapData;



        public rulerObj:Ruler3D;
        public setSquareObj:SetSquare3D;
        public  paperObj:Paper3D;
        public  protractorObj:Protractor3D;

        constructor($canvasContainer) // might recive many values as we go
        {
            //when needed use the $() to treat like a JQuery object
            this._playSurfaceHTMLElement = $canvasContainer[0];


        }

        public init():void
        {

            var graphSheet3D:Graphsheet3D = new robo.geom.GraphSheet3D(this._playSurfaceHTMLElement);
            this.ui3DScript = new UI3DScript(graphSheet3D);


            this.loadAssets();

            //this.testSomeDemoObjects();
        }




        //all compass,Scale,Pencil,SetSquare,Protractor gets constructed here
        public createVirtualObjects():void
        {

            if(this.scaleTextureBitmapData==null || this.paperTextureBitmapData==null)
            {
                return;
            }


            if(this.rulerObj==null)
            {
                this.rulerObj = new Ruler3D(this.ui3DScript);
                this.rulerObj.attachImage(this.scaleTextureBitmapData);
            }

            if(this.paperObj==null)
            {
                this.paperObj= new Paper3D(this.ui3DScript);
                this.paperObj.attachImage(this.paperTextureBitmapData);
            }




        }

        private loadAssets():void
        {
            this.loadAsset(MaterialTester.SCALE_TEXTURE);
            this.loadAsset(MaterialTester.PAPER_TEXTURE);


        }


        private loadAsset( path: string ):void
        {
            var token:away.net.AssetLoaderToken = away.library.AssetLibrary.load( new away.net.URLRequest( path ) );
            token.addEventListener( away.events.LoaderEvent.RESOURCE_COMPLETE, away.utils.Delegate.create(this, this.onResourceComplete) );
        }


        public onResourceComplete ( event: away.events.LoaderEvent )
        {
            var loader			: away.net.AssetLoader   	= <away.net.AssetLoader> event.target;
            var numAssets		: number 						= loader.baseDependency.assets.length;
            var i				: number						= 0;

            switch( event.url )
            {
                case MaterialTester.SCALE_TEXTURE:
                    this.scaleTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;

                case MaterialTester.PAPER_TEXTURE:
                    this.paperTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;

               /* case MaterialTester.SETSQUARE_TEXTURE:
                    this.setSquareTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;



                case MaterialTester.PROTRACTOR_TEXTURE:
                    this.protractorTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break; */

            }



            this.createVirtualObjects(); // This will get called for every Resouce, so this method checks if all the objects are assigned



        }



        public testSomeDemoObjects():void {


            var geometryGroup:GeometryGroup = new GeometryGroup(this.ui3DScript);
            var geometryPart:GeometryPart = geometryGroup.cylinder(new Point3D(0, 0, 0), new Point3D(0, 3, 0), 0.5, true, true);
            geometryGroup.removePart(geometryPart);
        }


        /** for checking Scale, return the scale mesh, or other objects create their respectve meshes and return it **/
        public getObjectMesh():Mesh
        {
            return this.rulerObj.getMesh();
        }

        public getTexture():TextureMaterial
        {
            return <TextureMaterial>this.rulerObj.getMesh().material;
        }


    }
}