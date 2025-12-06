/**
 * Created by Mathdisk on 4/18/14.
 */
module robo.shapeitems
{
    import Point3D = robo.core.Point3D;

    export  class ArcByDistanceShapeItem extends BaseShapeItem
    {
        public startPt:Point3D;
        public endPt:Point3D;
        public origin:Point3D;
        public fromAngleInDegrees:number;
        public toAngleInDegrees:number;

        constructor(startPt:Point3D,endPt:Point3D,origin:Point3D,fromAngleInDegrees:number,toAngleInDegrees:number)
        {
            super();
            this.startPt= startPt;
            this.endPt = endPt;
            this.origin = origin;
            this.fromAngleInDegrees = fromAngleInDegrees;
            this.toAngleInDegrees = toAngleInDegrees;
        }

        public equals(otherItem:BaseShapeItem):boolean
        {
            if(otherItem==undefined || otherItem==null)
            {
                return false;
            }

            if(otherItem instanceof ArcByDistanceShapeItem )
            {
                var otherArcByDistance:ArcByDistanceShapeItem = <ArcByDistanceShapeItem>otherItem;

                var result1:boolean = this.startPt.equals(otherArcByDistance.startPt);
                var result2:boolean = this.endPt.equals(otherArcByDistance.endPt);

                if(result1 && result2)
                     return true;
            }
            return false;
        }
    }
}