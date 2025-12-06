/**
 * Created by Mathdisk on 3/18/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.sequence {


    export class CallBackContext {

        private  callBackFunction:Function;
        private  bindContext:any;
        private  args:any[];

        constructor(callBackFunction:Function, bindContext:any, args:any[] = null) {
            this.callBackFunction = callBackFunction;
            this.bindContext = bindContext;
            this.args = args;
        }

        public  invokeCallBack():void {
            this.callBackFunction.apply(this.bindContext, this.args);
        }

    }

}