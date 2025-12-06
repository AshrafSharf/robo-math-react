/**
 * Created by rizwan on 3/19/14.
 */

module robo.util
{
    export class BoundryConstrainer
    {
        private boundries:number[];
        private previousValue:number = -0.1;
        public autoReset:boolean = false;

        constructor(boundries:number[])
        {
            this.boundries = boundries;
        }


        public constrain(ratio:number):number
        {
            for(var i:number=0;i<this.boundries.length;i++)
            {
                var boundryValue:number = this.boundries[i];

                //prev = 4.9
                //ratio =5.1
                if(this.previousValue<boundryValue && ratio>boundryValue)
                {
                    this.previousValue = boundryValue;
                    return boundryValue;
                }
            }

            this.previousValue =  ratio;
            return ratio;
        }


        public constrain1(ratio:number):number
        {
            if(this.previousValue>ratio)
            {
                for(var i:number=0;i<this.boundries.length;i++)
                {
                    var boundryValue:number = this.boundries[i];

                    if(this.previousValue<boundryValue)
                    {
                        this.previousValue = -0.1;
                        return boundryValue;
                    }
                }
                this.previousValue = -0.1;
                return this.boundries[0];
            }

            return this.constrain(ratio);
        }


        public reset():void
        {
            this.previousValue = -0.1;
        }
    }
}
