/**
 * Created by Mathdisk on 2/24/14.
 */

///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>

module robo.geom {

    //import all the external objects like this, typescript or javascript doesnt have concept called file or folder
    // so dont assume like as3 or java and forget to import the dependent class in the same folder

    import Point3D = robo.core.Point3D;
    import RotationInfo=robo.core.RotationInfo;
    import Geometric3DUtil = robo.core.Geometric3DUtil;
    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Mesh = away.entities.Mesh;
    import ObjectContainer3D = away.containers.DisplayObjectContainer;
    import MaterialBase = away.materials.MaterialBase;
    import ColorMaterial = away.materials.ColorMaterial;
    import TextureMaterial = away.materials.TextureMaterial;
    import Geometry = away.base.Geometry;
    import Graphsheet3D=robo.geom.GraphSheet3D;
    import UI3DScript = robo.geom.UI3DScript;
    import ImageTexture = away.textures.ImageTexture;
    import BitmapData     = away.base.BitmapData;
    import BitmapTexture = away.textures.BitmapTexture;
    import DisplayObject = away.base.DisplayObject;
    import SegmentSet = away.entities.SegmentSet;


    // GeometryPart doesnt need explict reference to GeometeryGroup as it is listed below the group class in definition.ts

    export class GeometryPart {

        public part:Mesh;
        originalUIPosition:Vector3D;
        private graphSheet3D:Graphsheet3D; // this graphSheet is used only for doing some UI to model conversion all the logic should happen only through Ui3DScript
        private ui3DScript:UI3DScript; // This is the canvas equivalent for as3 classes



        constructor(ui3DScript:UI3DScript, part:Mesh) {

            this.ui3DScript = ui3DScript;
            this.part = part;
            this.graphSheet3D = ui3DScript.graphSheet3D;
            this.originalUIPosition = new Vector3D(this.part.x, this.part.y, this.part.z);
        }

        public  alignTo(startPt:Point3D, endPt:Point3D):void
        {
            //now convert everything to UI
            var startPtVect:Vector3D = this.toUIVector(startPt);
            var endPtVect:Vector3D = this.toUIVector(endPt);
            var rotationInfo:RotationInfo = Geometric3DUtil.findRotationInfo(Point3D.fromVector3D(startPtVect), Point3D.fromVector3D(endPtVect));
            var transformationMatrix:Matrix3D = new Matrix3D();

            transformationMatrix.appendRotation(rotationInfo.degree, rotationInfo.axis.toVector3D());//rotate about
            transformationMatrix.appendTranslation(startPtVect.x, startPtVect.y, startPtVect.z);

            this.part._iMatrix3D = transformationMatrix;
            this.originalUIPosition = new Vector3D(this.part.x, this.part.y, this.part.z);
        }


        public  set position(point3D:Point3D)
        {
            var newUIPos:Vector3D = this.toUIVector(point3D);
            this.part.x = newUIPos.x;
            this.part.y = newUIPos.y;
            this.part.z = newUIPos.z;
        }

        public static partUIPosition(mesh:Mesh):Vector3D
        {
            return new Vector3D(mesh.x, mesh.y, mesh.z);
        }


        public  get visible():boolean
        {
            return this.part.visible;
        }


        public set visible(val:boolean)
        {
            this.part.visible = val;
        }

        // just helper methods used by roll,move and position functions
        toUIVector(pt:Point3D):Vector3D
        {
            return this.graphSheet3D.toUIVector(pt.x, pt.y, pt.z);
        }

        toUILength(len:number):number
        {
            return this.graphSheet3D.toUILength(len);
        }


        /**
         * The x,y,z should be interepreted based on the coordinte system
         * This method doesnt convert, simply returns the mapping
         */
        toUIMappedPosition(directionvect:Vector3D):Vector3D
        {
            return this.graphSheet3D.toUIMappedPosition(directionvect);
        }


        public  copy(startPt:Point3D = null, endPt:Point3D = null):GeometryPart {

            var clonedMaterial:MaterialBase = GeometryGroup.cloneMaterial(this.graphSheet3D, this.part);
            var clonedGeometry:Geometry = this.part.geometry.clone();
            clonedGeometry.applyTransformation(this.part._iMatrix3D.clone());


            var clonedMesh:Mesh = new Mesh(clonedGeometry, clonedMaterial);

            clonedMesh.pivotPoint = this.part.pivotPoint.clone();
            clonedMesh.partition = this.part.partition;


            this.part.parent.addChild(clonedMesh);

            var newGeometryPart:GeometryPart = new GeometryPart(this.ui3DScript, clonedMesh);
            if (startPt != null && endPt != null) {
                newGeometryPart.alignTo(startPt, endPt);
            }
            return newGeometryPart;
        }


        /**
         * returns in model
         */
        public get position():Point3D {

            return this.graphSheet3D.toModelPoint3DByMapper(this.getPositionAsPoint3D());
        }

        //dont use this method directtly because this returns in UI coordinates
        private getPositionAsPoint3D():Point3D
        {
            return new Point3D(this.part.x, this.part.y, this.part.z);
        }


        public transform(matrix3D:Matrix3D):void
        {
            this.part._iMatrix3D = matrix3D;
        }

        public pivot(pt:Point3D):void
        {
            var uiPivot:Vector3D = this.toUIVector(pt);
            this.part.pivotPoint = uiPivot;
        }

        public getPivot():Point3D {

            var uiPivot:Vector3D = this.part.pivotPoint;
            return this.graphSheet3D.toModel3DPoint(uiPivot.x, uiPivot.y, uiPivot.z);
        }


        public color(colorVal:number, alpha:number):void
        {
            if(this.part.material instanceof ColorMaterial)
            {
                (<ColorMaterial>this.part.material).color = colorVal;
                (<ColorMaterial>this.part.material).alpha = alpha;
            }
        }


        /**
         * Moves the 3d object forwards along it's local z axis
         * @param    distance    The length of the movement
         */
        public  moveForward(distance:number):void
        {
            var uiDistance:number = this.toUILength(distance);
            this.part.z = this.originalUIPosition.z + uiDistance;
        }


        /**
         * Moves the 3d object backwards along it's local z axis
         * @param    distance    The length of the movement
         */
        public    moveBackward(distance:number):void {
            var uiDistance:number = this.toUILength(distance);
            this.part.z = this.originalUIPosition.z - uiDistance;
        }


        /**
         * Moves the 3d object backwards along it's local x axis
         * @param    distance    The length of the movement
         */
        public  moveLeft(distance:number):void {
            var uiDistance:number = this.toUILength(distance);

            this.part.x = this.originalUIPosition.x - uiDistance;
        }


        /**
         * Moves the 3d object forwards along it's local x axis
         * @param    distance    The length of the movement
         */
        public moveRight(distance:number):void {

            var uiDistance:number = this.toUILength(distance);
            this.part.x = this.originalUIPosition.x + uiDistance;
        }


        /**
         * Moves the 3d object forwards along it's local y axis
         * @param    distance    The length of the movement
         */
        public  moveUp(distance:number):void {
            var uiDistance:number = this.toUILength(distance);
            this.part.y = this.originalUIPosition.y + uiDistance;
        }


        /**
         * Moves the 3d object backwards along it's local y axis
         * @param    distance    The length of the movement
         */
        public  moveDown(distance:number):void {
            var uiDistance:number = this.toUILength(distance);
            this.part.y = this.originalUIPosition.y - uiDistance;
        }


        /**
         * Rotates the 3d object around it's local x-axis
         * @param    angle The amount of rotation in degrees
         */
        public  pitch(angle:number):void {
            this.part.rotationX = 0; // cancel the previous rotation
            this.part.pitch(angle);
        }


        /**
         * Rotates the 3d object around it's local y-axis
         * @param    angle        The amount of rotation in degrees
         */
        public  yaw(angle:number):void {
            this.part.rotationY = 0; // cancel the previous rotation
            this.part.yaw(angle);

        }


        /**
         * Rotates the 3d object around it's local z-axis
         * @param    angle        The amount of rotation in degrees
         */
        public roll(angle:number):void {
            this.part.rotationZ = 0; // cancel the previous rotation
            this.part.roll(angle);
        }


        public  get  currentYaw():number {
            return this.part.rotationY;
        }


        public  get  currentRoll():number {
            return this.part.rotationZ;
        }


        public  get  currentPitch():number {
            return this.part.rotationX;
        }


        /**
         * angle in degress, this doesnt cancel the previous Pitch
         */
        public relativePitch(angle:number):void {
            this.part.pitch(angle);
        }


        public relativeRoll(angle:number):void {

            this.part.roll(angle);
        }

        /**
         * CurrentYaw = previusYaw+angle
         */
        public  relativeYaw(angle:number):void {
            this.part.yaw(angle);
        }

        public resetYaw():void {
            this.part.rotationY = 0;
        }


        public  resetRoll():void {
            this.part.rotationZ = 0;
        }

        public resetPitch():void {
            this.part.rotationX = 0;

        }


        /**
         * Dont directly expose this method, it is invke from group
         */
        public remove(dispose:boolean = true):void {

            if (this.part == null) {
                return;
            }

            if (this.part.parent == null) {
                return;
            }

            this.part.parent.removeChild(this.part);

            if(dispose == true)
            {
                this.part.dispose();

                if (this.part.material != null) {
                    GeometryGroup.disposeMaterial(this.part.material);
                }
                this.part = null;
            }
        }

        public static  getMappedAxis(givenAxis:string):string {
            var map:{
            } = {};

            givenAxis = givenAxis.toUpperCase();

            map["Y"] = 'x';
            map["Z"] = 'y';
            map["X"] = 'z';

            return map[givenAxis];
        }

        public setPosition(point3D:Point3D):void
        {
            var newUIPos:Vector3D = this.toUIVector(point3D);

            this.part.x = newUIPos.x;
            this.part.y = newUIPos.y;
            this.part.z = newUIPos.z;
        }


        public setTransparency(alpha:number):void
        {
           if(this.part.material instanceof ColorMaterial)
           {
                (<ColorMaterial>this.part.material).alpha = alpha;
           }

            if(this.part.material instanceof TextureMaterial)
            {
                (<TextureMaterial>this.part.material).alpha = alpha;
            }
        }

        public attachImage(imageBitmapData:BitmapData):void
        {
            if(this.part.material instanceof TextureMaterial)
            {
                (<TextureMaterial>this.part.material).dispose();
                this.part.material = null;
            }

            var newTextureMaterial:TextureMaterial  = new TextureMaterial(new BitmapTexture(imageBitmapData));
            newTextureMaterial.mipmap=true;
            newTextureMaterial.smooth=true;

            this.part.material = newTextureMaterial;
            this.part.material.smooth=true;
            var clonedGeometry:Geometry = this.part.geometry.clone();
            clonedGeometry.convertToSeparateBuffers();
            this.part.geometry = clonedGeometry;
        }

        /**
         * returns array of Numbers ranging from 0 to 1
         */
        public getUVData():number[]
        {
            var geometry:Geometry = this.part.geometry;

            var uvData:number[] = geometry.subGeometries[0].UVData;

            if(uvData==null || uvData.length==0)
            {
                uvData = [];

                var numbVertices:number = geometry.subGeometries[0].numVertices;

                for(var i:number=0;i<numbVertices;i++)
                {
                    uvData.push(0,1);// 2 entry for each vertex
                }
            }

            var uvArray = [];
            for(var elem in uvData) {
                 uvArray.push(elem);
            }
            return uvArray;
        }

        public updateUVData(uvPoints:number[]):void
        {
            if(uvPoints==null)
            {
                throw new Error("UV Array is Null");
            }

            var numbVertices:number = this.part.geometry.subGeometries[0].numVertices;

            if(uvPoints.length != numbVertices*2)
            {
               // throw new Error("UV Error, For each vertex there must be 2 entries, the part has "+numbVertices+" vertices so "+numbVertices*2+" UV values must be supplied");
            }

            var uvData:number[] = this.part.geometry.subGeometries[0].UVData;

            if(uvData==null || uvData.length==0)
            {
                uvData = [];
            }

            for(var i:number=0;i<uvPoints.length;i++)
            {
                uvData[i]=uvPoints[i];
            }

            this.part.geometry.subGeometries[0].UVData=uvData;
        }



        public clearRotation():void
        {
            this.part.rotationX=0;
            this.part.rotationY=0;
            this.part.rotationZ=0;
        }


        public requiresInstancemanagement():Boolean
        {
           return  GeometryPart.isSegmentSet(this.part);
        }

        public static isSegmentSet(displayObject:DisplayObject):Boolean
        {
            var topLevelObject:DisplayObject = GeometryPart.getTopLevelObject(displayObject);

            if(topLevelObject instanceof SegmentSet)
            {
                return true;
            }


            return false;
        }


        public static getTopLevelObject(displayObject:DisplayObject):DisplayObject
        {
            if(displayObject instanceof SegmentSet )
            {
                return displayObject;
            }

            if(displayObject instanceof Mesh)
            {
                var mesh:Mesh = <Mesh>displayObject;

                if(mesh.numChildren>=1)
                {
                    return this.getTopLevelObject(mesh.getChildAt(0));
                }


                if(mesh.numChildren==0)
                {
                    return mesh;
                }

            }

            return displayObject;
        }


    }
}




