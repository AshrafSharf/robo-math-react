/**
 * HideCommand - Hides one or more shapes instantly
 */
import { BaseCommand } from '../BaseCommand.js';
import { ShapeVisibilityAdapter } from './ShapeVisibilityAdapter.js';

export class HideCommand extends BaseCommand {
    /**
     * @param {Array<string>} shapeNames - Variable names of shapes to hide
     */
    constructor(shapeNames) {
        super();
        this.shapeNames = shapeNames;
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

        // Hide immediately - this is an instant operation
        this.adapters.forEach(adapter => adapter.hide());
    }

    async play() {
        // Hide all shapes instantly
        this.adapters.forEach(adapter => adapter.hide());
        return Promise.resolve();
    }

    doDirectPlay() {
        this.adapters.forEach(adapter => adapter.hide());
    }

    async playSingle() {
        return this.play();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
