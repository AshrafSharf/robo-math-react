/**
 * Created by rizwan on 3/19/14.
 */

module robo.extrusions {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Point = away.geom.Point;
    import SegmentSet = away.entities.SegmentSet;
    import LineSegment = away.primitives.LineSegment;
    import Segment = away.base.Segment;
    import DisplayObject = away.base.DisplayObject;
    import Mesh = away.entities.Mesh;
    import ColorMaterial = away.materials.ColorMaterial;

    /*//import away3d.core.base.Geometry;
    //import away3d.entities.SegmentSet;
    //import away3d.primitives.LineSegment;

    //import com.mathdisk.util.ArrayHelper;

    //import flash.geom.Matrix3D;
    //import flash.geom.Vector3D;

    //import processing.api.threedsupport.Point3D;
    //import processing.ext.object2d.WireframeObjects2D;
    //import processing.ext.object3d.ProcessingPolygon3D;*/

    /**
     * Receives and works on UI Coordinates
     */
    export class WireFrameObjects3D {

        private _lineRenderer: Object = null;


        constructor(lineCollection: Object) {
            this._lineRenderer = lineCollection;
        }

        public drawLine(from: Vector3D, to: Vector3D, color: number, thickness: number = 1) {

            var segmentSet: SegmentSet = (<SegmentSet>this._lineRenderer);
            var line: LineSegment = new LineSegment(from.subtract(segmentSet._iMatrix3D.position), to.subtract(segmentSet._iMatrix3D.position),
                color, color, thickness);
            segmentSet.addSegment(line);


        }

        public createArc(center: Vector3D, normal: Vector3D, axis: Vector3D, radiusA: number, radiusB: number, minAngle: number, maxAngle: number, color: number, drawSect: boolean, stepDegrees: number = 10): void {
            normal.normalize();
            axis.normalize();
            this.drawArc(center, normal, axis, radiusA, radiusB, minAngle, maxAngle, color, drawSect, stepDegrees);
        }

        private drawArc(center: Vector3D, normal: Vector3D, axis: Vector3D, radiusA: number, radiusB: number, minAngle: number, maxAngle: number, color: number, drawSect: boolean, stepDegrees: number = 10): void {
            var vx: Vector3D = axis;
            var vy: Vector3D = normal.crossProduct(axis);
            var step: number = stepDegrees * 2 * Math.PI / 360;

            var nSteps: number = Math.abs(Math.round((maxAngle - minAngle) / step));


            if (!nSteps) nSteps = 1;

            var temp: Vector3D;
            temp = vx.clone();
            temp.scaleBy(radiusA * Math.cos(minAngle));
            var prev: Vector3D = center.add(temp);
            temp = vy.clone();
            temp.scaleBy(radiusB * Math.sin(minAngle));
            prev = prev.add(temp);
            if (drawSect) {
                this.drawLine(center, prev, color);
            }

            var angle: number;
            var next: Vector3D;
            for (var i: number = 1; i <= nSteps; i++) {
                angle = minAngle + (maxAngle - minAngle) * i / nSteps;
                temp = vx.clone();
                temp.scaleBy(radiusA * Math.cos(angle));
                next = center.add(temp);
                temp = vy.clone();
                temp.scaleBy(radiusB * Math.sin(angle));
                next = next.add(temp);
                this.drawLine(prev, next, color);
                prev = next;
            }
            if (drawSect) {
                this.drawLine(center, prev, color);
            }

        }


        public static fadeoutByThickness(segmentSet: SegmentSet, alpha: number, color: number, defaultThickness: number = 1): void {
            var segmentCount: number = segmentSet._pSubGeometry.segmentCount;

            for (var i: number = 0; i < segmentCount; i++) {
                var lineSegment: Segment = segmentSet._pSubGeometry.getSegment(i);
                lineSegment.thickness = defaultThickness * alpha;
                lineSegment.startColor = color;
                lineSegment.endColor = color;

            }
        }


        public static applyThickness(segmentSet: SegmentSet, thickness: number): void {
            var segmentCount: number = segmentSet._pSubGeometry.segmentCount;
            for (var i: number = 0; i < segmentCount; i++) {
                var lineSegment: Segment = segmentSet._pSubGeometry.getSegment(i);
                lineSegment.thickness = thickness;
            }
        }

        public static getDisplayObjectColor(displayObject: DisplayObject): number {
            if (displayObject instanceof SegmentSet) {

                var segmentSet: SegmentSet = <SegmentSet>displayObject;
                var segmentCount: number = segmentSet._pSubGeometry.segmentCount;
                var lineSegment: Segment = segmentSet._pSubGeometry.getSegment(0);
                if (lineSegment) {
                    return lineSegment.startColor;
                }
                return NaN;
            }

            var mesh: Mesh = <Mesh>displayObject;
            if (mesh.material == null)
                return NaN;

            return (<ColorMaterial>mesh.material).color;


        }


        public static setColor(segmentSet: SegmentSet, color: number): void {
            var segmentCount: number = segmentSet._pSubGeometry.segmentCount;

            for (var i: number = 0; i < segmentCount; i++) {
                var lineSegment: Segment = segmentSet._pSubGeometry.getSegment(i);

                lineSegment.startColor = color;
                lineSegment.endColor = color;
            }
        }

        public spline(pts: Vector3D[], color: number, thickness: number = 1): void {

            for (var i: number = 0; i < pts.length - 1; i++) {
                var start: Vector3D = pts[i];
                var end: Vector3D = pts[i + 1];
                this.drawLine(start, end, color, thickness);

            }
        }

        /**
         *
         * @param pointPairs {start,end}
         * @param color
         */
        public splineByPointPairs(pointPairs, color: number, thickness: number = 1): void {
            for (var i: number = 0; i < pointPairs.length; i++) {
                var start: Vector3D = pointPairs[i].start;
                var end: Vector3D = pointPairs[i].end;
                this.drawLine(start, end, color, thickness);
            }
        }


    }
}
