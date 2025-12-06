/**
 * Created by Mathdisk on 3/23/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.command {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionIntrepreter = robo.expressions.ExpressionIntrepreter;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import TimerSequenceController = robo.sequence.TimerSequenceController;
    import Engine3D = robo.geom.Engine3D;
    import IRoboCommand = robo.command.IRoboCommand;
    import CommandSequenceEffect = robo.sequence.CommandSequenceEffect;
    import ISequenceEffect = robo.sequence.ISequenceEffect;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import Mesh = away.entities.Mesh;
    import ExpressionError = roboexpressions.ExpressionError;
    import DirectCommandSeqEffect = robo.sequence.DirectCommandSeqEffect;
    import Point3D =  robo.core.Point3D;
    import GraphSheet2D =  robo.twod.GraphSheet2D;
    import HideCommand = robo.command.HideCommand;
    import TextCommand = robo.command.TextCommand;
    import TextOnGraphsheetCommand = robo.command.TextOnGraphsheetCommand;

    import AssignmentExpression =robo.expressions.AssignmentExpression;
    import RangeExpression =robo.expressions.RangeExpression;
    import StyleConfig = robo.util.StyleConfig;

    export class PlayCommandHandler
    {
        private timerSequenceController:TimerSequenceController;
        private engine:Engine3D;
        private graphsheet2d:GraphSheet2D;

        private intrepretor:ExpressionIntrepreter;
        private timedDirectPlayExecutor:TimedDirectDrawExecutor;

        private static DIRECT_PLAY:number=0;
        private static TIMER_PLAY:number=1;
        private static NO_PLAY:number=-1;

        private previousEvaluatedExpressionsIdMap:any={};

        constructor(engine:Engine3D, timerSequenceController:TimerSequenceController)
        {
            this.engine = engine;
            this.timerSequenceController = engine.timeSequenceController;
            robo.expressions.IntrepreterFunctionTable.populateFunctionTable();
            this.intrepretor = new ExpressionIntrepreter();

            this.graphsheet2d = new GraphSheet2D($("#canvas2d")[0]);
            this.timedDirectPlayExecutor = new  TimedDirectDrawExecutor(this.engine);
        }

        /**
         *
         * Each cmdExpreesion  has the following data as defined in cmd-editor.js
         * {id:stateMap.count,expression:"",color:0xfff,speed:defaultSpeed};
         *
         * cmdExpression is what user entered through UI
         * @param editorExpressionItems
         */

          public playAll(CompassParser, editorExpressionItems):void {

            this.clearPendingPlays();
            this.engine.clearAllRoboOutputs();
            this.engine.reset();
            this.engine.clearVirtualExecutionContextMap(); // remove all references

            this.previousEvaluatedExpressionsIdMap = {};
            var roboCommandSummary:RoboCommandSummary = this.toCommandObjects(CompassParser, editorExpressionItems);
            if(roboCommandSummary.expressionError)
            {
                throw roboCommandSummary.expressionError;
            }

            this.initializeCommands(roboCommandSummary);

            var validRoboCommands:IRoboCommand[] = roboCommandSummary.robocommands;
            var expressionIdToExpressionMap:any =roboCommandSummary.expressionIdToExpressionMap; // using this map we can get properties like speed,color,label etc

            var sequenceEffects:ArrayHelper = new ArrayHelper();
            for (var i:number = 0; i < validRoboCommands.length; i++)
            {
                var roboCommand:IRoboCommand = validRoboCommands[i];
                var commandSequenceEffect:ISequenceEffect = this.commandToSequenceEffect(roboCommand);
                sequenceEffects.addItem(commandSequenceEffect);
            }

            this.timerSequenceController.clearAll();
            this.timerSequenceController.setSequenceEffects(sequenceEffects);
            this.timerSequenceController.playShow();
        }


        public clearAllDrawings():void{

            this.clearPendingPlays();
            this.engine.clearAllRoboOutputs();
            this.engine.reset();
            this.engine.clearVirtualExecutionContextMap(); // remove all references

            this.previousEvaluatedExpressionsIdMap = {};
            this.timerSequenceController.clearAll();
        }



       /** This method is called while loading the robo **/
        public directDrawAll(CompassParser, editorExpressionItems):void {

            this.clearPendingPlays();
            this.engine.clearAllRoboOutputs();  
            this.engine.reset();
            this.engine.clearVirtualExecutionContextMap(); // remove all references

            this.previousEvaluatedExpressionsIdMap = {};
            var roboCommandSummary:RoboCommandSummary = this.toCommandObjects(CompassParser, editorExpressionItems);
            this.initializeCommands(roboCommandSummary);

            var validRoboCommands:IRoboCommand[] = roboCommandSummary.robocommands;
            var expressionIdToExpressionMap:any = roboCommandSummary.expressionIdToExpressionMap; // using this map we can get properties like speed,color,label etc

            this.timedDirectPlayExecutor.executeDirectDraw(roboCommandSummary);
        }


        /** initialises the command Engine,Properties **/

        private initializeCommands(roboCommandSummary:RoboCommandSummary):void
        {
            var dirtiedRoboCommands:IRoboCommand[] = roboCommandSummary.filterDirtyCommands();
            var expressionIdToExpressionMap:any = roboCommandSummary.expressionIdToExpressionMap;

            for(var i:number=0;i<dirtiedRoboCommands.length;i++)
            {
                var roboCommand:IRoboCommand = dirtiedRoboCommands[i];
                var virtualObjectExecutionContext = new VirtualObjectsExecutionContext(roboCommand.getExpressionId());
                this.engine.addExpressionVirtualContext(roboCommand.getExpressionId(),virtualObjectExecutionContext); // This is a dictionary..

                roboCommand.init(this.engine, virtualObjectExecutionContext);
                //now set the properties using expressionId
                var expression:any = expressionIdToExpressionMap[roboCommand.getExpressionId()];

                this.assignExpressionValuesToCommand(roboCommand,expression);
            }
        }


        private commandToSequenceEffect(roboCommand:IRoboCommand,playType:number=1):ISequenceEffect
        {
             var commandSequenceEffect;

            switch(playType){

                case PlayCommandHandler.DIRECT_PLAY:
                    commandSequenceEffect = new DirectCommandSeqEffect(roboCommand);
                    break;

                case PlayCommandHandler.TIMER_PLAY:
                    commandSequenceEffect = new CommandSequenceEffect(roboCommand);
                    break;
            }

            return commandSequenceEffect;
        }


        private assignExpressionValuesToCommand(roboCommand,expression):void{

            var speedInSeconds:number = expression.speed;
            var colorvalue:number = expression.color;

            roboCommand.setTimeInSeconds(speedInSeconds);
            roboCommand.setColor(colorvalue);
            roboCommand.hasShowLabel(expression.label);
            roboCommand.setLabelOffset(expression.offsetX,-expression.offsetY);//todo need to implemeted in setting panel
        }


        private toCommandObjects(CompassParser, editiorExpressions):RoboCommandSummary
        {
            var expressionError:ExpressionError = null;
            var expressionIdToExpressionMap:any={};
            var currentEvaluatedExpressionsIdMap:any ={};

            var expressionContext = new ExpressionContext(this.engine.getGraphSheet3D());
            var evaluatedExpressions:IBaseExpression[] = [];

            var errorExpressionIndex:number=-1;
            StyleConfig.reset();

            for (var i:number = 0; i < editiorExpressions.length; i++) {

                try{

                    var editorExpression = editiorExpressions[i];
                    var value:string = <string>editorExpression.expression;
                    value = value.trim();
                    if(value=="")
                        continue;

                    var ast1 = CompassParser.parse(value)[0];


                    var evaluatedExpression:IBaseExpression = this.intrepretor.evalExpression(ast1);
                    //pass the generated id to evaluated expresssion
                    evaluatedExpression.setExpressionId(editorExpression.id);
                    evaluatedExpression.setExpressionCommandText(editorExpression.text);

                    evaluatedExpression.resolve(expressionContext);
                    evaluatedExpressions.push(evaluatedExpression);

                    expressionIdToExpressionMap[editorExpression.id] = editorExpression;
                    currentEvaluatedExpressionsIdMap[editorExpression.id]=evaluatedExpression;


                }catch(err){

                    errorExpressionIndex = i;

                    if (err instanceof ExpressionError) {

                        expressionError =  <ExpressionError>err;
                        expressionError.expressionId = editorExpression.id;
                        break;

                    }else{

                        throw new ExpressionError(editorExpression.id,err.name,err.message);
                    }

                }
            }



            var validRoboCommands:IRoboCommand[] = [];
            $.each(evaluatedExpressions, function (index, evaluatedExpression)
            {
                robo.command.CommandFactory.populateCommands(evaluatedExpression, validRoboCommands);
            });


            var that = this;
            var expresssionIdCommandMap:any={};
            $.each(validRoboCommands, function (index, roboCommand) {
                
                expresssionIdCommandMap[roboCommand.getExpressionId()]= roboCommand;
            });

            var roboCommandSummary:RoboCommandSummary = new RoboCommandSummary(editiorExpressions,validRoboCommands);
            roboCommandSummary.expressionIdToExpressionMap = expressionIdToExpressionMap;
            roboCommandSummary.expresssionIdToCommandMap = expresssionIdCommandMap;
            roboCommandSummary.expressionError = expressionError;
            roboCommandSummary.errorExpressionIndex = errorExpressionIndex;

            roboCommandSummary.previousEvaluatedExpressionsIdMap = this.previousEvaluatedExpressionsIdMap;
            roboCommandSummary.currentEvaluatedExpressionsIdMap=currentEvaluatedExpressionsIdMap;



            //swap the previous with the current one
            this.previousEvaluatedExpressionsIdMap = currentEvaluatedExpressionsIdMap;
            return roboCommandSummary;
        }


       public  playSingle(CompassParser, editiorExpressions, currentPlayedEditorExpression):void {

           this.previousEvaluatedExpressionsIdMap = {};

           this.doSinglePlay(CompassParser, editiorExpressions, currentPlayedEditorExpression,PlayCommandHandler.TIMER_PLAY);
        }


        public onUpdatePropertiesDraw(CompassParser, editiorExpressions, currentPlayedEditorExpression):void {

            this.previousEvaluatedExpressionsIdMap = {};

            //sends DIRECT_PLAY as an arg
            this.doSinglePlay(CompassParser, editiorExpressions, currentPlayedEditorExpression,PlayCommandHandler.DIRECT_PLAY);

            this.timerSequenceController.endSequence();
        }


        private doSinglePlay(CompassParser, editiorExpressions, currentPlayedEditorExpression,playType:number){

            this.clearPendingPlays();
            var roboCommandSummary:RoboCommandSummary = this.toCommandObjects(CompassParser, editiorExpressions);

            var validRoboCommands:IRoboCommand[] = roboCommandSummary.robocommands;
            var expressionIdToExpressionMap:any = roboCommandSummary.expressionIdToExpressionMap;
            var expresssionIdToCommandMap:any=roboCommandSummary.expresssionIdToCommandMap;
            var cmdExpressionId:number = currentPlayedEditorExpression.id;
            roboCommandSummary.setCurrentActiveExpressionId(cmdExpressionId);


            var triggerdCommand:IRoboCommand = <IRoboCommand>expresssionIdToCommandMap[cmdExpressionId];

            if(triggerdCommand==undefined){


                throw new ExpressionError(cmdExpressionId,"","");


            }


            if(roboCommandSummary.expressionError)
            {
                throw roboCommandSummary.expressionError;
            }

            roboCommandSummary.setToCommandIndex(roboCommandSummary.getFromCommandIndex()+1);

            this.deleteSingleExpression(cmdExpressionId);
            this.initializeCommands(roboCommandSummary);


            var currentSequencEffect:ISequenceEffect = this.commandToSequenceEffect(triggerdCommand,playType);
            var sequenceEffects:ArrayHelper = new ArrayHelper();
            sequenceEffects.addItem(currentSequencEffect);// just add this alone

            this.engine.resetSinglePlay();
            this.timerSequenceController.clearAll();
            this.timerSequenceController.setSequenceEffects(sequenceEffects);
            this.timerSequenceController.playShow();
        }


        public deleteSingleExpression(cmdExpressionId:number):void{

            this.engine.removeRoboOutputByExpression(cmdExpressionId);
        }


        public directDraw(CompassParser, editiorExpressions, currentPlayedEditorExpression):void {

            this.clearPendingPlays();

            var roboCommandSummary:RoboCommandSummary = this.toCommandObjects(CompassParser, editiorExpressions);

            if(roboCommandSummary.expressionError)
            {
                //Remove all exprssions that follows the buggy expression
                var errorExpressionIndex:number = roboCommandSummary.errorExpressionIndex;
                for(var index:number=errorExpressionIndex;index<editiorExpressions.length;index++)
                {
                    var expressionId:number = editiorExpressions[index].id;
                    this.engine.removeRoboOutputByExpression(expressionId);
                }
            }


            roboCommandSummary.setCurrentActiveExpressionId(currentPlayedEditorExpression.id);
            var dirtiedCommands:IRoboCommand[] =   roboCommandSummary.filterDirtyCommands();

            for(var index:number=0;index<dirtiedCommands.length;index++)
            {
                var roboCommand:IRoboCommand = dirtiedCommands[index];
                var expressionId:number = roboCommand.getExpressionId();
                this.engine.removeRoboOutputByExpression(expressionId);
            }

            this.initializeCommands(roboCommandSummary);
            this.timedDirectPlayExecutor.executeDirectDraw(roboCommandSummary);
        }



        //todo , bug not fixed
        public showIndicator(activeExpression):void{

            var cmdExpressionId:number = activeExpression.id;

            var virtualContext:VirtualObjectsExecutionContext = this.engine.getVirtualObjectsExecutionContextByExpressionId(cmdExpressionId);

            if(virtualContext!=null)
            {
               this.engine.indicatorObj.showHighlight(virtualContext);

            }else{

                this.hideIndicator();
            }
        }

        //todo , bug not fixed
        public hideIndicator():void{

            if(this.engine.indicatorObj!=null)
            {
                this.engine.indicatorObj.dismissHighlight();
            }
        }

        public drawAllOnCanvas2D(CompassParser, editorExpressionItems,exportSettings){

            this.clearPendingPlays();

            exportSettings.sheetWidth = this.engine.getSheetWidth();
            exportSettings.sheetHeight = this.engine.getSheetHeight();

            this.graphsheet2d.setDrawingBounds(exportSettings);
            this.graphsheet2d.drawAxis(exportSettings.showGrid);

            this.previousEvaluatedExpressionsIdMap = {};
            var roboCommandSummary:RoboCommandSummary = this.toCommandObjects(CompassParser, editorExpressionItems);
            var dirtiedRoboCommands:IRoboCommand[] = roboCommandSummary.filterDirtyCommands();
            var expressionIdToExpressionMap:any = roboCommandSummary.expressionIdToExpressionMap;

            for(var i:number=0;i<dirtiedRoboCommands.length;i++)
            {
                var roboCommand:IRoboCommand = dirtiedRoboCommands[i];
                var virtualObjectExecutionContext = new VirtualObjectsExecutionContext(roboCommand.getExpressionId());

                roboCommand.init(this.engine, virtualObjectExecutionContext);
                //now set the properties using expressionId
                var expression:any = expressionIdToExpressionMap[roboCommand.getExpressionId()];

                this.assignExpressionValuesToCommand(roboCommand,expression);
            }


            var allRoboCommands:IRoboCommand[] = roboCommandSummary.robocommands;

            var editorExpressionByIdMap:any = roboCommandSummary.expressionIdToExpressionMap; // using this map we can get properties like speed,color,label etc

            var sequenceEffects:ArrayHelper = new ArrayHelper();

            var filteredCommand:IRoboCommand[] = this.getVisibleCommands(allRoboCommands);

            for (var i:number = 0; i < filteredCommand.length; i++)
            {
                var roboCommand:IRoboCommand = filteredCommand[i];
                var cmdExp:any = editorExpressionByIdMap[roboCommand.getExpressionId()];
                // to set virtal objects to command and set Properties of each command from its expression
                this.commandToSequenceEffect(roboCommand,PlayCommandHandler.NO_PLAY);
                roboCommand.drawOn2D(this.graphsheet2d);
            }

        }

        private getVisibleCommands(allRoboCommands:IRoboCommand[]):IRoboCommand[]{

            var commandDictionary:any[] = [];

            for (var i:number = 0; i < allRoboCommands.length; i++)
            {
                var roboCommand:IRoboCommand = allRoboCommands[i];

                if(roboCommand instanceof HideCommand){
                    var hideCommand:HideCommand = <HideCommand>roboCommand;
                    this.removeCommandsToBeHide(hideCommand.getHideExpLabels(),commandDictionary);
                    continue;
                }

                var lhsName:string = roboCommand.getLabelName();
                var labelName:string = lhsName.length>0 ? lhsName : ""+i;
                commandDictionary[labelName] = roboCommand;
            }

            var visibleCommands:IRoboCommand[] = [];

            for(var command in commandDictionary)
                visibleCommands.push(commandDictionary[command]);

          return visibleCommands;

       }

        private removeCommandsToBeHide(hideLabels:string[],commandDictionary:any[]):void{

            var hideCommandList:IRoboCommand[]=[];
            for(var i:number=0;i<hideLabels.length;i++)
            {
                var labelName:string = hideLabels[i];
                var commandToHide = commandDictionary[labelName];

                if(commandToHide!=null)
                {
                    commandDictionary[labelName]=null;
                    delete commandDictionary[labelName];
                }
            }

        }


        public clearPendingPlays():void
        {
            this.timedDirectPlayExecutor.clearTimer();
        }

    }

}


