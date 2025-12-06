/**
 * Created by Mathdisk on 2/24/14.
 */
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.geom {

    import Point3D = robo.core.Point3D;
    import Point = away.geom.Point;
    import RotationInfo = robo.core.RotationInfo;
    import Mesh = away.entities.Mesh;
    import Vector3D = away.geom.Vector3D;
    import MaterialBase = away.materials.MaterialBase;
    import ColorMaterial = away.materials.ColorMaterial;
    import TextureMaterial = away.materials.TextureMaterial;
    import BitmapTexture = away.textures.BitmapTexture;
    import BitmapData = away.base.BitmapData;
    import Geometry = away.base.Geometry;
    import Graphsheet3D = robo.geom.GraphSheet3D;
    import UI3DScript = robo.geom.UI3DScript;
    import IIntersectable = robo.core.IIntersectable;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ProcessingGroup = robo.core.ProcessingGroup;
    import ProcessingPolygon2D = robo.core.ProcessingPolygon2D;

    export class GeometryGroup {

        private groupContainer: Mesh;
        private graphSheet3D: Graphsheet3D;
        private ui3DScript: UI3DScript;

        constructor(ui3DScript: UI3DScript, groupContainer: Mesh = null) {

            this.ui3DScript = ui3DScript;
            this.graphSheet3D = ui3DScript.graphSheet3D;

            if (groupContainer == null)
                this.groupContainer = ui3DScript.createGroupContainer();
            else
                this.groupContainer = groupContainer;
        }

        public get visible(): boolean {
            return this.groupContainer.visible;
        }

        public set visible(value: boolean) {
            this.groupContainer.visible = value;
        }


        public cylinder(startPt: Point3D, endPt: Point3D, radius: number, topClosed: boolean = true, bottomClosed: boolean = true): GeometryPart {

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);
            var currentObj: Mesh = this.ui3DScript.cylinder(startPt, endPt, radius, topClosed, bottomClosed);
            this.ui3DScript.setActiveGroupContainer(null);

            var height: number = endPt.subtract(startPt).length();
            return new HeightBasedGeometryPart(height, this.ui3DScript, currentObj);
        }

        public line(startPt: Point3D, endPt: Point3D, radius: number, topClosed: boolean = true, bottomClosed: boolean = true): GeometryPart {

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);
            var currentObj: Mesh = this.ui3DScript.line(startPt, endPt, radius);
            this.ui3DScript.setActiveGroupContainer(null);

            var height: number = endPt.subtract(startPt).length();
            return new HeightBasedGeometryPart(height, this.ui3DScript, currentObj);
        }

        public point3d(x1: number, y1: number, z1: number): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var pointObjMesh: Mesh = this.ui3DScript.point(new Point3D(x1, y1, z1));

            this.ui3DScript.setActiveGroupContainer(null);

            return new GeometryPart(this.ui3DScript, pointObjMesh);
        }

        public sphere(startPt: Point3D, radius: number): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var sphereObj: Mesh = this.ui3DScript.sphere(startPt.x, startPt.y, startPt.x, radius);

            this.ui3DScript.setActiveGroupContainer(null);

            return new GeometryPart(this.ui3DScript, sphereObj); // doesnt need any height based translation - so base geoetry is enough
        }

        public cone(startPt: Point3D, endPt: Point3D, bottomRadius: number = 1, topRadius: number = 0, topClosed: boolean = true, bottomClosed: boolean = true): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var coneObj: Mesh = this.ui3DScript.cone(startPt, endPt, bottomRadius, topRadius, topClosed, bottomClosed);

            this.ui3DScript.setActiveGroupContainer(null);

            var height: number = endPt.subtract(startPt).length();

            return new HeightBasedGeometryPart(height, this.ui3DScript, coneObj);
        }

        public cuboid(startPt: Point3D, width: number, height: number, depth: number): GeometryPart {
            this.ui3DScript.shareVertex(false);

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var cuboidObj: Mesh = this.ui3DScript.box3d(startPt.x, startPt.y, startPt.z, width, height, depth);

            this.ui3DScript.setActiveGroupContainer(null);

            this.ui3DScript.shareVertex(true);

            return new AxisAlignedCuboidGeometryPart("y", this.ui3DScript, cuboidObj);

        }

        public ring(startPt: Point3D, endPt: Point3D, innerRadius: number = 0.2): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var x1: number = startPt.x;
            var y1: number = startPt.y;
            var z1: number = startPt.z;

            var x2: number = endPt.x;
            var y2: number = endPt.y;
            var z2: number = endPt.z;

            var ringObj: Mesh = this.ui3DScript.ring(x1, y1, z1, x2, y2, z2, innerRadius);
            this.ui3DScript.setActiveGroupContainer(null);
            return new GeometryPart(this.ui3DScript, ringObj);
        }

        public capsule(startPt: Point3D, endPt: Point3D, radius: number = 0.3): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var capsuleObj: Mesh = this.ui3DScript.capsule(startPt, endPt, radius);
            this.ui3DScript.setActiveGroupContainer(null);

            var height: number = endPt.subtract(startPt).length();
            return new HeightBasedGeometryPart(height, this.ui3DScript, capsuleObj); // has the same property as cylinder
        }

        public solid(startPt: Point3D, endPt: Point3D, width: number = 1, depth: number = 1): GeometryPart {
            var x1: number = startPt.x;
            var y1: number = startPt.y;
            var z1: number = startPt.z;

            var x2: number = endPt.x;
            var y2: number = endPt.y;
            var z2: number = endPt.z;

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var solidObj: Mesh = this.ui3DScript.solid(x1, y1, z1, x2, y2, z2, width, depth);
            this.ui3DScript.setActiveGroupContainer(null);

            var height: number = endPt.subtract(startPt).length();
            return new HeightBasedGeometryPart(height, this.ui3DScript, solidObj);
        }

        public removePart(geoPart: GeometryPart, dispose: boolean = true): void {
            if (geoPart == null) {
                return;
            }
            geoPart.remove(dispose);
        }

        //internal method
        public static disposeMaterial(material: MaterialBase): void {
            if (material == null) {
                return;

            }
            if (material.hasOwnProperty("color")) {
                material.dispose();
            } else // assume it is a Texture material
            {

                var textureMaterial: TextureMaterial = <TextureMaterial>material;
                var tex: BitmapTexture = <BitmapTexture>textureMaterial.texture;
                // get the bitmapdata of the texture
                var bitmapData: BitmapData = tex.bitmapData;

                tex.dispose();
                //now dispose the source
                bitmapData.dispose();

            }


        }


        private cloneMesh(parentContainer: Mesh, sourceMesh: Mesh): void {
            var clonedGeometry: Geometry = sourceMesh.geometry.clone();
            clonedGeometry.applyTransformation(sourceMesh._iMatrix3D.clone());

            var material: MaterialBase = GeometryGroup.cloneMaterial(this.graphSheet3D, sourceMesh);


            var clonedMesh: Mesh = new Mesh(clonedGeometry, material);
            clonedMesh.pivotPoint = sourceMesh.pivotPoint.clone();
            clonedMesh.partition = sourceMesh.partition;

            parentContainer.addChild(clonedMesh);
        }


        //internal
        public static cloneMaterial(graphSheet3D: Graphsheet3D, sourceMesh: Mesh): MaterialBase {

            var destMaterial: MaterialBase = null;

            if (sourceMesh.material.hasOwnProperty("color"))// check to see if this is a color material
            {
                var colorSourceMaterial: ColorMaterial = <ColorMaterial>sourceMesh.material;
                destMaterial = graphSheet3D.getColorMaterial(colorSourceMaterial.color, colorSourceMaterial.alpha);
                return destMaterial;
            }


            return null;

        }


        public linearExtrude(points: Point3D[], axis: string, length: number, thickness: number = 0, coverAll: boolean = false, excludedSides: string = ""): GeometryPart {
            //convert the model path extrude to UI
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);
            var linearExtObj: Mesh = this.ui3DScript.linearExtrude(points, axis, length, thickness, coverAll, excludedSides);// division is hardcoded now
            this.ui3DScript.setActiveGroupContainer(null);

            return new AxisAlignedGeometryPart(axis, this.ui3DScript, linearExtObj);
        }

        public ellipticArc3d(center: Point3D, normal: Point3D, axis: Point3D, radiusA: number, radiusB: number, minAngle: number, maxAngle: number): GeometryPart {

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);
            var ellipticArc3dObj: Mesh = this.ui3DScript.ellipticArc3d(center, normal, axis, radiusA, radiusB, minAngle, maxAngle);
            this.ui3DScript.setActiveGroupContainer(null);

            var geometryPart: GeometryPart = new GeometryPart(this.ui3DScript, ellipticArc3dObj);
            return geometryPart;

        }


        public text(textValue: string, modelPos: Point3D, size: number = 30, height: number = 5): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var textMesh: Mesh = this.ui3DScript.text(textValue, modelPos, size, height);

            this.ui3DScript.setActiveGroupContainer(null);

            var geometryPart: GeometryPart = new GeometryPart(this.ui3DScript, textMesh);
            return geometryPart;

        }

        public fillSurface(polygons: ProcessingPolygon2D[]): GeometryPart {

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var fillSurfaceMesh: Mesh = this.ui3DScript.fillSurface(polygons);

            this.ui3DScript.setActiveGroupContainer(null);

            var geometryPart: GeometryPart = new GeometryPart(this.ui3DScript, fillSurfaceMesh);
            return geometryPart;


        }

        public spline(modelPoints: Point3D[]): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var fillSurfaceMesh: Mesh = this.ui3DScript.spline(modelPoints);

            this.ui3DScript.setActiveGroupContainer(null);

            var geometryPart: GeometryPart = new GeometryPart(this.ui3DScript, fillSurfaceMesh);
            return geometryPart;

        }

        public splineByPointPairs(pointPairs): GeometryPart {
            this.ui3DScript.setActiveGroupContainer(this.groupContainer);
            var fillSurfaceMesh: Mesh = this.ui3DScript.splineByModelPairPoints(pointPairs);
            this.ui3DScript.setActiveGroupContainer(null);
            var geometryPart: GeometryPart = new GeometryPart(this.ui3DScript, fillSurfaceMesh);
            return geometryPart;
        }


        public polyline(points: Point[]): GeometryPart {

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);

            var currentObj: Mesh = this.ui3DScript.polyline(points);
            this.ui3DScript.setActiveGroupContainer(null);

            var geometryPart: GeometryPart = new GeometryPart(this.ui3DScript, currentObj);
            return geometryPart;

        }

        public processingGroup(processingGroup: ProcessingGroup): GeometryPart {

            this.ui3DScript.setActiveGroupContainer(this.groupContainer);
            var currentObj: Mesh = this.ui3DScript.processingGroup(processingGroup);
            this.ui3DScript.setActiveGroupContainer(null);

            var geometryPart: GeometryPart = new GeometryPart(this.ui3DScript, currentObj);
            return geometryPart;

        }

        /**
         *
         * This method is an exception in the sense it takes UI values instead of model
         */

        /*    public delaunayMesh(points:Vector3D[]):GeometryPart
            {
                //convert the model path extrude to UI
                this.ui3DScript.setActiveGroupContainer(this.groupContainer);
                var delanuyMesh:Mesh = this.ui3DScript.delaunayMesh(points);// division is hardcoded now
                this.ui3DScript.setActiveGroupContainer(null);

                return new GeometryPart(this.ui3DScript,delanuyMesh);
            }*/
    }


}