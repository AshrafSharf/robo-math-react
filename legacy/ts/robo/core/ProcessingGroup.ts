/**
 * Created by rizwan on 3/27/14.
 */
module robo.core {

    import Vector3D = away.geom.Vector3D;
    import Matrix3D = away.geom.Matrix3D;
    import Matrix = away.geom.Matrix;
    import Point = away.geom.Point;
    import PMath = robo.util.PMath;
    import Geometric2DUtil = robo.core.Geometric2DUtil;
    import ProcessingLine2D = robo.core.ProcessingLine2D;
    import ArrayHelper = robosys.lang.ArrayHelper;

    export class ProcessingGroup implements IIntersectable, ITransformable {
        private groupItems: ITransformable[] = [];

        public static TRANSFORMABLE_TYPE: number = 6;
        fillColor:number = -1;

        constructor(groupItems: ITransformable[]) {
            this.expandAndAddGroupItems(groupItems);
        }


        private expandAndAddGroupItems(items: ITransformable[]): void {
            for (var i: number = 0; i < items.length; i++) {
                var item: ITransformable = items[i];

                if (item instanceof ProcessingGroup == true) {
                    this.expandAndAddGroupItems((<ProcessingGroup>item).getGroupItems());
                } else {
                    this.groupItems.push(item);
                }


            }
        }

        public setFillColor(fillColor:number) {
            this.fillColor = fillColor;
        }

        public hasCurrentColor() {
            return this.fillColor!=-1;
        }

        public getFillColor() {
            return this.fillColor;
        }

        public getGroupItems(): ITransformable[] {
            return this.groupItems;
        }

        public intersect(object: IIntersectable): Point[] {
            return [];
        }

        public mergePolyPoints(arrayOfPointArray: any, stepSize: number = 1): void {
            var uniquePoints = this._getUniquePoints();
            arrayOfPointArray.push(uniquePoints);
        }

        public asPolyPoints(arrayOfPointArray: any, stepSize: number = 1): void {
            for(var i:number=0;i<this.groupItems.length;i++)
            {
                (<any>this.groupItems[i]).asPolyPoints(arrayOfPointArray,stepSize);
            }
        }

        _getCollectAllGroupPoints(arrayOfPointArray, stepSize = 1) {
            for (var i: number = 0; i < this.groupItems.length; i++) {
                (<any>this.groupItems[i]).asPolyPoints(arrayOfPointArray, stepSize);
            }
        }


        public getTranslatedObject(translationFucn: Function): IIntersectable {
            var newTransfrmables: ITransformable[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].translatePointForGraphSheetOffset(translationFucn);
            }


            return new ProcessingGroup(newTransfrmables)

        }


        public translatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            var newTransfrmables: ITransformable[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].translatePointForGraphSheetOffset(translationFucn);
            }

            return new ProcessingGroup(newTransfrmables);

        }

        public reverseTranslatePointForGraphSheetOffset(translationFucn: Function): ITransformable {
            var newTransfrmables: ITransformable[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].reverseTranslatePointForGraphSheetOffset(translationFucn);
            }


            return new ProcessingGroup(newTransfrmables);

        }


        public toFillableUIPoints(converter: any, points: Point[]): Point[] // converter is GraphSheet3D
        {
            var uiPoints: Point[] = [];
            for (var i: number = 0; i < points.length; i++) {
                var vect: Vector3D = converter.toUIVector(points[i].x, points[i].y, 0);
                uiPoints.push(new Point(vect.x, vect.z));
            }

            return uiPoints;
        }

        public dilateTransform(scaleValue: number, dilateAbout: Point): ITransformable {
            var newTransfrmables: ITransformable[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].dilateTransform(scaleValue, dilateAbout);
            }


            return new ProcessingGroup(newTransfrmables);
        }

        public reflectTransform(point1: Point, point2: Point, ratio: number): ITransformable {
            var newTransfrmables: ITransformable[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].reflectTransform(point1, point2, ratio);
            }


            return new ProcessingGroup(newTransfrmables);
        }


        public rotateTransform(angleInDegress: number, rotateAbout: Point): ITransformable {
            var newTransfrmables: ITransformable[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].rotateTransform(angleInDegress, rotateAbout);
            }


            return new ProcessingGroup(newTransfrmables);
        }

        public translateTransform(tranValue: Point, transAbout: Point): ITransformable {
            var newTransfrmables: ITransformable[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].translateTransform(tranValue, transAbout);
            }


            return new ProcessingGroup(newTransfrmables);
        }

        public getAsAtomicValues(): number[] {
            var allAtomicValues: number[] = [];

            for (var i: number = 0; i < this.groupItems.length; i++) {
                var groupItemAtomicValues: number[] = this.groupItems[i].getAsAtomicValues();
                for (var j: number = 0; j < groupItemAtomicValues.length; j++) {
                    allAtomicValues[allAtomicValues.length] = groupItemAtomicValues[j];
                }
            }

            return allAtomicValues;
        }

        public getType(): number {
            return ProcessingGroup.TRANSFORMABLE_TYPE;
        }


        public getStartValue(): number[] {

            return this.groupItems[0].getStartValue();
        }

        public getEndValue(): number[] {

            return this.groupItems[0].getEndValue();
        }


        public getLabelPosition(): Point {
            return this.groupItems[0].getLabelPosition();
        }

        _getUniquePoints(stepSize=1) {
            var arrayOfPointArray:any = [];

            // collects points
            this._getCollectAllGroupPoints(arrayOfPointArray,stepSize);

            var allPoints = arrayOfPointArray.flat();

            // remove duplicates
            var filteredPoints = [];
            filteredPoints.push(allPoints[0]);
            for (var i = 1; i < allPoints.length; i++) {
                if (filteredPoints[filteredPoints.length - 1].equals(allPoints[i])) {
                    continue;
                }
                filteredPoints.push(allPoints[i])
            }

            return filteredPoints;
        }


        public positionIndex(index: number): Point {
            var uniquePoints = this._getUniquePoints();
            if (uniquePoints.length < (index)) {
                return null;
            }
            return uniquePoints[index];
        }


        public reverse(): ITransformable {
            return this;
        }

        public projectTransform(point1: Point, point2: Point, ratio: number): ITransformable {
            var newTransfrmables: ITransformable[] = [];
            for (var i: number = 0; i < this.groupItems.length; i++) {
                newTransfrmables[i] = this.groupItems[i].projectTransform(point1, point2, ratio);
            }
            return new ProcessingGroup(newTransfrmables);
        }
    }


}
