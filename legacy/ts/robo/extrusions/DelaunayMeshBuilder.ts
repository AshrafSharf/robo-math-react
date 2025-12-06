/**
 * Created by Mathdisk on 3/16/14.
 */


///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.extrusions {

    import Vector3D = away.geom.Vector3D;
    import Point3D = robo.core.Point3D;
    import Matrix3D = away.geom.Matrix3D;
    import Geometry = away.base.Geometry;
    import SubGeometry = away.base.SubGeometry;
    import MaterialBase = away.materials.MaterialBase;


    export class DelaunayMeshBuilder
    {

        public static  PLANE_XZ:string = "xz";
        public static  PLANE_XY:string = "xy";
        public static  PLANE_ZY:string = "zy";

        private  static LIMIT:number = 196605;
        private  static EPS:number = .0001;
        private  static MAXRAD:number = 1.2;

        private  _circle:Vector3D;
        private  _vectors:Vector3D[];
        private _geom:Geometry;
        private  _subGeometry:SubGeometry;
        private  _sortProp:string;
        private  _loopProp:string;

        private  _uvs:number[];
        private  _vertices:number[];
        private  _indices:number[];
        private  _normals:number[];
      

      
        private  _plane:string;
        private  _flip:Boolean;
        private  _smoothSurface:Boolean;

        private  _axis0Min:number;
        private  _axis0Max:number;
        private  _axis1Min:number;
        private  _axis1Max:number;

        private  _tmpNormal:Vector3D;
        private  _normal0:Vector3D;
        private  _normal1:Vector3D;
        private  _normal2:Vector3D;

        /*
         * Class DelaunayMesh generates (and becomes) a mesh from a vector of vector3D's . <code>DelaunayMesh</code>
         *@param	material				MaterialBase. The material for the resulting mesh.
         *@param	vectors				Vector3D[] A series of vector3d's defining the surface of the shape.
         *@param	plane					[optional] String. The destination plane: can be DelaunayMesh.PLANE_XY, DelaunayMesh.PLANE_XZ or DelaunayMesh.PLANE_ZY. Default is xz plane.
         *@param	centerMesh		[optional] Boolean. If the final mesh must be centered. Default is false.
         *@param	flip					[optional] Boolean. If the faces need to be inverted. Default is false.
         *@param	smoothSurface	[optional] Boolean. If the surface finished needs to smooth or flat. Default is true, a smooth finish.
         */
        public constructor(geom:Geometry,material:MaterialBase, vectors:Vector3D[], plane:string = DelaunayMeshBuilder.PLANE_ZY, centerMesh:Boolean = false, flip:Boolean = false, smoothSurface:Boolean = true)
    {
        this._geom = geom
        this._subGeometry = new SubGeometry();
        this._geom.addSubGeometry(this._subGeometry);
        this._vectors = vectors;
        this._plane = plane;
        this._flip = flip;
        this._smoothSurface = smoothSurface;

        this.buildExtrude();
    }


      public  get vectors():Vector3D[]
    {
        return this._vectors;
    }

    

        private  buildExtrude():void
    {

        if (this._vectors && this._vectors.length > 2) {
            this.initHolders();
            this.generate();
        } else
            throw new Error("DelaunayMesh: minimum 3 Vector3D are required to generate a surface");



    }

        private  initHolders():void
    {
        this._axis0Min = Infinity;
        this._axis0Max = -Infinity;
        this._axis1Min = Infinity;
        this._axis1Max = -Infinity;

        this._uvs = [];
        this._vertices = [];
        this._indices = [];

        this._circle = new Vector3D();

        if (this._smoothSurface) {
            this._normals = [];
            this._normal0 = new Vector3D(0.0, 0.0, 0.0);
            this._normal1 = new Vector3D(0.0, 0.0, 0.0);
            this._normal2 = new Vector3D(0.0, 0.0, 0.0);
            this._tmpNormal = new Vector3D(0.0, 0.0, 0.0);
            this._subGeometry.autoDeriveVertexNormals = false;

        } else
            this._subGeometry.autoDeriveVertexNormals = true;
        this._subGeometry.autoDeriveVertexTangents = true;

    }

        private  addFace(v0:Vector3D, v1:Vector3D, v2:Vector3D, uv0:UV, uv1:UV, uv2:UV):void
    {
        var subGeom:SubGeometry = this._subGeometry;
        var uvs:number[] = this._uvs;
        var vertices:number[] = this._vertices;
        var indices:number[] = this._indices;

        if (this._smoothSurface)
            var normals:number[] = this._normals;



        var bv0:Boolean;
        var bv1:Boolean;
        var bv2:Boolean;

        var ind0:number;
        var ind1:number;
        var ind2:number;

        if (this._smoothSurface) {
            var uvind:number;
            var uvindV:number;
            var vind:number;
            var vindb:number;
            var vindz:number;
            var ind:number;
            var indlength:number = indices.length;
            this.calcNormal(v0, v1, v2);
            var ab:number;

            if (indlength > 0) {

                for (var i:number = indlength - 1; i > 0; --i) {
                    ind = indices[i];
                    vind = ind*3;
                    vindb = vind + 1;
                    vindz = vind + 2;
                    uvind = ind*2;
                    uvindV = uvind + 1;

                    if (bv0 && bv1 && bv2)
                        break;

                    if (!bv0 && vertices[vind] == v0.x && vertices[vindb] == v0.y && vertices[vindz] == v0.z) {

                        this._tmpNormal.x = normals[vind];
                        this._tmpNormal.y = normals[vindb];
                        this._tmpNormal.z = normals[vindz];
                        ab = Vector3D.angleBetween(this._tmpNormal, this._normal0);

                        if (ab < DelaunayMeshBuilder.MAXRAD) {
                            this._normal0.x = (this._tmpNormal.x + this._normal0.x)*.5;
                            this._normal0.y = (this._tmpNormal.y + this._normal0.y)*.5;
                            this._normal0.z = (this._tmpNormal.z + this._normal0.z)*.5;

                            bv0 = true;
                            ind0 = ind;
                            continue;
                        }
                    }

                    if (!bv1 && vertices[vind] == v1.x && vertices[vindb] == v1.y && vertices[vindz] == v1.z) {

                        this._tmpNormal.x = normals[vind];
                        this._tmpNormal.y = normals[vindb];
                        this._tmpNormal.z = normals[vindz];
                        ab = Vector3D.angleBetween(this._tmpNormal, this._normal1);

                        if (ab < DelaunayMeshBuilder.MAXRAD) {
                            this._normal1.x = (this._tmpNormal.x + this._normal1.x)*.5;
                            this._normal1.y = (this._tmpNormal.y + this._normal1.y)*.5;
                            this._normal1.z = (this._tmpNormal.z + this._normal1.z)*.5;

                            bv1 = true;
                            ind1 = ind;
                            continue;
                        }
                    }

                    if (!bv2 && vertices[vind] == v2.x && vertices[vindb] == v2.y && vertices[vindz] == v2.z) {

                        this._tmpNormal.x = normals[vind];
                        this._tmpNormal.y = normals[vindb];
                        this._tmpNormal.z = normals[vindz];
                        ab = Vector3D.angleBetween(this._tmpNormal, this._normal2);

                        if (ab < DelaunayMeshBuilder.MAXRAD) {

                            this._normal2.x = (this._tmpNormal.x + this._normal2.x)*.5;
                            this._normal2.y = (this._tmpNormal.y + this._normal2.y)*.5;
                            this._normal2.z = (this._tmpNormal.z + this._normal2.z)*.5;

                            bv2 = true;
                            ind2 = ind;
                            continue;
                        }

                    }
                }
            }
        }

        if (!bv0) {
            ind0 = vertices.length/3;
            vertices.push(v0.x, v0.y, v0.z);
            uvs.push(uv0.u, uv0.v);
            if (this._smoothSurface)
                normals.push(this._normal0.x, this._normal0.y, this._normal0.z);
        }

        if (!bv1) {
            ind1 = vertices.length/3;
            vertices.push(v1.x, v1.y, v1.z);
            uvs.push(uv1.u, uv1.v);
            if (this._smoothSurface)
                normals.push(this._normal1.x, this._normal1.y, this._normal1.z);
        }

        if (!bv2) {
            ind2 = vertices.length/3;
            vertices.push(v2.x, v2.y, v2.z);
            uvs.push(uv2.u, uv2.v);
            if (this._smoothSurface)
                normals.push(this._normal2.x, this._normal2.y, this._normal2.z);
        }

        indices.push(ind0, ind1, ind2);
    }

        private  generate():void
    {
        this.getVectorsBounds();

        var w:number = this._axis0Max - this._axis0Min;
        var h:number = this._axis1Max - this._axis1Min;

        var offW:number = (this._axis0Min > 0)? -this._axis0Min : Math.abs(this._axis0Min);
        var offH:number = (this._axis1Min > 0)? -this._axis1Min : Math.abs(this._axis1Min);

        var uv0:UV = new UV();
        var uv1:UV = new UV();
        var uv2:UV = new UV();

        var v0:Vector3D;
        var v1:Vector3D;
        var v2:Vector3D;

        var limit:number = this._vectors.length;

        if (limit > 3) {
            var nVectors:Vector3D[] = [];
            nVectors = this._vectors.sort(this.sortFunction);

            var i:number;
            var j:number;
            var k:number;
            var v:Tri[] = [];
            var nv:number = nVectors.length;

            for (i = 0; i < (nv*3); ++i)
                v[i] = new Tri();

            var bList:Boolean[] = [];
            var edges:Edge[] = [];
            var nEdge:number = 0;
            var maxTris:number = 4*nv;
            var maxEdges:number = nv*2;

            for (i = 0; i < maxTris; ++i)
                bList[i] = false;

            var inside:Boolean;
            var valA:number;
            var valB:number;
            var x1:number;
            var y1:number;
            var x2:number;
            var y2:number;
            var x3:number;
            var y3:number;
            // TODO: not used
            // var xc:number;
            // TODO: not used
            // var yc:number;

            var sortMin:number;
            var sortMax:number;
            var loopMin:number;
            var loopMax:number;
            var sortMid:number;
            var loopMid:number;
            var ntri:number = 1;

            for (i = 0; i < maxEdges; ++i)
                edges[i] = new Edge();

            sortMin = nVectors[0][this._sortProp];
            loopMin = nVectors[0][this._loopProp];
            sortMax = sortMin;
            loopMax = loopMin;

            for (i = 1; i < nv; ++i) {
                if (nVectors[i][this._sortProp] < sortMin)
                    sortMin = nVectors[i][this._sortProp];
                if (nVectors[i][this._sortProp] > sortMax)
                    sortMax = nVectors[i][this._sortProp];
                if (nVectors[i][this._loopProp] < loopMin)
                    loopMin = nVectors[i][this._loopProp];
                if (nVectors[i][this._loopProp] > loopMax)
                    loopMax = nVectors[i][this._loopProp];
            }

            var da:number = sortMax - sortMin;
            var db:number = loopMax - loopMin;
            var dmax:number = (da > db)? da : db;
            sortMid = (sortMax + sortMin)*.5;
            loopMid = (loopMax + loopMin)*.5;

            nVectors[nv] = new Vector3D(0.0, 0.0, 0.0);
            nVectors[nv + 1] = new Vector3D(0.0, 0.0, 0.0);
            nVectors[nv + 2] = new Vector3D(0.0, 0.0, 0.0);

            var offset:number = 2.0;
            nVectors[nv + 0][this._sortProp] = sortMid - offset*dmax;
            nVectors[nv + 0][this._loopProp] = loopMid - dmax;

            nVectors[nv + 1][this._sortProp] = sortMid;
            nVectors[nv + 1][this._loopProp] = loopMid + offset*dmax;

            nVectors[nv + 2][this._sortProp] = sortMid + offset*dmax;
            nVectors[nv + 2][this._loopProp] = loopMid - dmax;

            v[0].v0 = nv;
            v[0].v1 = nv + 1;
            v[0].v2 = nv + 2;
            bList[0] = false;

            for (i = 0; i < nv; ++i) {

                valA = this.vectors[i][this._sortProp];
                valB = this.vectors[i][this._loopProp];
                nEdge = 0;

                for (j = 0; j < ntri; ++j) {

                    if (bList[j])
                        continue;

                    x1 = nVectors[v[j].v0][this._sortProp];
                    y1 = nVectors[v[j].v0][this._loopProp];
                    x2 = nVectors[v[j].v1][this._sortProp];
                    y2 = nVectors[v[j].v1][this._loopProp];
                    x3 = nVectors[v[j].v2][this._sortProp];
                    y3 = nVectors[v[j].v2][this._loopProp];

                    inside = this.circumCircle(valA, valB, x1, y1, x2, y2, x3, y3);

                    if (this._circle.x + this._circle.z < valA)
                        bList[j] = true;

                    if (inside) {
                        if (nEdge + 3 >= maxEdges) {
                            maxEdges += 3;
                            edges.push(new Edge(), new Edge(), new Edge());
                        }
                        edges[nEdge].v0 = v[j].v0;
                        edges[nEdge].v1 = v[j].v1;
                        edges[nEdge + 1].v0 = v[j].v1;
                        edges[nEdge + 1].v1 = v[j].v2;
                        edges[nEdge + 2].v0 = v[j].v2;
                        edges[nEdge + 2].v1 = v[j].v0;
                        nEdge += 3;
                        ntri--;
                        v[j].v0 = v[ntri].v0;
                        v[j].v1 = v[ntri].v1;
                        v[j].v2 = v[ntri].v2;
                        bList[j] = bList[ntri];
                        j--;

                    }
                }

                for (j = 0; j < nEdge - 1; ++j) {

                    for (k = j + 1; k < nEdge; ++k) {

                        if ((edges[j].v0 == edges[k].v1) && (edges[j].v1 == edges[k].v0))
                            edges[j].v0 = edges[j].v1 = edges[k].v0 = edges[k].v1 = -1;

                        if ((edges[j].v0 == edges[k].v0) && (edges[j].v1 == edges[k].v1))
                            edges[j].v0 = edges[j].v1 = edges[k].v0 = edges[k].v1 = -1;
                    }
                }

                for (j = 0; j < nEdge; ++j) {

                    if (edges[j].v0 == -1 || edges[j].v1 == -1)
                        continue;

                    if (ntri >= maxTris)
                        continue;

                    v[ntri].v0 = edges[j].v0;
                    v[ntri].v1 = edges[j].v1;
                    v[ntri].v2 = i;

                    bList[ntri] = false;

                    ntri++;
                }
            }

            for (i = 0; i < ntri; ++i) {

                if (v[i].v0 == v[i].v1 && v[i].v1 == v[i].v2)
                    continue;

                if ((v[i].v0 >= limit || v[i].v1 >= limit || v[i].v2 >= limit)) {
                    v[i] = v[ntri - 1];
                    ntri--;
                    i--;
                    continue;
                }

                v0 = nVectors[v[i].v0];
                v1 = nVectors[v[i].v1];
                v2 = nVectors[v[i].v2];

                uv0.u = (v0[this._loopProp] + offW)/w;
                uv0.v = 1 - (v0[this._sortProp] + offH)/h;

                uv1.u = (v1[this._loopProp] + offW)/w;
                uv1.v = 1 - (v1[this._sortProp] + offH)/h;

                uv2.u = (v2[this._loopProp] + offW)/w;
                uv2.v = 1 - (v2[this._sortProp] + offH)/h;

                if (this._flip)
                    this.addFace(v0, v1, v2, uv0, uv1, uv2);
                else
                    this.addFace(v1, v0, v2, uv1, uv0, uv2);

            }

            if (this._smoothSurface)
                this._subGeometry.updateVertexNormalData(this._normals);

            for (i = 0; i < v.length; ++i)
                v[i] = null;

            v = null;
            nVectors = null;

        } else {

            v0 = this._vectors[0];
            v1 = this._vectors[1];
            v2 = this._vectors[2];

            this._vertices.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);

            uv0.u = (v0[this._loopProp] + offW)/w;
            uv0.v = 1 - (v0[this._sortProp] + offH)/h;

            uv1.u = (v1[this._loopProp] + offW)/w;
            uv1.v = 1 - (v1[this._sortProp] + offH)/h;

            uv2.u = (v2[this._loopProp] + offW)/w;
            uv2.v = 1 - (v2[this._sortProp] + offH)/h;

            this._uvs.push(uv0.u, uv0.v, uv1.u, uv1.v, uv2.u, uv2.v);

            if (this._flip)
                this._indices.push(1, 0, 2);
            else
                this._indices.push(0, 1, 2);

            this._subGeometry.autoDeriveVertexNormals = true;
        }

        this._subGeometry.updateVertexData(this._vertices);
        this._subGeometry.updateIndexData(this._indices);
        this._subGeometry.updateUVData(this._uvs);

    }

        private  sortFunction(v0:Vector3D, v1:Vector3D):number
    {
        var a:number = v0[this._sortProp];
        var b:number = v1[this._sortProp];
        if (a == b)
            return 0;
        else if (a < b)
            return 1;
        else
            return -1;
    }

        private  calcNormal(v0:Vector3D, v1:Vector3D, v2:Vector3D):void
    {
        var da1:number = v2.x - v0.x;
        var db1:number = v2.y - v0.y;
        var dz1:number = v2.z - v0.z;
        var da2:number = v1.x - v0.x;
        var db2:number = v1.y - v0.y;
        var dz2:number = v1.z - v0.z;

        var cx:number = dz1*db2 - db1*dz2;
        var cy:number = da1*dz2 - dz1*da2;
        var cz:number = db1*da2 - da1*db2;
        var d:number = 1/Math.sqrt(cx*cx + cy*cy + cz*cz);

        this._normal0.x = this._normal1.x = this._normal2.x = cx*d;
        this._normal0.y = this._normal1.y = this._normal2.y = cy*d;
        this._normal0.z = this._normal1.z = this._normal2.z = cz*d;
    }

        private  getVectorsBounds():void
    {
        var i:number;
        var v:Vector3D;
        switch (this._plane) {
            case DelaunayMeshBuilder.PLANE_XZ:
                this._sortProp = "z";
                this._loopProp = "x";
                for (i = 0; i < this._vectors.length; ++i) {
                    v = this._vectors[i];
                    if (v.x < this._axis0Min)
                        this._axis0Min = v.x;
                    if (v.x > this._axis0Max)
                        this._axis0Max = v.x;
                    if (v.z < this._axis1Min)
                        this._axis1Min = v.z;
                    if (v.z > this._axis1Max)
                        this._axis1Max = v.z;
                }
                break;

            case DelaunayMeshBuilder.PLANE_XY:
                this._sortProp = "y";
                this._loopProp = "x";
                for (i = 0; i < this._vectors.length; ++i) {
                    v = this._vectors[i];
                    if (v.x < this._axis0Min)
                        this._axis0Min = v.x;
                    if (v.x > this._axis0Max)
                        this._axis0Max = v.x;
                    if (v.y < this._axis1Min)
                        this._axis1Min = v.y;
                    if (v.y > this._axis1Max)
                        this._axis1Max = v.y;
                }
                break;

            case DelaunayMeshBuilder.PLANE_ZY:
                this._sortProp = "y";
                this._loopProp = "z";
                for (i = 0; i < this._vectors.length; ++i) {
                    v = this._vectors[i];
                    if (v.z < this._axis0Min)
                        this._axis0Min = v.z;
                    if (v.z > this._axis0Max)
                        this._axis0Max = v.z;
                    if (v.y < this._axis1Min)
                        this._axis1Min = v.y;
                    if (v.y > this._axis1Max)
                        this._axis1Max = v.y;
                }

        }
    }





 

        private  circumCircle(xp:number, yp:number, x1:number, y1:number, x2:number, y2:number, x3:number, y3:number):Boolean
    {
        var m1:number;
        var m2:number;
        var mx1:number;
        var mx2:number;
        var my1:number;
        var my2:number;
        var da:number;
        var db:number;
        var rsqr:number;
        var drsqr:number;
        var xc:number;
        var yc:number;

        if (Math.abs(y1 - y2) < DelaunayMeshBuilder.EPS && Math.abs(y2 - y3) < DelaunayMeshBuilder.EPS)
            return false;

        if (Math.abs(y2 - y1) < DelaunayMeshBuilder.EPS) {
            m2 = -(x3 - x2)/(y3 - y2);
            mx2 = (x2 + x3)*.5;
            my2 = (y2 + y3)*.5;
            xc = (x2 + x1)*.5;
            yc = m2*(xc - mx2) + my2;

        } else if (Math.abs(y3 - y2) < DelaunayMeshBuilder.EPS) {
            m1 = -(x2 - x1)/(y2 - y1);
            mx1 = (x1 + x2)*.5;
            my1 = (y1 + y2)*.5;
            xc = (x3 + x2)*.5;
            yc = m1*(xc - mx1) + my1;

        } else {
            m1 = -(x2 - x1)/(y2 - y1);
            m2 = -(x3 - x2)/(y3 - y2);
            mx1 = (x1 + x2)*.5;
            mx2 = (x2 + x3)*.5;
            my1 = (y1 + y2)*.5;
            my2 = (y2 + y3)*.5;
            xc = (m1*mx1 - m2*mx2 + my2 - my1)/(m1 - m2);
            yc = m1*(xc - mx1) + my1;
        }

        da = x2 - xc;
        db = y2 - yc;
        rsqr = da*da + db*db;

        da = xp - xc;
        db = yp - yc;
        drsqr = da*da + db*db;

        this._circle.x = xc;
        this._circle.y = yc;
        this._circle.z = Math.sqrt(rsqr);

        return Boolean(drsqr <= rsqr);
    }
    

    }


   export class Tri
    {
        public  v0:number;
        public  v1:number;
        public  v2:number;
    }

    export class Edge
    {
        public  v0:number;
        public  v1:number;
    }

}