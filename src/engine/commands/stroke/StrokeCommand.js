/**
 * StrokeCommand - Animates stroke color of shapes
 *
 * Animates the stroke color of one or more shapes using GSAP.
 * Supports SVG shapes, MathText, 3D objects, TextItems, and TextItemCollections.
 */
import { BaseCommand } from '../BaseCommand.js';
import { ShapeStrokeAdapter } from './ShapeStrokeAdapter.js';

export class StrokeCommand extends BaseCommand {
    /**
     * @param {Array<string>} shapeNames - Variable names of shapes to modify
     * @param {string} color - Target color (hex or named color)
     * @param {number} opacity - Target stroke opacity (0-1)
     * @param {number} duration - Animation duration in seconds
     */
    constructor(shapeNames, color, opacity = 1, duration = 1) {
        super();
        this.shapeNames = shapeNames;
        this.targetColor = color;
        this.targetOpacity = opacity;
        this.duration = duration;
        this.shapes = [];
        this.adapters = [];
    }

    /**
     * Override setColor to prevent ExpressionPipelineService from overwriting targetColor
     * StrokeCommand uses its own targetColor from the expression, not from settings
     */
    setColor(color) {
        // Intentionally do nothing - stroke uses targetColor from expression
    }

    async doInit() {
        // Look up shapes from registry
        this.shapes = this.shapeNames
            .map(name => this.commandContext.shapeRegistry[name])
            .filter(shape => shape != null);

        // Create adapters for each shape and capture original colors
        this.adapters = this.shapes.map(shape => {
            const adapter = ShapeStrokeAdapter.for(shape);
            adapter.captureOriginal();
            return adapter;
        });
    }

    async play() {
        await this._animate();
        // Ensure final state is at target color
        this._setToTarget();
    }

    /**
     * Animate all adapters
     * @returns {Promise}
     */
    _animate() {
        const promises = this.adapters.map(adapter => {
            return new Promise(resolve => {
                adapter.animateColor(this.targetColor, this.targetOpacity, this.duration, resolve);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Set all adapters to target color (used after animation and for directPlay)
     */
    _setToTarget() {
        this.adapters.forEach(adapter => adapter.setColor(this.targetColor, this.targetOpacity));
    }

    doDirectPlay() {
        // Instant color change to target
        this._setToTarget();
    }

    async playSingle() {
        // Reset to original color first, then animate to target
        this.adapters.forEach(adapter => adapter.resetToOriginal());
        await this._animate();
        // Ensure final state is at target color
        this._setToTarget();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
