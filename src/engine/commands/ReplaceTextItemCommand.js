/**
 * ReplaceTextItemCommand - Creates new MathTextComponents at TextItem positions
 *
 * Takes a LaTeX string and a TextItem (or TextItemCollection),
 * creates a new MathTextComponent for each item at its position
 * with its style, then animates writing them.
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { MathTextPositionUtil } from '../../mathtext/utils/math-text-position-util.js';
import { FadeOutCommand } from './visibility/FadeOutCommand.js';

export class ReplaceTextItemCommand extends BaseCommand {
    /**
     * @param {string} sourceString - LaTeX string to render
     * @param {string} targetVariableName - Variable name of TextItem or TextItemCollection
     * @param {Object} inlineExpression - Optional inline subonly/subwithout expression
     */
    constructor(sourceString, targetVariableName, inlineExpression = null) {
        super();
        this.sourceString = sourceString;
        this.targetVariableName = targetVariableName;
        this.inlineExpression = inlineExpression;

        this.targetTextItems = [];
        this.createdMathComponents = [];
        this.fadeOutCommand = null;
    }

    async doInit() {
        // If we have an inline expression (subonly/subwithout), run it first
        if (this.inlineExpression) {
            const subCommand = this.inlineExpression.toCommand();
            await subCommand.init(this.commandContext);

            // Get the collection and register with a temp name for FadeOutCommand
            const collection = this.inlineExpression.getResolvedValue();
            if (!collection) {
                console.warn('ReplaceTextItemCommand: Inline expression returned no collection');
                return;
            }
            this.targetVariableName = `__replace_inline_${Date.now()}`;
            this.commandContext.shapeRegistry[this.targetVariableName] = collection;
        }

        // Get target from registry - could be TextItem or TextItemCollection
        let target = this.commandContext.shapeRegistry[this.targetVariableName];
        if (!target) {
            console.warn(`ReplaceTextItemCommand: "${this.targetVariableName}" not found in registry`);
            return;
        }

        // If it's a TextItemCollection (has size() method), get all items
        if (target.size && typeof target.size === 'function') {
            const count = target.size();
            for (let i = 0; i < count; i++) {
                const item = target.get(i);
                if (item) {
                    this.targetTextItems.push(item);
                }
            }
            if (this.targetTextItems.length === 0) {
                console.warn(`ReplaceTextItemCommand: Collection "${this.targetVariableName}" is empty`);
                return;
            }
        } else {
            // It's a single TextItem (from textat)
            this.targetTextItems.push(target);
        }

        // Create FadeOutCommand for the target
        this.fadeOutCommand = new FadeOutCommand([this.targetVariableName], 0.5);
        await this.fadeOutCommand.init(this.commandContext);

        await this._createMathComponentsForTargets();
    }

    /**
     * Creates MathTextComponents for all items in targetTextItems array.
     * Called by doInit() and can be called by subclasses after populating targetTextItems.
     */
    async _createMathComponentsForTargets() {
        for (const textItem of this.targetTextItems) {
            const targetMathComponent = textItem.getMathComponent();
            const canvasBounds = textItem.getCanvasBounds();
            if (!canvasBounds) {
                console.warn('ReplaceTextItemCommand: Could not get canvas bounds for textItem');
                continue;
            }

            const mathComponent = new MathTextComponent(
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

            // Get bounds and center-align the replacement with the target
            const newBounds = MathTextPositionUtil.getPathBoundsInContainer(mathComponent.containerDOM);
            const position = MathTextPositionUtil.centerAlignPosition(canvasBounds, newBounds);
            mathComponent.setCanvasPosition(position.x, position.y);
            this.createdMathComponents.push(mathComponent);
        }

        this.commandResult = this.createdMathComponents.length === 1
            ? this.createdMathComponents[0]
            : this.createdMathComponents;
    }

    async playSingle() {
        if (this.createdMathComponents.length === 0) return;

        // Fadeout target using FadeOutCommand
        if (this.fadeOutCommand) {
            await this.fadeOutCommand.play();
        }

        // Then write all replacement components sequentially
        for (const mathComponent of this.createdMathComponents) {
            mathComponent.showContainer();
            const effect = new WriteEffect(mathComponent);
            await effect.play();
        }
    }

    doDirectPlay() {
        // Hide target immediately using FadeOutCommand
        if (this.fadeOutCommand) {
            this.fadeOutCommand.doDirectPlay();
        }

        // Show all replacement components
        for (const mathComponent of this.createdMathComponents) {
            mathComponent.show();
        }
    }

    getLabelPosition() {
        if (this.targetTextItems.length > 0) {
            const bounds = this.targetTextItems[0].getBounds();
            if (bounds) {
                return { x: bounds.minX, y: bounds.minY };
            }
        }
        return { x: 0, y: 0 };
    }

    clear() {
        for (const mathComponent of this.createdMathComponents) {
            mathComponent.destroy();
        }
        this.targetTextItems = [];
        this.createdMathComponents = [];
        this.fadeOutCommand = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
