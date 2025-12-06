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

    export class VirtualTracer extends BaseVirtualObject {
        private ui3DScript: UI3DScript;
        private tracerGroup: GeometryGroup;
        private _pencil3d: Pencil3D = null;
        private traceOutputInstanceManager: GeomPartInstanceRemoveManager;

        constructor(ui3DScript: UI3DScript) {
            super();

            this.ui3DScript = ui3DScript;
            this.tracerGroup = new GeometryGroup(this.ui3DScript);
            this.traceOutputInstanceManager = new GeomPartInstanceRemoveManager(this.tracerGroup, 20);// 20 is  the max internal instances to  manage
        }

        public drawTraceUsingPencil(pointList: Point3D[], ratio: number): void {


            if (ratio < 1) {
                var toIndex: number = (pointList.length - 1) * ratio;

                toIndex = toIndex | 0; // force it to int
                this.internalDrawTrace(pointList, 0, toIndex);

                var pencilPos: Point3D = this.pencil3d.getDirectionVector(pointList[toIndex], 1);
                this.pencil3d.move(pencilPos);
            }


            if (ratio == 1) {
                this.commitTrace(pointList);
            }

        }

        public drawPointPairsUsingPencil(pointPairs, ratio: number): void {

            if (ratio < 1) {
                var toIndex: number = (pointPairs.length - 1) * ratio;

                toIndex = toIndex | 0; // force it to int
                this.internalDrawPointPairs(pointPairs, 0, toIndex);

                var pencilPos: Point3D = this.pencil3d.getDirectionVector(new Point3D(pointPairs[toIndex].start.x, pointPairs[toIndex].start.y), 1);
                this.pencil3d.move(pencilPos);
            }


            if (ratio == 1) {
                this.commitUsingPointPairs(pointPairs);
            }

        }


        /** Object commitment must be done using a seperate method called commit line **/

        public commitTrace(pointList: Point3D[]): void {
            this.traceOutputInstanceManager.clearAll();

            var outputMesh: Mesh = this.ui3DScript.commitSpline(pointList);

            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public commitUsingPointPairs(pointPairs): void {
            this.traceOutputInstanceManager.clearAll();

            var outputMesh: Mesh = this.ui3DScript.commitByPairPoints(pointPairs);

            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTrace(pointList: Point3D[]): void {
            var outputMesh: Mesh = this.ui3DScript.commitSpline(pointList);

            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitPointPairs(modelPointPairs): void {
            var outputMesh: Mesh = this.ui3DScript.commitByPairPoints(modelPointPairs);
            this.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public get pencil3d(): Pencil3D {
            return this._pencil3d;
        }


        public set pencil3d(value: Pencil3D) {
            this._pencil3d = value;
        }


        private internalDrawTrace(pointList: Point3D[], fromIndex: number, toIndex: number): void {
            var pointPortion: Point3D[] = pointList.slice(fromIndex, toIndex + 1);
            var previewTracePart: GeometryPart = this.tracerGroup.spline(pointPortion);
            this.traceOutputInstanceManager.manageMesh(previewTracePart);
        }


        private internalDrawPointPairs(pointPairs, fromIndex: number, toIndex: number): void {
            var subPointPairs = pointPairs.slice(fromIndex, toIndex + 1);
            var previewTracePart: GeometryPart = this.tracerGroup.splineByPointPairs(subPointPairs);
            this.traceOutputInstanceManager.manageMesh(previewTracePart);
        }

        public removeInternalDrawings(): void {
            this.traceOutputInstanceManager.clearAll();
        }


    }


}

