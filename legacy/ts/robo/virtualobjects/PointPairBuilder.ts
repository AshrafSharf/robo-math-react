module robo.virtualobjects {
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point3D = robo.core.Point3D;
    import PMath = robo.util.PMath;
    import UI3DScript = robo.geom.UI3DScript
    import GeometryGroup = robo.geom.GeometryGroup;
    import GeometryPart = robo.geom.GeometryPart;
    import Pencil3D = robo.virtualobjects.Pencil3D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Mesh = away.entities.Mesh;
    import GeomPartInstanceRemoveManager = robo.geom.GeomPartInstanceRemoveManager;
    import BaseVirtualObject = robo.virtualobjects.BaseVirtualObject;
    import SegmentSet = away.entities.SegmentSet;
    import WireFrameObjects3D = robo.extrusions.WireFrameObjects3D;


    export class PointPairBuilder extends BaseVirtualObject {
        private ui3DScript: UI3DScript;
        private pointPairGroup: GeometryGroup;
        private traceOutputInstanceManager: GeomPartInstanceRemoveManager;

        constructor(ui3DScript: UI3DScript) {
            super();
            this.ui3DScript = ui3DScript;
            this.pointPairGroup = new GeometryGroup(this.ui3DScript);
            this.traceOutputInstanceManager = new GeomPartInstanceRemoveManager(this.pointPairGroup, 40);// 20 is  the max internal instances to  manage
        }

        public commitUsingPointPairs(pointPairs): void {
            this.traceOutputInstanceManager.clearAll();
            var outputMesh: Mesh = this.ui3DScript.commitByPairPoints(pointPairs);
            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }


        public directCommitPointPairs(modelPointPairs, alphaValue = 1): void {
            var outputMesh: Mesh = this.ui3DScript.commitByPairPoints(modelPointPairs);
            outputMesh.alpha = alphaValue;
            if (outputMesh.numChildren > 0) {
                var segmentSet:SegmentSet =  <SegmentSet><any>outputMesh.getChildAt(0);
                WireFrameObjects3D.applyThickness(segmentSet, alphaValue);

            }
            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public removeInternalDrawings(): void {
            this.traceOutputInstanceManager.clearAll();
        }

    }


}

