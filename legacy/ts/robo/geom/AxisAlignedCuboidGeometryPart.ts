/**
 * Created by rizwan on 6/2/14.
 */

module robo.geom {

    import Mesh = away.entities.Mesh;
    import AxisAlignedGeometryPart = robo.geom.AxisAlignedGeometryPart;
    import UI3DScript = robo.geom.UI3DScript;

    export class AxisAlignedCuboidGeometryPart extends AxisAlignedGeometryPart {

        constructor(axis:string, ui3DScript:UI3DScript, part:Mesh)
        {
            super(axis,ui3DScript, part);
        }

        public  relativeYaw(angle:number):void
        {
            if(angle>90)
            {
                var numberOfTimes:number = Math.floor(angle/90);

                var balanceAngle:number = angle - (numberOfTimes * 90);

                for(var i:number=0;i<numberOfTimes;i++)
                {
                    super.relativeYaw(90);
                }

                super.relativeYaw(balanceAngle);

                return;
            }

            super.relativeYaw(angle);
        }
    }
}
