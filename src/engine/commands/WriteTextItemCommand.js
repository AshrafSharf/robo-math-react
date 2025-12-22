/**
 * WriteTextItemCommand - Clones a TextItem to a position and animates it
 *
 * Used when write() is called with position and item: write(row, col, item(S, 0))
 * Creates an independent MathTextComponent from the TextItem's SVG at the position.
 */
import { BaseCommand } from './BaseCommand.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';

export class WriteTextItemCommand extends BaseCommand {
    /**
     * @param {string} collectionVariableName - Variable name of the TextItemCollection
     * @param {number} index - Index of the TextItem to clone
     * @param {number} row - Logical row coordinate
     * @param {number} col - Logical col coordinate
     */
    constructor(collectionVariableName, index, row, col) {
        super();
        this.collectionVariableName = collectionVariableName;
        this.index = index;
        this.row = row;
        this.col = col;
        this.mathComponent = null;
    }

    async doInit() {
        // Get the TextItemCollection from shapeRegistry
        const collection = this.commandContext.shapeRegistry[this.collectionVariableName];
        if (!collection) {
            console.warn(`WriteTextItemCommand: "${this.collectionVariableName}" not found in registry`);
            return;
        }

        // Validate index
        if (this.index < 0 || this.index >= collection.size()) {
            console.warn(`WriteTextItemCommand: Index ${this.index} out of bounds (collection has ${collection.size()} items)`);
            return;
        }

        // Get the TextItem and its cloned SVG (with non-matching paths removed)
        const textItem = collection.get(this.index);
        const clonedSvg = textItem.getClonedSVG();
        if (!clonedSvg) {
            console.warn('WriteTextItemCommand: No cloned SVG available');
            return;
        }

        // Convert logical coords to pixel coords
        const coordinateMapper = this.diagram2d.coordinateMapper;
        const pixelCoords = coordinateMapper.toPixel(this.row, this.col);

        // Create independent MathTextComponent from SVG
        this.mathComponent = MathTextComponent.fromSVGClone(
            clonedSvg,
            pixelCoords.x,
            pixelCoords.y,
            this.diagram2d.canvasSection,
            {
                fontSize: 22,
                stroke: this.color,
                fill: this.color
            }
        );

        this.mathComponent.hide();
        this.mathComponent.disableStroke();
        this.commandResult = this.mathComponent;
    }

    async playSingle() {
        if (!this.mathComponent) return;

        const effect = new WriteEffect(this.mathComponent);
        return effect.play();
    }

    doDirectPlay() {
        if (!this.mathComponent) return;

        this.mathComponent.show();
        this.mathComponent.enableStroke();
    }

    getLabelPosition() {
        return { x: this.col, y: this.row };
    }

    clear() {
        if (this.mathComponent && this.mathComponent.containerDOM) {
            const containerDOM = this.mathComponent.containerDOM;
            if (containerDOM.parentNode) {
                containerDOM.parentNode.removeChild(containerDOM);
            }
        }
        this.mathComponent = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
