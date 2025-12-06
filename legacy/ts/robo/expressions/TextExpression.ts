/**
 * Created by rizwan on 4/1/14.
 */

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ExpressionContext = robo.expressions.ExpressionContext;
    import AbstractNonArithmeticExpression = robo.expressions.AbstractNonArithmeticExpression;
    import QuotedStringExpression = robo.expressions.QuotedStringExpression;
    import Point = away.geom.Point;
    import StringUtil = robo.util.StringUtil;
    import PointExpression  = robo.expressions.PointExpression;
    import  NumericExpression  = robo.expressions.NumericExpression;
    import  VariableReferenceExpression  = robo.expressions.VariableReferenceExpression;
    import  AbstractArithmeticExpression  = robo.expressions.AbstractArithmeticExpression;

    import PMath = robo.util.PMath;

    export class TextExpression extends AbstractNonArithmeticExpression
    {
        public static NAME:string = "text";
        private subExpressions:IBaseExpression[] = [];
        private displayText:string;
        private coordinates:number[] = [];// gets populated  after calling resolve, 4 values x1,y1,x2,y2

        constructor(subExpressions:IBaseExpression[])
        {
            super();

            this.subExpressions = subExpressions;
        }



        resolve(context:ExpressionContext):void
        {
            this.coordinates = [];
            this.displayText = null;

            for (var i:number = 0; i < this.subExpressions.length; i++) {

                var resultExpression:IBaseExpression = this.subExpressions[i];
                resultExpression.resolve(context);

                var atomicValues:number[] = resultExpression.getVariableAtomicValues();
                for (var j:number = 0; j < atomicValues.length; j++) {

                    this.coordinates[this.coordinates.length] = atomicValues[j];
                }
            }

            this.validateExpression();

            if(this.displayText.indexOf("#")!=-1)
              this.replaceHashWord(context);

        }

        private replaceHashWord(context:ExpressionContext):void{

            var hashRegEx = /#(\w)+/g;
            var matchedTokens = hashRegEx.exec(this.displayText);

            if(matchedTokens!=null){

                for(var i:number=0;i<matchedTokens.length;i++){

                    var hashWord = matchedTokens[0];
                    hashWord = StringUtil.replace(hashWord,"#","");
                    var exp:IBaseExpression =  context.getReference(hashWord);

                    if(exp==null)
                      continue;

                    //below logic cannot be refrac to switch case, check 3rd condition

                    if(exp instanceof PointExpression){
                        var pointExp = <PointExpression>exp;
                        this.displayText =  StringUtil.replace(this.displayText,"#"+hashWord,pointExp.getFriendlyToStr());
                        return;
                    }


                    if(exp instanceof NumericExpression){
                        var numericExp = <NumericExpression>exp;
                        this.displayText =  StringUtil.replace(this.displayText,"#"+hashWord,""+PMath.roundDecimal(numericExp.value,2));
                        return;
                    }

                    //this will match for all +,-,/,* expressions
                    if(exp instanceof AbstractArithmeticExpression){
                        var variableRefExp = <AbstractArithmeticExpression>exp;
                        var atomicValues = variableRefExp.getVariableAtomicValues();
                        if(atomicValues.length>0)
                        this.displayText =  StringUtil.replace(this.displayText,"#"+hashWord,""+PMath.roundDecimal(atomicValues[0],2));
                        return;
                    }

                }

            }

        }


        validateExpression():void
        {
            var resultExpression:IBaseExpression = this.subExpressions[0];
            if(resultExpression.getName()==QuotedStringExpression.NAME)
            {
                var quotedStringExpression:QuotedStringExpression = <QuotedStringExpression>resultExpression;
                this.displayText = quotedStringExpression.getComment();

            }else{

                this.dispatchError("Text expression should contain text inside a single quote");
            }



            if(this.coordinates.length!=0 && this.coordinates.length!=2)
            {
                this.dispatchError("Text expression must have two coordinates");
            }
        }


        getName():string
        {
            return TextExpression.NAME;
        }

        public getVariableAtomicValues():number[]
        {
            return  [];// this expression clones the array as it is since slice is zero
        }

        //convient method
        public getDisplayText():string
        {

            var toNumber=+this.displayText

            if(PMath.isNaN(toNumber)){

                return this.displayText;

            }


            return PMath.roundDecimal(toNumber,2)+"";


        }

        public getTextPosition():Point
        {
            return new Point(this.coordinates[0],this.coordinates[1]);
        }

        public isSimpleTextExpression():boolean
        {
            return (this.coordinates.length==0) ? true : false
        }

        public  equals(other:IBaseExpression):boolean
        {
            if(!other)
                return false;


            if(this.getName()!=other.getName())
                return false;


            var otherExpression:TextExpression = <TextExpression>other;

            if(this.getDisplayText()!=otherExpression.getDisplayText())
            {
                return false;
            }

            if(this.isSimpleTextExpression()==otherExpression.isSimpleTextExpression())
            {
                return this.getTextPosition().equals(otherExpression.getTextPosition());
            }

            return false;
        }
    }
}