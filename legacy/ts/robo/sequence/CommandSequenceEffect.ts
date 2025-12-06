/**
 * Created by Mathdisk on 3/19/14.
 */
/**
 * Created by Mathdisk on 3/18/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>



module robo.sequence {

    import ISequenceEffect = robo.sequence.ISequenceEffect;
    import IRoboCommand = robo.command.IRoboCommand;
    import SequenceContext = robo.sequence.SequenceContext;
    import CommandAnimater = robo.command.CommandAnimater;

    export class CommandSequenceEffect implements ISequenceEffect {

        private roboCommand:IRoboCommand;
        private sequenceContext:SequenceContext;
        private commandAnimatar:CommandAnimater;
        public timeInSeconds:number = 1;
        previousValue:number = -1;

        constructor(roboCommand:IRoboCommand)
        {
            this.roboCommand = roboCommand;
            this.timeInSeconds = this.roboCommand.getTimeInSeconds();
            this.commandAnimatar = new CommandAnimater(this);
        }

       public resume():void {

           this.commandAnimatar.resume();
        }

        public pause():void {

            this.commandAnimatar.pause();
        }

        public stop():void {

            this.commandAnimatar.stop();
        }

        public  play(sequenceContext:SequenceContext):void {

            this.sequenceContext = sequenceContext;
            this.commandAnimatar.start();
        }

        //gets called from CommandAnimator
      public onStart(val:number):void
      {
          this.roboCommand.prePlay();
      }

        //called from CommandAnimator
       public onChange(val:number):void
       {
           if(val!=this.previousValue)
           {
               this.roboCommand.play(val);
           }
           this.previousValue = val;
       }

        public onFinish(val:number):void
        {
            this.sequenceContext.callBackContext.invokeCallBack(); // this will signal the SequenceController to fire of the next sequence
            this.roboCommand.postPlay();
        }
    }
}