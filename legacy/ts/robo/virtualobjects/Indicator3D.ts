/**
 * Created by rizwan on 4/15/14.
 */

module robo.virtualobjects
{
    import UI3DScript = robo.geom.UI3DScript;
    import VirtualObjectsExecutionContext = robo.virtualobjects.VirtualObjectsExecutionContext;

    export class Indicator3D  extends BaseVirtualObject
    {
        private ui3DScript:UI3DScript;
        private activeVirtualContext:VirtualObjectsExecutionContext = null;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
        }

        public showHighlight(virtualContext:VirtualObjectsExecutionContext):void
        {
           this.dismissHighlight();

            this.activeVirtualContext = virtualContext;

            this.activeVirtualContext.showHighlight();
        }

        public dismissHighlight():void
        {
            if(this.activeVirtualContext!=null)
            {
                this.activeVirtualContext.dismissHighlight();
            }
            this.activeVirtualContext = null;
        }
    }
}
