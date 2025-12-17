import { GeomPrimitiveShape } from "./geom-primitive-shape.js";
import { CirclePathGenerator } from "../path-generators/circle-path-generator.js";
import { TweenablePath } from "../animator/tweenable-path.js";

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

    generatePathForCoordinates(coords) {
        const cx = this.graphsheet2d.toViewX(coords[0]);
        const cy = this.graphsheet2d.toViewY(coords[1]);
        const r = this.pointRadius;
        return new CirclePathGenerator().generate({ cx, cy, r });
    }

    setTweenSpeed(tweenablePath) {
        tweenablePath.setFast();
    }

    /**
     * Custom animation for points:
     * 1. Pen moves to location
     * 2. Pen draws circle stroke
     * 3. Fill appears (while pen is still at the point)
     * 4. Pen moves away
     */
    renderWithAnimation(penStartPoint, completionHandler) {
        try {
            // Save original fill color
            const originalFill = this.styleObj.fill;

            const shapeTweenCompletionhandler = () => {
                // Enable stroke after animation completes
                this.enableStroke();
                completionHandler();
            };

            // Restore fill AFTER stroke is drawn but BEFORE pen moves away
            const preCompletionHandler = () => {
                this.primitiveShape.attr('fill', originalFill);
            };

            const tweenablePath = new TweenablePath(this.primitiveShape.node);

            // Hide fill during animation (only show stroke)
            this.primitiveShape.attr('fill', 'transparent');
            this.primitiveShape.show();
            this.disableStroke();
            this.setTweenSpeed(tweenablePath);

            // Animate with pen movement and stroke drawing
            tweenablePath.tween(
                shapeTweenCompletionhandler,
                penStartPoint,
                preCompletionHandler, // Restore fill before pen moves away
                null  // No text trace point
            );
        } catch (e) {
            console.error('Point animation error:', e);
            this.primitiveShape.show();
            completionHandler();
        }
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