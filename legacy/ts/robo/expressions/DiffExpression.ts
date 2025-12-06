/**
 * Created by Mathdisk on 3/17/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.expressions {

    import IBaseExpression = robo.expressions.IBaseExpression;
    import ClipType = robo.polyclipping.ClipType;

    export class DiffExpression extends ClipperExpression {

        constructor(subExpressions:IBaseExpression[])
        {
            super(subExpressions);
        }

        public getClipType():number
        {
            return ClipType.DIFFERENCE;
        }
    }


}