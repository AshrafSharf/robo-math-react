/**
 * Created by MohammedAzeem on 3/19/14.
 */
module robo.virtualobjects
{
    import Point3D = robo.core.Point3D;
    import GeometryPart = robo.geom.GeometryPart;
    import ColorConstants = robo.util.ColorConstants;

    export class CompassEdge
    {

        private _edgeStart:Point3D;
        private _edgeEnd:Point3D;

        private _edgeRadius:number=1;
        private _edgeHeight:number=4;

        private _compassEdgeMainPart:GeometryPart;
        private _compassEdgeBottomPart:GeometryPart;

        private _compass:Compass3D;

        private _alignedEdgeStart:Point3D;
        private _alignedEdgeEnd:Point3D;
        private _isLHSEdge:boolean;

        constructor(compass:Compass3D,  edgeStart:Point3D, edgeRadius:number, edgeHeight:number, isLHSEdge:boolean)
        {
            this._compass = compass;
            this._edgeStart = edgeStart;
            this._edgeRadius = edgeRadius;
            this._edgeHeight = edgeHeight;
            this._isLHSEdge = isLHSEdge;

            this._edgeEnd = edgeStart.moveFront(this._edgeHeight);

            this.alignedEdgeStart = edgeStart.copy();
            this.alignedEdgeEnd = this._edgeEnd.copy();

            this.constructEdge();

        }

        private  constructEdge()
        {
            var mainPartEnd:Point3D = this._edgeEnd.lerp(this._edgeStart,0.2);
            this._compassEdgeMainPart = this._compass.compassGroup.cylinder(this._edgeStart,mainPartEnd,this._edgeRadius);

            var edgeBottomColor = ColorConstants.orange;
            if(this._isLHSEdge==false)
                edgeBottomColor = ColorConstants.white;

            this._compassEdgeBottomPart = this._compass.compassGroup.cone(mainPartEnd,this._edgeEnd,this._edgeRadius);
            this._compassEdgeBottomPart.color(edgeBottomColor,1);
        }



        public  expandAndRotate( expandInDegress:number, rotationInDegress:number)
        {
            var expansionAxis:Point3D = new Point3D(0,1,0); // expand is about y axis

            //here consider this._compassOrigin as pivot point for expansion
            var newCompassOrigin:Point3D = this._compass.calculateTopOrigin(expandInDegress);

            if(this._isLHSEdge==true)
                this._alignedEdgeStart = newCompassOrigin.moveLeft(this._edgeRadius);
            else
                this._alignedEdgeStart = newCompassOrigin.moveRight(this._edgeRadius);

            this.alignedEdgeEnd = this.alignedEdgeStart.moveFront(this._edgeHeight);

            this.alignedEdgeStart = this.alignedEdgeStart.rotate(expandInDegress,expansionAxis,newCompassOrigin);
            this.alignedEdgeEnd = this.alignedEdgeEnd.rotate(expandInDegress,expansionAxis,newCompassOrigin);

            var rotationAxis:Point3D = new Point3D(0,0,1); // rotate is about z axis

            var rotationPivot:Point3D  = this._compass.calculateRotationPivot();
            this.alignedEdgeStart = this.alignedEdgeStart.rotate(rotationInDegress, rotationAxis,rotationPivot);
            this.alignedEdgeEnd = this.alignedEdgeEnd.rotate(rotationInDegress,rotationAxis,rotationPivot);

            var mainPartEnd:Point3D = this.alignedEdgeEnd.lerp(this.alignedEdgeStart,0.2);
            this._compassEdgeMainPart.alignTo(this.alignedEdgeStart,mainPartEnd);
            this._compassEdgeBottomPart.alignTo(mainPartEnd,this.alignedEdgeEnd);
        }



        public get alignedEdgeStart():Point3D
        {
            return this._alignedEdgeStart;
        }

        public set alignedEdgeStart(value:Point3D)
        {
            this._alignedEdgeStart = value;
        }

        public get alignedEdgeEnd():Point3D
        {
            return this._alignedEdgeEnd;
        }

        public set alignedEdgeEnd(value:Point3D)
        {
            this._alignedEdgeEnd = value;
        }

        public get compassEdgeMainPart():GeometryPart
        {
            return this._compassEdgeMainPart;
        }

        public set compassEdgeMainPart(value:GeometryPart)
        {
            this._compassEdgeMainPart = value;
        }

        public get compassEdgeBottomPart():GeometryPart
        {
            return this._compassEdgeBottomPart;
        }

        public set compassEdgeBottomPart(value:GeometryPart)
        {
            this._compassEdgeBottomPart = value;
        }


        public moveTo(newEdgeStart:Point3D)
        {
            this._edgeStart = newEdgeStart.copy();
            this._edgeEnd = this._edgeStart.moveFront(this._edgeHeight);

            this.alignedEdgeStart = this._edgeStart.copy();
            this.alignedEdgeEnd = this._edgeEnd.copy();


            var mainPartEnd:Point3D = this._edgeEnd.lerp(this._edgeStart,0.2);
            this._compassEdgeMainPart.alignTo(this._edgeStart,mainPartEnd);
            this._compassEdgeBottomPart.alignTo(mainPartEnd,this._edgeEnd);

        }

        public showOrHide(ratio:number=1)
        {

            this._compassEdgeBottomPart.setTransparency(ratio);
            this._compassEdgeMainPart.setTransparency(ratio);


        }


    }
}