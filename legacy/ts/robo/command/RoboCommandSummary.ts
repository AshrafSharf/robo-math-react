/**
 * Created by Mathdisk on 3/23/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.command {

    import ExpressionError = roboexpressions.ExpressionError;
    import IRoboCommand = robo.command.IRoboCommand;
    import IBaseExpression = robo.expressions.IBaseExpression;
    export  class  RoboCommandSummary
    {
       private fromCommandIndex:number=0;
       private toCommandIndex:number=-1;
       private currentActiveExpressionId:number=0;

       public editiorExpressions:any;
       public robocommands:IRoboCommand[];
       public expressionError:ExpressionError;
       public errorExpressionIndex:number = -1;

       public expresssionIdToCommandMap:any={};
       public expressionIdToExpressionMap:any={};

       public previousEvaluatedExpressionsIdMap:any={};
       public currentEvaluatedExpressionsIdMap:any={};


        constructor(editiorExpressions:any,robocommands:IRoboCommand[])
        {
           this.editiorExpressions = editiorExpressions;
           this.robocommands = robocommands;
           this.toCommandIndex  = robocommands.length;
        }

        public hasMoreCommandsToDraw(currentDrawIndex:number)
        {
            if(currentDrawIndex<this.robocommands.length)
                return true;

            return false;
        }

        public setCurrentActiveExpressionId(currentActiveExpressionId:number):void
        {
            this.currentActiveExpressionId = currentActiveExpressionId;
            this.fromCommandIndex = this.getCommandIndexByExpressionId(this.currentActiveExpressionId);
        }


        public setToCommandIndex(toCommandIndex:number):void
        {
            this.toCommandIndex = toCommandIndex;
        }


        public getCurrentActiveExpressionId():number
        {
            return this.currentActiveExpressionId;
        }

        public getFromCommandIndex():number
        {
            return this.fromCommandIndex;
        }


       public getToCommandIndex():number
       {
           return this.toCommandIndex;
       }

        /** tries to get the command with respect to a given expression, if not gets the next applicable robocomand **/

        public getCommandIndexByExpressionId(expressionId:number):number
        {
           var roboCommand:IRoboCommand = this.expresssionIdToCommandMap[expressionId];
           var commandIndex:number =  this.robocommands.indexOf(roboCommand);


            if(commandIndex==-1) // no direct command for this expression, so get the next applicable one
            {
                  var expressionObject:any = this.expressionIdToExpressionMap[expressionId]
                  var expressionIndex:number = this.editiorExpressions.indexOf(expressionObject);

                if(expressionIndex==-1)
                    return -1;

                 for(var i:number=expressionIndex;i<this.editiorExpressions.length;i++)
                 {
                     var nextExpressionId:number = this.editiorExpressions[i].id;
                     var nextApplicableRoboCommand:IRoboCommand = this.expresssionIdToCommandMap[nextExpressionId];

                     if(nextApplicableRoboCommand)
                     {
                         commandIndex =  this.robocommands.indexOf(nextApplicableRoboCommand);
                         return commandIndex;
                     }
                 }


            }


            return commandIndex;
        }

        /** Filter the commands from "fromCommandIndex" to "toCommandIndex" and return only the dirtlied commandList **/

        public filterDirtyCommands():IRoboCommand[]
        {
            var filteredCommands:IRoboCommand[] =[];

            if(this.fromCommandIndex==-1)
            {
                return filteredCommands;
            }


            for(var index:number = this.fromCommandIndex;index<this.toCommandIndex;index++)
            {
               var roboCommand:IRoboCommand = this.robocommands[index];
               var expressionId:number = roboCommand.getExpressionId();

               var currentEvaluatedExpression:IBaseExpression = <IBaseExpression>this.currentEvaluatedExpressionsIdMap[expressionId];
               var previousEvaluatedExpression:IBaseExpression=<IBaseExpression>this.previousEvaluatedExpressionsIdMap[expressionId];

                if(currentEvaluatedExpression==null) {

                    filteredCommands.push(roboCommand);
                    continue;
                }

                //previous Evaluated Expression may not be there for all cases, but the equas method takes careof that
                if(currentEvaluatedExpression.equals(previousEvaluatedExpression)==false) // should not be equal
                {
                    filteredCommands.push(roboCommand);
                }

                // stroke and fade expressions should always be executed (The internal if condition makes sure they are not added twice
                if(currentEvaluatedExpression.alwaysExecute()) {
                    if(filteredCommands.indexOf(roboCommand)<0) {
                        filteredCommands.push(roboCommand);
                    }
                }

            }

            return filteredCommands;
        }




    }
}
