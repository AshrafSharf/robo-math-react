///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.sequence {


    import ArrayHelper = robosys.lang.ArrayHelper;
    import CallBackContext = robo.sequence.CallBackContext;
    import SequenceContext = robo.sequence.SequenceContext;
    import ISequenceEffect = robo.sequence.ISequenceEffect;
    import Timer = away.utils.Timer;
    import TimerEvent = away.events.TimerEvent;
    import Graphsheet3D=robo.geom.GraphSheet3D;
    import UI3DScript = robo.geom.UI3DScript;

    /**
     *
     * Timer sequence now doesnt use any timer.. It is only the individua Sequence which use timer
     */
    export class TimerSequenceController extends AbstractSequenceController {

        public constructor(graphSheet3D:Graphsheet3D,ui3DScript:UI3DScript) {

            super(graphSheet3D,ui3DScript);
        }


        public  playShow():void {

            super.playShow();

           this.nextSequence();
        }


        public  directPlayAll():void {

            for(var index:number=0;index<this.sequenceEffects.length;index++)
            {
                var sequenceEffect:ISequenceEffect = <ISequenceEffect>this.sequenceEffects[index];

                this.prePlayShow(index, sequenceEffect);

                sequenceEffect.play(this.sequenceContext);

                this.postPlayShow(this.effectIndex, sequenceEffect);
            }

            this.endSequence();

        }


		endSequence():void
		{
            super.endSequence();
        }

		public pauseShow()
		{
            if(this.isPaused())
                return;

            var sequenceEffect:ISequenceEffect = this.getCurrentSequenceEffect();

            if(sequenceEffect)
            {
                sequenceEffect.pause();
            }

            super.pauseShow();
        }


        public stopShow():void {

            var sequenceEffect:ISequenceEffect = this.getCurrentSequenceEffect();

            if(sequenceEffect)
            {
                sequenceEffect.stop();
            }

            super.stopShow();
        }


        public resumeShow():void {

            if(this.isPaused()==false)
            {
                return;
            }

            var sequenceEffect:ISequenceEffect = this.getCurrentSequenceEffect();

            if(sequenceEffect)
            {
                sequenceEffect.resume();
            }

            super.resumeShow();
        }


        /**
         *
         * This is the which actually controls the next sequence,only on unpaused succesful completion,
         * the sequence gets resumed
         */
        public onSequenceItemComplete():void {

            super.onSequenceItemComplete();

            if(this.isActive())
              this.nextSequence();
        }


        public  clearAll():void {

            super.clearAll();
        }
    }
}