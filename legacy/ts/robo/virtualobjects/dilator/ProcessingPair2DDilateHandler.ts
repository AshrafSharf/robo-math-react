/**
 * Created by Mathdisk on 3/31/14.
 */


///<reference path="../../../../libs/jquery.d.ts"/>
///<reference path="../../../../libs/away3d.next.d.ts" />
///<reference path="../../_definitions.ts"/>

module robo.virtualobjects.dilator {
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

    export class ProcessingPair2DDilateHandler extends DilatePartHandler {
        private lineOutputInstanceManager: GeomPartInstanceRemoveManager;

        constructor(virtualDilator: VirtualDilator) {
            super(virtualDilator);

            this.lineOutputInstanceManager = new GeomPartInstanceRemoveManager(this.virtualTransformer.transformerGroup);// 20 is  the max internal instances to  manage

        }

        public drawPreviewObject(itransformable: ITransformable, scaleValue: number, dilateAbout: Point): void {
            var processingPointPair2D: ProcessingPointPair2D = <ProcessingPointPair2D>itransformable.dilateTransform(scaleValue, dilateAbout);
            processingPointPair2D = <ProcessingPointPair2D>processingPointPair2D.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var previewLinePart: GeometryPart = this.virtualTransformer.transformerGroup.splineByPointPairs(processingPointPair2D.modelPointPairs);
            this.lineOutputInstanceManager.manageMesh(previewLinePart);
        }

        public commitTransformableObject(itransformable: ITransformable, scaleValue: number, dilateAbout: Point): void {
            this.lineOutputInstanceManager.clearAll();
            this.commitSplineByPairPoints(itransformable, scaleValue, dilateAbout);

        }

        private commitSplineByPairPoints(itransformable: ITransformable, scaleValue: number, dilateAbout: Point): void {
            var processingPointPair2D: ProcessingPointPair2D = <ProcessingPointPair2D>itransformable.dilateTransform(scaleValue, dilateAbout);
            processingPointPair2D = <ProcessingPointPair2D>processingPointPair2D.translatePointForGraphSheetOffset(GraphSheet3D.translatePointForGraphSheetOffset)

            var outputMesh: Mesh = this.virtualTransformer.ui3DScript.commitByPairPoints(processingPointPair2D.modelPointPairs);
            this.virtualTransformer.virtualObjectsExecutionContext.addOutputMesh(outputMesh);
        }

        public directCommitTransform(itransformable: ITransformable, scaleValue: number, dilateAbout: Point): void {
            this.commitSplineByPairPoints(itransformable, scaleValue, dilateAbout);
        }

        public removeInternalDrawings(): void {
            this.lineOutputInstanceManager.clearAll();
        }

        public drawOn2D(itransformable: ITransformable, scaleValue: number, dilateAbout: Point, graphSheet2D: GraphSheet2D): void {

        }
    }
}