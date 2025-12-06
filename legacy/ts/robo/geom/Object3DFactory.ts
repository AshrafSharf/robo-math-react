/**
 * Created by Mathdisk on 2/24/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


/**
 * This class must work only on UI coordinates dont use any reference to GraphSheet or GraphSheetBounds
 *
 */
module robo.geom {


    import ColorMaterial = away.materials.ColorMaterial;
    import Cylinder = robo.primitives.Cylinder;
    import Sphere = robo.primitives.Sphere;
    import Cube = robo.primitives.Cube;
    import Torus = robo.primitives.Torus;
    import Matrix3D = away.geom.Matrix3D;
    import Vector3D = away.geom.Vector3D;
    import Capsule = robo.primitives.Capsule;
    import Point3D = robo.core.Point3D;
    import RotationInfo = robo.core.RotationInfo;
    import Mesh = away.entities.Mesh;
    import LinearExtrude = robo.extrusions.LinearExtrude;
    import Geometry = away.base.Geometry;
    import SegmentSet = away.entities.SegmentSet;
    import WireFrameObjects3D = robo.extrusions.WireFrameObjects3D;
    import MaterialBase = away.materials.MaterialBase;
    import Point = away.geom.Point;
    import DelanayTriangle = robo.extrusions.DelanayTriangle;
    import FaceHelper = robo.primitives.FaceHelper;
    import Triangulator2D = robo.extrusions.Triangulator2D;
    import ThreeJSShapeAdapter = robo.primitives.ThreeJSShapeAdapter;
    import ShapeResult = robo.polyclipping.ClipResult;


    export class Object3DFactory {


        /** receives coordinates in UI **/
        public static createCylinder(bottomRadius: number, topRadius, startPt: Vector3D, endPt: Vector3D, degree: number, axisOfRotationVector: Vector3D, colorMaterial: ColorMaterial, topClosed: boolean = true, bottomClosed: boolean = true, dimensions: Point = null): Mesh {
            var height: number = new Point3D(startPt.x, startPt.y, startPt.z).distanceTo(new Point3D(endPt.x, endPt.y, endPt.z));
            var cylinder: Cylinder = null;

            if (dimensions == null) {
                dimensions = new Point(20, 20);
            }

            cylinder = new Cylinder();
            cylinder.segmentsH = dimensions.x;
            cylinder.segmentsW = dimensions.y;
            cylinder.height = height;
            cylinder.topRadius = topRadius;
            cylinder.bottomRadius = bottomRadius;

            cylinder.material = colorMaterial;
            cylinder.mouseEnabled = false;


            cylinder.topClosed = topClosed;
            cylinder.bottomClosed = bottomClosed;
            cylinder.yUp = true;// this is to make sure the cylinder is generated with hight up


            Object3DFactory.alignTransformer(cylinder, startPt, endPt, degree, axisOfRotationVector);

            return cylinder;

        }//end of method


        private static alignTransformer(mesh: Mesh, startPt: Vector3D, endPt: Vector3D, degree: number, axisOfRotationVector: Vector3D): void {
            var transformationMatrix: Matrix3D = new Matrix3D();
            var heightOffSetVector: Vector3D = endPt.subtract(startPt);

            transformationMatrix.appendTranslation(0, heightOffSetVector.length / 2, 0);//natural pos
            transformationMatrix.appendRotation(degree, axisOfRotationVector);//rotate about

            //the actual translation
            //	startPt = graphSheet3D.graphsheet3DBound.toDefaultView(startPt); // We are dealing with Away3D generated cylinder,so we must give the coordinates only in away3d's default coordinate
            transformationMatrix.appendTranslation(startPt.x, startPt.y, startPt.z);
            mesh._iMatrix3D = transformationMatrix;

        }

        /** receives coordinates in UI **/
        public static createLinearExtrude(pathPoints: Vector3D[], axis: string, length: number, thickness: number, coverAll: Boolean, excludedSides: string, colorMaterial: ColorMaterial): Mesh {
            var linearExtrude: LinearExtrude = null;
            var geometry: Geometry = new Geometry();

            linearExtrude = new LinearExtrude(geometry, colorMaterial, pathPoints, axis, length, 3, coverAll, thickness, 3, false, false, "", excludedSides);
            var linearExtrudeMesh: Mesh = new Mesh(geometry);
            linearExtrudeMesh.material = colorMaterial;

            return linearExtrudeMesh;
        }//end of method


        public static solid(startPt: Vector3D, endPt: Vector3D, width: number, height: number, depth: number, degree: number, axisOfRotationVector: Vector3D, fillColor: number, colorMaterial: ColorMaterial, alpha: number = 1): Mesh {
            var cube: Cube = null;
            cube = new Cube();
            cube.mouseEnabled = false;
            cube.width = width;
            cube.height = height;
            cube.depth = depth;
            cube.material = colorMaterial;

            Object3DFactory.alignTransformer(cube, startPt, endPt, degree, axisOfRotationVector);

            return cube;
        }


        public static createBox(startPt: Vector3D, width: number, height: number, depth: number, fillColor: number, colorMaterial: ColorMaterial, alpha: number = 1): Mesh {

            var boxMesh: Cube = new Cube();

            colorMaterial.alpha = alpha;
            boxMesh.material = colorMaterial;

            boxMesh.height = height;
            boxMesh.width = width;
            boxMesh.depth = depth;
            boxMesh.mouseEnabled = false;

            var transformationMatrix: Matrix3D = new Matrix3D();
            transformationMatrix.appendTranslation(startPt.x, startPt.y, startPt.z);
            boxMesh._iMatrix3D = transformationMatrix;

            return boxMesh;

        }

        public static createSphere(x: number, y: number, z: number, radius: number, fillColor: number, colorMaterial: ColorMaterial, alpha: number = 1): Mesh {
            var sphere: Sphere = new Sphere();
            sphere.segmentsH = 25;
            sphere.segmentsW = 25;
            colorMaterial.alpha = alpha;
            sphere.material = colorMaterial;
            sphere.radius = radius;
            sphere.mouseEnabled = false;

            var transformationMatrix: Matrix3D = new Matrix3D();
            transformationMatrix.appendTranslation(x, y, z);
            sphere._iMatrix3D = transformationMatrix;

            return sphere;

        }//end of method

        /** receives coordinates in UI **/
        public static createRing(startPt: Vector3D, endPt: Vector3D, outerRadius: number, innerRadius: number, degree: number, axisOfRotationVector: Vector3D, fillColor: number, colorMaterial: ColorMaterial, alpha: number = 1): Mesh {
            var ring: Torus = null;

            ring = new Torus();
            ring.segmentsR = 26;
            ring.segmentsT = 18;
            ring.material = colorMaterial;
            ring.radius = outerRadius;
            ring.tubeRadius = innerRadius;
            ring.yUp = true;
            ring.mouseEnabled = false;

            var transformationMatrix: Matrix3D = new Matrix3D();
            transformationMatrix.appendRotation(degree, axisOfRotationVector);//rotate about
            transformationMatrix.appendTranslation(startPt.x, startPt.y, startPt.z);
            ring._iMatrix3D = transformationMatrix;

            return ring;
        }//end of method


        public static createCapsule(startPt: Vector3D, height: number, radius: number, degree: number, axisOfRotationVector: Vector3D, colorMaterial: ColorMaterial): Mesh {
            var capsule: Capsule = new Capsule();
            capsule.segmentsH = 22;
            capsule.segmentsW = 22;
            capsule.material = colorMaterial;
            capsule.mouseEnabled = false;
            capsule.height = height;
            capsule.radius = radius;

            var transformationMatrix: Matrix3D = new Matrix3D();
            transformationMatrix.appendTranslation(0, height / 2, 0);//natural pos,Y up is false
            transformationMatrix.appendRotation(degree, axisOfRotationVector);//rotate about
            transformationMatrix.appendTranslation(startPt.x, startPt.y, startPt.z);
            capsule._iMatrix3D = transformationMatrix;

            return capsule;

        }//end of method


        public static createPoint(radius: number, origin: Vector3D, material: MaterialBase): Mesh {
            var pointMesh: Sphere = new Sphere();
            pointMesh.segmentsH = 20;
            pointMesh.segmentsW = 20;
            pointMesh.radius = radius;
            pointMesh.setPosition(origin);

            pointMesh.material = material;


            return pointMesh;

        }//end of method

        /** receives coordinates in UI **/
        public static createArc(center: Vector3D, normal: Vector3D, axis: Vector3D, radiusA: number, radiusB: number, minAngle: number, maxAngle: number, fillColor: number, drawSect: boolean = false, stepDegrees: number = 1): Mesh {
            var geometry: Geometry = null;
            var lineContainerMesh: Mesh = new Mesh(geometry);
            var wireFrameSegmentSet: SegmentSet = new SegmentSet();
            var wireFrameObj: WireFrameObjects3D = new WireFrameObjects3D(wireFrameSegmentSet);

            wireFrameObj.createArc(center, normal, axis, radiusA, radiusB, minAngle, maxAngle, fillColor, drawSect, stepDegrees);
            lineContainerMesh.addChild(wireFrameSegmentSet);

            return lineContainerMesh;
        }//end of method


        /** receives coordinates in UI **/
        public static createLine(startPoint: Vector3D, endPoint: Vector3D, thickness: number, fillColor: number): Mesh {
            var geometry: Geometry = null;
            var lineContainerMesh: Mesh = new Mesh(geometry);
            var wireFrameSegmentSet: SegmentSet = new SegmentSet();
            var wireFrameObj: WireFrameObjects3D = new WireFrameObjects3D(wireFrameSegmentSet);

            wireFrameObj.drawLine(startPoint, endPoint, fillColor, thickness);

            lineContainerMesh.addChild(wireFrameSegmentSet);

            return lineContainerMesh;
        }//end of method


        public static createDelanayMesh(contorArray: Point[], material: MaterialBase): Mesh {


            var geometry: Geometry = new Geometry();
            var mesh: Mesh = new Mesh(geometry);
            mesh.material = material;

            var triangulator: Triangulator2D = new Triangulator2D(contorArray);
            var faces: DelanayTriangle[] = triangulator.tri();


            var uv: UV = new UV();
            uv.u = 0;
            uv.v = 1;


            for (var i: number = 0; i < faces.length; i++) {
                var face: DelanayTriangle = faces[i];


                var vertex1: Vertex = new Vertex(face.p1.X, face.p1.Z, face.p1.Y);
                var vertex2: Vertex = new Vertex(face.p2.X, face.p2.Z, face.p2.Y);
                var vertex3: Vertex = new Vertex(face.p3.X, face.p3.Z, face.p3.Y);


                FaceHelper.addFace(mesh, vertex1, vertex2, vertex3, uv, uv, uv);
            }


            return mesh;

        }


        public static createSpline(points: Vector3D[], color: number): Mesh {


            var geometry: Geometry = null;
            var splineContainerMesh: Mesh = new Mesh(geometry);
            var wireFrameSegmentSet: SegmentSet = new SegmentSet();
            var wireFrameObj: WireFrameObjects3D = new WireFrameObjects3D(wireFrameSegmentSet);


            wireFrameObj.spline(points, color);

            splineContainerMesh.addChild(wireFrameSegmentSet);


            return splineContainerMesh;

        }

        public static createSplineByPairPoints(uiPointPairs, color: number, thickness: number = 1): Mesh {

            var geometry: Geometry = null;
            var splineContainerMesh: Mesh = new Mesh(geometry);
            var wireFrameSegmentSet: SegmentSet = new SegmentSet();
            var wireFrameObj: WireFrameObjects3D = new WireFrameObjects3D(wireFrameSegmentSet);
            wireFrameObj.splineByPointPairs(uiPointPairs, color, thickness);
            splineContainerMesh.addChild(wireFrameSegmentSet);
            return splineContainerMesh;

        }


        public static polygonizePointsToMesh(contorArray: Point[], material: MaterialBase): Mesh {

            var geometry: Geometry = new Geometry();
            var mesh: Mesh = new Mesh(geometry);
            mesh.material = material;

            var centroidPt: Point = Triangulator2D.calculateCentroid(contorArray);


            var v0: Point = centroidPt;

            var uv: UV = new UV();
            uv.u = 0;
            uv.v = 1;


            for (var i = 0; i < contorArray.length - 1; i++) {
                var v1: Point = contorArray[i];
                var v2: Point = contorArray[i + 1];

                var vertex1: Vertex = new Vertex(v0.x, 0, v0.y);
                var vertex2: Vertex = new Vertex(v1.x, 0, v1.y);
                var vertex3: Vertex = new Vertex(v2.x, 0, v2.y);


                FaceHelper.addFace(mesh, vertex1, vertex2, vertex3, uv, uv, uv);


            }

            //the ast trinagle joing the first and the lst one


            {
                var v1: Point = contorArray[i - 1];
                var v2: Point = contorArray[0];

                var vertex1: Vertex = new Vertex(v0.x, 0, v0.y);
                var vertex2: Vertex = new Vertex(v1.x, 0, v1.y);
                var vertex3: Vertex = new Vertex(v2.x, 0, v2.y);

                FaceHelper.addFace(mesh, vertex1, vertex2, vertex3, uv, uv, uv);

            }


            return mesh;
        }


        public static createThreeJsBasedMesh(arrayOfPointsArray: any, material: MaterialBase): Mesh {

            var mesh: Mesh = ThreeJSShapeAdapter.makePolyShape(arrayOfPointsArray);

            mesh.material = material;


            return mesh;

        }


    }


}




