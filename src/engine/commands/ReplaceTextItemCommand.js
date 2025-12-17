/**
 * ReplaceTextItemCommand - Creates a new MathTextComponent at a TextItem's position
 *
 * Takes a LaTeX string and a TextItem, creates a new MathTextComponent
 * at the TextItem's position with the TextItem's style, then animates writing it.
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';

export class ReplaceTextItemCommand extends BaseCommand {
    /**
     * @param {string} sourceString - LaTeX string to render
     * @param {string} targetVariableName - Variable name of TextItem for position/style
     */
    constructor(sourceString, targetVariableName) {
        super();
        this.sourceString = sourceString;
        this.targetVariableName = targetVariableName;

        this.targetTextItem = null;
        this.createdMathComponent = null;
    }

    async doInit() {
        // Get target from registry - could be TextItem or TextItemCollection
        let target = this.commandContext.shapeRegistry[this.targetVariableName];
        if (!target) {
            console.warn(`ReplaceTextItemCommand: "${this.targetVariableName}" not found in registry`);
            return;
        }

        // If it's a TextItemCollection (from subonly/subwithout), get the first item
        if (target.get && typeof target.get === 'function') {
            this.targetTextItem = target.get(0);
            if (!this.targetTextItem) {
                console.warn(`ReplaceTextItemCommand: Collection "${this.targetVariableName}" is empty`);
                return;
            }
        } else {
            // It's already a TextItem (from textat)
            this.targetTextItem = target;
        }

        // Get target's position and style from its parent MathTextComponent
        const targetMathComponent = this.targetTextItem.getMathComponent();
        const canvasBounds = this.targetTextItem.getCanvasBounds();

        // Create new MathTextComponent with target's style at target's position
        this.createdMathComponent = new MathTextComponent(
            this.sourceString,
            0, 0,  // row, col not used - we set position directly
            targetMathComponent.coordinateMapper,
            targetMathComponent.parentDOM,
            {
                fontSize: targetMathComponent.fontSizeValue,
                stroke: targetMathComponent.strokeColor,
                fill: targetMathComponent.fillColor
            }
        );

        // Position at target TextItem's location
        this.createdMathComponent.setCanvasPosition(canvasBounds.x, canvasBounds.y);

        this.commandResult = this.createdMathComponent;
    }

    async playSingle() {
        if (!this.createdMathComponent) return;

        // Show container, then animate write
        this.createdMathComponent.showContainer();
        const effect = new WriteEffect(this.createdMathComponent);
        return effect.play();
    }

    doDirectPlay() {
        if (!this.createdMathComponent) return;
        this.createdMathComponent.show();
    }

    getLabelPosition() {
        if (this.targetTextItem) {
            const bounds = this.targetTextItem.getBounds();
            if (bounds) {
                return { x: bounds.minX, y: bounds.minY };
            }
        }
        return { x: 0, y: 0 };
    }

    clear() {
        if (this.createdMathComponent) {
            this.createdMathComponent.destroy();
        }
        this.targetTextItem = null;
        this.createdMathComponent = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
