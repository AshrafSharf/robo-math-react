/**
 * Created by Mathdisk on 3/17/14.
 */


///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *
 * Manages the lifecyle of different 3D objects
 */
module robo.geom {
    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Point = away.geom.Point;
    import Matrix3D = away.geom.Matrix3D;
    import Geometric3DUtil = robo.core.Geometric3DUtil;
    import RotationInfo = robo.core.RotationInfo;
    import ColorMaterial = away.materials.ColorMaterial;
    import Mesh = away.entities.Mesh;
    import Graphsheet3D = robo.geom.GraphSheet3D;
    import ArrayHelper = robosys.lang.ArrayHelper;
    import Text3DFactory = robo.primitives.Text3DFactory;
    import Triangulator2D = robo.extrusions.Triangulator2D;
    import DelanayTriangle = robo.extrusions.DelanayTriangle;
    import IIntersectable = robo.core.IIntersectable;
    import ShapeResult = robo.polyclipping.ClipResult;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ITransformable = robo.core.ITransformable;
    import ProcessingCircle = robo.core.ProcessingCircle;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;
    import PMath = robo.util.PMath;
    import ProcessingSpline2D = robo.core.ProcessingSpline2D;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import FIlledPolygon2D = robo.core.FIlledPolygon2D;
    import TransformablePoint = robo.core.TransformablePoint;
    import ProcessingPointPair2D = robo.core.ProcessingPointPair2D;
    import StyleConfig = robo.util.StyleConfig;


    export class UI3DScript {

        public graphSheet3D: GraphSheet3D;
        public curFillColor: number = 0xff00ff;
        public curFillAlpha: number = 1;
        private shareVerticesFlag: Boolean = true;
        private rootGroupContainers: ArrayHelper; // A type definitionfile is explicitly and referenced in _definitions.ts
        //// created as the ArrayHelper.ts is actually written in pure Javascript..

        private roboMeshes: Mesh[];
        private labelMeshes: Mesh[];

        constructor(graphSheet3D: GraphSheet3D) {

            this.graphSheet3D = graphSheet3D;
            this.rootGroupContainers = new ArrayHelper();
            this.roboMeshes = [];
            this.labelMeshes = [];
        }


        public cylinder(startPt: Point3D, endPt: Point3D, radius: number = 1, topClosed: boolean = true, bottomClosed: boolean = true, dimensions: Point = null): Mesh {
            //now convert everything to UI
            var startPtVect: Vector3D = this.graphSheet3D.toUIVector(startPt.x, startPt.y, startPt.z);
            var endPtVect: Vector3D = this.graphSheet3D.toUIVector(endPt.x, endPt.y, endPt.z);

            var rotationInfo: RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtVect), Point3D.fromVector3D(endPtVect));

            var uiRadius: number = this.graphSheet3D.toUILength(radius);

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var cylinderMesh: Mesh = Object3DFactory.createCylinder(uiRadius, uiRadius, startPtVect, endPtVect, rotationInfo.degree, rotationInfo.axis.toVector3D(), colorMaterial, topClosed, bottomClosed, dimensions);

            this.graphSheet3D.addToScene(cylinderMesh);

            return cylinderMesh;
        }


        public line(startPt: Point3D, endPt: Point3D, thickness: number = 1): Mesh {
            //now convert everything to UI
            var startPtUIVect: Vector3D = this.graphSheet3D.toUIVector(startPt.x, startPt.y, startPt.z);
            var endPtUIVect: Vector3D = this.graphSheet3D.toUIVector(endPt.x, endPt.y, endPt.z);

            var rotationInfo: RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtUIVect), Point3D.fromVector3D(endPtUIVect));

            var lineMesh: Mesh = Object3DFactory.createLine(startPtUIVect, endPtUIVect, thickness, this.curFillColor);

            this.graphSheet3D.addToScene(lineMesh);

            return lineMesh;
        }

        public polyline(points: Point[], thickness: number = 1): Mesh {

            var uiPoints: Vector3D[] = [];
            for (var i: number = 0; i < points.length; i++) {
                var uiPoint: Vector3D = this.graphSheet3D.toUIVector(points[i].x, points[i].y, 0);
                uiPoints.push(uiPoint);
            }


            var polyLineMesh: Mesh = Object3DFactory.createSpline(uiPoints, this.curFillColor);

            this.graphSheet3D.addToScene(polyLineMesh);

            return polyLineMesh;
        }

        /**
         * excludedSides - Defines if the top, bottom, left, right, front or back of the the extrusion is left open.
         */
        public linearExtrude(points: Point3D[], axis: string, length: number, thickness: number = 0, coverAll: Boolean = false, excludedSides: string = ""): Mesh {
            //convert the model path extrude to UI
            var uiPath: Vector3D[] = [];

            for (var i: number = 0; i < points.length; i++) {
                var model3Dpt: Point3D = points[i];
                var uiPtVector: Vector3D = this.graphSheet3D.toUIVector(model3Dpt.x, model3Dpt.y, model3Dpt.z);
                uiPath.push(uiPtVector);
            }

            var uiMappedAxis: string = "Y";
            uiMappedAxis = uiMappedAxis.toLowerCase();

            var uiLength: number = this.graphSheet3D.toUILength(length);
            var uiThickness: number = this.graphSheet3D.toUILength(thickness);

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);
            var linearExtrudeMesh: Mesh = Object3DFactory.createLinearExtrude(uiPath, uiMappedAxis, uiLength, uiThickness, coverAll, excludedSides, colorMaterial);// division is hardcoded now

            this.graphSheet3D.addToScene(linearExtrudeMesh);

            return linearExtrudeMesh;

        }


        public fillSurface(polygons: ProcessingPolygon2D[]): Mesh {

            if (polygons.length < 1) {
                return null;
            }

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterialWithoutLight(this.curFillColor, this.curFillAlpha);

            colorMaterial.alpha = 0.7;

            var surfaceMesh: Mesh = null;


            var arrayofUIPointsArray: any = [];
            for (var j: number = 0; j < polygons.length; j++) {


                var modelPoints: Point[] = polygons[j].points;
                var uiPoints: Point[] = [];
                for (var i: number = 0; i < modelPoints.length; i++) {
                    var uiPoint: Vector3D = this.graphSheet3D.toUIVector(modelPoints[i].x, modelPoints[i].y, 0);

                    uiPoints.push(new Point(uiPoint.x, uiPoint.z)); // Note this is Z value
                }

                arrayofUIPointsArray.push(uiPoints);
            }


            surfaceMesh = Object3DFactory.createThreeJsBasedMesh(arrayofUIPointsArray, colorMaterial);

            this.graphSheet3D.addToScene(surfaceMesh);

            return surfaceMesh;

        }


        public spline(modelPoints: Point3D[]): Mesh {

            var uiPoints: Vector3D[] = [];

            for (var i: number = 0; i < modelPoints.length; i++) {
                var model3Dpt: Point3D = modelPoints[i];
                var uiPtVector: Vector3D = this.graphSheet3D.toUIVector(model3Dpt.x, model3Dpt.y, model3Dpt.z);
                uiPoints.push(uiPtVector);
            }
            var splineMesh: Mesh = Object3DFactory.createSpline(uiPoints, this.curFillColor);
            this.graphSheet3D.addToScene(splineMesh);

            return splineMesh;
        }

        public splineByModelPairPoints(modelPointPairs): Mesh {
            var splineMesh = this.generateMeshFromPairPoints(modelPointPairs);
            this.graphSheet3D.addToScene(splineMesh);
            return splineMesh;
        }

        private generateMeshFromPairPoints(modelPointPairs) {
            var uiPointPairs = [];

            for (var i: number = 0; i < modelPointPairs.length; i++) {
                var modelStartPt: Point3D = modelPointPairs[i].start;
                var uiPointStart: Vector3D = this.graphSheet3D.toUIVector(modelStartPt.x, modelStartPt.y, modelStartPt.z);
                var modelEndPt: Point3D = modelPointPairs[i].end;
                var uiPointEnd: Vector3D = this.graphSheet3D.toUIVector(modelEndPt.x, modelEndPt.y, modelEndPt.z);
                uiPointPairs.push({
                    start: uiPointStart,
                    end: uiPointEnd
                });
            }

            var splineMesh: Mesh = Object3DFactory.createSplineByPairPoints(uiPointPairs, this.curFillColor);
            return splineMesh;
        }

        public box3d(x1: number, y1: number, z1: number, width: number, height: number, depth: number): Mesh {
            var uiPoint: Vector3D = this.graphSheet3D.toUIVector(x1, y1, z1);
            var uiWidth: number = this.graphSheet3D.toUILength(width);
            var uiHeight: number = this.graphSheet3D.toUILength(height);
            var uiDepth: number = this.graphSheet3D.toUILength(depth);
            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var box3d: Mesh = Object3DFactory.createBox(uiPoint, uiWidth, uiHeight, uiDepth, this.curFillColor, colorMaterial, this.curFillAlpha);
            box3d.visible = true;

            this.graphSheet3D.addToScene(box3d);

            return box3d;

        }

        public solid(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, width: number = 1, depth: number = 1): Mesh {
            var startPt: Vector3D = new Vector3D(x1, y1, z1);// this is model
            var endPt: Vector3D = new Vector3D(x2, y2, z2);

            startPt = this.graphSheet3D.toUIVector(startPt.x, startPt.y, startPt.z);
            endPt = this.graphSheet3D.toUIVector(endPt.x, endPt.y, endPt.z);

            var rotationInfo: RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPt), Point3D.fromVector3D(endPt));

            var uiHeight: number = endPt.subtract(startPt).length;
            var uiWidth: number = this.graphSheet3D.toUILength(width);
            var uiDepth: number = this.graphSheet3D.toUILength(depth);
            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var solidShape: Mesh = Object3DFactory.solid(startPt, endPt, uiWidth, uiHeight, uiDepth, rotationInfo.degree, rotationInfo.axis.toVector3D(), this.curFillColor, colorMaterial, this.curFillAlpha);
            solidShape.visible = true;

            this.graphSheet3D.addToScene(solidShape);

            return solidShape;
        }

        public sphere(x1: number, y1: number, z1: number, radius: number): Mesh {
            var uiPoint: Vector3D = this.graphSheet3D.toUIVector(x1, y1, z1);
            var uiRadius: number = this.graphSheet3D.toUILength(radius);
            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var entity3D: Mesh = Object3DFactory.createSphere(uiPoint.x, uiPoint.y, uiPoint.z, uiRadius, this.curFillColor, colorMaterial, this.curFillAlpha);
            entity3D.visible = true;

            this.graphSheet3D.addToScene(entity3D);

            return entity3D;
        }

        public ring(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, innerRadius: number = 0.1): Mesh {
            var startPt: Vector3D = new Vector3D(x1, y1, z1);// this is model
            var endPt: Vector3D = new Vector3D(x2, y2, z2);

            //now convert everything to UI
            startPt = this.graphSheet3D.toUIVector(startPt.x, startPt.y, startPt.z);
            endPt = this.graphSheet3D.toUIVector(endPt.x, endPt.y, endPt.z);

            var uiOuterRadius: number = endPt.subtract(startPt).length;
            uiOuterRadius = uiOuterRadius / 2;//Treat the distance as diameter
            var uiInnerRadius: number = this.graphSheet3D.toUILength(innerRadius);

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);
            var rotationInfo: RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPt), Point3D.fromVector3D(endPt));

            var entity3D: Mesh = Object3DFactory.createRing(startPt, endPt, uiOuterRadius, uiInnerRadius, rotationInfo.degree, rotationInfo.axis.toVector3D(), this.curFillColor, colorMaterial, this.curFillAlpha);
            this.graphSheet3D.addToScene(entity3D);

            return entity3D;

        }

        public createGroupContainer(): Mesh {
            var groupContainer: Mesh = this.graphSheet3D.createGroupContainer();
            this.rootGroupContainers.add(groupContainer);
            return groupContainer;
        }


        public setActiveGroupContainer(groupContainer: Mesh): void {
            this.graphSheet3D.setActiveGroupContainer(groupContainer);

        }

        public cone(startPt: Point3D, endPt: Point3D, bottomRadius: number = 1, topRadius: number = 0, topClosed: boolean = true, bottomClosed: boolean = true): Mesh {
            //now convert everything to UI
            var startPtVect: Vector3D = this.graphSheet3D.toUIVector(startPt.x, startPt.y, startPt.z);
            var endPtVect: Vector3D = this.graphSheet3D.toUIVector(endPt.x, endPt.y, endPt.z);

            var rotationInfo: RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtVect), Point3D.fromVector3D(endPtVect));

            var uiBottomRadius: number = this.graphSheet3D.toUILength(bottomRadius);
            var uiTopRadius: number = this.graphSheet3D.toUILength(topRadius);

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var coneMesh: Mesh = Object3DFactory.createCylinder(uiBottomRadius, uiTopRadius, startPtVect, endPtVect, rotationInfo.degree, rotationInfo.axis.toVector3D(), colorMaterial, topClosed, bottomClosed);

            this.graphSheet3D.addToScene(coneMesh);

            return coneMesh;
        }


        public capsule(startPt: Point3D, endPt: Point3D, radius: number = 0.3): Mesh {
            //now convert everything to UI
            var startPtVect: Vector3D = this.graphSheet3D.toUIVector(startPt.x, startPt.y, startPt.z);
            var endPtVect: Vector3D = this.graphSheet3D.toUIVector(endPt.x, endPt.y, endPt.z);

            var uiHeight: number = endPtVect.subtract(startPtVect).length;
            var uiRadius: number = this.graphSheet3D.toUILength(radius);

            var rotationInfo: RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtVect), Point3D.fromVector3D(endPtVect));
            var degree: number = rotationInfo.degree;
            var axis: Vector3D = rotationInfo.axis.toVector3D();

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var capsuleObj: Mesh = Object3DFactory.createCapsule(startPtVect, uiHeight, uiRadius, degree, axis, colorMaterial);

            this.graphSheet3D.addToScene(capsuleObj);

            return capsuleObj;
        }

        public crossPoint(position: Point3D): Mesh {
            var origin: Point3D = position.copy();
            var radius: number = 0.20;
            var left = origin.moveLeft(radius);
            var right = origin.moveRight(radius);

            var top = origin.moveUp(radius);
            var bottom = origin.moveDown(radius);

            var lineStart: Vector3D = this.graphSheet3D.toUIVector(left.x, left.y, left.z);
            var lineEnd: Vector3D = this.graphSheet3D.toUIVector(right.x, right.y, right.z);

            var crossStart: Vector3D = this.graphSheet3D.toUIVector(top.x, top.y, top.z);
            var crossEnd: Vector3D = this.graphSheet3D.toUIVector(bottom.x, bottom.y, bottom.z);

            var uiPointPairs = [{start: lineStart, end: lineEnd}, {start: crossStart, end: crossEnd}];
            var pointMesh: Mesh = Object3DFactory.createSplineByPairPoints(uiPointPairs, this.curFillColor)
            this.graphSheet3D.addToScene(pointMesh);
            return pointMesh;
        }

        public commitMarkerList(positions: Point3D[]): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());
            var roboMesh: Mesh = this.markerList(positions);
            this.setActiveGroupContainer(null);
            this.roboMeshes.push(roboMesh);
            return roboMesh;
        }

        public commitMarkerLabelList(positions: Point3D[]): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());
            var parentContainer: Mesh = new Mesh(null);

            for (var i = 0; i < positions.length; i++) {
                var textMesh = this._text(i + 1 + "", positions[i].moveLeft(0.8), 20);
                parentContainer.addChild(textMesh);
            }

            this.graphSheet3D.addToScene(parentContainer);
            this.setActiveGroupContainer(null);
            this.roboMeshes.push(parentContainer);
            return parentContainer;
        }

        public markerList(positions: Point3D[]): Mesh {
            var uiPointPairs = [];
            for (var i = 0; i < positions.length; i++) {
                var position = positions[i];
                var origin: Point3D = position.copy();
                var radius: number = 0.20;
                var left = origin.moveLeft(radius);
                var right = origin.moveRight(radius);

                var top = origin.moveUp(radius);
                var bottom = origin.moveDown(radius);

                var lineStart: Vector3D = this.graphSheet3D.toUIVector(left.x, left.y, left.z);
                var lineEnd: Vector3D = this.graphSheet3D.toUIVector(right.x, right.y, right.z);

                var crossStart: Vector3D = this.graphSheet3D.toUIVector(top.x, top.y, top.z);
                var crossEnd: Vector3D = this.graphSheet3D.toUIVector(bottom.x, bottom.y, bottom.z);
                uiPointPairs.push({start: lineStart, end: lineEnd}, {start: crossStart, end: crossEnd})
            }
            var pointMesh: Mesh = Object3DFactory.createSplineByPairPoints(uiPointPairs, this.curFillColor)
            this.graphSheet3D.addToScene(pointMesh);
            return pointMesh;
        }

        public point(position: Point3D): Mesh {

            var origin: Point3D = position.copy();
            var radius: number = 0.15;

            //now convert everything to UI
            var uiOrigin: Vector3D = this.graphSheet3D.toUIVector(origin.x, origin.y, origin.z);

            var uiRadius: number = this.graphSheet3D.toUILength(radius);

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var pointMesh: Mesh = Object3DFactory.createPoint(uiRadius, uiOrigin, colorMaterial);

            this.graphSheet3D.addToScene(pointMesh);

            return pointMesh;
        }


        public shareVertex(value: Boolean): void {
            this.shareVerticesFlag = value;
        }

        public ellipticArc3d(center: Point3D, normal: Point3D, axis: Point3D, radiusA: number, radiusB: number, minAngle: number, maxAngle: number): Mesh {
            var ellipticArc3dObj: Mesh = this.convertArcModelToUIAndBuildMesh(center, normal, axis, radiusA, radiusB, minAngle, maxAngle);
            this.graphSheet3D.addToScene(ellipticArc3dObj);
            return ellipticArc3dObj;
        }

        public convertArcModelToUIAndBuildMesh(center: Point3D, normal: Point3D, axis: Point3D, radiusA: number, radiusB: number, minAngle: number, maxAngle: number): Mesh {
            //now convert everything to UI
            var centerPt: Vector3D = this.graphSheet3D.toUIVector(center.x, center.y, center.z);

            var coordinateSystemMapper: ICoordinateSystemMapper = this.graphSheet3D.graphsheet3DBound.getCoordinateSysMapper();

            var normalVt: Vector3D = new Vector3D(coordinateSystemMapper.mappedX(normal.x, normal.y, normal.z), coordinateSystemMapper.mappedY(normal.x, normal.y, normal.z), coordinateSystemMapper.mappedZ(normal.x, normal.y, normal.z));
            var axisVt: Vector3D = new Vector3D(coordinateSystemMapper.mappedX(axis.x, axis.y, axis.z), coordinateSystemMapper.mappedY(axis.x, axis.y, axis.z), coordinateSystemMapper.mappedZ(axis.x, axis.y, axis.z));

            var radiusUIA: number = this.graphSheet3D.graphsheet3DBound.toUILength(radiusA);
            var radiusUIB: number = this.graphSheet3D.graphsheet3DBound.toUILength(radiusB);

            var ellipticArc3dObj: Mesh = Object3DFactory.createArc(centerPt, normalVt, axisVt, radiusUIA, radiusUIB, minAngle, maxAngle, this.curFillColor);

            return ellipticArc3dObj;
        }

        public fill(color: number): void {
            this.curFillColor = color;
        }


        /**
         *
         *
         * @param textValue
         * @param position - It is in Model
         */
        public label3D(textValue: string, modelPos: Point3D): Mesh {

            var textMesh: Mesh = this.text(textValue, modelPos);
            this.labelMeshes.push(textMesh);

            return textMesh;


        }


        public text(textValue: string, modelPos: Point3D, size: number = 25, height: number = 3): Mesh {
            var textMesh = this._text(textValue, modelPos, size, height)
            this.graphSheet3D.addToScene(textMesh);
            return textMesh;
        }

        _text(textValue: string, modelPos: Point3D, size: number = 25, height: number = 3) {
            var zOffset: number = 0.1;//not to get flicker with plane
            var model3DPos: Point3D = new Point3D(modelPos.x, modelPos.y, modelPos.z + zOffset);
            var uiPos: Vector3D = this.graphSheet3D.toView(model3DPos.toVector3D());

            var textMesh: Mesh = Text3DFactory.getTextMesh(textValue, size, height);

            textMesh.x = uiPos.x;
            textMesh.y = uiPos.y;
            textMesh.z = uiPos.z;


            textMesh.pitch(90);
            textMesh.yaw(270);

            var material: ColorMaterial = this.graphSheet3D.getColorMaterialWithoutLight(this.curFillColor, 0.9);
            textMesh.material = material;
            return textMesh;
        }


        public fromProcessingCircleToEllipticArc(processingCircle: ProcessingCircle): Mesh {
            var origin2d: Point = new Point(processingCircle.ox, processingCircle.oy);
            var origin: Point3D = new Point3D(origin2d.x, origin2d.y, 0);
            var normal: Point3D = new Point3D(0, 0, 1);
            var axisVt: Point3D = new Point3D(1, 0, 0);
            var radius: number = processingCircle.radius;
            var fromAngleInDegrees: number = processingCircle.getUIFromAngle();
            var toAngleInDegrees: number = processingCircle.getUIToAngle();

            var mesh: Mesh = this.convertArcModelToUIAndBuildMesh(origin, normal, axisVt, radius, radius, PMath.radians(fromAngleInDegrees), PMath.radians(toAngleInDegrees));

            return mesh;

        }

        public fromProcessingPolygonToPolyline(processingPolygon2D: ProcessingPolygon2D): Mesh {

            var points: Point[] = processingPolygon2D.points;

            var uiPoints: Vector3D[] = [];
            for (var i: number = 0; i < points.length; i++) {
                var uiPoint: Vector3D = this.graphSheet3D.toUIVector(points[i].x, points[i].y, 0);
                uiPoints.push(uiPoint);
            }


            var polyLineMesh: Mesh = Object3DFactory.createSpline(uiPoints, this.curFillColor);
            return polyLineMesh;

        }


        public fromFilledPolygonToMesh(filledPolygon: FIlledPolygon2D, fillAlpha: number): Mesh {

            var points: Point[] = filledPolygon.points;

            var uiPoints: Point[] = [];

            for (var i: number = 0; i < points.length; i++) {
                var uiPoint: Vector3D = this.graphSheet3D.toUIVector(points[i].x, points[i].y, 0);

                uiPoints.push(new Point(uiPoint.x, uiPoint.z)); // Note this is Z value
            }

            var arrayofUIPointsArray: any = [];
            arrayofUIPointsArray.push(uiPoints);

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterialWithoutLight(this.curFillColor, fillAlpha);


            var surfaceMesh: Mesh = null;

            surfaceMesh = Object3DFactory.createThreeJsBasedMesh(arrayofUIPointsArray, colorMaterial);


            return surfaceMesh;


        }

        public fromProcessingLineToLine(line2D: ProcessingLine2D): Mesh {
            var thickness: number = 1;
            var startPt: Point3D = new Point3D(line2D.startPoint.x, line2D.startPoint.y, 0);
            var endPt: Point3D = new Point3D(line2D.endPoint.x, line2D.endPoint.y, 0);

            //now convert everything to UI
            var startPtUIVect: Vector3D = this.graphSheet3D.toUIVector(startPt.x, startPt.y, startPt.z);
            var endPtUIVect: Vector3D = this.graphSheet3D.toUIVector(endPt.x, endPt.y, endPt.z);

            var rotationInfo: RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtUIVect), Point3D.fromVector3D(endPtUIVect));
            var lineMesh: Mesh = Object3DFactory.createLine(startPtUIVect, endPtUIVect, thickness, this.curFillColor);

            return lineMesh;
        }


        public fromTransformalPointToPoint(transPoint: TransformablePoint): Mesh {

            var src_point: Point = transPoint.getSourcePoint();

            var origin: Point3D = new Point3D(src_point.x, src_point.y);

            var radius: number = 0.15;

            //now convert everything to UI
            var uiOrigin: Vector3D = this.graphSheet3D.toUIVector(origin.x, origin.y, origin.z);

            var uiRadius: number = this.graphSheet3D.toUILength(radius);

            var colorMaterial: ColorMaterial = this.graphSheet3D.getColorMaterial(this.curFillColor, this.curFillAlpha);

            var pointMesh: Mesh = Object3DFactory.createPoint(uiRadius, uiOrigin, colorMaterial);

            return pointMesh;

        }

        public fromProcessingSplineToSpline(processingSpline2D: ProcessingSpline2D): Mesh {
            var modelPoints: Point3D[] = processingSpline2D.outPutAsPoint3D();

            var uiPoints: Vector3D[] = [];

            for (var i: number = 0; i < modelPoints.length; i++) {
                var model3Dpt: Point3D = modelPoints[i];
                var uiPtVector: Vector3D = this.graphSheet3D.toUIVector(model3Dpt.x, model3Dpt.y, model3Dpt.z);
                uiPoints.push(uiPtVector);
            }
            var splineMesh: Mesh = Object3DFactory.createSpline(uiPoints, this.curFillColor);


            return splineMesh;
        }


        /**
         * Note: These from methods dont add the mesh to the graphSheet, they only generate and return them
         * @param processingPointPair2D
         */
        public fromProcessingPair2DToSpline(processingPointPair2D: ProcessingPointPair2D): Mesh {
            return this.generateMeshFromPairPoints(processingPointPair2D.modelPointPairs);
        }


        public commitEllipticArc3d(center: Point3D, normal: Point3D, axis: Point3D, radiusA: number, radiusB: number, minAngle: number, maxAngle: number): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var roboMesh: Mesh = this.ellipticArc3d(center, normal, axis, radiusA, radiusB, minAngle, maxAngle);

            this.setActiveGroupContainer(null);

            this.roboMeshes.push(roboMesh);

            return roboMesh;
        }


        public commitText3d(textValue: string, modelPos: Point3D, size: number = 30, height: number = 5): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var roboMesh: Mesh = this.text(textValue, modelPos, size, height);

            this.setActiveGroupContainer(null);

            this.roboMeshes.push(roboMesh);

            return roboMesh;
        }


        public commitPoint3d(pt: Point3D): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var roboMesh: Mesh = this.point(pt);

            this.setActiveGroupContainer(null);

            this.roboMeshes.push(roboMesh);

            return roboMesh;
        }

        public commitPointMarker(pt: Point3D): Mesh {
            if (StyleConfig.POINT_STYLE == 'sphere') {
                return this.commitPoint3d(pt);
            }

            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());
            var roboMesh: Mesh = this.crossPoint(pt);
            this.setActiveGroupContainer(null);
            this.roboMeshes.push(roboMesh);
            return roboMesh;

        }


        public commitFillSurface(polygons: ProcessingPolygon2D[]): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var roboMesh: Mesh = this.fillSurface(polygons);

            this.setActiveGroupContainer(null);

            if (roboMesh) {
                this.roboMeshes.push(roboMesh);
            }

            return roboMesh;
        }

        public commitLine(startPt: Point3D, endPt: Point3D, radius: number = 2, topClosed: boolean = true, bottomClosed: boolean = true, dimensions: Point = null): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var lineMesh: Mesh = this.line(startPt, endPt, radius);//this.cylinder(startPt,endPt,radius,topClosed,bottomClosed,dimensions);

            this.setActiveGroupContainer(null);

            this.roboMeshes.push(lineMesh);

            return lineMesh;


        }

        public commitPolyLine(points: Point[]): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var lineMesh: Mesh = this.polyline(points);//this.cylinder(startPt,endPt,radius,topClosed,bottomClosed,dimensions);

            this.setActiveGroupContainer(null);

            this.roboMeshes.push(lineMesh);

            return lineMesh;


        }

        public commitSpline(modelPoints: Point3D[]): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var splineMesh: Mesh = this.spline(modelPoints);

            this.setActiveGroupContainer(null);

            this.roboMeshes.push(splineMesh);

            return splineMesh;


        }

        /**
         * each
         * @param modelPointPair item has {start, end} members
         */
        public commitByPairPoints(modelPointPairs): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());
            var splineMesh: Mesh = this.splineByModelPairPoints(modelPointPairs);
            this.setActiveGroupContainer(null);
            this.roboMeshes.push(splineMesh);
            return splineMesh;
        }


        public processingGroup(processingGroup: ProcessingGroup): Mesh {

            var parentContainerMesh: Mesh = new Mesh(null);
            this.buildProcessingGroup(parentContainerMesh, processingGroup);
            this.graphSheet3D.addToScene(parentContainerMesh);

            return parentContainerMesh;

        }

        public commitProcessingGroup(processingGroup: ProcessingGroup): Mesh {
            this.setActiveGroupContainer(this.graphSheet3D.getRoboOutputContainer());

            var parentContainer: Mesh = new Mesh(null);

            this.buildProcessingGroup(parentContainer, processingGroup);

            this.graphSheet3D.addToScene(parentContainer);

            this.setActiveGroupContainer(null);

            this.roboMeshes.push(parentContainer);

            return parentContainer;
        }

        private buildProcessingGroup(processGroupContainer: Mesh, processingGroup: ProcessingGroup): void {

            var childMeshes: Mesh[] = [];

            var transformables: ITransformable[] = processingGroup.getGroupItems();

            for (var i: number = 0; i < transformables.length; i++) {
                var transformable: ITransformable = transformables[i];

                switch (transformable.getType()) {
                    case ProcessingCircle.TRANSFORMABLE_TYPE:
                        var circleMesh: Mesh = this.fromProcessingCircleToEllipticArc(<ProcessingCircle>transformable);
                        processGroupContainer.addChild(circleMesh);
                        childMeshes.push(circleMesh);
                        break;

                    case ProcessingPolygon2D.TRANSFORMABLE_TYPE:
                        var polylineMesh: Mesh = this.fromProcessingPolygonToPolyline(<ProcessingPolygon2D>transformable);
                        processGroupContainer.addChild(polylineMesh);
                        childMeshes.push(polylineMesh);
                        break;

                    case ProcessingSpline2D.TRANSFORMABLE_TYPE:
                        var splineMesh: Mesh = this.fromProcessingSplineToSpline(<ProcessingSpline2D>transformable);
                        processGroupContainer.addChild(splineMesh);
                        childMeshes.push(splineMesh);
                        break;

                    case ProcessingLine2D.TRANSFORMABLE_TYPE:
                        var lineMesh: Mesh = this.fromProcessingLineToLine(<ProcessingLine2D>transformable);
                        processGroupContainer.addChild(lineMesh);
                        childMeshes.push(lineMesh);
                        break;

                    case FIlledPolygon2D.TRANSFORMABLE_TYPE:
                        var filledMesh: Mesh = this.fromFilledPolygonToMesh(<FIlledPolygon2D>transformable, (<FIlledPolygon2D>transformable).fillAlpha);
                        processGroupContainer.addChild(filledMesh);
                        childMeshes.push(filledMesh);
                        break;

                    case TransformablePoint.TRANSFORMABLE_TYPE:
                        var pointMesh: Mesh = this.fromTransformalPointToPoint(<TransformablePoint>transformable);
                        processGroupContainer.addChild(pointMesh);
                        childMeshes.push(pointMesh);
                        break;

                    case ProcessingPointPair2D.TRANSFORMABLE_TYPE:
                        var processPairMesh: Mesh = this.fromProcessingPair2DToSpline(<ProcessingPointPair2D>transformable);
                        processGroupContainer.addChild(processPairMesh);
                        childMeshes.push(processPairMesh);
                        break;


                }
            }


        }


        public removeRoboMesh(roboMesh: Mesh): void {
            var idx: number = this.roboMeshes.indexOf(roboMesh);

            if (idx != -1) {
                var roboMesh: Mesh = this.roboMeshes[idx];

                roboMesh.parent.removeChild(roboMesh);
                roboMesh.dispose();

                if (roboMesh.material != null) {
                    GeometryGroup.disposeMaterial(roboMesh.material);
                }
                roboMesh = null;

                this.roboMeshes.splice(idx, 1); // remove that item alone
            }
        }


        public removeLabelMesh(mesh: Mesh): void {
            var idx: number = this.labelMeshes.indexOf(mesh);

            if (idx != -1) {
                var labelMesh: Mesh = this.labelMeshes[idx];

                labelMesh.parent.removeChild(labelMesh);
                labelMesh.dispose();

                if (labelMesh.material != null) {
                    GeometryGroup.disposeMaterial(labelMesh.material);
                }
                labelMesh = null;

                this.labelMeshes.splice(idx, 1); // remove that item alone
            }
        }


        public clearAllRoboOutputs(): void {
            for (var i: number = 0; i < this.roboMeshes.length; i++) {
                var roboMesh: Mesh = <Mesh>this.roboMeshes[i];
                if (roboMesh.parent) {
                    roboMesh.parent.removeChild(roboMesh);
                }

                roboMesh.dispose();

                if (roboMesh.material != null) {
                    GeometryGroup.disposeMaterial(roboMesh.material);
                }
                roboMesh = null;
            }
            this.roboMeshes = [];

            for (i = 0; i < this.labelMeshes.length; i++) {
                var textMesh: Mesh = <Mesh>this.labelMeshes[i];
                if (textMesh.parent) {
                    textMesh.parent.removeChild(textMesh);
                }

                textMesh.dispose();

                if (textMesh.material != null) {
                    GeometryGroup.disposeMaterial(textMesh.material);
                }
                textMesh = null;
            }

            this.labelMeshes = [];
        }


        public toModel3DPoint(viewPoint: Point3D): Point3D {
            var modelPt: Point3D = this.graphSheet3D.toModelPoint3DByMapper(viewPoint);

            return new Point3D(modelPt.x, modelPt.y, modelPt.z);
        }

    }

}
