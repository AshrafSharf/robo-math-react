/**
 * Created by Mathdisk on 3/12/14.
 */
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
    ///<reference path="../../../libs/jquery.d.ts"/>

/** This class is not used now **/


module robo.geom {
    //open the away3d.next.d.ts for all the references

    import View3D = away.containers.View;
    import Camera3D =away.entities.Camera;
    import Vector3D = away.geom.Vector3D;


    export class HoverDragController {

        _playSurfaceHTMLElement:HTMLElement;
        _target:Vector3D;
        _camera:Camera3D;
        _view:View3D;
        radius:number = 600;
        _speed:number = .005;
        _dragSmoothing:number = .1;
        _drag:Boolean = false;
        _referenceX:number = 0;
        _referenceY:number = 0;
        _xRad:number = -2;
        _yRad:number = -0.5;
        _targetXRad:number = -2;
        _targetYRad:number = -0.5;
        _targetRadius:number = 1000;
        _radiusFromLoader:number = 0;
        _mouseX:number = 0;
        _mouseY:number = 0;




        /**
         * Creates a HoverDragController object
         * @param camera The camera to control
         * @param stage The stage that will be receiving mouse events
         */
            constructor(view:View3D, playSurfaceHTMLElement:HTMLElement) {
            this._view = view;
            this._playSurfaceHTMLElement = playSurfaceHTMLElement;

            this._target = new Vector3D();
            this._camera = this._view.camera;

            $(playSurfaceHTMLElement).mousedown(this.onTrackMouseDown);
            $(playSurfaceHTMLElement).mouseup(this.onTrackMouseUp);
            $(playSurfaceHTMLElement).mouseleave(this.onTrackMouseUp);
            $(playSurfaceHTMLElement).mousemove(this.onTrackMouseMove);


            var that = this;

            $(playSurfaceHTMLElement).on('mousewheel', function (event:JQueryMouseEventObject) {
                var deltaY = event['deltaY']; // gives the direction
                var zoomFactor = event['deltaFactor'] / 4;
                that.updateCameraDistance(zoomFactor * deltaY);
            })


        }


        //e:JQueryMouseEventObject,to make this available...
        onTrackMouseMove = (event:JQueryMouseEventObject)=> {



            this._mouseX = event.clientX; // Page X is for the entire page
            this._mouseY = event.clientY;

        }


        private  getMouseX():number {
            return this._mouseX;
        }

        private  getMouseY():number {
            return this._mouseY;
        }


        /**
         * Update cam movement towards its target position,called from the enterframe of GraphSheet
         */

            updateCameraPosition():void {

            if (this._drag)
                this.updateRotationTarget();

            this.radius = this.radius + (this._targetRadius - this.radius) * this._dragSmoothing;
            this._xRad = this._xRad + (this._targetXRad - this._xRad) * this._dragSmoothing;
            this._yRad = this._yRad + (this._targetYRad - this._yRad) * this._dragSmoothing;

            var cy:number = Math.cos(this._yRad) * this.radius;

            this._camera.x = this._target.x - Math.sin(this._xRad) * cy;
            this._camera.y = this._target.y - Math.sin(this._yRad) * this.radius;
            this._camera.z = this._target.z - Math.cos(this._xRad) * cy;
            this._camera.lookAt(this._target);

            this._view.render();


        }


        private  isLoading():boolean {

            if (this.radius > this._radiusFromLoader) {
                return true;
            }
            return false;
        }


        /**
         * If dragging, update the target position's spherical coordinates
         */
        private  updateRotationTarget():void {


            var mouseX:number = this.getMouseX();
            var mouseY:number = this.getMouseY();
            var dx:number = mouseX - this._referenceX;
            var dy:number = mouseY - this._referenceY;
            var bound:number = Math.PI * .5 - .05;

            this._referenceX = mouseX;
            this._referenceY = mouseY;
            this._targetXRad += dx * this._speed;
            this._targetYRad += dy * this._speed;
            if (this._targetYRad > bound) this._targetYRad = bound;
            else if (this._targetYRad < -bound) this._targetYRad = -bound;
        }


        /**
         * Start dragging
         */
        //event :JQueryMouseEventObject
        //
        onTrackMouseDown = (event:JQueryMouseEventObject) => {



            this._drag = true;

            this._referenceX = event.clientX;
            this._referenceY = event.clientX;
        }

        /**
         * Stop dragging
         */
        //event : JQueryMouseEventObject
        onTrackMouseUp = (event:JQueryMouseEventObject) => {




            this._drag = false;


        }

        /**
         * Updates camera distance
         */
        public  updateCameraDistance(zoomFactor:number):void {
            this._targetRadius -= zoomFactor;
        }

        public  updateXrotation(xrotation:number):void {
            this._xRad += xrotation;
        }


        public  clearAll():void {

            this._playSurfaceHTMLElement = null;
            this._target = null;
            this._camera = null;
            this._view = null;
        }

        public  appendToJson(graphSheetJson:Object):void {

        }

        public  populateFromJson(graphSheetJson:Object):void {

        }





    }//end of class


}//end of module