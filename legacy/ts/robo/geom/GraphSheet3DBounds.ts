/**
 * Created by Mathdisk on 3/15/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *
 * No class needs to know GraphSheetBounds, all ui to model (or vice versa)
 * should be delegated through GraphSheet(which all classes know)
 */
module robo.geom {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point3D = robo.core.Point3D;
    import Vector3DUtils = robo.util.Vector3DUtils;
    import MathSystem = robo.util.MathSystem;
    import PMath = robo.util.PMath;
    import Point = away.geom.Point;


    export class GraphSheet3DBounds {

        public static SCALE_STEP_FACTOR: number = 10;
        public static MIN_SCALE: number = 50;
        public static MAX_SCALE: number = 100;
        public static DEFAULT_X_TRANSLATION: number = 0;
        public static DEFAULT_Y_TRANSLATION: number = 0;
        public static DEFAULT_Z_TRANSLATION: number = 0;
        private static GRAPH_SHEET_MIN_X: number = -14;
        private static GRAPH_SHEET_MAX_X: number = 24;


        public static DEFAULT_PLANE_DIMENSION: number = 500;
        public static DEFAULT_GRAPHSHEET_WIDTH: number = 500;
        public static DEFAULT_GRAPHSHEET_HEIGHT: number = 500;
        public static MIN_PLANE_DIMENSION: number = 50;
        public static MAX_PLANE_DIMENSION: number = 2000;

        private xModelMin: number;
        private xModelMax: number;

        private yModelMin: number;
        private yModelMax: number;

        private zModelMin: number;
        private zModelMax: number;

        private _graphSheetScale: number = GraphSheet3DBounds.MIN_SCALE;


        private maxXvalue: number;
        private minXvalue: number;

        private maxYValue: number;
        private minYValue: number;

        private maxZValue: number;
        private minZValue: number;


        private xZPlaneWidth: number = GraphSheet3DBounds.DEFAULT_PLANE_DIMENSION;//default value
        private xZPlaneHeight: number = GraphSheet3DBounds.DEFAULT_PLANE_DIMENSION;

        private yZPlaneWidth: number = GraphSheet3DBounds.DEFAULT_PLANE_DIMENSION;
        private yZPlaneHeight: number = GraphSheet3DBounds.DEFAULT_PLANE_DIMENSION;

        private xYPlaneWidth: number = GraphSheet3DBounds.DEFAULT_PLANE_DIMENSION;
        private xYPlaneHeight: number = GraphSheet3DBounds.DEFAULT_PLANE_DIMENSION;


        private xUnit: number = 1;//1 model uint is 40 pixels wide
        private yUnit: number = 1;
        private zUnit: number = 1;


        coordianteSystemMapper: ICoordinateSystemMapper;
        private graphsheet3D: GraphSheet3D;


        private xUIOrigin: number;
        private yUIOrigin: number;
        private zUIOrigin: number;


        constructor(graphsheet3D: GraphSheet3D) {

            this.graphsheet3D = graphsheet3D;
            this.coordianteSystemMapper = new LHSCoordinateSystemMapper();


            this.calculateBounds();

            this.xUIOrigin = 0;
            this.yUIOrigin = 0;
            this.zUIOrigin = 0;

        }


        public calculateBounds(): void {

            this.setUIBounds();

            this.adjustBoundForProperDivision();

            this.xModelMin = this.minXvalue * (this.xUnit / this._graphSheetScale);

            this.xModelMax = this.maxXvalue * (this.xUnit / this._graphSheetScale);

            this.yModelMin = this.minYValue * (this.yUnit / this._graphSheetScale);

            this.yModelMax = this.maxYValue * (this.yUnit / this._graphSheetScale);

            this.zModelMin = this.minZValue * (this.zUnit / this._graphSheetScale);

            this.zModelMax = this.maxZValue * (this.zUnit / this._graphSheetScale);

        }

        public getXModelMin(): number {
            return this.xModelMin;
        }

        public getXModelMax(): number {
            return this.xModelMax;
        }

        //this method  set  the  min and max bounds in away3d values
        private setUIBounds(): void {


            this.maxXvalue = this.xZPlaneWidth / 2 - this.xUIOrigin;
            this.minXvalue = -this.xZPlaneWidth / 2 - this.xUIOrigin;

            this.maxZValue = this.xZPlaneHeight / 2 - this.zUIOrigin;
            this.minZValue = -this.xZPlaneHeight / 2 - this.zUIOrigin;

            this.maxYValue = this.xYPlaneHeight / 2 - this.yUIOrigin;
            this.minYValue = -this.xYPlaneHeight / 2 - this.yUIOrigin;

        }


        adjustBoundForProperDivision(): void //The axis should always start with Integers rather than decimals
        {
            var offSet: number;

            offSet = this.maxXvalue % this._graphSheetScale;
            this.maxXvalue = this.maxXvalue - offSet;

            offSet = this.minXvalue % this._graphSheetScale;
            this.minXvalue = this.minXvalue - offSet;


            offSet = this.maxYValue % this._graphSheetScale;
            this.maxYValue = this.maxYValue - offSet;


            offSet = this.minYValue % this._graphSheetScale;
            this.minYValue = this.minYValue - offSet;


            offSet = this.maxZValue % this._graphSheetScale;
            this.maxZValue = this.maxZValue - offSet;


            offSet = this.minZValue % this._graphSheetScale;
            this.minZValue = this.minZValue - offSet;

        }


        public getXUIMin(): number {

            return this.mappedX(this.minXvalue, this.minYValue, this.minZValue);
        }

        public getXUIMax(): number {

            return this.mappedX(this.maxXvalue, this.maxYValue, this.maxZValue);
        }


        public getYUIMin(): number {

            return this.mappedY(this.minXvalue, this.minYValue, this.minZValue);
        }

        public getYUIMax(): number {

            return this.mappedY(this.maxXvalue, this.maxYValue, this.maxZValue);
        }

        public getZUIMin(): number {

            return this.mappedZ(this.minXvalue, this.minYValue, this.minZValue);
        }

        public getZUIMax(): number {

            return this.mappedZ(this.maxXvalue, this.maxYValue, this.maxZValue);
        }

        toViewX(modelX: number): number {

            return this.xUIOrigin + (modelX * (this._graphSheetScale / this.xUnit));

        }


        toViewY(modelY: number): number {

            return this.yUIOrigin + (modelY * (this._graphSheetScale / this.yUnit));
        }


        toViewZ(modelZ: number): number {

            return this.zUIOrigin + (modelZ * (this._graphSheetScale / this.zUnit));
        }

        public toView(modelPoint: Vector3D): Vector3D {
            var viewPoint: Vector3D = new Vector3D();

            viewPoint.x = this.toViewX(modelPoint.x);
            viewPoint.y = this.toViewY(modelPoint.y);
            viewPoint.z = this.toViewZ(modelPoint.z);

            var beforeMapX: number = viewPoint.x;
            var beforeMapY: number = viewPoint.y;
            var beforeMapZ: number = viewPoint.z;


            viewPoint.x = this.mappedX(beforeMapX, beforeMapY, beforeMapZ);
            viewPoint.y = this.mappedY(beforeMapX, beforeMapY, beforeMapZ);
            viewPoint.z = this.mappedZ(beforeMapX, beforeMapY, beforeMapZ);


            return viewPoint;
        }

        public toModelPoint3DByMapper(point: Vector3D): Point3D {

            var modelPt: Point3D = Point3D.fromVector3D(this.toModel(point));

            var modelX: number = this.coordianteSystemMapper.systemMappedX(modelPt.x, modelPt.y, modelPt.z);
            var modelY: number = this.coordianteSystemMapper.systemMappedY(modelPt.x, modelPt.y, modelPt.z);
            var modelZ: number = this.coordianteSystemMapper.systemMappedZ(modelPt.x, modelPt.y, modelPt.z);

            return new Point3D(modelX, modelY, modelZ);

        }


        public toViewWithoutMapping(modelPoint: Vector3D): Vector3D {
            var viewPoint: Vector3D = new Vector3D();

            viewPoint.x = this.toViewX(modelPoint.x);
            viewPoint.y = this.toViewY(modelPoint.y);
            viewPoint.z = this.toViewZ(modelPoint.z);


            return viewPoint;
        }


        public toViewWithoutCoordinateTranslation(modelPoint: Vector3D): Vector3D {
            var viewPoint: Vector3D = new Vector3D();

            viewPoint.x = this.toViewXWithoutTranslation(modelPoint.x);
            viewPoint.y = this.toViewYWithoutTranslation(modelPoint.y);
            viewPoint.z = this.toViewZWithoutTranslation(modelPoint.z);

            var beforeMapX: number = viewPoint.x;
            var beforeMapY: number = viewPoint.y;
            var beforeMapZ: number = viewPoint.z;


            viewPoint.x = this.mappedX(beforeMapX, beforeMapY, beforeMapZ);
            viewPoint.y = this.mappedY(beforeMapX, beforeMapY, beforeMapZ);
            viewPoint.z = this.mappedZ(beforeMapX, beforeMapY, beforeMapZ);


            return viewPoint;


        }

        public toDefaultViewWithoutCoordinateTranslation(modelPoint: Vector3D): Vector3D {
            var viewPoint: Vector3D = new Vector3D();

            viewPoint.x = this.toViewXWithoutTranslation(modelPoint.x);
            viewPoint.y = this.toViewYWithoutTranslation(modelPoint.y);
            viewPoint.z = this.toViewZWithoutTranslation(modelPoint.z);


            return viewPoint;


        }


        public toDefaultView(point: Vector3D): Vector3D {
            var defaultPoint: Vector3D = new Vector3D();

            defaultPoint.x = this.coordianteSystemMapper.systemMappedX(point.x, point.y, point.z);
            defaultPoint.y = this.coordianteSystemMapper.systemMappedY(point.x, point.y, point.z);
            defaultPoint.z = this.coordianteSystemMapper.systemMappedZ(point.x, point.y, point.z);

            return defaultPoint;


        }

        public toModelX(viewX: number): number {

            return (viewX - this.xUIOrigin) * (this.xUnit / this._graphSheetScale);
        }


        public toModelY(viewY: number): number {

            return (viewY - this.yUIOrigin) * (this.yUnit / this._graphSheetScale);
        }

        public toModelZ(viewZ: number): number {

            return (viewZ - this.zUIOrigin) * (this.zUnit / this._graphSheetScale);
        }

        /**
         * This doesnt take care of system mapper
         */
        public toModel(viewPoint: Vector3D): Vector3D {
            var modelPoint: Vector3D = new Vector3D();

            modelPoint.x = this.toModelX(viewPoint.x);
            modelPoint.y = this.toModelY(viewPoint.y);
            modelPoint.z = this.toModelZ(viewPoint.z);

            return modelPoint;
        }


        public autoConfigScale(xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number): void {
            //use the xmin,xmax,ymin,ymax,zmin,zmax to dynamicaaly change the Units along the three axis of the graphsheet to fit the graph

            //The default is to have 1 unit for every 40 pixels..
            // xmin: -4 to xmax: +10 the spread is 14 ,to accomodate 14 units the this._graphSheetScale should be split into atleast 14

            var xModelSpread: number = Math.abs(xMin) + Math.abs(xMax);
            var xLocUnit: number = xModelSpread / (this.graphsheet3D.width() / this._graphSheetScale);	// example if we assume 400 as width then  400/(14 * 40) would yield 0.756 as this.xUnit

            var yModelSpread: number = Math.abs(yMin) + Math.abs(yMax);
            var yLocUnit: number = yModelSpread / (this.graphsheet3D.height() / this._graphSheetScale);


            var zModelSpread: number = Math.abs(zMin) + Math.abs(zMax);
            var zLocUnit: number = zModelSpread / (this.graphsheet3D.width() / this._graphSheetScale);


            this.xUnit = PMath.roundDecimal(xLocUnit, 1);
            this.yUnit = PMath.roundDecimal(yLocUnit, 1);
            this.zUnit = PMath.roundDecimal(zLocUnit, 1);

        }


        public toUIDistance(xPoint: number, yPoint: number, zPoint: number): number {

            return Math.sqrt(Math.pow(xPoint * (this._graphSheetScale / this.xUnit), 2) + Math.pow(yPoint * (this._graphSheetScale / this.yUnit), 2) + Math.pow(zPoint * (this._graphSheetScale / this.zUnit), 2));
        }

        public toUILength(uiLength: number): number {

            return (this._graphSheetScale / this.xUnit) * uiLength;
        }

        /** This methods dont take the coordiante system mapping into account **/

        public toViewXWithoutTranslation(modelX: number): number {

            return (modelX * (this._graphSheetScale / this.xUnit));

        }

        /** This methods dont take the coordianet system mapping into account **/
        public toViewYWithoutTranslation(modelY: number): number {

            return (modelY * (this._graphSheetScale / this.yUnit));

        }

        /** This methods dont take the coordianet system mapping into account **/

        public toViewZWithoutTranslation(modelZ: number): number {

            return (modelZ * (this._graphSheetScale / this.zUnit));

        }


        public mappedX(xVal: number, yVal: number, zVal: number): number {
            return this.coordianteSystemMapper.mappedX(xVal, yVal, zVal);
        }

        public mappedY(xVal: number, yVal: number, zVal: number): number {
            return this.coordianteSystemMapper.mappedY(xVal, yVal, zVal);
        }

        public mappedZ(xVal: number, yVal: number, zVal: number): number {
            return this.coordianteSystemMapper.mappedZ(xVal, yVal, zVal);
        }

        public transformBasedOnCoordinateSystem(vector3D: Vector3D): Vector3D {
            return vector3D;
        }


        public getCoordinateSysMapper(): ICoordinateSystemMapper {
            return this.coordianteSystemMapper;
        }

        public getXUIOrigin(): number {

            return this.xUIOrigin;
        }

        public getYUIOrigin(): number {

            return this.yUIOrigin;
        }

        public generateGridLines() {

            var xMaxUI = GraphSheet3DBounds.MAX_PLANE_DIMENSION / 2;
            var xMinUI = -GraphSheet3DBounds.MAX_PLANE_DIMENSION / 2;

            var yMaxUI = GraphSheet3DBounds.MAX_PLANE_DIMENSION / 2;
            var yMinUI = -GraphSheet3DBounds.MAX_PLANE_DIMENSION / 2;

            var pointPairs = [];

            var labelPosAdj: number = 0;
            var yOrigindown: number = yMinUI;
            var yDistance: number = this._graphSheetScale;
            var textPos: Point;

            //Y down
            while (yOrigindown < yMaxUI) {
                yOrigindown += yDistance;
                var yModelPos: number = this.toModelY(yOrigindown);
                pointPairs.push(this.getPointPair(xMinUI, yOrigindown, xMaxUI, yOrigindown));
            }


            //X Right
            var xRight: number = xMinUI;
            var xDistance: number = this._graphSheetScale

            while (xRight < xMaxUI) {
                xRight += xDistance;
                var xModelPos: number = this.toModelX(xRight);
                pointPairs.push(this.getPointPair(xRight, yMinUI, xRight, yMaxUI));
            }


            return pointPairs;

        }

        private getPointPair(x1, y1, x2, y2) {
            return {
                start: new Vector3D(this.coordianteSystemMapper.mappedX(x1, y1, 0),
                    this.coordianteSystemMapper.mappedY(x1, y1, 0),
                    this.coordianteSystemMapper.mappedZ(x1, y1, 0)),
                end: new Vector3D(this.coordianteSystemMapper.mappedX(x2, y2, 0),
                    this.coordianteSystemMapper.mappedY(x2, y2, 0),
                    this.coordianteSystemMapper.mappedZ(x2, y2, 0))
            }
        }

        public getGraphSheetModelMinX(): number {
            return GraphSheet3DBounds.GRAPH_SHEET_MIN_X;
        }

        public getGraphSheetModelMaxX(): number {
            return GraphSheet3DBounds.GRAPH_SHEET_MAX_X;
        }

        public translateOrigin(tx: number, ty: number): void {

            this.xUIOrigin += tx;
            this.yUIOrigin += ty;

            this.calculateBounds();
        }

    }


}