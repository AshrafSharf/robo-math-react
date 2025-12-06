/**
 * Created by Mathdisk on 3/16/14.
 */
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.extrusions {

    import Vector3D = away.geom.Vector3D;
    import Point = away.geom.Point;
    import Line = robo.extrusions.Line;
    import FourPoints = robo.extrusions.FourPoints;
    import RenderSide=robo.extrusions.RenderSide;
    import Matrix3D = away.geom.Matrix3D;
    import MaterialBase = away.materials.MaterialBase;
    import Geometry = away.base.Geometry;
    import SubGeometry = away.base.SubGeometry;
    import Vertex=robo.extrusions.Vertex;
    

    export class LinearExtrude
    {
        /**
         *  Class LinearExtrusion generates walls like meshes with or without thickness from a series of Vector3D's
         *
         *@param        material                        [optional] MaterialBase. The LatheExtrude (Mesh) material. Optional in constructor, material must be set before LatheExtrude object is render.
         * @param        vectors                        [optional] Vector.&lt;Vector3D&gt;. A series of Vector3D's representing the profile information to be repeated/rotated around a given axis.
         * @param        axis                            [optional] String. The axis to elevate along: X this._AXIS, Y this._AXIS or Z this._AXIS. Default is LinearExtrusion.Y this._AXIS.
         * @param        offset                            [optional] Number. The elevation offset along the defined axis.
         * @param        subdivision                    [optional] uint. The subdivision of the geometry between 2 vector3D. Default is 32.
         * @param        coverAll                        [optional] Boolean. The way the uv mapping is spreaded across the shape. True covers an entire side of the geometry while false covers per segments. Default is false.
         * @param        thickness                    [optional] Number. If the shape must simulate a thickness. Default is 0.
         * @param        thicknessSubdivision    [optional] uint. If thickness is higher than 0. Defines the subdivision of the thickness (top, left, right, bottom). Default is 3;
         * @param        materials                    [optional] MultipleMaterials. Allows multiple material support when thickness is set higher to 1. Default is null.
         * properties as MaterialBase are: bottom, top, left, right, front and back.
         * @param        centerMesh                [optional] Boolean. If the geometry needs to be recentered in its own object space. If the position after generation is set to 0,0,0, the object would be centered in worldspace. Default is false.
         * @param        closePath                    [optional] Boolean. Defines if the last entered vector needs to be linked with the first one to form a closed shape. Default is false.
         * @param        ignoreSides                [optional] String. To prevent the generation of sides if thickness is set higher than 0. To avoid the bottom ignoreSides = "bottom", avoiding both top and bottom: ignoreSides = "bottom, top". Strings options: bottom, top, left, right, front and back. Default is "".
         * @param        flip                            [optional] Boolean. If the faces must be reversed depending on Vector3D's orientation. Default is false.
         */


        public static  X_AXIS:string = "x";
        public static  Y_AXIS:string = "y";
        public static  Z_AXIS:string = "z";

        private static LIMIT:number = 196605;
        private static EPS:number = .0001;

        private  _varr:Vertex[];
        private  _varr2:Vertex[];
        private  _uvarr:UV[];
        private  _subdivision:number;
        private  _coverAll:Boolean;
        private  _flip:Boolean;
        private  _closePath:Boolean;
        private  _axis:string;
        private  _offset:number;
        private _activeMaterial:MaterialBase;
        private _centerMesh:Boolean;
        private _thickness:number;
        private _thicknessSubdivision:number;
        private _ignoreSides:string;

        private  _geomDirty:Boolean = true;
        private  _subGeometry:SubGeometry;
       
        private _uva:UV;
        private _uvb:UV;
        private _uvc:UV;
        private _uvd:UV;
       
        private  _maxIndProfile:number;
        private  _uvs:number[];
        private _vertices:number[];
        private _indices:number[];
        private _aVectors:Vector3D[];
        private _baseMax:number;
        private _baseMin:number;
        private material:MaterialBase;

       private _geom:Geometry; // the liner extrude is built ina way to give geometry on demand basis because of constructir (super issue, we are creating it here)

     constructor(geom:Geometry,material:MaterialBase = null, vectors:Vector3D[] = null, axis:string= LinearExtrude.Y_AXIS, offset:number = 10, subdivision:number = 3, coverAll:Boolean = false, thickness:number = 0, thicknessSubdivision:number = 3, centerMesh:Boolean = false, closePath:Boolean = false, ignoreSides:string= "", flip:Boolean = false)
     {

         this.material = material;
         this._geom = geom;


         this._subGeometry = new SubGeometry();


         this._aVectors = vectors;
         this._axis = axis;
         this._offset = offset;
         this._coverAll = coverAll;
         this._flip = flip;
         this._centerMesh = centerMesh;
         this._thickness = Math.abs(thickness);
        this.subdivision = subdivision;
        this.thicknessSubdivision = thicknessSubdivision;
         this._ignoreSides = ignoreSides;
         this._closePath = closePath;

      
        if ( this._closePath && ignoreSides != "")
            this.ignoreSides = ignoreSides;

         this.buildExtrude();

    }

        private  buildExtrude():void
    {

        if (! this._aVectors.length ||  this._aVectors.length < 2)
            throw new Error("LinearExtrusion error: at least 2 vector3D required!");
        if ( this._closePath)
             this._aVectors.push(new Vector3D( this._aVectors[0].x,  this._aVectors[0].y,  this._aVectors[0].z));

         this._maxIndProfile =  this._aVectors.length*9;

         this._geomDirty = false;
        this.initHolders();

        this.generate();

        if ( this._vertices.length > 0) {
             this._subGeometry.updateVertexData( this._vertices);
             this._subGeometry.updateIndexData( this._indices);
             this._subGeometry.updateUVData( this._uvs);
            this.geometry.addSubGeometry( this._subGeometry);
        }

       

       

         this._varr =  this._varr2 = null;
         this._uvarr = null;
    }

        /**
         * Defines the axis used for the extrusion. Defaults to "y".
         */
        public  get axis():string
    {
        return  this._axis;
    }

    public  set axis(val:string)
    {
        if ( this._axis == val)
            return;

         this._axis = val;
        this.pInvalidateGeometry();
    }



        /**
         * Defines the subdivisions created in the mesh for the total number of revolutions. Defaults to 2, minimum 2.
         */
        public  get subdivision():number
    {
        return  this._subdivision;
    }

        public  set subdivision(val:number)
    {
        val = (val < 3)? 3 : val;
        if ( this._subdivision == val)
            return;
         this._subdivision = val;
        this.pInvalidateGeometry();
    }

        /**
         * Defines if the texture(s) should be stretched to cover the entire mesh or per step between segments. Defaults to true.
         */
        public  get coverAll():Boolean
    {
        return  this._coverAll;
    }

        public  set coverAll(val:Boolean)
    {
        if ( this._coverAll == val)
            return;

         this._coverAll = val;
        this.pInvalidateGeometry();
    }

        /**
         * Defines if the generated faces should be inversed. Default false.
         */
        public  get flip():Boolean
    {
        return  this._flip;
    }

        public  set flip(val:Boolean)
    {
        if ( this._flip == val)
            return;

         this._flip = val;
        this.pInvalidateGeometry();
    }

        

        /**
         * Defines the  this._thickness of the resulting lathed geometry. Defaults to 0 (single face).
         */
        public  get thickness():number
    {
        return  this._thickness;
    }

        public  set thickness(val:number)
    {
        val = Math.abs(val);
        if ( this._thickness == val)
            return;

         this._thickness = val;
        this.pInvalidateGeometry();
    }

        /**
         * Defines the subdivision for the top, bottom, right and left if thickness is set higher to 0. Defaults to 1.
         */
        public  get thicknessSubdivision():number
    {
        return  this._thicknessSubdivision;
    }

        public  set thicknessSubdivision(val:number)
    {
        val = (val < 3)? 3 : val;
        if ( this._thicknessSubdivision == val)
            return;

         this._thicknessSubdivision = val;
        this.pInvalidateGeometry();
    }

        /**
         * Defines if the top, bottom, left, right, front or back of the the extrusion is left open.
         */
        public  get ignoreSides():string
    {
        return  this._ignoreSides;
    }

        public  set ignoreSides(val:string)
    {
         this._ignoreSides = val;
        if ( this._closePath) {
            if ( this._ignoreSides.indexOf("left") == -1)
                 this._ignoreSides += "left,";
            if ( this._ignoreSides.indexOf("right") == -1)
                 this._ignoreSides += "right";
        }
        this.pInvalidateGeometry();
    }


        /**
         * @inheritDoc
         */
        public  get geometry():Geometry
        {
            if ( this._geomDirty)
                this.buildExtrude();

            return this._geom;
        }




        private  addFace(v0:Vertex, v1:Vertex, v2:Vertex, uv0:UV, uv1:UV, uv2:UV, mat:MaterialBase, invertU:Boolean = false):void
    {
        var subGeom:SubGeometry;
        var uvs:number[];
        var vertices:number[];
        // TODO: not used
        // var normals:number[];
        var indices:number[];
    

            subGeom =  this._subGeometry;
            uvs =  this._uvs;
            vertices =  this._vertices;
            indices =  this._indices;
       

        if (vertices.length + 9 > LinearExtrude.LIMIT) {
            subGeom.updateVertexData(vertices);
            subGeom.updateIndexData(indices);
            subGeom.updateUVData(uvs);
            this.geometry.addSubGeometry(subGeom);


         //   this.subMeshes[this.subMeshes.length - 1].material = mat;

            subGeom = new SubGeometry();
            subGeom.autoDeriveVertexTangents = true;
            subGeom.autoDeriveVertexNormals = true;

    

                 this._subGeometry = subGeom;
                uvs =  this._uvs = [];
                vertices =  this._vertices = [];
                indices =  this._indices = [];
        
        }

        var ind:number = vertices.length/3;

        if (invertU)
            uvs.push(1 - uv0.u, uv0.v, 1 - uv1.u, uv1.v, 1 - uv2.u, uv2.v);
        else
            uvs.push(uv0.u, uv0.v, uv1.u, uv1.v, uv2.u, uv2.v);
        vertices.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);

        indices.push(ind, ind + 1, ind + 2);
    }

        private  generate():void
    {
        var i:number;
        var j:number;
        var increase:number =  this._offset/ this._subdivision;

        var baseMaxX:number =  this._aVectors[0].x;
        var baseMinX:number =  this._aVectors[0].x;
        var baseMaxY:number =  this._aVectors[0].y;
        var baseMinY:number =  this._aVectors[0].y;
        var baseMaxZ:number =  this._aVectors[0].z;
        var baseMinZ:number =  this._aVectors[0].z;

        for (i = 1; i <  this._aVectors.length; i++) {
            baseMaxX = Math.max( this._aVectors[i].x, baseMaxX);
            baseMinX = Math.min( this._aVectors[i].x, baseMinX);
            baseMaxY = Math.max( this._aVectors[i].y, baseMaxY);
            baseMinY = Math.min( this._aVectors[i].y, baseMinY);
            baseMaxZ = Math.max( this._aVectors[i].z, baseMaxZ);
            baseMinZ = Math.min( this._aVectors[i].z, baseMinZ);
        }

        var offset:number = 0;

        switch ( this._axis) {
            case LinearExtrude.X_AXIS:
                 this._baseMax = Math.abs(baseMaxX) - Math.abs(baseMinX);
                if (baseMinZ > 0 && baseMaxZ > 0) {
                     this._baseMin = baseMaxZ - baseMinZ;
                    offset = -baseMinZ;
                } else if (baseMinZ < 0 && baseMaxZ < 0) {
                     this._baseMin = Math.abs(baseMinZ - baseMaxZ);
                    offset = -baseMinZ;
                } else {
                     this._baseMin = Math.abs(baseMaxZ) + Math.abs(baseMinZ);
                    offset = Math.abs(baseMinZ) + ((baseMaxZ < 0)? -baseMaxZ : 0);
                }
                break;

            case LinearExtrude.Y_AXIS:
                 this._baseMax = Math.abs(baseMaxY) - Math.abs(baseMinY);
                if (baseMinX > 0 && baseMaxX > 0) {
                     this._baseMin = baseMaxX - baseMinX;
                    offset = -baseMinX;
                } else if (baseMinX < 0 && baseMaxX < 0) {
                     this._baseMin = Math.abs(baseMinX - baseMaxX);
                    offset = -baseMinX;
                } else {
                     this._baseMin = Math.abs(baseMaxX) + Math.abs(baseMinX);
                    offset = Math.abs(baseMinX) + ((baseMaxX < 0)? -baseMaxX : 0);
                }
                break;

            case LinearExtrude.Z_AXIS:
                 this._baseMax = Math.abs(baseMaxZ) - Math.abs(baseMinZ);
                if (baseMinY > 0 && baseMaxY > 0) {
                     this._baseMin = baseMaxY - baseMinY;
                    offset = -baseMinY;
                } else if (baseMinY < 0 && baseMaxY < 0) {
                     this._baseMin = Math.abs(baseMinY - baseMaxY);
                    offset = -baseMinY;
                } else {
                     this._baseMin = Math.abs(baseMaxY) + Math.abs(baseMinY);
                    offset = Math.abs(baseMinY) + ((baseMaxY < 0)? -baseMaxY : 0);
                }
                break;
        }




        var aLines:any[];
        var prop1:string;
        var prop2:string;
        var prop3:string;
        var vector:Vertex = new Vertex();
        if ( this._thickness != 0) {
            var aListsides:any[] = ["top", "bottom", "right", "left", "front", "back"];
            var renderSide:RenderSide = new RenderSide();

            for (i = 0; i < aListsides.length; ++i)
                renderSide[aListsides[i]] = ( this._ignoreSides.indexOf(aListsides[i]) == -1);

            switch ( this._axis) {
                case LinearExtrude.X_AXIS:
                    prop1 = LinearExtrude.Z_AXIS;
                    prop2 = LinearExtrude.Y_AXIS;
                    prop3 = LinearExtrude.X_AXIS;
                    break;

                case LinearExtrude.Y_AXIS:
                    prop1 = LinearExtrude.X_AXIS;
                    prop2 = LinearExtrude.Z_AXIS;
                    prop3 = LinearExtrude.Y_AXIS;
                    break;

                case LinearExtrude.Z_AXIS:
                    prop1 = LinearExtrude.Y_AXIS;
                    prop2 = LinearExtrude.X_AXIS;
                    prop3 = LinearExtrude.Z_AXIS;
            }

            aLines = this.buildThicknessPoints(prop1, prop2);

            var points:FourPoints;

            var vector2:Vertex = new Vertex();
            var vector3:Vertex = new Vertex();
            var vector4:Vertex = new Vertex();

            for (i = 0; i < aLines.length; i++) {

                points = <FourPoints>(aLines[i]);

                if (i == 0) {
                    vector[prop1] = points.pt2.x;
                    vector[prop2] = points.pt2.y;
                    vector[prop3] =  this._aVectors[0][prop3];
                     this._varr.push(new Vertex(vector.x, vector.y, vector.z));

                    vector2[prop1] = points.pt1.x;
                    vector2[prop2] = points.pt1.y;
                    vector2[prop3] =  this._aVectors[0][prop3];
                     this._varr2.push(new Vertex(vector2.x, vector2.y, vector2.z));

                    this.elevate(vector, vector2, increase);

                    if (aLines.length == 1) {

                        vector3[prop1] = points.pt4.x;
                        vector3[prop2] = points.pt4.y;
                        vector3[prop3] =  this._aVectors[0][prop3];
                         this._varr.push(new Vertex(vector3.x, vector3.y, vector3.z));

                        vector4[prop1] = points.pt3.x;
                        vector4[prop2] = points.pt3.y;
                        vector4[prop3] =  this._aVectors[0][prop3];
                         this._varr2.push(new Vertex(vector4.x, vector4.y, vector4.z));

                        this.elevate(vector3, vector4, increase);
                    }

                } else if (i == aLines.length - 1) {

                    vector[prop1] = points.pt2.x;
                    vector[prop2] = points.pt2.y;
                    vector[prop3] =  this._aVectors[i][prop3];
                     this._varr.push(new Vertex(vector.x, vector.y, vector.z));

                    vector2[prop1] = points.pt1.x;
                    vector2[prop2] = points.pt1.y;
                    vector2[prop3] =  this._aVectors[i][prop3];
                     this._varr2.push(new Vertex(vector2.x, vector2.y, vector2.z));

                    this.elevate(vector, vector2, increase);

                    vector3[prop1] = points.pt4.x;
                    vector3[prop2] = points.pt4.y;
                    vector3[prop3] =  this._aVectors[i][prop3];
                     this._varr.push(new Vertex(vector3.x, vector3.y, vector3.z));

                    vector4[prop1] = points.pt3.x;
                    vector4[prop2] = points.pt3.y;
                    vector4[prop3] =  this._aVectors[i][prop3];
                     this._varr2.push(new Vertex(vector4.x, vector4.y, vector4.z));

                    this.elevate(vector3, vector4, increase);

                } else {

                    vector[prop1] = points.pt2.x;
                    vector[prop2] = points.pt2.y;
                    vector[prop3] =  this._aVectors[i][prop3];
                     this._varr.push(new Vertex(vector.x, vector.y, vector.z));

                    vector2[prop1] = points.pt1.x;
                    vector2[prop2] = points.pt1.y;
                    vector2[prop3] =  this._aVectors[i][prop3];
                     this._varr2.push(new Vertex(vector2.x, vector2.y, vector2.z));

                    this.elevate(vector, vector2, increase);
                }
            }

        } else {

            for (i = 0; i <  this._aVectors.length; i++) {
                vector.x =  this._aVectors[i].x;
                vector.y =  this._aVectors[i].y;
                vector.z =  this._aVectors[i].z;
                 this._varr.push(new Vertex(vector.x, vector.y, vector.z));

                for (j = 0; j <  this._subdivision; j++) {
                    vector[ this._axis] += increase;
                     this._varr.push(new Vertex(vector.x, vector.y, vector.z));
                }
            }
        }

        var index:number = 0;
        var mat:MaterialBase;

        if ( this._thickness > 0) {
            var v1a:Vertex;
            var v1b:Vertex;
            var v1c:Vertex;
            var v2a:Vertex;
            var v2b:Vertex;
            var v2c:Vertex;
            var v3a:Vertex;
            var v3b:Vertex;
            var v3c:Vertex;
            var v4b:Vertex;
            var v4c:Vertex;
        }

        var step:number = 1/( this._aVectors.length - 1);

        var vindex:number;

        for (i = 0; i <  this._aVectors.length - 1; ++i) {

            if ( this._coverAll) {
                 this._uva.u =  this._uvb.u = step*i;
                 this._uvc.u =  this._uvd.u =  this._uvb.u + step;
            } else {
                 this._uva.u = 0;
                 this._uvb.u = 0;
                 this._uvc.u = 1;
                 this._uvd.u = 1;
            }

            for (j = 0; j <  this._subdivision; ++j) {

                 this._uva.v =  this._uvd.v = 1 - (j/ this._subdivision);
                 this._uvb.v =  this._uvc.v = 1 - (j + 1)/ this._subdivision;

                vindex = index + j;
                if ( this._thickness == 0) {

                    if ( this._flip) {
                        this.addFace( this._varr[ vindex + 1],  this._varr[vindex],  this._varr[vindex +  this._subdivision + 2],  this._uvb,  this._uva,  this._uvc, this.material);
                        this.addFace( this._varr[ vindex +  this._subdivision + 2],  this._varr[vindex],  this._varr[vindex +  this._subdivision + 1],  this._uvc,  this._uva,  this._uvd, this.material);
                    } else {
                        this.addFace( this._varr[vindex],  this._varr[vindex + 1],  this._varr[vindex +  this._subdivision + 2],  this._uva,  this._uvb,  this._uvc, this.material);
                        this.addFace( this._varr[vindex],  this._varr[vindex +  this._subdivision + 2],  this._varr[vindex +  this._subdivision + 1],  this._uva,  this._uvc,  this._uvd, this.material);
                    }

                } else {
                    //half side 1
                    v1a =  this._varr[vindex];
                    v1b =  this._varr[vindex + 1];
                    v1c =  this._varr[vindex +  this._subdivision + 2];
                    v2a =  this._varr[vindex];
                    v2b =  this._varr[vindex +  this._subdivision + 2];
                    v2c =  this._varr[vindex +  this._subdivision + 1];

                    //half side 2
                    v3a =  this._varr2[vindex];
                    v3b =  this._varr2[vindex + 1];
                    v3c =  this._varr2[vindex +  this._subdivision + 2];
                    v4b =  this._varr2[vindex +  this._subdivision + 2];
                    v4c =  this._varr2[vindex +  this._subdivision + 1];

                    //right
                    if (renderSide.right) {
                        mat =  this.material;
                        if ( this._flip) {
                            this.addFace(v1a, v1b, v1c,  this._uva,  this._uvb,  this._uvc, mat);
                            this.addFace(v2a, v2b, v2c,  this._uva,  this._uvc,  this._uvd, mat);
                        } else {
                            this.addFace(v1b, v1a, v1c,  this._uvb,  this._uva,  this._uvc, mat);
                            this.addFace(v2b, v2a, v2c,  this._uvc,  this._uva,  this._uvd, mat);
                        }
                    }

                    //left
                    if (renderSide.left) {
                        mat =  this.material;
                        if ( this._flip) {
                            this.addFace(v4c, v3b, v3a,  this._uvd,  this._uvb,  this._uva, mat, true);
                            this.addFace(v4c, v4b, v3b,  this._uvd,  this._uvc,  this._uvb, mat, true);
                        } else {
                            this.addFace(v3b, v4c, v3a,  this._uvb,  this._uvd,  this._uva, mat, true);
                            this.addFace(v4b, v4c, v3b,  this._uvc,  this._uvd,  this._uvb, mat, true);
                        }
                    }

                    //back
                    if (i == 0 && renderSide.back) {
                        mat =  this.material;
                        if ( this._flip) {
                            this.addFace(v3a, v3b, v1b,  this._uva,  this._uvb,  this._uvc, mat);
                            this.addFace(v3a, v1b, v1a,  this._uva,  this._uvc,  this._uvd, mat);
                        } else {
                            this.addFace(v3b, v3a, v1b,  this._uvb,  this._uva,  this._uvc, mat);
                            this.addFace(v1b, v3a, v1a,  this._uvc,  this._uva,  this._uvd, mat);
                        }
                    }

                    //bottom
                    if (j == 0 && renderSide.bottom) {
                        mat =  this.material;
                        this.addThicknessSubdivision([v4c, v3a], [v2c, v1a],  this._uvd.u,  this._uvb.u, mat);
                    }

                    //top
                    if (j ==  this._subdivision - 1 && renderSide.top) {
                        mat =  this.material;
                        this.addThicknessSubdivision([v3b, v3c], [v1b, v1c],  this._uva.u,  this._uvc.u, mat);
                    }

                    //front 
                    if (i ==  this._aVectors.length - 2 && renderSide.front) {
                        mat =  this.material;
                        if ( this._flip) {
                            this.addFace(v2c, v2b, v3c,  this._uva,  this._uvb,  this._uvc, mat);
                            this.addFace(v2c, v3c, v4c,  this._uva,  this._uvc,  this._uvd, mat);
                        } else {
                            this.addFace(v2b, v2c, v3c,  this._uvb,  this._uva,  this._uvc, mat);
                            this.addFace(v3c, v2c, v4c,  this._uvc,  this._uva,  this._uvd, mat);
                        }
                    }

                }
            }

            index +=  this._subdivision + 1;
        }
    }

        private  addThicknessSubdivision(points1:any[], points2:any[], u1:number, u2:number, mat:MaterialBase):void
    {
        var i:number;
        var j:number;

        var stepx:number;
        var stepy:number;
        var stepz:number;

        var va:Vertex;
        var vb:Vertex;
        var vc:Vertex;
        var vd:Vertex;

        var index:number = 0;
        var v1:number = 0;
        var v2:number = 0;
        var tmp:any[] = [];

        for (i = 0; i < points1.length; ++i) {
            stepx = (points2[i].x - points1[i].x)/ this._thicknessSubdivision;
            stepy = (points2[i].y - points1[i].y)/ this._thicknessSubdivision;
            stepz = (points2[i].z - points1[i].z)/ this._thicknessSubdivision;

            for (j = 0; j <  this._thicknessSubdivision + 1; ++j)
                tmp.push(new Vertex(points1[i].x + (stepx*j), points1[i].y + (stepy*j), points1[i].z + (stepz*j)));

        }

        for (i = 0; i < points1.length - 1; ++i) {

            for (j = 0; j <  this._thicknessSubdivision; ++j) {

                v1 = j/ this._thicknessSubdivision;
                v2 = (j + 1)/ this._thicknessSubdivision;

                 this._uva.u = u1;
                 this._uva.v = v1;
                 this._uvb.u = u1;
                 this._uvb.v = v2;
                 this._uvc.u = u2;
                 this._uvc.v = v2;
                 this._uvd.u = u2;
                 this._uvd.v = v1;

                va = tmp[index + j];
                vb = tmp[(index + j) + 1];
                vc = tmp[((index + j) + ( this._thicknessSubdivision + 2))];
                vd = tmp[((index + j) + ( this._thicknessSubdivision + 1))];

                if (! this._flip) {
                    this.addFace(va, vb, vc,  this._uva,  this._uvb,  this._uvc, mat);
                    this.addFace(va, vc, vd,  this._uva,  this._uvc,  this._uvd, mat);
                } else {
                    this.addFace(vb, va, vc,  this._uvb,  this._uva,  this._uvc, mat);
                    this.addFace(vc, va, vd,  this._uvc,  this._uva,  this._uvd, mat);
                }
            }
            index +=  this._subdivision + 1;
        }

    }

        private  elevate(v0:Object, v1:Object, increase:number):void
    {
        for (var i:number = 0; i <  this._subdivision; ++i) {
            v0[ this._axis] += increase;
            v1[ this._axis] += increase;
             this._varr.push(new Vertex(v0[LinearExtrude.X_AXIS], v0[LinearExtrude.Y_AXIS], v0[LinearExtrude.Z_AXIS]));
             this._varr2.push(new Vertex(v1[LinearExtrude.X_AXIS], v1[LinearExtrude.Y_AXIS], v1[LinearExtrude.Z_AXIS]));
        }
    }

        private  buildThicknessPoints(prop1:string, prop2:string):any[]
    {
        var anchors:any[] = [];
        var lines:any[] = [];

        for (var i:number = 0; i <  this._aVectors.length - 1; ++i) {

            if ( this._aVectors[i][prop1] == 0 &&  this._aVectors[i][prop2] == 0)
                 this._aVectors[i][prop1] = LinearExtrude.EPS;

            if ( this._aVectors[i + 1][prop2] &&  this._aVectors[i][prop2] ==  this._aVectors[i + 1][prop2])
                 this._aVectors[i + 1][prop2] += LinearExtrude.EPS;

            if ( this._aVectors[i][prop1] &&  this._aVectors[i][prop1] ==  this._aVectors[i + 1][prop1])
                 this._aVectors[i + 1][prop1] += LinearExtrude.EPS;

            anchors.push(this.defineAnchors( this._aVectors[i],  this._aVectors[i + 1], prop1, prop2));
        }

        var totallength:number = anchors.length;
        var pointResult:FourPoints;

        if (totallength > 1) {

            for (i = 0; i < totallength; ++i) {

                if (i < totallength)
                    pointResult = this.definelines(i, anchors[i], anchors[i + 1], lines);
                else
                    pointResult = this.definelines(i, anchors[i], anchors[i - 1], lines);

                if (pointResult != null)
                    lines.push(pointResult);
            }

        } else {

            var fourPoints:FourPoints = new FourPoints();
            var anchorFP:FourPoints = anchors[0];
            fourPoints.pt1 = anchorFP.pt1;
            fourPoints.pt2 = anchorFP.pt2;
            fourPoints.pt3 = anchorFP.pt3;
            fourPoints.pt4 = anchorFP.pt4;
            lines = [fourPoints];
        }

        return lines;
    }

        private  definelines(index:number, point1:FourPoints, point2:FourPoints = null, lines:any[]=null):FourPoints
    {
        var tmppt:any;
        var fourPoints:FourPoints = new FourPoints();


        if (point2 == null) {
            tmppt = lines[index - 1];
            fourPoints.pt1 = tmppt.pt3;
            fourPoints.pt2 = tmppt.pt4;
            fourPoints.pt3 = point1.pt3;
            fourPoints.pt4 = point1.pt4;

            return fourPoints;
        }

        var line1:Line = this.buildObjectLine(point1.pt1.x, point1.pt1.y, point1.pt3.x, point1.pt3.y);
        var line2:Line = this.buildObjectLine(point1.pt2.x, point1.pt2.y, point1.pt4.x, point1.pt4.y);
        var line3:Line = this.buildObjectLine(point2.pt1.x, point2.pt1.y, point2.pt3.x, point2.pt3.y);
        var line4:Line = this.buildObjectLine(point2.pt2.x, point2.pt2.y, point2.pt4.x, point2.pt4.y);

        var cross1:Point = this.lineIntersect(line3, line1);
        var cross2:Point = this.lineIntersect(line2, line4);

        if (cross1 != null && cross2 != null) {

            if (index == 0) {
                fourPoints.pt1 = point1.pt1;
                fourPoints.pt2 = point1.pt2;
                fourPoints.pt3 = cross1;
                fourPoints.pt4 = cross2;

                return fourPoints;
            }

            tmppt = lines[index - 1];
            fourPoints.pt1 = tmppt.pt3;
            fourPoints.pt2 = tmppt.pt4;
            fourPoints.pt3 = cross1;
            fourPoints.pt4 = cross2;

            return fourPoints;

        } else
            return null;
    }

        private  defineAnchors(base:Vector3D, baseEnd:Vector3D, prop1:string, prop2:string):FourPoints
    {
        var angle:number = (Math.atan2(base[prop2] - baseEnd[prop2], base[prop1] - baseEnd[prop1])*180)/Math.PI;
        angle -= 270;
        var angle2:number = angle + 180;

        var fourPoints:FourPoints = new FourPoints();
        fourPoints.pt1 = new Point(base[prop1], base[prop2]);
        fourPoints.pt2 = new Point(base[prop1], base[prop2]);
        fourPoints.pt3 = new Point(baseEnd[prop1], baseEnd[prop2]);
        fourPoints.pt4 = new Point(baseEnd[prop1], baseEnd[prop2]);

        var radius:number =  this._thickness*.5;

        fourPoints.pt1.x = fourPoints.pt1.x + Math.cos(-angle/180*Math.PI)*radius;
        fourPoints.pt1.y = fourPoints.pt1.y + Math.sin(angle/180*Math.PI)*radius;

        fourPoints.pt2.x = fourPoints.pt2.x + Math.cos(-angle2/180*Math.PI)*radius;
        fourPoints.pt2.y = fourPoints.pt2.y + Math.sin(angle2/180*Math.PI)*radius;

        fourPoints.pt3.x = fourPoints.pt3.x + Math.cos(-angle/180*Math.PI)*radius;
        fourPoints.pt3.y = fourPoints.pt3.y + Math.sin(angle/180*Math.PI)*radius;

        fourPoints.pt4.x = fourPoints.pt4.x + Math.cos(-angle2/180*Math.PI)*radius;
        fourPoints.pt4.y = fourPoints.pt4.y + Math.sin(angle2/180*Math.PI)*radius;

        return fourPoints;
    }

        private  buildObjectLine(origX:number, origY:number, endX:number, endY:number):Line
    {
        var line:Line = new Line();
        line.ax = origX;
        line.ay = origY;
        line.bx = endX - origX;
        line.by = endY - origY;

        return line;
    }

        private  lineIntersect(Line1:Line, Line2:Line):Point
    {
        Line1.bx = (Line1.bx == 0)? LinearExtrude.EPS : Line1.bx;
        Line2.bx = (Line2.bx == 0)? LinearExtrude.EPS : Line2.bx;

        var a1:number = Line1.by/Line1.bx;
        var b1:number = Line1.ay - a1*Line1.ax;
        var a2:number = Line2.by/Line2.bx;
        var b2:number = Line2.ay - a2*Line2.ax;
        var nzero:number = ((a1 - a2) == 0)? LinearExtrude.EPS : a1 - a2;
        var ptx:number = ( b2 - b1 )/(nzero);
        var pty:number = a1*ptx + b1;

        if (isFinite(ptx) && isFinite(pty))
            return new Point(ptx, pty);
        else {
            console.log("infinity");
            return null;
        }
    }

        private  initHolders():void
    {
        if (! this._uva) {
             this._uva = new UV(0, 0);
             this._uvb = new UV(0, 0);
             this._uvc = new UV(0, 0);
             this._uvd = new UV(0, 0);
        }

         this._varr = [];
         this._varr2 = [];
         this._uvarr = [];
         this._uvs = [];
         this._vertices = [];
         this._indices = [];

       
             this._subGeometry.autoDeriveVertexNormals = true;
             this._subGeometry.autoDeriveVertexTangents = true;
       
    }

   

        /**
         * Invalidates the geometry, causing it to be rebuilded when requested.
         */
    private  pInvalidateGeometry():void
    {
        if ( this._geomDirty)
            return;
         this._geomDirty = true; // true makes it dirty

    }

    }
}