
declare module roboexpressions {

interface ExpressionError {

        expressionId : number;
        expressionType:string;
        message:string;


        new (expressionId:number,expressionType:string,message:string): ExpressionError;

        prototype: ExpressionError;

    }

}

    