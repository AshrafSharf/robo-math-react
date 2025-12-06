/**
 * Created by Mathdisk on 3/23/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.command {

    import Engine3D = robo.geom.Engine3D;
    import IRoboCommand = robo.command.IRoboCommand;

    export class TimedDirectDrawExecutor
    {
        public timer:any;
        public TIME_INTERVAL:number = 10;

        private engine:Engine3D;

        constructor(engine:Engine3D)
        {
             this.engine = engine;
        }


       public executeDirectDraw(roboCommandSummary:RoboCommandSummary) {

           clearTimeout(this.timer);

           var drawStartIndex:number = roboCommandSummary.getFromCommandIndex();

           if(drawStartIndex==-1 && roboCommandSummary.expressionError)
           {
               $.gevent.publish("on-playAll-sequence-complete-with-error",{expressionError:roboCommandSummary.expressionError});

           }

           var filteredCommandIndex:number =0;
           var filteredCommands:IRoboCommand[] = roboCommandSummary.filterDirtyCommands();

           var that = this;

           roboCommandExecute();

           function roboCommandExecute()
           {
               clearTimeout(that.timer);

               if(filteredCommandIndex<filteredCommands.length) {

                   var roboCommand:IRoboCommand = filteredCommands[filteredCommandIndex];
                   roboCommand.directPlay();
                   that.timer = setTimeout(roboCommandExecute,that.TIME_INTERVAL);
                   filteredCommandIndex++;
               }

               else
               {
                   if(roboCommandSummary.expressionError)
                   {
                       $.gevent.publish("on-playAll-sequence-complete-with-error",{expressionError:roboCommandSummary.expressionError});

                   }else{
                       // fire completion event
                       $.gevent.publish("supress-warning",{});
                       $.gevent.publish('on-playAll-sequence-complete',{});
                   }
               }
           }
       }


        public clearTimer()
        {
            clearTimeout(this.timer);
        }
    }
}