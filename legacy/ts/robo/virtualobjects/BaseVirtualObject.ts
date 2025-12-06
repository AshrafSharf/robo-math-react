/**
 * Created by Mathdisk on 3/31/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.virtualobjects
{
    import Point = away.geom.Point;
    import Point3D = robo.core.Point3D;

    export class BaseVirtualObject
    {
        public virtualObjectsExecutionContext:VirtualObjectsExecutionContext;
        public maximumOpacity:number = 0.7;

        constructor()
        {

        }

        public setVirtualObjectsExecutionContext(value:VirtualObjectsExecutionContext):void
        {
            this.virtualObjectsExecutionContext = value;
        }

        public getVirtualObjectsExecutionContext():VirtualObjectsExecutionContext
        {
            return this.virtualObjectsExecutionContext;
        }

        public static fromPointToPoint3D(pt:Point):Point3D
        {
           return new Point3D(pt.x,pt.y,0);
        }
    }
}