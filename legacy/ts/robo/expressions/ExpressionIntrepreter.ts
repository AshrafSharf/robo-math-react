/**
 * Created by Mathdisk on 3/22/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/***
 *
 * Command Intrepreter doesnt depend on any Robo class, the CommandFunctionTable is the place where we define all the export functions
 */
module robo.expressions {

   export class ExpressionIntrepreter
   {

       public static expTable:any={};

       constructor()
       {



       }




       /**
        * The ast has either just args or value
        *
        * @param ast
        * @param scope
        */

       public evalExpression(ast, scope?):any
       {
           var args = [];

           if(ast.args) // if the ast has args then it is a expression, if not it is a terminal
           {

              // resolve each args (This coud because a line can have line(point(0,0),2,3) where point is a inner expression

               for(var i:number=0;i<ast.args.length;i++)
               {
                   var innerAst:any = ast.args[i];
                   args[i] = this.evalExpression(innerAst, scope);
               }


           } // if args is not there then atleast value must be there
           else
           {
               args[0]=ast.value;
           }



           var normalizedName:string = ast.name.toLowerCase();

           var result:any;

           if(ExpressionIntrepreter.expTable[normalizedName])
               result = ExpressionIntrepreter.expTable[normalizedName].call(this,{args:args,scope:scope});
           else
           {
               throw new Error("No command by the name "+normalizedName+" is found");
           }

          return result;

       }

   }
}

