module robo.sequence {


    import ISequenceController = robo.sequence.ISequenceController;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import CallBackContext = robo.sequence.CallBackContext;
    import SequenceContext = robo.sequence.SequenceContext;
    import ISequenceEffect = robo.sequence.ISequenceEffect;
    import Graphsheet3D=robo.geom.GraphSheet3D;
    import UI3DScript = robo.geom.UI3DScript;
  
    export class AbstractSequenceController implements ISequenceController {

        public static STOPPED_STATE:number=0;
        public static RUNNING_STATE:number=1;
        public static PAUSED_STATE:number=2;

        sequenceEffects:ArrayHelper = new ArrayHelper();
        effectIndex:number = 0;

        callBackContext:CallBackContext;
        _sequenceContext:SequenceContext;

        graphSheet3D:Graphsheet3D;
        ui3DScript:UI3DScript;

        public sequenceState:number = AbstractSequenceController.STOPPED_STATE;

        public constructor(graphSheet3D:Graphsheet3D,ui3DScript:UI3DScript) {

            this.graphSheet3D = graphSheet3D;
            this.ui3DScript=ui3DScript;

            this.effectIndex = 0;

            this.callBackContext = new CallBackContext(this.onSequenceItemComplete, this);
            this.sequenceContext = new SequenceContext(this.callBackContext);

            var $playSurface:JQuery = this.graphSheet3D.getPlaySurfaceElement();
            $.gevent.subscribe($playSurface,'on-pause-button-pressed',this.onPauseButtonPressed);
            $.gevent.subscribe($playSurface,'on-resume-button-pressed',this.onResumeButtonPressed);
            $.gevent.subscribe($playSurface,'on-stop-button-pressed',this.onStopButtonPressed);
        }


        onPauseButtonPressed = (event,eventData)=> {

            this.pauseShow();
        }


        onStopButtonPressed = (event,eventData)=> {

            this.stopShow();
        }


        onResumeButtonPressed = (event,eventData)=> {

            if(this.isPaused)
            {
                this.resumeShow();
            }
        }


        public setSequencEffects(sequenceEffects:ArrayHelper):void
        {
            this.sequenceEffects =sequenceEffects
        }

        public isPaused():boolean
        {
            return this.sequenceState == AbstractSequenceController.PAUSED_STATE;
        }


        public isActive():boolean
        {
            return this.sequenceState == AbstractSequenceController.RUNNING_STATE;
        }


        //**
        //
        // for timer based controller nextSequence trigged by timer event,
        // for manual it is triggered by MuseClick
        //
        //**/

        public nextSequence():void {

            if(this.effectIndex == this.sequenceEffects.length)
            {
                this.endSequence();
                return;
            }

            if(this.isPaused())
            {
                return;
            }


            var sequenceEffect:ISequenceEffect = <ISequenceEffect>this.sequenceEffects[this.effectIndex];

            this.prePlayShow(this.effectIndex, sequenceEffect);

            sequenceEffect.play(this.sequenceContext);

            this.effectIndex++;

            this.postPlayShow(this.effectIndex, sequenceEffect);
        }


        // This method gets called when the previous contextcall back gets invoked(Thisnis little mesy but a direct port of as3)


        public  onSequenceItemComplete():void {


        }

        public endSequence():void
        {
            this.sequenceState = AbstractSequenceController.STOPPED_STATE;
            this.effectIndex = 0;

            $.gevent.publish('on-playAll-sequence-complete',{});
        }



        public  playShow():void {

        }


        public setSequenceEffects(sequenceEffects:ArrayHelper):void {

            this.sequenceEffects = sequenceEffects;
            this.effectIndex = 0;
            this.sequenceState = AbstractSequenceController.RUNNING_STATE;
        }

        public startShow():void {

            var sequenceEffect:ISequenceEffect = <ISequenceEffect>this.sequenceEffects[this.effectIndex];

            this.prePlayShow(this.effectIndex, sequenceEffect);

            sequenceEffect.play(this.sequenceContext);

            this.effectIndex++;

            this.postPlayShow(this.effectIndex, sequenceEffect);
        }


        public prePlayShow(currentEffectIndex:number, sequenceEffect:ISequenceEffect):void {

        }


        public postPlayShow(currentEffectIndex:number, sequenceEffect:ISequenceEffect):void {

        }


        public  directPlayAll():void
        {

        }


        public pauseShow():void {

            if(this.sequenceState == AbstractSequenceController.STOPPED_STATE )
                return;

            this.sequenceState = AbstractSequenceController.PAUSED_STATE;
        }

        public resumeShow():void {

            if(this.sequenceState == AbstractSequenceController.PAUSED_STATE )
                this.sequenceState = AbstractSequenceController.RUNNING_STATE;
        }


        public stopShow():void {

            this.sequenceState = AbstractSequenceController.STOPPED_STATE;

            $.gevent.publish('robo-hide-displayText',{});
        }


        public clearAll():void {

            this.sequenceState = AbstractSequenceController.STOPPED_STATE;

            if (this.sequenceEffects) {
                this.sequenceEffects = new ArrayHelper();
            }
            this.effectIndex = 0;
        }


        public getSequenceEffects():ArrayHelper {

            return this.sequenceEffects;
        }

        public getCurrentEffectIndex():Number {


            return this.effectIndex;
        }

        public get sequenceContext() {

            return this._sequenceContext;
        }

        public set sequenceContext(value:SequenceContext) {

            this._sequenceContext = value;
        }


        public getCurrentSequenceEffect():ISequenceEffect
        {
            var currentIndex:number = this.effectIndex-1;
            currentIndex = Math.max(0,currentIndex);
            currentIndex = Math.min(currentIndex,this.sequenceEffects.length-1);
            var sequenceEffect:ISequenceEffect = <ISequenceEffect>this.sequenceEffects[currentIndex];

            return sequenceEffect;
        }
    }
}