/**
 * Created by rizwan on 3/20/14.
 */

module robo.virtualobjects
{
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import BitmapData = away.base.BitmapData;
    import UI3DScript = robo.geom.UI3DScript;
    import Point3D = robo.core.Point3D;


    export  class Paper3D
    {
        private planePart:GeometryPart;

        constructor(ui3DScript:UI3DScript)
        {
            this.createPlanePart(ui3DScript);
        }

        private createPlanePart(ui3DScript:UI3DScript)
        {
            var geoGroup:GeometryGroup = new GeometryGroup(ui3DScript);

            this.planePart = geoGroup.cuboid(new Point3D(0,0,-0.05),40,0,40);
        }

        public attachImage(imageBitmapData:BitmapData):void
        {
            this.planePart.attachImage(imageBitmapData);

            var uvArray:number[] = this.planePart.getUVData();

            this.updateCuboidUVDatas(uvArray);
        }

        private updateCuboidUVDatas(uvArray:number[]):void
        {
            //11
            uvArray[20] = 0;
            uvArray[21] = 0;

            //15
            uvArray[28] = 1;
            uvArray[29] = 0;

            //13
            uvArray[24] = 1;
            uvArray[25] = 1;

            //9
            uvArray[16] = 0;
            uvArray[17] = 1;

            for(var i:number=0; i<uvArray.length;i++)
            {
                if(i==20 || i==21 || i==24 || i==25 || i==16 || i==17 || i==28 || i==29)
                {

                }
                else
                {
                    uvArray[i]=0;
                }
            }
            this.planePart.updateUVData(uvArray);
        }
    }
}
