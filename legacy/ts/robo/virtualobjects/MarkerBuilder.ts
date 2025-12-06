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

    export class MarkerBuilder extends BaseVirtualObject {
        private ui3DScript: UI3DScript;
        private markerGroup: GeometryGroup;
        private markerOutputInstanceManager: GeomPartInstanceRemoveManager;

        constructor(ui3DScript: UI3DScript) {
            super();
            this.ui3DScript = ui3DScript;
            this.markerGroup = new GeometryGroup(this.ui3DScript);
            this.markerOutputInstanceManager = new GeomPartInstanceRemoveManager(this.markerGroup, 60);// 20 is  the max internal instances to  manage
        }

        public commitMarkers(points: Point3D[]): void {
            this.markerOutputInstanceManager.clearAll();
            var outputMesh: Mesh = this.ui3DScript.commitMarkerList(points);
            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
            var makerMesh: Mesh = this.ui3DScript.commitMarkerLabelList(points);
            this.virtualObjectsExecutionContext.addOutputMesh(makerMesh);
        }

        public directCommitMarkers(points: Point3D[]): void {
            this.commitMarkers(points);
        }

        public removeInternalDrawings(): void {
            this.markerOutputInstanceManager.clearAll();
        }

    }


}

