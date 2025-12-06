/**
 * Created by MohammedAzeem on 4/5/14.
 */


module robo.core {

    import Point = away.geom.Point;

    export interface IIntersectable
    {
        asPolyPoints(arrayOfPointArray:any,stepSize:number):void;
        intersect(object:IIntersectable):Point[];
        getTranslatedObject(translationFucn:Function):IIntersectable;




    }
}
