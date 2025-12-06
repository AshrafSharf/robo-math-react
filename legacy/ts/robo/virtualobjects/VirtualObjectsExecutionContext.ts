/**
 * Created by Mathdisk on 3/21/14.
 */
///<reference path="../../../libs/jquery.d.ts"/>
///<reference path="../../../libs/away3d.next.d.ts" />
///<reference path="../_definitions.ts"/>


module robo.virtualobjects {

    import Mesh = away.entities.Mesh;
    import StringUtil = robo.util.StringUtil;
    import ColorMaterial = away.materials.ColorMaterial;
    import SegmentSet = away.entities.SegmentSet;
    import Segment = away.base.Segment;
    import ColorTransform = away.geom.ColorTransform;
    import WireFrameObjects3D = robo.extrusions.WireFrameObjects3D;
    import Point3D = robo.core.Point3D;
    import ColorConstants = robo.util.ColorConstants;
    import Sphere = robo.primitives.Sphere;
    import DisplayObject = away.base.DisplayObject;
    import GeometryPart = robo.geom.GeometryPart;
    import PMath = robo.util.PMath;


    export class VirtualObjectsExecutionContext {

        static OVERRIDEN_STROKE: string = 'OVERRIDEN_STROKE';

        private expressionRefId: number;
        private outputMeshList: Mesh[] = [];
        private labelMesh: Mesh = null;
        private labelName: string;
        private indicatorPosition: Point3D;
        private _labelOffsetXPos: number = 0;
        private _labelOffsetYPos: number = 0;
        private _labelVisible: boolean = true;


        private displayAlpha: number;
        private visibileValue: boolean = true;

        private maxAlphaValue: number = 1;
        private highLightOriginalColorMap: any = {};
        DEFAULT_THICKNESS: number = 1;
        HIGHLIGHT_THICKNESS: number = 2;

        constructor(expressionRefId: number, maxAlphaValue: number = 1) {

            this.expressionRefId = expressionRefId;
            this.maxAlphaValue = maxAlphaValue;


        }

        public getMaxAlphaValue(): number {
            return this.maxAlphaValue;
        }

        public setMaxAlphaValue(maxAlphaValue: number): void {
            this.maxAlphaValue = maxAlphaValue;

        }

        public get labelVisible(): boolean {

            return this._labelVisible;
        }


        public set labelVisible(value: boolean) {

            this._labelVisible = value;
        }

        public get labelOffsetXPos(): number {

            return this._labelOffsetXPos;
        }

        public set labelOffsetXPos(value: number) {

            this._labelOffsetXPos = value;
        }

        public get labelOffsetYPos(): number {

            return this._labelOffsetYPos;
        }

        public set labelOffsetYPos(value: number) {

            this._labelOffsetYPos = value;
        }

        public clearOutputMeshReferences(): void {
            this.outputMeshList = [];
            this.labelMesh = null;
        }

        /**
         * The out put Mesh is set by the respective Virtual Object
         * @param outputMesh
         */
        public addOutputMesh(outputMesh: Mesh): void {
            if (outputMesh != null)
                this.outputMeshList.push(outputMesh);
        }

        public getOutputMeshList(): Mesh[] {
            return this.outputMeshList;
        }


        setLabelMesh(textMesh: Mesh): void {
            this.labelMesh = textMesh;
        }

        getLabelMesh(): Mesh {
            return this.labelMesh;
        }


        public getLabelName(): string {
            return this.labelName;
        }

        public setLabelName(labelName: string): void {
            this.labelName = labelName;
        }

        public hasSameLabel(otherLabelName: string): boolean {
            if (!StringUtil.isEmpty(this.getLabelName()) && !StringUtil.isEmpty(otherLabelName)) {
                if (this.getLabelName() == otherLabelName)
                    return true;

                return false;
            }
            return false;
        }

        public getExpressionId(): number {
            return this.expressionRefId;
        }


        public fadeOut(alpha: number, color: number): void {
            for (var i: number = 0; i < this.outputMeshList.length; i++) {
                var outputMesh: Mesh = this.outputMeshList[i];

                if (outputMesh) {
                    this.recursiveFade(outputMesh, alpha, color);


                }
            }

            if (this.labelMesh) {
                (<ColorMaterial>this.labelMesh.material).alpha = alpha;
                (<ColorMaterial>this.labelMesh.material).color = color;
            }
        }


        public getPrimaryColor(): number {
            if (this.outputMeshList.length == 0)
                return 0;

            var displayObject: DisplayObject = <DisplayObject>this.outputMeshList[0];

            displayObject = GeometryPart.getTopLevelObject(displayObject);

            var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(displayObject);

            return displayColor;
        }


        private recursiveFade(displayObject: DisplayObject, alpha: number, color: number, thickness: number = 1): void {
            if (displayObject instanceof SegmentSet) {
                var innerSegmentSet: SegmentSet = <SegmentSet>displayObject;//segment material's alpha not working
                var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(displayObject);
                WireFrameObjects3D.fadeoutByThickness(innerSegmentSet, alpha, displayColor, thickness);
                return;
            }

            if (displayObject instanceof Mesh) {
                var mesh: Mesh = <Mesh>displayObject;

                if (mesh.numChildren >= 1) {
                    for (var i: number = 0; i < mesh.numChildren; i++) {
                        this.recursiveFade(mesh.getChildAt(i), alpha, color, thickness);
                    }
                } else {
                    (<ColorMaterial>mesh.material).alpha = alpha;

                }
            }
        }


        private recursiveHighlight(displayObject: DisplayObject, thickness: number): void {

            if (displayObject instanceof SegmentSet) {
                var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(displayObject);
                var highlightColor: number = ColorConstants.brighter(displayColor);//0x10E8CE;

                this.highLightOriginalColorMap[highlightColor + ""] = displayColor;

                var innerSegmentSet: SegmentSet = <SegmentSet>displayObject;//segment material's alpha not working
                WireFrameObjects3D.fadeoutByThickness(innerSegmentSet, 1, highlightColor, thickness);
                return;
            }
            if (displayObject instanceof Sphere) {
                var sphere: Sphere = <Sphere>displayObject;

                var newRadius: number = sphere.radius + 3;

                sphere.radius = newRadius;

                return;
            }

            if (displayObject instanceof Mesh) {
                var mesh: Mesh = <Mesh>displayObject;

                if (mesh.numChildren >= 1) {
                    for (var i: number = 0; i < mesh.numChildren; i++) {
                        this.recursiveHighlight(mesh.getChildAt(i), thickness);
                    }
                } else {
                    var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(displayObject);
                    var highlightColor: number = ColorConstants.brighter(displayColor);//0x10E8CE;

                    this.highLightOriginalColorMap[highlightColor + ""] = displayColor;

                    (<ColorMaterial>mesh.material).color = highlightColor;
                }
            }
        }

        public getIndicatorPosition(): Point3D {
            return this.indicatorPosition;
        }

        public setIndicatorPosition(indicatorPosition: Point3D): void {
            this.indicatorPosition = indicatorPosition;
        }


        public showHighlight(): void {
            this.visibileValue = true;
            if (this.outputMeshList.length > 0) {
                var outputMesh: Mesh = this.outputMeshList[0];
                this.visibileValue = outputMesh.visible;
            }

            for (var i: number = 0; i < this.outputMeshList.length; i++) {
                var outputMesh: Mesh = this.outputMeshList[i];
                if (outputMesh[VirtualObjectsExecutionContext.OVERRIDEN_STROKE]) {
                    continue;
                }
                this.recursiveHighlight(outputMesh, this.HIGHLIGHT_THICKNESS);// Increase the thickness
            }


            if (this.labelMesh != null && this.labelMesh.material != null) {
                if (!this.labelMesh[VirtualObjectsExecutionContext.OVERRIDEN_STROKE]) {
                    var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(<DisplayObject>this.labelMesh);
                    var highlightColor: number = ColorConstants.brighter(displayColor);//0x10E8CE;
                    this.highLightOriginalColorMap[highlightColor + ""] = displayColor;
                    (<ColorMaterial>this.labelMesh.material).color = highlightColor;
                }
            }
        }

        applyOverriddenStroke() {
            for (var i: number = 0; i < this.outputMeshList.length; i++) {
                var outputMesh: Mesh = this.outputMeshList[i];
                outputMesh[VirtualObjectsExecutionContext.OVERRIDEN_STROKE] = true;
            }
            if (this.labelMesh != null && this.labelMesh.material != null) {
                this.labelMesh[VirtualObjectsExecutionContext.OVERRIDEN_STROKE] = true;
            }
        }

        applyThickness(thickness: number) {
            for (var i: number = 0; i < this.outputMeshList.length; i++) {
                var outputMesh: Mesh = this.outputMeshList[i];

                for (var j: number = 0; j < outputMesh.numChildren; j++) {
                    var segmentMesh = outputMesh.getChildAt(j);
                    if (segmentMesh instanceof SegmentSet) {
                        var innerSegmentSet: SegmentSet = <SegmentSet><any>segmentMesh;
                        WireFrameObjects3D.applyThickness(innerSegmentSet, thickness);
                    } else {
                        if (segmentMesh['numChildren'] > 0) {
                            var child = ((<any>segmentMesh).getChildAt(0));
                            if (child instanceof SegmentSet) {
                                var childSegmentSet: SegmentSet = <SegmentSet><any>child;
                                WireFrameObjects3D.applyThickness(childSegmentSet, thickness);
                            }

                        }
                    }

                    if (segmentMesh instanceof SegmentSet) {
                        var innerSegmentSet: SegmentSet = <SegmentSet><any>segmentMesh;
                        WireFrameObjects3D.applyThickness(innerSegmentSet, thickness);
                    }
                }
            }
        }

        private recursiveDismissHighlight(displayObject: DisplayObject, thickness: number): void {

            if (displayObject instanceof SegmentSet) {
                var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(displayObject);

                var originalColor: number = this.highLightOriginalColorMap[displayColor + ""];

                if (!originalColor) {
                    originalColor = ColorConstants.darker(displayColor);//0x10E8CE;

                }

                var innerSegmentSet: SegmentSet = <SegmentSet>displayObject;//segment material's alpha not working
                WireFrameObjects3D.fadeoutByThickness(innerSegmentSet, 1, originalColor, thickness);
                return;
            }

            if (displayObject instanceof Sphere) {


                var sphere: Sphere = <Sphere>displayObject;

                var newRadius: number = sphere.radius - 3;

                sphere.radius = newRadius;

                return;
            }

            if (displayObject instanceof Mesh) {
                var mesh: Mesh = <Mesh>displayObject;

                if (mesh.numChildren >= 1) {
                    for (var i: number = 0; i < mesh.numChildren; i++) {
                        this.recursiveDismissHighlight(mesh.getChildAt(i), thickness);
                    }
                } else {
                    var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(displayObject);

                    if (PMath.isNaN(displayColor) == false) {

                        var originalColor: number = this.highLightOriginalColorMap[displayColor + ""];

                        if (!originalColor) {
                            originalColor = ColorConstants.darker(displayColor);//0x10E8CE;

                        }
                        (<ColorMaterial>mesh.material).color = originalColor;

                    }

                }
            }
        }


        public dismissHighlight(): void {
            for (var i: number = 0; i < this.outputMeshList.length; i++) {
                var outputMesh: Mesh = this.outputMeshList[i];
                if (outputMesh[VirtualObjectsExecutionContext.OVERRIDEN_STROKE]) {
                    continue;
                }
                this.recursiveDismissHighlight(outputMesh, this.DEFAULT_THICKNESS);
            }

            if (this.labelMesh != null && this.labelMesh.material != null) {

                var displayColor: number = WireFrameObjects3D.getDisplayObjectColor(<DisplayObject>this.labelMesh);
                var originalColor: number = this.highLightOriginalColorMap[displayColor + ""];

                if (!originalColor) {
                    originalColor = ColorConstants.darker(displayColor);//0x10E8CE;

                }
                (<ColorMaterial>this.labelMesh.material).color = originalColor;

            }


        }


    }
}
