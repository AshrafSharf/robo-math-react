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
        // Defer lookup and hide to play time
        // This handles cases where shapes are created by previous commands during play
    }

    _lookupAndHide() {
        // Look up shapes from registry
        this.shapes = this.shapeNames
            .map(name => this.commandContext.shapeRegistry[name])
            .filter(shape => shape != null);

        // Create adapters for each shape
        this.adapters = this.shapes.map(shape => ShapeVisibilityAdapter.for(shape));

        // Hide
        this.adapters.forEach(adapter => adapter.hide());
    }

    async play() {
        this._lookupAndHide();
        return Promise.resolve();
    }

    doDirectPlay() {
        this._lookupAndHide();
    }

    async playSingle() {
        return this.play();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
