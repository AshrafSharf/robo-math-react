/**
 * SizeCommand - Scales containers (g2d, mathtext, g3d) by width/height ratios
 *
 * Animates the scale using GSAP. All components scale in parallel.
 * Ratios: 0.5 = half size, 1 = no change, 2 = double size
 */
import { BaseCommand } from '../BaseCommand.js';
import { ShapeSizeAdapter } from './ShapeSizeAdapter.js';

export class SizeCommand extends BaseCommand {
    /**
     * @param {Array<string>} shapeNames - Variable names of shapes to scale
     * @param {number} widthRatio - Width scale ratio (0.5 = half, 2 = double)
     * @param {number} heightRatio - Height scale ratio (0.5 = half, 2 = double)
     * @param {number} duration - Animation duration in seconds
     */
    constructor(shapeNames, widthRatio, heightRatio, duration = 0.5) {
        super();
        this.shapeNames = shapeNames;
        this.widthRatio = widthRatio;
        this.heightRatio = heightRatio;
        this.duration = duration;
        this.shapes = [];
        this.adapters = [];
    }

    async doInit() {
        // Look up shapes from registry
        this.shapes = this.shapeNames
            .map(name => this.commandContext.shapeRegistry[name])
            .filter(shape => shape != null);

        // Create adapters for each shape and capture original scale
        this.adapters = this.shapes.map(shape => {
            const adapter = ShapeSizeAdapter.for(shape);
            adapter.captureOriginalAndSetTarget(this.widthRatio, this.heightRatio);
            return adapter;
        });
    }

    async play() {
        return this._animate();
    }

    /**
     * Animate all adapters
     * @returns {Promise}
     */
    _animate() {
        const promises = this.adapters.map(adapter => {
            return new Promise(resolve => {
                adapter.scale(this.duration, resolve);
            });
        });

        return Promise.all(promises);
    }

    doDirectPlay() {
        // Instant scale to target (idempotent)
        this.adapters.forEach(adapter => adapter.scaleInstant());
    }

    async playSingle() {
        // Reset to original scale first, then animate
        this.adapters.forEach(adapter => adapter.resetToOriginal());
        return this._animate();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
