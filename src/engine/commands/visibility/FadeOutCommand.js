/**
 * FadeOutCommand - Fades out one or more shapes with animation
 */
import { BaseCommand } from '../BaseCommand.js';
import { ShapeVisibilityAdapter } from './ShapeVisibilityAdapter.js';

export class FadeOutCommand extends BaseCommand {
    /**
     * @param {Array<string>} shapeNames - Variable names of shapes to fade out
     * @param {number} duration - Animation duration in seconds
     */
    constructor(shapeNames, duration = 2) {
        super();
        this.shapeNames = shapeNames;
        this.duration = duration;
        this.shapes = [];
        this.adapters = [];
    }

    async doInit() {
        // Look up shapes from registry
        this.shapes = this.shapeNames
            .map(name => this.commandContext.shapeRegistry[name])
            .filter(shape => shape != null);

        // Create adapters for each shape
        this.adapters = this.shapes.map(shape => ShapeVisibilityAdapter.for(shape));
    }

    async play() {
        const duration = this.duration;

        // Fade out all shapes in parallel
        const promises = this.adapters.map(adapter => {
            return new Promise(resolve => {
                adapter.fadeOut(duration, resolve);
            });
        });

        return Promise.all(promises);
    }

    doDirectPlay() {
        // Instant hide without animation
        this.adapters.forEach(adapter => adapter.hide());
    }

    async playSingle() {
        return this.play();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
