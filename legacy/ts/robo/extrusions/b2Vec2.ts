/**
 * Created by Mathdisk on 3/16/14.
 */


///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.extrusions {

    export class b2Vec2
    {
        public  constructor(x_:number=0, y_:number=0)
        {this.x=x_; this.y=y_;}

        public  SetZero() : void { this.x = 0.0; this.y = 0.0; }
        public  Set(x_:number=0, y_:number=0) : void {this.x=x_; this.y=y_;}
        public  SetV(v:b2Vec2) : void {this.x=v.x; this.y=v.y;}

        public  GetNegative():b2Vec2 { return new b2Vec2(-this.x, -this.y); }
        public  NegativeSelf():void { this.x = -this.x; this.y = -this.y; }

        public static   Make(x_:number, y_:number):b2Vec2
    {
        return new b2Vec2(x_, y_);
    }

        public  Copy():b2Vec2{
        return new b2Vec2(this.x,this.y);
    }

        public  Add(v:b2Vec2) : void
    {
        this.x += v.x; this.y += v.y;
    }

        public  Subtract(v:b2Vec2) : void
    {
        this.x -= v.x; this.y-= v.y;
    }


        public  Multiply(a:number) : void
    {
        this.x *= a; this.y *= a;
    }


        public  MinV(b:b2Vec2) : void
    {
        this.x = this.x < b.x ? this.x : b.x;
        this.x = this.y < b.y ? this.y : b.y;
    }

        public  MaxV(b:b2Vec2) : void
    {
        this.x = this.x > b.x ? this.x : b.x;
        this.y = this.y > b.y ? this.y : b.y;
    }

        public  Abs() : void
    {
        if (this.x < 0) this.x = -this.x;
        if (this.y < 0) this.y = -this.y;
    }

        public  Length():number
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

        public  LengthSquared():number
    {
        return (this.x * this.x + this.y * this.y);
    }

        public  Normalize():number
    {
        var length:number = Math.sqrt(this.x * this.x + this.y * this.y);
        if (length < Number.MIN_VALUE)
        {
            return 0.0;
        }
        var invLength:number = 1.0 / length;
        this.x *= invLength;
        this.y *= invLength;

        return length;
    }


        public  x:number;
        public  y:number;
    }

}