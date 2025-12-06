/**
 * Created by Mathdisk on 3/31/14.
 */


///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

module robo.virtualobjects.rotator {
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
    import ITransformable = robo.core.ITransformable;
    import Point = away.geom.Point;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import GraphSheet3D = robo.geom.GraphSheet3D;
    import GraphSheet2D = robo.twod.GraphSheet2D;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;

    export class ProcessingPair2DRotateHandler extends RotatePartHandler {
        private lineOutputInstanceManager: GeomPartInstanceRemoveManager;

        constructor(virtualRotator: VirtualRotator) {
            super(virtualRotator);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualRotator.rotatorGroup);// 20 is  the max internal instances to  manage

        }

        public drawPreviewObject(itransformable: ITransformable, angleInDegress: number, rotateAbout: Point): void {
            var processingPointPair2D: ProcessingPointPair2D = <ProcessingPointPair2D>itransformable.rotateTransform(angleInDegress, rotateAbout);
            processingPointPair2D = <ProcessingPointPair2D>processingPointPair2D.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewLinePart: GeometryPart = this.virtualRotator.rotatorGroup.splineByPointPairs(processingPointPair2D.modelPointPairs);
            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public commitTransformableObject(itransformable: ITransformable, angleInDegress: number, rotateAbout: Point): void {
            this.lineOutputInstanceManager.clearAll();
            this.commitSplineByPairPoints(itransformable, angleInDegress, rotateAbout);
        }

        private commitSplineByPairPoints(itransformable: ITransformable, angleInDegress: number, rotateAbout: Point): void {
            var processingPointPair2D: ProcessingPointPair2D = <ProcessingPointPair2D>itransformable.rotateTransform(angleInDegress, rotateAbout);
            processingPointPair2D = <ProcessingPointPair2D>processingPointPair2D.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh: Mesh = this.virtualRotator.ui3DScript.commitByPairPoints(processingPointPair2D.modelPointPairs);
            this.virtualRotator.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitRotate(itransformable: ITransformable, angleInDegress: number, rotateAbout: Point): void {
            this.commitSplineByPairPoints(itransformable, angleInDegress, rotateAbout);
        }

        public removeInternalDrawings(): void {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable: ITransformable, angleInDegress: number, rotateAbout: Point, graphSheet2D: GraphSheet2D): void {

        }

    }

}