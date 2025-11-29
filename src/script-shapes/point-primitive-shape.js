import { GeomPrimitiveShape } from "./geom-primitive-shape.js";
import { CirclePathGenerator } from "../path-generators/circle-path-generator.js";

export class PointPrimitiveShape extends GeomPrimitiveShape {

    constructor(modelCoordinates, pointRadius) {
        super(modelCoordinates);
        this.pointRadius = pointRadius;
        // Points should be filled, not transparent
        this.styleObj.fill = this.styleObj.stroke || 'red';
    }

    generatePath() {
        const cx = this.graphsheet2d.toViewX(this.modelCoordinates[0]);
        const cy = this.graphsheet2d.toViewY(this.modelCoordinates[1]);
        const r = this.pointRadius;
        const pathStr = new CirclePathGenerator().generate({cx: cx, cy: cy, r: r});
        this.primitiveShape.attr('d', pathStr);
    }

    getShapeType() {
        return 'point';
    }

    setTweenSpeed(tweenablePath) {
        tweenablePath.setFast();
    }

    /**
     * Get the default rotation point for a point
     * For points, this is the origin (0, 0)
     * @returns {Object} Origin {x: 0, y: 0} in model coordinates
     */
    getRotationCenter() {
        // Points rotate about the origin
        return { x: 0, y: 0 };
    }
}