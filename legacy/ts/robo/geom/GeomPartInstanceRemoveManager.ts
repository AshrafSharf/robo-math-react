/**
 * Created by MathDisk on 2/24/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.geom {


    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import SegmentSet = away.entities.SegmentSet;
    import LineSegment = away.primitives.LineSegment;
    import Segment = away.base.Segment;
    import DisplayObject = away.base.DisplayObject;
    import Mesh = away.entities.Mesh;




    export class GeomPartInstanceRemoveManager
    {
        private geometryGroup:GeometryGroup;
        private instances:GeometryPart[] =[];
        private maxInst:number=5;



        constructor(geometryGroup:GeometryGroup,maxInst:number=2)
        {
            this.geometryGroup = geometryGroup;
            this.maxInst = maxInst;
        }

        public manageMesh(childPart:GeometryPart):void
        {


            if(this.instances.length>this.maxInst)
            {
                var part:GeometryPart =  this.instances.shift();
                this.geometryGroup.removePart(part);

            }

            for(var i:number=0;i<this.instances.length;i++)
            {
                var geometryPart:GeometryPart =  this.instances[i];
                this.hideNonSegmentMeshes(geometryPart.part);

            }

            this.instances.push(childPart);



        }

        private hideNonSegmentMeshes(displayObject:DisplayObject):void
        {
            if(displayObject instanceof SegmentSet )
            {
                var innerSegmentSet:SegmentSet=<SegmentSet>displayObject;// no more children
                 return;
            }

            if(displayObject instanceof Mesh)
            {
                var mesh:Mesh = <Mesh>displayObject;

                if(mesh.numChildren>=1)
                {
                    for(var i:number=0;i<mesh.numChildren;i++)
                    {
                        this.hideNonSegmentMeshes(mesh.getChildAt(i));
                    }
                }

                else
                {
                    mesh.visible=false;

                }
            }
        }



        public clearAll():void
        {
            for(var i:number=0;i<this.instances.length;i++)
            {
                var part:GeometryPart =  this.instances[i];
                this.geometryGroup.removePart(part);

            }


            this.instances=[];

        }

    }

}