/**
 * Created by Mathdisk on 3/18/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.sequence {


    export interface ISequenceEffect {

        resume():void;
        pause():void;
        stop():void;
        play(sequenceContext:SequenceContext):void;


    }

}