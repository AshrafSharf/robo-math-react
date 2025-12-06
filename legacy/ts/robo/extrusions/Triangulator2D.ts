/**
 * Created by Mathdisk on 3/16/14.
 */


///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.extrusions {

    import PMath=robo.util.PMath;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Point = away.geom.Point;

    export class Triangulator2D
    {
        private  thePoly:any=[];


        public constructor(argPoly:any)
    {
        this.thePoly =[];

        this.sortAndStoreClockWise(argPoly);


    }


        public  tri():any
    {

        var allDelanyTriangles:ArrayHelper = new ArrayHelper();

        var verticesVec:any = [];

        for(var i:number=0;i<this.thePoly.length;i++)
        {

            verticesVec.push(new b2Vec2(this.thePoly[i].X,this.thePoly[i].Y));

        }

        //seperate concave poly vertieces into concave shapes , so that delany tringulation works correctly
        var arrayOfArray:any = this.Separate(verticesVec);


        for(var j:number=0;j<arrayOfArray.length;j++)
        {
            var polyPts:any = arrayOfArray[j];
            var delanuyTriangles:any = Delaunay.Triangulate(polyPts);
            allDelanyTriangles.addAll(delanuyTriangles);

        }


        return allDelanyTriangles;



    }


        public   sortAndStoreClockWise(argPoly:any):void
    {

        
        var centroidPt:Point = Triangulator2D.calculateCentroid(argPoly);

        for(var i:number=0;i<argPoly.length;i++)
        {


            var rad:number = Triangulator2D.lineAngle(centroidPt.x,centroidPt.y,argPoly[i].x,argPoly[i].y);

            var degreeVal:number =  PMath.degrees(rad);

            if(degreeVal<0)
            {
                degreeVal =  360+degreeVal;
            }


            var delanayPoint:DelanauyPoint = new DelanauyPoint(argPoly[i].x,argPoly[i].y);
            delanayPoint.angle = degreeVal;

            this.thePoly.push(delanayPoint);

        }

        //Make it clockwise
        this.thePoly.sort(Triangulator2D.sortOn("angle"));



    }


       private static sortOn(property){

        return function(a, b){
            if(a[property] < b[property]){
                return -1;
            }else if(a[property] > b[property]){
                return 1;
            }else{
                return 0;
            }
        }
    }


        public static  lineAngle(x1:number, y1:number, x2:number, y2:number):number{

        var  dx = x2 - x1;
        var  dy = y2 - y1;
        return Math.atan2(dy,dx);

    }


        

        public static calculateCentroid(pointSet:any):Point
        {

            var area = 0;
            var x:number = 0;
            var y:number = 0;
            for (var i:number = 0; i < pointSet.length; i++) {
                var p1:Point = pointSet[i];
                var p2:Point = pointSet[(i + 1) % pointSet.length];
                area += (p1.x * p2.y) - (p2.x * p1.y);
                x += (p1.x + p2.x) * (p1.x * p2.y - p2.x * p1.y);
                y += (p1.y + p2.y) * (p1.x * p2.y - p2.x * p1.y);
            }
            area = area / 2;
            var centroid = new Point(x / (6 * area), y / (6 * area));
           
            
            return centroid;

        }





        private  calcShapes(verticesVec:any):any
    {
        var vec:any;
        var i:number, n:number, j:number;
        var d:number, t:number, dx:number, dy:number, minLen:number;
        var i1:number, i2:number, i3:number, p1:b2Vec2, p2:b2Vec2, p3:b2Vec2;
        var j1:number, j2:number, v1:b2Vec2, v2:b2Vec2, k:number, h:number;
        var vec1:any, vec2:any;
        var v:b2Vec2, hitV:b2Vec2;
        var isConvex:Boolean;
        var figsVec:any = [], queue:any = [];

        queue.push(verticesVec);

        while(queue.length)
        {
            vec = queue[0];
            n = vec.length;
            isConvex = true;

            for(i=0; i<n; i++)
            {
                i1 = i;
                i2 = (i<n-1?i+1:i+1-n);
                i3 = (i<n-2?i+2:i+2-n);

                p1 = vec[i1];
                p2 = vec[i2];
                p3 = vec[i3];

                d = this.det(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                if(d<0)
                {
                    isConvex = false;
                    minLen = Number.MAX_VALUE;

                    for(j=0; j<n; j++)
                    {
                        if(j!=i1&&j!=i2)
                        {
                            j1 = j;
                            j2 = (j<n-1?j+1:0);

                            v1 = vec[j1];
                            v2 = vec[j2];

                            v = this.hitRay(p1.x, p1.y, p2.x, p2.y, v1.x, v1.y, v2.x, v2.y);

                            if(v)
                            {
                                dx = p2.x-v.x;
                                dy = p2.y-v.y;
                                t = dx*dx+dy*dy;

                                if(t<minLen)
                                {
                                    h = j1;
                                    k = j2;
                                    hitV = v;
                                    minLen = t;
                                }
                            }
                        }
                    }

                    if(minLen==Number.MAX_VALUE) this.err();

                    vec1 = [];
                    vec2 = [];

                    j1 = h;
                    j2 = k;
                    v1 = vec[j1];
                    v2 = vec[j2];

                    if(!this.pointsMatch(hitV.x, hitV.y, v2.x, v2.y)) vec1.push(hitV);
                    if(!this.pointsMatch(hitV.x, hitV.y, v1.x, v1.y)) vec2.push(hitV);

                    h = -1;
                    k = i1;
                    while(true)
                    {
                        if(k!=j2) vec1.push(vec[k]);
                        else
                        {
                            if(h<0||h>=n) this.err();
                            if(!this.isOnSegment(v2.x, v2.y, vec[h].x, vec[h].y, p1.x, p1.y)) vec1.push(vec[k]);
                            break;
                        }

                        h = k;
                        if(k-1<0) k = n-1;
                        else k--;
                    }

                    vec1 = vec1.reverse();

                    h = -1;
                    k = i2;
                    while(true)
                    {
                        if(k!=j1) vec2.push(vec[k]);
                        else
                        {
                            if(h<0||h>=n) this.err();
                            if(k==j1&&!this.isOnSegment(v1.x, v1.y, vec[h].x, vec[h].y, p2.x, p2.y)) vec2.push(vec[k]);
                            break;
                        }

                        h = k;
                        if(k+1>n-1) k = 0;
                        else k++;
                    }

                    queue.push(vec1, vec2);
                    queue.shift();

                    break;
                }
            }

            if(isConvex) figsVec.push(queue.shift());
        }

        return figsVec;
    }

        private  hitRay(x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number):b2Vec2
    {
        var t1:number = x3-x1, t2:number = y3-y1, t3:number = x2-x1, t4:number = y2-y1,
            t5:number = x4-x3, t6:number = y4-y3, t7:number = t4*t5-t3*t6, a:number;

        a = (t5*t2-t6*t1)/t7;
        var px:number = x1+a*t3, py:number = y1+a*t4;
        var b1:Boolean = this.isOnSegment(x2, y2, x1, y1, px, py);
        var b2:Boolean = this.isOnSegment(px, py, x3, y3, x4, y4);

        if(b1&&b2) return new b2Vec2(px, py);

        return null;
    }

        private  hitSegment(x1:number, y1:number, x2:number, y2:number, x3:number, y3:number, x4:number, y4:number):b2Vec2
    {
        var t1:number = x3-x1, t2:number = y3-y1, t3:number = x2-x1, t4:number = y2-y1,
            t5:number = x4-x3, t6:number = y4-y3, t7:number = t4*t5-t3*t6, a:number;

        a = (t5*t2-t6*t1)/t7;
        var px:number = x1+a*t3, py:number = y1+a*t4;
        var b1:Boolean = this.isOnSegment(px, py, x1, y1, x2, y2);
        var b2:Boolean = this.isOnSegment(px, py, x3, y3, x4, y4);

        if(b1&&b2) return new b2Vec2(px, py);

        return null;
    }

        private  isOnSegment(px:number, py:number, x1:number, y1:number, x2:number, y2:number):Boolean
    {
        var b1:Boolean = ((x1+0.1>=px&&px>=x2-0.1)||(x1-0.1<=px&&px<=x2+0.1));
        var b2:Boolean = ((y1+0.1>=py&&py>=y2-0.1)||(y1-0.1<=py&&py<=y2+0.1));
        return (b1&&b2&&this.isOnLine(px, py, x1, y1, x2, y2));
    }

        private  pointsMatch(x1:number, y1:number, x2:number, y2:number):Boolean
    {
        var dx:number = (x2>=x1?x2-x1:x1-x2), dy:number = (y2>=y1?y2-y1:y1-y2);
        return (dx<0.1&&dy<0.1);
    }

        private  isOnLine(px:number, py:number, x1:number, y1:number, x2:number, y2:number):Boolean
    {
        if(x2-x1>0.1||x1-x2>0.1)
        {
            var a:number = (y2-y1)/(x2-x1), possibleY:number = a*(px-x1)+y1, diff:number = (possibleY>py?possibleY-py:py-possibleY);
            return (diff<0.1);
        }

        return (px-x1<0.1||x1-px<0.1);
    }

        private  det(x1:number, y1:number, x2:number, y2:number, x3:number, y3:number):number
    {
        return x1*y2+x2*y3+x3*y1-y1*x2-y2*x3-y3*x1;
    }

        private  err():void
    {
        throw new Error("A problem has occurred. Use the Validate() method to see where the problem is.");
    }

        /**
         * Checks whether the vertices in <code>verticesVec</code> can be properly distributed into the new fixtures (more specifically, it makes sure there are no overlapping segments and the vertices are in clockwise order).
         * It is recommended that you use this method for debugging only, because it may cost more CPU usage.
         * <p/>
         * @param verticesVec The vertices to be validated.
         * @return An integer which can have the following values:
         * <ul>
         * <li>0 if the vertices can be properly processed.</li>
         * <li>1 If there are overlapping lines.</li>
         * <li>2 if the points are <b>not</b> in clockwise order.</li>
         * <li>3 if there are overlapping lines <b>and</b> the points are <b>not</b> in clockwise order.</li>
         * </ul>
         * */

        public  Validate(verticesVec:any):number
    {
        var i:number, n:number = verticesVec.length, j:number, j2:number, i2:number, i3:number, d:number, ret:number = 0;
        var fl:Boolean, fl2:Boolean = false;

        for(i=0; i<n; i++)
        {
            i2 = (i<n-1?i+1:0);
            i3 = (i>0?i-1:n-1);

            fl = false;
            for(j=0; j<n; j++)
            {
                if(j!=i&&j!=i2)
                {
                    if(!fl)
                    {
                        d = this.det(verticesVec[i].x, verticesVec[i].y, verticesVec[i2].x, verticesVec[i2].y, verticesVec[j].x, verticesVec[j].y);
                        if(d>0) fl = true;
                    }

                    if(j!=i3)
                    {
                        j2 = (j<n-1?j+1:0);
                        if(this.hitSegment(verticesVec[i].x, verticesVec[i].y, verticesVec[i2].x, verticesVec[i2].y, verticesVec[j].x, verticesVec[j].y, verticesVec[j2].x, verticesVec[j2].y))
                            ret = 1;
                    }
                }
            }

            if(!fl) fl2 = true;
        }

        if(fl2)
        {
            if(ret==1) ret = 3;
            else ret = 2;
        }

        return ret;
    }



        /** This method converts concave shapes into convex ones.. returns array of array of points **/

        public  Separate(verticesVec:any, scale:number = 50):any
    {
        var arrayOfArrayPoints:any = [];

        var i:number, n:number = verticesVec.length, j:number, m:number;
        var vec:any = [], figsVec:any;



        for(i=0; i<n; i++) vec.push(new b2Vec2(verticesVec[i].x*scale, verticesVec[i].y*scale));

        figsVec = this.calcShapes(vec);
        n = figsVec.length;

        for(i=0; i<n; i++)
        {
            var points = [];

            vec = figsVec[i];
            m = vec.length;


            for(j=0; j<m; j++)
            {
                points.push(new DelanauyPoint(vec[j].x/scale, vec[j].y/scale) );
            }

            arrayOfArrayPoints.push(points);
        }


        return arrayOfArrayPoints;

    }

    }

}