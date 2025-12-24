/**
 * StrokeWidthCommand - Animates stroke width of shapes
 *
 * Animates the stroke width of one or more shapes using GSAP.
 * Supports SVG shapes, MathText, 3D objects, TextItems, and TextItemCollections.
 */
import { BaseCommand } from '../BaseCommand.js';
import { ShapeStrokeWidthAdapter } from './ShapeStrokeWidthAdapter.js';

export class StrokeWidthCommand extends BaseCommand {
    /**
     * @param {Array<string>} shapeNames - Variable names of shapes to modify
     * @param {number} width - Target stroke width
     * @param {number} duration - Animation duration in seconds
     */
    constructor(shapeNames, width, duration = 1) {
        super();
        this.shapeNames = shapeNames;
        this.targetWidth = width;
        this.duration = duration;
        this.shapes = [];
        this.adapters = [];
    }

    /**
     * Override setStrokeWidth to prevent ExpressionPipelineService from overwriting targetWidth
     * StrokeWidthCommand uses its own targetWidth from the expression, not from settings
     */
    setStrokeWidth(width) {
        // Intentionally do nothing - strokewidth uses targetWidth from expression
    }

    async doInit() {
        // Look up shapes from registry
        this.shapes = this.shapeNames
            .map(name => this.commandContext.shapeRegistry[name])
            .filter(shape => shape != null);

        // Create adapters for each shape and capture original widths
        this.adapters = this.shapes.map(shape => {
            const adapter = ShapeStrokeWidthAdapter.for(shape);
            adapter.captureOriginal();
            return adapter;
        });
    }

    async play() {
        await this._animate();
        // Ensure final state is at target width
        this._setToTarget();
    }

    /**
     * Animate all adapters
     * @returns {Promise}
     */
    _animate() {
        const promises = this.adapters.map(adapter => {
            return new Promise(resolve => {
                adapter.animateWidth(this.targetWidth, this.duration, resolve);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Set all adapters to target width (used after animation and for directPlay)
     */
    _setToTarget() {
        this.adapters.forEach(adapter => adapter.setWidth(this.targetWidth));
    }

    doDirectPlay() {
        // Instant width change to target
        this._setToTarget();
    }

    async playSingle() {
        // Reset to original width first, then animate to target
        this.adapters.forEach(adapter => adapter.resetToOriginal());
        await this._animate();
        // Ensure final state is at target width
        this._setToTarget();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
