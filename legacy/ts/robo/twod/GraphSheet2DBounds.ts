/**
 * Created by Mathdisk on 4/26/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.twod {

    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Point = away.geom.Point;

    import TextField = away.entities.TextField;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import GraphSheet3DBounds = robo.geom.GraphSheet3DBounds;


    export class GraphSheet2DBounds {


        public static ZOOM_FACTOR:number = 1.5;

        public static MIN_SCALE:number = GraphSheet3DBounds.MIN_SCALE/GraphSheet2DBounds.ZOOM_FACTOR;
        public static MAX_SCALE:number = GraphSheet3DBounds.MAX_SCALE/GraphSheet2DBounds.ZOOM_FACTOR;

        public static DEFAULT_SCALE:number = GraphSheet2DBounds.MIN_SCALE;
        public static DEFAULT_SCALE_FACTOR:number = GraphSheet3DBounds.SCALE_STEP_FACTOR;

        public static SCALE_STEP_FACTOR:number = GraphSheet2DBounds.SCALE_STEP_FACTOR;


        private  xModelMin:number;
        private  xModelMax:number;
        private  yModelMin:number;
        private  yModelMax:number;
        private  graphsheet2D:GraphSheet2D;
        private  _xUIScale:number = GraphSheet2DBounds.DEFAULT_SCALE;//in Pixels
        private  _yUIScale:number = GraphSheet2DBounds.DEFAULT_SCALE;
        private  xUIOrigin:number;
        private  yUIOrigin:number;
        private  xUnit:number = 1;
        private  yUnit:number = 1;

        private  _scaleXFactorValue:number = GraphSheet2DBounds.DEFAULT_SCALE_FACTOR;
        private  _scaleYFactorValue:number = GraphSheet2DBounds.DEFAULT_SCALE_FACTOR;

        private  _graphSheetScale:number = GraphSheet2DBounds.MIN_SCALE;

        constructor(graphsheet2D:GraphSheet2D) {

            this.graphsheet2D = graphsheet2D;

            this.doInit();
        }

        public doInit():void{

            this.initializeOrigin();

            this.calculateBounds();
        }

        private initializeOrigin():void {
            this.xUIOrigin = this.graphsheet2D.width / 2;

            this.yUIOrigin = this.graphsheet2D.height / 2;
        }

        private calculateBounds():void {

            this.xUIOrigin = Math.floor(this.xUIOrigin);
            this.yUIOrigin = Math.floor(this.yUIOrigin);

            this.xModelMin = -this.xUIOrigin * (this.xUnit / this._xUIScale);
            this.xModelMax = (this.graphsheet2D.width - this.xUIOrigin) * (this.xUnit / this._xUIScale);

            this.yModelMin = (this.yUIOrigin - this.graphsheet2D.height) * (this.yUnit / this._yUIScale);
            this.yModelMax = this.yUIOrigin * (this.yUnit / this._yUIScale);
        }

        public translateOrigin(tx:number, ty:number):void {

            this.xUIOrigin += tx;
            this.yUIOrigin += ty;

            this.calculateBounds();
        }

        public toModel(viewPoint:Vector3D):Point {

            var modelPoint:Point = new Point();

            modelPoint.x = this.toModelX(viewPoint.x);
            modelPoint.y = this.toModelY(viewPoint.y);

            return modelPoint;
        }

        public toModelX(viewX:number):number {

            return  (viewX - this.xUIOrigin) * (this.xUnit / this._xUIScale);
        }


        public toModelY(viewY:number):number {

            return   (this.yUIOrigin - viewY) * (this.yUnit / this._yUIScale);
        }


        public toView(modelPoint:any):Point {
            var viewPoint:Point = new Point();

            viewPoint.x = this.toViewX(modelPoint.x);
            viewPoint.y = this.toViewY(modelPoint.y);//works only when value is negative

            return viewPoint;
        }

        public  toViewX(modelX:number):number {
            var uiX:number = this.xUIOrigin + (modelX * (this._xUIScale / this.xUnit))

            return uiX;
        }


        public  toViewY(modelY:number):number {
            var uiY:number = this.yUIOrigin - (modelY * (this._yUIScale / this.yUnit));

            return uiY;
        }


        public  toUILength(modelLength:number):number {

            return (this._graphSheetScale / this.xUnit) * modelLength;
        }

        public getXUIOrigin():number {

            return this.xUIOrigin;
        }

        public getYUIOrigin():number {

            return this.yUIOrigin;
        }


        public  getXUIScale():number {
            return this._xUIScale;
        }


        public  getYUIScale():number {
            return this._yUIScale;
        }

        public toTranslateXWithOutOrigin(modelX):number{

            return (modelX * (this._xUIScale / this.yUnit));
        }

        public toTranslateYWithOutOrigin(modelY):number{

            return (modelY * (this._yUIScale / this.yUnit));
        }

        public setXUIScale(value:number):void {
            this._xUIScale = value;
        }

        public setYUIScale(value:number):void {
            this._yUIScale = value;
        }

    }

}