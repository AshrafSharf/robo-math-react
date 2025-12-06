/**
 * Created by rizwan on 4/21/14.
 */

module robo.sequence {


    import ISequenceEffect = robo.sequence.ISequenceEffect;
    import IRoboCommand = robo.command.IRoboCommand;
    import SequenceContext = robo.sequence.SequenceContext;
    import CommandAnimater = robo.command.CommandAnimater;

    export class DirectCommandSeqEffect implements ISequenceEffect {

        private roboCommand:IRoboCommand;
        private sequenceContext:SequenceContext;

        constructor(roboCommand:IRoboCommand) {

            this.roboCommand = roboCommand;
        }

        public  resume():void {


        }

        public pause():void {


        }



        public stop():void {


        }

        public  play(sequenceContext:SequenceContext):void {

            this.sequenceContext = sequenceContext;

            this.roboCommand.directPlay();

        }

        public onStart(val:number):void
        {

        }

        public onChange(val:number):void
        {

        }

        public onFinish(val:number):void
        {
            this.sequenceContext.callBackContext.invokeCallBack(); // this will signal the SequenceController to fire of the next sequence
            this.roboCommand.postPlay();
        }
    }
}