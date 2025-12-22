/**
 * PosCommand - Shifts containers (g2d, mathtext, g3d) by delta row/col in logical coordinates
 *
 * Animates the shift using GSAP. All components shift in parallel.
 */
import { BaseCommand } from '../BaseCommand.js';
import { ShapeRepositionAdapter } from './ShapeRepositionAdapter.js';

export class PosCommand extends BaseCommand {
    /**
     * @param {Array<string>} shapeNames - Variable names of shapes to shift
     * @param {number} dRow - Delta row in logical coordinates
     * @param {number} dCol - Delta column in logical coordinates
     * @param {number} duration - Animation duration in seconds
     */
    constructor(shapeNames, dRow, dCol, duration = 0.5) {
        super();
        this.shapeNames = shapeNames;
        this.dRow = dRow;
        this.dCol = dCol;
        this.duration = duration;
        this.shapes = [];
        this.adapters = [];
        this.dx = 0;
        this.dy = 0;
    }

    async doInit() {
        // Look up shapes from registry
        this.shapes = this.shapeNames
            .map(name => this.commandContext.shapeRegistry[name])
            .filter(shape => shape != null);

        // Create adapters for each shape and capture original positions
        this.adapters = this.shapes.map(shape => {
            const adapter = ShapeRepositionAdapter.for(shape);
            adapter.captureOriginal();
            return adapter;
        });

        // Convert logical coordinates to pixels using layoutMapper
        const layoutMapper = this.commandContext.layoutMapper;
        if (layoutMapper) {
            // dRow maps to Y (vertical), dCol maps to X (horizontal)
            this.dx = layoutMapper.toPixelX(this.dCol);
            this.dy = layoutMapper.toPixelY(this.dRow);
        }
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
                adapter.shift(this.dx, this.dy, this.duration, resolve);
            });
        });

        return Promise.all(promises);
    }

    doDirectPlay() {
        // Instant shift to target (idempotent - uses original + delta)
        this.adapters.forEach(adapter => adapter.shiftInstant(this.dx, this.dy));
    }

    async playSingle() {
        // Reset to original position first, then animate
        this.adapters.forEach(adapter => adapter.resetToOriginal());
        return this._animate();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
