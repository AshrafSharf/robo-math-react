/**
 * Created by Mathdisk on 3/17/14.
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
module robo.geom {


    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Matrix3D = away.geom.Matrix3D;
    import Graphsheet3D=robo.geom.GraphSheet3D;
    import UI3DScript = robo.geom.UI3DScript;
    import Mesh = away.entities.Mesh;
    import GeometryGroup = robo.geom.GeometryGroup;
    import Ruler3D = robo.virtualobjects.Ruler3D;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import SetSquare3D = robo.virtualobjects.SetSquare3D;
    import Paper3D = robo.virtualobjects.Paper3D;
    import Protractor3D = robo.virtualobjects.Protractor3D;
    import FillerVirtualObject = robo.virtualobjects.FillerVirtualObject;
    import Compass3D = robo.virtualobjects.Compass3D;
    import PolygonBuilder = robo.virtualobjects.PolygonBuilder;
    import Indicator3D = robo.virtualobjects.Indicator3D;
    import Cast = away.utils.Cast;
    import BitmapData = away.base.BitmapData;
    import TimerSequenceController = robo.sequence.TimerSequenceController;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Point = away.geom.Point;
    import StringUtil = robo.util.StringUtil;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import DelaunayMeshBuilder= robo.extrusions.DelaunayMeshBuilder;
    import DelanauyPoint = robo.extrusions.DelanauyPoint;
    import VirtualTracer = robo.virtualobjects.VirtualTracer;
    import VirtualRotator = robo.virtualobjects.rotator.VirtualRotator;
    import VirtualTranslator = robo.virtualobjects.translator.VirtualTranslator;
    import VirtualDilator = robo.virtualobjects.dilator.VirtualDilator;
    import VirtualReflector = robo.virtualobjects.reflector.VirtualReflector;
    import VirtualProjector = robo.virtualobjects.projector.VirtualProjector;
    import ProcessingGroupBuilder = robo.virtualobjects.ProcessingGroupBuilder;
    import PointPairBuilder = robo.virtualobjects.PointPairBuilder;
    import MarkerBuilder = robo.virtualobjects.MarkerBuilder;



    // controlls all the virtual objects
    // creates command objects
    // builds sequence Commands
    // uses TimerSequenceController to fire off sequences

    export class Engine3D {

        private ui3DScript:UI3DScript;
        private _playSurfaceHTMLElement:HTMLElement;

       private static  SCALE_TEXTURE="assets/scale_texture.png";
        private static  PROTRACTOR_TEXTURE="assets/protractor_texture.png";
        private static  SETSQUARE_TEXTURE="assets/setsquare_texture.png";
        private static  PAPER_TEXTURE="assets/paper_texture.png";
        private static  PLAIN_PAPER_TEXTURE="assets/plain_paper_texture.png";


          //for edmdoo
        /* private static  SCALE_TEXTURE="/img/scale_texture.png";
         private static  PROTRACTOR_TEXTURE="/img/protractor_texture.png";
         private static  SETSQUARE_TEXTURE="/img/setsquare_texture.png";
         private static  PAPER_TEXTURE="/img/paper_texture.png";
         private static  PLAIN_PAPER_TEXTURE="/img/plain_paper_texture.png";*/

        private scaleTextureBitmapData	: BitmapData = null;
        private protractorTextureBitmapData	:BitmapData = null;
        private setSquareTextureBitmapData	: BitmapData = null;
        private paperTextureBitmapData	: BitmapData = null;
        private plainPaperTextureBitmapData	: BitmapData = null;

        public rulerObj:Ruler3D;
        public setSquareObj:SetSquare3D;
        public paperObj:Paper3D;
        public protractorObj:Protractor3D;
        public pencilObj:Pencil3D;
        public compassObj:Compass3D;
        public polygonBuilderObj:PolygonBuilder;
        public fillerVirtualObject:FillerVirtualObject;
        public virtualTracer:VirtualTracer;
        public virtualRotator:VirtualRotator;
        public virtualTranslator:VirtualTranslator;
        public virtualDilator:VirtualDilator;
        public virtualReflector:VirtualReflector;
        public processingGroupBuilder:ProcessingGroupBuilder;
        public pointPairBuilder:PointPairBuilder;
        public markerBuilder: MarkerBuilder;
        public virtualProjector:VirtualProjector;
        public indicatorObj:Indicator3D;
        private graphSheet3D:Graphsheet3D;


        timeSequenceController:TimerSequenceController;
        private expressionIdVirtualContextMap:any={};// key expression Id ,value Virtual Context Map
        private isAllObjectInit:boolean=false;

        constructor($canvasContainer) // might recive many values as we go
        {
            //when needed use the $() to treat like a JQuery object
            this._playSurfaceHTMLElement = $canvasContainer[0];
        }


        public init():void
        {
            this.loadAssets();
            this.createGraphSheet();

            $.gevent.subscribe($(this._playSurfaceHTMLElement),'on-stop-button-pressed',this.onStopButtonPressed);
            $.gevent.subscribe($(this._playSurfaceHTMLElement),'on-playAll-sequence-complete',this.onPlayAllSequenceComplete);
            $.gevent.subscribe($(this._playSurfaceHTMLElement), 'robo-delete-all', this.onDeleteAllHandler);

            $.gevent.subscribe($(this._playSurfaceHTMLElement), 'show-grid', this.onShowGridHandler);
            $.gevent.subscribe($(this._playSurfaceHTMLElement), 'hide-grid', this.onHideGridHandler);
        }


        private createGraphSheet():void
        {
            this.graphSheet3D = new robo.geom.GraphSheet3D(this._playSurfaceHTMLElement);
            this.ui3DScript = new UI3DScript(this.graphSheet3D);
            this.timeSequenceController = new TimerSequenceController(this.graphSheet3D,this.ui3DScript);
        }


        private loadAssets():void
        {
            this.loadAsset(Engine3D.SCALE_TEXTURE);
            this.loadAsset(Engine3D.SETSQUARE_TEXTURE);
            this.loadAsset(Engine3D.PAPER_TEXTURE);
            this.loadAsset(Engine3D.PLAIN_PAPER_TEXTURE);
            this.loadAsset(Engine3D.PROTRACTOR_TEXTURE);
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
                case Engine3D.SCALE_TEXTURE:
                    this.scaleTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;

                case Engine3D.SETSQUARE_TEXTURE:
                    this.setSquareTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;

                case Engine3D.PAPER_TEXTURE:
                    this.paperTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;

                case Engine3D.PLAIN_PAPER_TEXTURE:
                    this.plainPaperTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;

                case Engine3D.PROTRACTOR_TEXTURE:
                    this.protractorTextureBitmapData = Cast.bitmapData(event.assets[0]);
                    break;
            }

            this.createVirtualObjects(); // This will get called for every Resouce, so this method checks if all the objects are assigned
        }


        //all compass,Scale,Pencil,SetSquare,Protractor gets constructed here
        public createVirtualObjects():void
        {
            if(this.scaleTextureBitmapData==null || this.protractorTextureBitmapData==null || this.setSquareTextureBitmapData==null || this.paperTextureBitmapData==null)
            {
                return;
            }

            this.ui3DScript.fill(0x00ff00);
            this.pencilObj = new Pencil3D(this.ui3DScript);

            this.rulerObj = new Ruler3D(this.ui3DScript);
            this.rulerObj.pencil3d = this.pencilObj;
            this.rulerObj.attachImage(this.scaleTextureBitmapData);

            this.setSquareObj = new SetSquare3D(this.ui3DScript);
            this.setSquareObj.rulerObj = this.rulerObj;
            this.setSquareObj.pencilObj = this.pencilObj;
            this.setSquareObj.attachImage(this.setSquareTextureBitmapData);

            this.compassObj = new Compass3D(this.ui3DScript);
            this.compassObj.pencilObj = this.pencilObj;

            this.protractorObj = new Protractor3D(this.ui3DScript);
            this.protractorObj.pencilObj = this.pencilObj;
            this.protractorObj.compassObj = this.compassObj;
            this.protractorObj.attachImage(this.protractorTextureBitmapData);

            this.polygonBuilderObj = new PolygonBuilder(this.ui3DScript);
            this.polygonBuilderObj.pencil3d=this.pencilObj;
            this.polygonBuilderObj.ruler3d=this.rulerObj;

            this.paperObj = new Paper3D(this.ui3DScript);
            this.paperObj.attachImage(this.paperTextureBitmapData);

            this.indicatorObj = new Indicator3D(this.ui3DScript);

            this.fillerVirtualObject = new FillerVirtualObject(this.ui3DScript);
            this.virtualTracer = new VirtualTracer(this.ui3DScript);
            this.virtualRotator = new VirtualRotator(this.ui3DScript);
            this.virtualTranslator = new VirtualTranslator(this.ui3DScript);

            this.virtualDilator = new VirtualDilator(this.ui3DScript);

            this.virtualReflector = new VirtualReflector(this.ui3DScript);
            this.virtualProjector = new VirtualProjector(this.ui3DScript);

            this.processingGroupBuilder = new ProcessingGroupBuilder(this.ui3DScript);
            this.pointPairBuilder = new PointPairBuilder(this.ui3DScript);
            this.markerBuilder = new MarkerBuilder(this.ui3DScript)


            this.isAllObjectInit = true;
            this.hideAllVirtualObjects();

            $.gevent.publish('virtual-object-init',{});
        }



        public playSequence():void
        {
            this.timeSequenceController.playShow();
        }

        public testSomeDemoObjects():void
        {
            var geometryGroup:GeometryGroup = new GeometryGroup(this.ui3DScript);
            var geometryPart:GeometryPart = geometryGroup.cylinder(new Point3D(0, 0, 0), new Point3D(0, 3, 0), 0.5, true, true);

            geometryGroup.removePart(geometryPart);
        }


        public getSetSquare():GeometryPart
        {
            return this.setSquareObj.setSquarePart;
        }


        public label3D(textValue:string,modelPos:Point3D):Mesh
        {
           return  this.ui3DScript.label3D(textValue,modelPos);
        }

        public clearAllRoboOutputs():void
        {
            this.ui3DScript.clearAllRoboOutputs();
        }

        public fill(color:number):void
        {
            var fillColor:any = StringUtil.replace(""+color,"#","0x");
            this.ui3DScript.fill(fillColor);
        }

        public removeRoboMesh(roboMesh:Mesh):void
        {
            this.ui3DScript.removeRoboMesh(roboMesh);
        }

        public removeLabelMesh(labelMesh:Mesh):void
        {
            this.ui3DScript.removeLabelMesh(labelMesh);
        }


        public hideVirtualElements(excludedElements:ArrayHelper):void
        {
            var virtualObjects:any[] = [this.pencilObj,this.rulerObj,this.setSquareObj,this.compassObj,this.protractorObj];
            for(var i:number=0;i<virtualObjects.length;i++)
            {
                var virtualElement:any = virtualObjects[i];
                if(excludedElements.contains(virtualElement))
                {
                    virtualElement.showOrHide(1);
                    continue;
                }
                virtualElement.showOrHide(0);
            }
        }

        public reset():void
        {
            if(this.isAllObjectInit==false)//no need to validate for all
              return;

            this.pencilObj.reset();
            this.rulerObj.reset();
            this.setSquareObj.reset();
            this.compassObj.reset();
            this.protractorObj.reset();
            this.polygonBuilderObj.reset();
            this.fillerVirtualObject.reset();
        }

        public resetSinglePlay():void
        {
            this.compassObj.clearPreviousShapeItem();
        }

        public removeInternalDrawings():void
        {
            if(this.isAllObjectInit==false)//no need to validate for all
                return;

            this.rulerObj.removeInternalDrawings();
            this.compassObj.removeInternalDrawings();
            this.protractorObj.removeInternalDrawings();
            this.setSquareObj.removeInternalDrawings();
            this.virtualTracer.removeInternalDrawings();
            this.virtualRotator.removeInternalDrawings();
            this.virtualTranslator.removeInternalDrawings();
            this.virtualReflector.removeInternalDrawings();
			this.virtualDilator.removeInternalDrawings();
            this.virtualProjector.removeInternalDrawings();
            this.processingGroupBuilder.removeInternalDrawings();
            this.pointPairBuilder.removeInternalDrawings();
            this.markerBuilder.removeInternalDrawings();

        }

        onStopButtonPressed = (event,eventData)=> {

            this.removeInternalDrawings();

            this.hideAllVirtualObjects();

            this.reset();
        }

        onPlayAllSequenceComplete = (event,eventData)=>{

            this.removeInternalDrawings();

            this.hideAllVirtualObjects();
        }

        onDeleteAllHandler = (event,eventData)=>{

            this.clearAllRoboOutputs();
            this.reset();
            this.clearVirtualExecutionContextMap(); // remove all references

            this.removeInternalDrawings();
            this.hideAllVirtualObjects();
        }


        onShowGridHandler = (event,eventData)=>{

            if(this.paperObj){
                this.paperObj.attachImage(this.paperTextureBitmapData);
            }
        }


        onHideGridHandler = (event,eventData)=>{
            if(this.paperObj){
                this.paperObj.attachImage(this.plainPaperTextureBitmapData);
            }

        }


        private hideAllVirtualObjects():void
        {
            if(this.isAllObjectInit==false)//no need to validate for all
                return;

            this.pencilObj.showOrHide(0);
            this.rulerObj.showOrHide(0);
            this.setSquareObj.showOrHide(0);
            this.compassObj.showOrHide(0);
            this.protractorObj.showOrHide(0);
            this.indicatorObj.dismissHighlight();
        }



        public clearVirtualExecutionContextMap():void
        {
            this.expressionIdVirtualContextMap = {};
        }

        public addExpressionVirtualContext(cmdExpressionId:number,virtualObjectExecutionContext:VirtualObjectsExecutionContext):void
        {
            this.removeRoboOutputByExpression(cmdExpressionId);// remove existing  pending meshes in case..defensive..?
            this.expressionIdVirtualContextMap[cmdExpressionId]=virtualObjectExecutionContext;
        }

        public getVirtualObjectsExecutionContextByExpressionId(cmdExpressionId:number):VirtualObjectsExecutionContext
        {
            return this.expressionIdVirtualContextMap[cmdExpressionId];
        }



        public getOutputMeshByExpression(cmdExpressionId:number):Mesh[]
        {
            var currentVirtContext:VirtualObjectsExecutionContext =  this.getVirtualObjectsExecutionContextByExpressionId(cmdExpressionId);

            // Remove the Mesh that corresponds to the command expression
            if(currentVirtContext!= undefined)
            {
                var meshList  = currentVirtContext.getOutputMeshList();
                return meshList;
            }
            return [];
        }



        public removeRoboOutputByExpression(cmdExpressionId:number):void
        {
            var currentVirtContext:VirtualObjectsExecutionContext =  this.getVirtualObjectsExecutionContextByExpressionId(cmdExpressionId);

            // Remove the Mesh that corresponds to the command expression
            if(currentVirtContext!= undefined)
            {
                var meshList  = currentVirtContext.getOutputMeshList();

                for (var i:number = 0; i < meshList.length; i++) {

                    var outPutMesh:Mesh = meshList[i];

                    if(outPutMesh)
                        this.removeRoboMesh(outPutMesh);
                }

                var labelMesh:Mesh = currentVirtContext.getLabelMesh();

                if(labelMesh)
                    this.removeLabelMesh(labelMesh);

                currentVirtContext.clearOutputMeshReferences();
            }

            if(this.expressionIdVirtualContextMap[cmdExpressionId])
            {
                delete this.expressionIdVirtualContextMap[cmdExpressionId];
            }

        }



        public hideRoboOutputByExpression(cmdExpressionId:number):void
        {
            var currentVirtContext:VirtualObjectsExecutionContext =  this.getVirtualObjectsExecutionContextByExpressionId(cmdExpressionId);

            // Remove the Mesh that corresponds to the command expression
            if(currentVirtContext!= undefined)
            {
                var meshList  = currentVirtContext.getOutputMeshList();

                for (var i:number = 0; i < meshList.length; i++) {

                    var outPutMesh:Mesh = meshList[i];

                    if(outPutMesh) {
                    outPutMesh.visible=false;


                    }


                }

                var labelMesh:Mesh = currentVirtContext.getLabelMesh();

                if(labelMesh)
                    labelMesh.visible=false;

            }
        }


        public showRoboOutputByExpression(cmdExpressionId:number,alphaValue:number=1):void
        {
            var currentVirtContext:VirtualObjectsExecutionContext =  this.getVirtualObjectsExecutionContextByExpressionId(cmdExpressionId);

            // Remove the Mesh that corresponds to the command expression
            if(currentVirtContext!= undefined)
            {
                var meshList  = currentVirtContext.getOutputMeshList();

                for (var i:number = 0; i < meshList.length; i++) {

                    var outPutMesh:Mesh = meshList[i];

                    if(outPutMesh) {

                     outPutMesh.visible=true;
                     currentVirtContext.fadeOut(alphaValue,this.ui3DScript.curFillColor);

                    }
                }

                var labelMesh:Mesh = currentVirtContext.getLabelMesh();

                if(labelMesh) {

                    labelMesh.visible=true;
                    labelMesh.alpha=alphaValue;
                }
            }

        }




        public removeMeshesFor(labels:string[]):void
        {
            var virtualObjectExecutionCtxsToRemove:VirtualObjectsExecutionContext[]= this.getVirtualObjectExecutionContextByLabels(labels);

            for(var i:number=0;i<virtualObjectExecutionCtxsToRemove.length;i++)
            {
                var virtExecTobeRemoved:VirtualObjectsExecutionContext = virtualObjectExecutionCtxsToRemove[i];

                this.removeRoboOutputByExpression(virtExecTobeRemoved.getExpressionId());
            }

        }



        public hideMeshesFor(labels:string[]):void
        {
            var virtualObjectExecutionCtxsToRemove:VirtualObjectsExecutionContext[]= this.getVirtualObjectExecutionContextByLabels(labels);

            for(var i:number=0;i<virtualObjectExecutionCtxsToRemove.length;i++)
            {
                var virtExecTobeRemoved:VirtualObjectsExecutionContext = virtualObjectExecutionCtxsToRemove[i];

                this.hideRoboOutputByExpression(virtExecTobeRemoved.getExpressionId());
            }
        }




        public showMeshesFor(labels:string[],alphaValue:number=1):void
        {
            var virtualObjectExecutionCtxsToRemove:VirtualObjectsExecutionContext[]= this.getVirtualObjectExecutionContextByLabels(labels);

            for(var i:number=0;i<virtualObjectExecutionCtxsToRemove.length;i++)
            {
                var virtExecTobeRemoved:VirtualObjectsExecutionContext = virtualObjectExecutionCtxsToRemove[i];

                alphaValue = Math.min(alphaValue,virtExecTobeRemoved.getMaxAlphaValue()); // for fill the max alpha value will be just 0.7

                this.showRoboOutputByExpression(virtExecTobeRemoved.getExpressionId(),alphaValue);
            }
        }


        public getVirtualObjectExecutionContextByLabels(labels:string[]):VirtualObjectsExecutionContext[]
        {
            var virtualObjectExecutionCtxsToRemove:VirtualObjectsExecutionContext[]=[];
            //build a label to Virtual Object execution Map

            for(var i:number=0;i<labels.length;i++)
            {
                var currentLabelName:string = labels[i];
                for(var expressionId in this.expressionIdVirtualContextMap)
                {
                    var matchingCtx:VirtualObjectsExecutionContext = <VirtualObjectsExecutionContext>this.expressionIdVirtualContextMap[expressionId];
                    if(matchingCtx.hasSameLabel(currentLabelName))
                        virtualObjectExecutionCtxsToRemove.push(matchingCtx);
                }
            }
            return virtualObjectExecutionCtxsToRemove;
        }

        public resetCamera():void{

            this.graphSheet3D.resetCameraPosition();
        }

        //to show resize icon, to resize graph back to its original width, when show-side bar clicked
        public onCmdEditorResized(){

            this.graphSheet3D.onResize();
        }

        public getSheetWidth():number{

            return this.graphSheet3D.width();
        }

        public getGraphSheet3D():Graphsheet3D
        {
            return this.graphSheet3D;
        }

        public getSheetHeight():number{

            return this.graphSheet3D.height();
        }

        public getCurrentColor():number
        {
            return this.ui3DScript.curFillColor;
        }


        private testDelanuyMesh():void
        {
           /* var circle:ProcessingCircle = new ProcessingCircle(0,0,6,0,360);
            var circle2:ProcessingCircle = new ProcessingCircle(-2,0,4,0,360);
            var circle3:ProcessingCircle = new ProcessingCircle(-3,3,6,0,360);

            var fillBuilder:FillBuilder = new FillBuilder(this.ui3DScript);

            var uiPoints:Point[] = fillBuilder.polyIntersect([circle,circle2,circle3]);

            var mesh:Mesh = this.ui3DScript.delaunayMesh(uiPoints);



            console.log(uiPoints.length);

             */



            /*    var uiPoints:Point[]=[];

          for(var i:number=0;i<points.length;i++)
            {
                var vect:Vector3D = this.graphSheet3D.toUIVector(points[i].x,points[i].y,0);
                uiPoints.push(new Point(vect.x,vect.z));
            } */







        }

    }
}
