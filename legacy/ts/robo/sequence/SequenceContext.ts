/**
 * Created by Mathdisk on 3/18/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.sequence {


    import CallBackContext = robo.sequence.CallBackContext;

    export class SequenceContext {

        public callBackContext:CallBackContext;

        constructor(callBackContext:CallBackContext) {
            this.callBackContext = callBackContext;
        }

    }

}