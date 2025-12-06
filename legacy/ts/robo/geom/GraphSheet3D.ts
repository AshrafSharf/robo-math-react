/**
 * Created by Mathdisk on 2/24/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *
 * GraphSheet should not know anything about GeometryGroup or GeometryPart, this will create circular
 * references and is hard to fix in tyoescript compiler
 */
module robo.geom {

    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Point = away.geom.Point;
    import Matrix3D = away.geom.Matrix3D;

    import MaterialBase = away.materials.MaterialBase;
    import ColorMaterial = away.materials.ColorMaterial;
    import StaticLightPicker = away.materials.StaticLightPicker;
    import DirectionalLight = away.lights.DirectionalLight;
    import Mesh = away.entities.Mesh;
    import HoverController = away.controllers.HoverController;
    import TextField = away.entities.TextField;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Text3DFactory = robo.primitives.Text3DFactory;

    export class GraphSheet3D {

        private _drawingSurface: away.containers.View;
        private _camController: HoverDragController;

        //tick for frame update
        private _timer: away.utils.RequestAnimationFrame;
        private _playSurfaceHTMLElement: HTMLElement;
        public graphsheet3DBound: GraphSheet3DBounds;

        private lightPicker: StaticLightPicker;
        private light1: DirectionalLight;
        private light2: DirectionalLight;

        private environmentContainer: Mesh; //This container holds meshes related to paper and other standard objects,objects in the environemt are not affected in runtime (command)
        private activeGroupContainer: Mesh;
        gridMesh: Mesh;


        // All the robo output objects such as line,point,arc gets added
        private roboOutputContainer: Mesh;

        //Navigation Variables
        private cameraController: HoverController;
        private move: boolean = false;
        private lastPanAngle: number;
        private lastTiltAngle: number;
        private lastMouseX: number;
        private lastMouseY: number;

        public static X_ORIGIN: number = -5;
        public static Y_ORIGIN: number = -5;

        private isTwoDFixedView: Boolean = false;

        private static globalInstance: GraphSheet3D;


        private gridLineColor: number = 0x000;

        constructor(playSurface) {

            //when needed use the $() to treat like a JQuery object
            this._playSurfaceHTMLElement = playSurface;

            this.setUpView();
            this.createLight();
            this.setUpCamera();
            this.initializeListeners();

            GraphSheet3D.globalInstance = this;
        }


        public static getInstance(): GraphSheet3D {
            return GraphSheet3D.globalInstance;
        }

        public getPlaySurfaceElement(): JQuery {
            return $(this._playSurfaceHTMLElement);
        }

        private setUpView(): void {

            //setup the view
            var renderer: away.render.DefaultRenderer = new away.render.DefaultRenderer();
            renderer.antiAlias = 4;
            this._drawingSurface = new away.containers.View(renderer);


            //assign
            var stageGL: away.base.StageGL = renderer.stageGL;
            stageGL.canvas.parentNode.removeChild(stageGL.canvas);
            //use the dom element
            this._playSurfaceHTMLElement.appendChild(stageGL.canvas);

            this._drawingSurface.width = $(this._playSurfaceHTMLElement).width();
            this._drawingSurface.height = $(this._playSurfaceHTMLElement).width();
            $(this._playSurfaceHTMLElement).height();

            this.graphsheet3DBound = new GraphSheet3DBounds(this);

            this.environmentContainer = new Mesh(null);
            this._drawingSurface.scene.addChild(this.environmentContainer);

            //set bg color
            this._drawingSurface.backgroundColor = 0x757575;


          //  this.drawGrid();
            this.createRoboOutputContainer();

        }


        private setUpCamera(): void {

            /** this._camController = new HoverDragController(this._drawingSurface, this._playSurfaceHTMLElement);
             this._camController.radius = $(this._playSurfaceHTMLElement).width(); **/

            //setup controller to be used on the camera
            this.cameraController = new HoverController(this._drawingSurface.camera);
            this.cameraController.distance = 600;
            this.cameraController.minTiltAngle = 0;
            this.cameraController.maxTiltAngle = 89;
            this.cameraController.panAngle = 89;
            this.cameraController.tiltAngle = 50;

            $(this._playSurfaceHTMLElement).mousedown(this.onCameraMouseDown);
            $(this._playSurfaceHTMLElement).mouseup(this.onCameraMouseUp)
            $(this._playSurfaceHTMLElement).mousemove(this.onMouseCameraMove);

            //document,window are all keywords which typescript understands
            this._playSurfaceHTMLElement.onmousewheel = (event) => this.onCameraMouseWheel(event);

        }


        /**
         * Mouse down listener for navigation
         */
        onCameraMouseDown = (event: JQueryMouseEventObject) => {
            if (this.isTwoDFixedView) {
                return;
            }

            this.lastPanAngle = this.cameraController.panAngle;
            this.lastTiltAngle = this.cameraController.tiltAngle;

            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            this.move = true;
        }

        public showPaperVertically(): void {
            this.cameraController.panAngle = 90.005;
            this.cameraController.tiltAngle = 90;
            this.cameraController.distance = 500;

        }

        /**
         * Mouse up listener for navigation
         */
        onCameraMouseUp = (event: JQueryMouseEventObject) => {
            if (this.isTwoDFixedView) {
                return;
            }
            this.move = false;
        }

        onMouseCameraMove = (event: JQueryMouseEventObject) => {
            if (this.isTwoDFixedView) {
                return;
            }

            if (this.move) {
                this.cameraController.panAngle = 0.3 * (event.clientX - this.lastMouseX) + this.lastPanAngle;
                this.cameraController.tiltAngle = 0.3 * (event.clientY - this.lastMouseY) + this.lastTiltAngle;
            }
        }


        onCameraMouseWheel = (event) => {
            if (event.wheelDelta > 0) {
                this.cameraController.distance += 20;
            } else {
                this.cameraController.distance -= 20;
            }
        }


        private initializeListeners(): void {
            //setup the render loop
            window.onresize = (event) => this.onResize(event);

            this.onResize();

            this._timer = new away.utils.RequestAnimationFrame(this.onEnterFrame, this);
            this._timer.start();
        }


        public resetCameraPosition(): void {

            this.cameraController.distance = 600;
            this.cameraController.minTiltAngle = 0;
            this.cameraController.maxTiltAngle = 89;
            this.cameraController.panAngle = 89;
            this.cameraController.tiltAngle = 50;
        }


        /**
         * render loop
         */
        private onEnterFrame(dt: number): void {

            // this._camController.updateCameraPosition();
            this._drawingSurface.render();
        }


        public onResize(event: Event = null): void {

            var currentWindowWidth: number = $(window).width();
            var currentWindowHeight: number = $(window).height();

            var leftPos: number = $(this._playSurfaceHTMLElement).position().left;
            var topPos: number = $(this._playSurfaceHTMLElement).position().top;
            var playSurfaceWidth: number = currentWindowWidth - leftPos;
            var playSurfaceHeight: number = currentWindowHeight - topPos;

            $(this._playSurfaceHTMLElement).css({'width': playSurfaceWidth, 'height': playSurfaceHeight});
            this._drawingSurface.y = 0;
            this._drawingSurface.x = 0;
            this._drawingSurface.width = $(this._playSurfaceHTMLElement).width();
            this._drawingSurface.height = $(this._playSurfaceHTMLElement).height();
        }

        public width(): number {

            return this._drawingSurface.width;
        }

        public height(): number {

            return this._drawingSurface.height;
        }


        public toView(modelPoint: Vector3D): Vector3D {

            var point: Vector3D = this.graphsheet3DBound.toView(modelPoint);

            return point;
        }


        public applyLights(materialbase: MaterialBase): void {

            materialbase.lightPicker = this.lightPicker;
            materialbase.bothSides = true;
            materialbase.smooth = true;
        }


        public getColorMaterial(color: number, alpha: number = 1): ColorMaterial {

            var materialbase: ColorMaterial = new ColorMaterial(color, alpha);
            this.applyLights(materialbase);
            materialbase.bothSides = true;
            materialbase.smooth = true;
            return materialbase;
        }

        private createLight(): void {

            this.lightPicker = new StaticLightPicker([]);

            this.light1 = new away.lights.DirectionalLight();
            this.light1.direction = new away.geom.Vector3D(0, -1, 0);
            this.light1.ambient = 0.3;
            this.light1.diffuse = 0.7;
            this.light1.ambientColor = 0x888888;

            this.light2 = new away.lights.DirectionalLight();
            this.light2.direction = new away.geom.Vector3D(1, 1, 0);
            this.light2.ambient = 0.3;
            this.light2.diffuse = 0.7;
            this.light2.ambientColor = 0x888888;

            this._drawingSurface.scene.addChild(this.light1);
            this._drawingSurface.scene.addChild(this.light2);
            this.lightPicker.lights = [this.light1, this.light2];
        }

        /**
         *
         * This called when creating a new Geometry Group
         * @returns {Mesh}
         */
        public createGroupContainer(): Mesh {

            var groupContainer: Mesh = new Mesh(null);
            this._drawingSurface.scene.addChild(groupContainer); // the method argument says DisplayObject, since Mesh implements all the interfaces of DisplayObject this can be added as well
            return groupContainer;
        }

        public createRoboOutputContainer(): void {

            this.roboOutputContainer = new Mesh(null);
            this._drawingSurface.scene.addChild(this.roboOutputContainer); // the method argument says DisplayObject, since Mesh implements all the interfaces of DisplayObject this can be added as well
        }

        public drawGrid() {
            var uiPointPairs = this.graphsheet3DBound.generateGridLines();
            if (this.gridMesh) {
                this.environmentContainer.removeChild(this.gridMesh);
            }
            this.gridMesh = Object3DFactory.createSplineByPairPoints(uiPointPairs, this.gridLineColor, 0.5);
            this.environmentContainer.addChild(this.gridMesh);


            var size: number = 20, height: number = 3;
            var zOffset: number = 0.1;//not to get flicker with plane

            var axisLabels = [{
                text: "-6", model: new Point3D(-6, 0, 0)
            }];
            for (var i = 0; i < axisLabels.length; i++) {

                var modelPos = axisLabels[i].model;
                var textValue = axisLabels[i].text;

                var model3DPos: Point3D = new Point3D(modelPos.x, modelPos.y, modelPos.z + zOffset);
                var uiPos: Vector3D = this.toView(model3DPos.toVector3D());
                var textMesh: Mesh = Text3DFactory.getTextMesh(textValue, size, height);

                textMesh.x = uiPos.x;
                textMesh.y = uiPos.y;
                textMesh.z = uiPos.z;

                textMesh.pitch(90);
                textMesh.yaw(270);

                var material: ColorMaterial = this.getColorMaterialWithoutLight(this.gridLineColor, 0.9);

                textMesh.material = material;
                this.environmentContainer.addChild(textMesh);
            }


        }

        public getRoboOutputContainer(): Mesh {
            return this.roboOutputContainer;
        }

        public setActiveGroupContainer(groupContainer: Mesh): void {

            this.activeGroupContainer = groupContainer;
        }


        public isViewRootContainer(container: Mesh): Boolean {

            if (this.environmentContainer == container) {
                return true;
            }

            return false;
        }


        public toUIVector(x1: number, y1: number, z1: number): Vector3D {
            var modelVectorPoint: Vector3D = new Vector3D(x1, y1, z1);
            return this.toView(modelVectorPoint);
        }

        /** This is  Model to Model translation.Takes care of origin offset **/
        public static translatePointForGraphSheetOffset(pt: Point): Point {
            return new Point(pt.x + GraphSheet3D.X_ORIGIN, -(pt.y + GraphSheet3D.Y_ORIGIN));
        }

        public static translateInlinePoint3DForGraphSheetOffset(pt: Point3D) {
            pt.x = pt.x + GraphSheet3D.X_ORIGIN;
            pt.y = -(pt.y + GraphSheet3D.Y_ORIGIN)
        }

        /** This is also  Model to Model translation.Takes care of origin offset **/
        public static reverseTranslatePointForGraphSheetOffset(pt: Point): Point {
            return new Point(pt.x - GraphSheet3D.X_ORIGIN, (-pt.y - GraphSheet3D.Y_ORIGIN));
        }

        public toUIMappedPosition(directionvect: Vector3D): Vector3D {

            var coordianatmapper: ICoordinateSystemMapper = this.graphsheet3DBound.getCoordinateSysMapper();

            var x: number = coordianatmapper.mappedX(directionvect.x, directionvect.y, directionvect.z);
            var y: number = coordianatmapper.mappedY(directionvect.x, directionvect.y, directionvect.z);
            var z: number = coordianatmapper.mappedZ(directionvect.x, directionvect.y, directionvect.z);

            return new Vector3D(x, y, z);
        }


        public toModel3DPoint(x1: number, y1: number, z1: number): Point3D {

            var modelX: number = this.graphsheet3DBound.toModelX(x1);
            var modelY: number = this.graphsheet3DBound.toModelY(y1);
            var modelZ: number = this.graphsheet3DBound.toModelZ(z1);

            return new Point3D(modelX, modelY, modelZ);
        }

        public toModelPoint3DByMapper(modelPt: Point3D): Point3D {

            return this.graphsheet3DBound.toModelPoint3DByMapper(new Vector3D(modelPt.x, modelPt.y, modelPt.z));
        }


        public toUILength(modelLen: number): number {
            return this.graphsheet3DBound.toUILength(modelLen);
        }


        public addToScene(mesh: Mesh): void {

            if (this.activeGroupContainer != null) {
                this.activeGroupContainer.addChild(mesh);
            } else // add it to the environment
            {
                this.environmentContainer.addChild(mesh);
            }
        }

        public addText(textField: TextField): void {
            this._drawingSurface.scene.addChild(textField);
        }

        public getColorMaterialWithoutLight(color, alpha): ColorMaterial {

            var materialbase: ColorMaterial = new ColorMaterial(color, alpha);
            materialbase.bothSides = true;
            materialbase.smooth = true;
            return materialbase;
        }

        /** only zoom in and zoom out allowed **/

        public toggle2DFixedView(): void {
            this.isTwoDFixedView = !this.isTwoDFixedView;
            //Bring it in uprofront and lock the rotation

            if (this.isTwoDFixedView) {

                this.showPaperVertically();
            } else {

                this.resetCameraPosition();
            }

        }

        public hasTwoDFixedView() {

            return this.isTwoDFixedView;
        }

        public setTwoDFixedView(val: boolean) {

            this.isTwoDFixedView = val;
        }


        public getGraphSheetModelMinX(): number {
            return this.graphsheet3DBound.getGraphSheetModelMinX();
        }

        public getGraphSheetModelMaxX(): number {
            return this.graphsheet3DBound.getGraphSheetModelMaxX();
        }


    }

}
