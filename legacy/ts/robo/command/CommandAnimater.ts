/**
 * Created by Mathdisk on 3/19/14.
 */

////<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../../../libs/greensock.d.ts" />
///<reference path="../_definitions.ts"/>

/**

 This class will uses greensock animator internally
 This class is used by CommandSequenceEffect class

 **/


module robo.command {


    // in runtime, CommandSequenceEffect will be undefined, so dont try to instantiate this, it is only for the tsc compiler


    import CommandSequenceEffect = robo.sequence.CommandSequenceEffect

    /**  Unlike Flash Tween object, this Tween doesnt have its own Timer, rather we have to update the tween on the EnteFrame, based on this

     /** Always animates within the range of 0 t0 1 **/
    export class CommandAnimater {

        private tween:TweenLite;
        private  tweenStarted:boolean = false;

        public tweenValue:number = 0;
        public timeInSeconds:number = 3; // in seconds

        private _commandSequenceEffect:CommandSequenceEffect;

        constructor(commandSeqenceEffect:CommandSequenceEffect) {

            this._commandSequenceEffect = commandSeqenceEffect;
            this.timeInSeconds = this._commandSequenceEffect.timeInSeconds;
            this.tweenValue = 0;
        }


        public start():void {

            this.create(); // TODO
            this.tween.play();

        }

        public create():void {

            this.tween = new TweenMax(this, this.timeInSeconds, {tweenValue: 1});

            var that = this;

            this.tween.eventCallback("onStart", function()
                {
                    that._commandSequenceEffect.onStart(that.tweenValue);
                }
            );


            this.tween.eventCallback("onUpdate", function()
                {
                    that._commandSequenceEffect.onChange(that.tweenValue);
                }
            );


            this.tween.eventCallback("onComplete", function()
                {
                    that._commandSequenceEffect.onFinish(that.tweenValue);
                    that.stop();
                }
            );
        }


        public pause():void {

            this.tween.pause();
        }

        /** resets the tween itself **/

        public stop():void {

            this.tween.kill();
        }


        public resume():void {

            this.tween.resume();
        }
    }
}