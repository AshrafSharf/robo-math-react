/**
 * Created by Mathdisk on 3/17/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.command {

    import Engine3D = robo.geom.Engine3D; // soft ref
    import Point = away.geom.Point;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;
    import GraphSheet2D = robo.twod.GraphSheet2D;

    export interface IRoboCommand
    {
        showLabel:boolean;

        prePlay():void;
        preCalculate():void;
        postPlay():void;
        play(value:number):void;// value always ranges from 0 to 1
        init(engine:Engine3D,commandContext:VirtualObjectsExecutionContext):void;
        getTimeInSeconds():number;
        setTimeInSeconds(timeInSecods:number):void;

        //this will help us to correlate the command and the expression
        getExpressionId():number;
        setExpressionId(expressionId:number):void;

        setCommandText(cmdText:string):void;
        getCommandText():string;

        getLabelName():string;
        setLabelName(labelName:string):void;
        getLabelPosition():Point;
        setColor(colorVal:number):void;
        getColor():number;
        hasShowLabel(val:string):void;
        virtualObjectExecutionContext:VirtualObjectsExecutionContext;
        setLabelOffset(xOffset:number,yOffset:number):void
        directPlay():void;
        drawOn2D(graphSheet2D:GraphSheet2D):void;
    }

}