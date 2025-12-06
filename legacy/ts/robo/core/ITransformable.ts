
///<reference path="../../../libs/Away3D.next.d.ts" />
///<reference path="../_definitions.ts"/>
module robo.core {

    import Point = away.geom.Point;



    export interface ITransformable {

        dilateTransform(scaleValue:number,dilateAbout:Point):ITransformable;
        reflectTransform(point1:Point,point2:Point,ratio:number):ITransformable;
        rotateTransform(angleInDegress:number, rotateAbout:Point):ITransformable;
        translateTransform(tranValue:Point, tranAbout:Point):ITransformable;
        projectTransform(point1:Point,point2:Point,ratio:number):ITransformable;
        getAsAtomicValues():number[];
        translatePointForGraphSheetOffset(transformaterFunction:Function):ITransformable;
        reverseTranslatePointForGraphSheetOffset(transformaterFunction:Function):ITransformable;
        getType():number;// 1 for Point,2 for line, 3 for arc,4 for polygon
        getStartValue():number[];
        getEndValue():number[];
        getLabelPosition():Point;
        positionIndex(index:number):Point;
        reverse():ITransformable;

    }
}