/**
 * Created by Mathdisk on 3/15/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *
 * Note the as3 version of cylinder has getters and setter which i removed by mistake, the other primitives can
 * have exactly the same as as3 version.Just make sure not to have :void on setters..
 */
module robo.primitives {

    import SubGeometry = away.base.SubGeometry;
    import CompactSubGeometry = away.base.CompactSubGeometry;

    import Geometry = THREE.Geometry;
    import Face3 = THREE.Face3;
    import Face = THREE.Face;
    import Vector3 = THREE.Vector3;
    import Mesh = away.entities.Mesh;
    import MaterialBase = away.materials.MaterialBase;
    import FaceHelper = robo.primitives.FaceHelper;
    import AwayGeometry = away.base.Geometry;

    export class ThreeJSToAway3DConverter {

        constructor() {
        }

        public static convertToAwayMesh(geometry: Geometry): Mesh {
            var faces: Face[] = geometry.faces;
            var vertices: Vector3[] = geometry.vertices;
            var awayGeometry: AwayGeometry = new AwayGeometry();
            var mesh: Mesh = new Mesh(awayGeometry);

            var uv: UV = new UV();
            uv.u = 0;
            uv.v = 1;

            for (var i: number = 0; i < faces.length; i++) {
                var face: Face3 = <Face3>faces[i];

                var idx1: number = face.a;
                var idx2: number = face.b;
                var idx3: number = face.c;

                var vec1: Vector3 = vertices[idx1];
                var vec2: Vector3 = vertices[idx2];
                var vec3: Vector3 = vertices[idx3];

                var vertex1: Vertex = new Vertex(vec1.x, vec1.y, vec1.z);
                var vertex2: Vertex = new Vertex(vec2.x, vec2.y, vec2.z);
                var vertex3: Vertex = new Vertex(vec3.x, vec3.y, vec3.z);


                FaceHelper.addFace(mesh, vertex1, vertex2, vertex3, uv, uv, uv);
            }
            return mesh;
        }

    }


}
