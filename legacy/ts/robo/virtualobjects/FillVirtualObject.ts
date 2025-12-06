/**
 * Created by Mathdisk on 2/24/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.virtualobjects
{
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import PMath = robo.util.PMath;
    import UI3DScript = robo.geom.UI3DScript;
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Point3D = robo.core.Point3D;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingLine3D = robo.core.ProcessingLine3D;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import Point = away.geom.Point;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import ColorConstants = robo.util.ColorConstants;
    import Mesh = away.entities.Mesh;
    import BitmapData = away.base.BitmapData;
    import BoundryConstrainer = robo.util.BoundryConstrainer;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import IIntersectable = robo.core.IIntersectable;
    import ColorMaterial = away.materials.ColorMaterial;
    import ProcessingPolygon2D=robo.core.ProcessingPolygon2D;
    import ProcessingGroup = robo.core.ProcessingGroup;

    export  class FillerVirtualObject extends BaseVirtualObject
    {
        private ui3DScript:UI3DScript;
        public outputMesh:Mesh;
        private fillGroup:GeometryGroup;
        private boundryContainer:BoundryConstrainer;

        public static MAX_FILL_ALPHA:number = 0.7;

        constructor(ui3DScript:UI3DScript)
        {
            super();

            this.ui3DScript = ui3DScript;
            this.boundryContainer = new BoundryConstrainer([0,1]);

            this.createFillGroup();
        }


        private createFillGroup():void
        {
            this.fillGroup = new GeometryGroup(this.ui3DScript);
        }


        public fillSurface(processingGroup:ProcessingGroup,ratio:number):void
        {
            ratio = this.boundryContainer.constrain(ratio);

            if(ratio==0)
            {
                this.outputMesh = this.ui3DScript.commitProcessingGroup(processingGroup);
                if(this.outputMesh!=null)
                this.virtualObjectsExecutionContext.addOutputMesh(this.outputMesh);
            }

            var fillAlphaRatio:number = PMath.map(ratio,0,1,0,0.7);
            this.virtualObjectsExecutionContext.fadeOut(fillAlphaRatio,this.virtualObjectsExecutionContext.getPrimaryColor());



            if(ratio==1)
            {
                this.boundryContainer.reset();
            }
        }

        public directFillSurface(processingGroup:ProcessingGroup):void
        {
            this.outputMesh = this.ui3DScript.commitProcessingGroup(processingGroup);
            if(this.outputMesh!=null)
                this.virtualObjectsExecutionContext.addOutputMesh(this.outputMesh);
        }

        public reset():void
        {
            this.boundryContainer.reset();
        }

        public removeInternalDrawings():void
        {

        }
    }


}