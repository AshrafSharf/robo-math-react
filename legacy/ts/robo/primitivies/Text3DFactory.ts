/**
 * Created by Mathdisk on 3/28/14.
 */

///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../../../libs/three.d.ts" />
///<reference path="../_definitions.ts"/>

/**
 *
 * Uses the 3D geometry created by Three js converts into Away3D geometry
 */
module robo.primitives {

    import TextGeometry = THREE.TextGeometry;
    import TextGeometryParameters = THREE.TextGeometryParameters;
    import Geometry = THREE.Geometry;
    import Face3 = THREE.Face3;
    import Face = THREE.Face;
    import Vector3 = THREE.Vector3;
    import Mesh = away.entities.Mesh;
    import MaterialBase = away.materials.MaterialBase;
    import FaceHelper = robo.primitives.FaceHelper;
    import AwayGeometry = away.base.Geometry;
    import ThreeJSToAway3DConverter = robo.primitives.ThreeJSToAway3DConverter;


    export class Text3DFactory {


        public static getTextMesh(textValue: string, size: number = 30, height: number = 5, fontName: string = "helvetiker"): Mesh {

            var textGeomParams: TextGeometryParameters = {};


            textGeomParams.size = size
            textGeomParams.height = height
            textGeomParams.curveSegments = 2;
            textGeomParams.font = fontName;

            while (textValue.indexOf("_") >= 0) {
                textValue = textValue.replace('_', "'")
            }

            var text: string = textValue;
            var textGeometry: TextGeometry = new TextGeometry(text, textGeomParams);

            textGeometry.computeBoundingBox();


            var mesh: Mesh = ThreeJSToAway3DConverter.convertToAwayMesh(textGeometry);


            return mesh;


        }


    }

}
