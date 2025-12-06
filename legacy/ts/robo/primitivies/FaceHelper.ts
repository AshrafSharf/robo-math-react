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
module robo.primitives
{

    import SubGeometry = away.base.SubGeometry;
    import CompactSubGeometry = away.base.CompactSubGeometry;

    import Mesh = away.entities.Mesh;

    
    export class FaceHelper
    {

        private static  LIMIT:number= 196605;
        private static  SPLIT:number= 2;
        private static  TRI:number= 3;
        private static  QUARTER:number= 4;

        private static  _n:Vertex = new Vertex();
        private static  _t:Vertex = new Vertex();
        
        constructor()
        {

        }

       

        /*Adding a face*/
        public static  addFace(mesh:Mesh, v0:Vertex, v1:Vertex, v2:Vertex, uv0:UV, uv1:UV, uv2:UV):void
       {
          var subGeom:SubGeometry;

           if(mesh.geometry.subGeometries.length==0){
                subGeom = new SubGeometry();
                mesh.geometry.addSubGeometry(subGeom);
           }
           else
           {

               subGeom =  <SubGeometry>mesh.geometry.subGeometries[0];
           }


        var vertices:number[] = subGeom.vertexData || [];
      //  var normals:number[] = subGeom.vertexNormalData || [];
       // var tangents:number[] = subGeom.vertexTangentData || [];
        var indices:number[];
        var uvs:number[];
        var lengthVertices:number= vertices.length;

     //   FaceHelper._n = this.getFaceNormal(v0, v1, v2, FaceHelper._n);
      //  FaceHelper._t = this.getFaceTangent(v0, v1, v2, uv0.v, uv1.v, uv2.v, 1, FaceHelper._t);

        if (lengthVertices + 9 > FaceHelper.LIMIT) {
            indices = ([0, 1, 2]);
            vertices = ([v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z]);
            uvs = ([uv0.u, uv0.v, uv1.u, uv1.v, uv2.u, uv2.v]);
          //  normals = ([FaceHelper._n.x, FaceHelper._n.y, FaceHelper._n.z, FaceHelper._n.x, FaceHelper._n.y, FaceHelper._n.z, FaceHelper._n.x, FaceHelper._n.y, FaceHelper._n.z]);
           // tangents = ([FaceHelper._t.x, FaceHelper._t.y, FaceHelper._t.z, FaceHelper._t.x, FaceHelper._t.y, FaceHelper._t.z, FaceHelper._t.x, FaceHelper._t.y, FaceHelper._t.z]);
            subGeom = new SubGeometry();
            mesh.geometry.addSubGeometry(subGeom);

        } else {

            indices = subGeom.indexData || [];
            uvs = subGeom.UVData || [];

            var ind:number= lengthVertices/3;
            var nind:number= indices.length;
            indices[nind++] = ind++;
            indices[nind++] = ind++;
            indices[nind++] = ind++;
            vertices.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
            uvs.push(uv0.u, uv0.v, uv1.u, uv1.v, uv2.u, uv2.v);
         //   normals.push(FaceHelper._n.x, FaceHelper._n.y, FaceHelper._n.z, FaceHelper._n.x, FaceHelper._n.y, FaceHelper._n.z, FaceHelper._n.x, FaceHelper._n.y, FaceHelper._n.z);
           // tangents.push(FaceHelper._t.x, FaceHelper._t.y, FaceHelper._t.z, FaceHelper._t.x, FaceHelper._t.y, FaceHelper._t.z, FaceHelper._t.x, FaceHelper._t.y, FaceHelper._t.z);
        }

        this.updateSubGeometryData(subGeom, vertices, indices, uvs, null, null);
    }


        private static  updateSubGeometryData(subGeometry:SubGeometry, vertices:number[], indices:number[], uvs:number[], normals:number[] = null, tangents:number[] = null):void
    {
        subGeometry.updateVertexData(vertices);
        subGeometry.updateIndexData(indices);

        if (normals)
            subGeometry.updateVertexNormalData(normals);
        if (tangents)
            subGeometry.updateVertexTangentData(tangents);

        subGeometry.updateUVData(uvs);
    }


      public static  getFaceNormal(v0:Vertex, v1:Vertex, v2:Vertex, out:Vertex = null):Vertex
    {
        var dx1:number = v2.x - v0.x;
        var dy1:number = v2.y - v0.y;
        var dz1:number = v2.z - v0.z;

        var dx2:number = v1.x - v0.x;
        var dy2:number = v1.y - v0.y;
        var dz2:number = v1.z - v0.z;

        var cx:number = dz1*dy2 - dy1*dz2;
        var cy:number = dx1*dz2 - dz1*dx2;
        var cz:number = dy1*dx2 - dx1*dy2;

        var d:number = 1/Math.sqrt(cx*cx + cy*cy + cz*cz);

        var normal:Vertex = out || new Vertex(0.0, 0.0, 0.0);
        normal.x = cx*d;
        normal.y = cy*d;
        normal.z = cz*d;

        return normal;
    }


        public static  getFaceTangent(v0:Vertex, v1:Vertex, v2:Vertex, uv0V:number, uv1V:number, uv2V:number, uvScaleV:number = 1, out:Vertex = null):Vertex
    {
        var invScale:number = 1/uvScaleV;

        var dv0:number = uv0V;
        var dv1:number = (uv1V - dv0)*invScale;
        var dv2:number = (uv2V - dv0)*invScale;

        var x0:number = v0.x;
        var y0:number = v0.y;
        var z0:number = v0.z;

        var dx1:number = v1.x - x0;
        var dy1:number = v1.y - y0;
        var dz1:number = v1.z - z0;

        var dx2:number = v2.x - x0;
        var dy2:number = v2.y - y0;
        var dz2:number = v2.z - z0;

        var tangent:Vertex = out || new Vertex(0.0, 0.0, 0.0);

        var cx:number = dv2*dx1 - dv1*dx2;
        var cy:number = dv2*dy1 - dv1*dy2;
        var cz:number = dv2*dz1 - dv1*dz2;
        var denom:number = 1/Math.sqrt(cx*cx + cy*cy + cz*cz);

        tangent.x = denom*cx;
        tangent.y = denom*cy;
        tangent.z = denom*cz;

        return tangent;
    }


    }
}