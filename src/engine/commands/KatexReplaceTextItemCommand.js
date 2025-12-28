/**
 * KatexReplaceTextItemCommand - Creates new KatexComponents at KatexTextItem positions
 *
 * Takes a LaTeX string and a KatexTextItem (or KatexTextItemCollection),
 * creates a new KatexComponent for each item at its position
 * with its style, then animates revealing them.
 */
import { BaseCommand } from './BaseCommand.js';
import { KatexComponent } from '../../mathtext/katex/katex-component.js';
import { MathTextPositionUtil } from '../../mathtext/utils/math-text-position-util.js';
import { FadeOutCommand } from './visibility/FadeOutCommand.js';

export class KatexReplaceTextItemCommand extends BaseCommand {
    /**
     * @param {string} sourceString - LaTeX string to render
     * @param {string} targetVariableName - Variable name of KatexTextItem or KatexTextItemCollection
     * @param {Object} inlineExpression - Optional inline select/selectexcept expression
     */
    constructor(sourceString, targetVariableName, inlineExpression = null) {
        super();
        this.sourceString = sourceString;
        this.targetVariableName = targetVariableName;
        this.inlineExpression = inlineExpression;

        this.targetTextItems = [];
        this.createdKatexComponents = [];
        this.fadeOutCommand = null;
    }

    async doInit() {
        // If we have an inline expression (select/selectexcept), run it first
        if (this.inlineExpression) {
            const subCommand = this.inlineExpression.toCommand();
            await subCommand.init(this.commandContext);

            // Get the collection and register with a temp name for FadeOutCommand
            const collection = this.inlineExpression.getResolvedValue();
            if (!collection) {
                console.warn('KatexReplaceTextItemCommand: Inline expression returned no collection');
                return;
            }
            this.targetVariableName = `__replace_inline_${Date.now()}`;
            this.commandContext.shapeRegistry[this.targetVariableName] = collection;
        }

        // Get target from registry - could be KatexTextItem or KatexTextItemCollection
        let target = this.commandContext.shapeRegistry[this.targetVariableName];
        if (!target) {
            console.warn(`KatexReplaceTextItemCommand: "${this.targetVariableName}" not found in registry`);
            return;
        }

        // If it's a KatexTextItemCollection (has size() method), get all items
        if (target.size && typeof target.size === 'function') {
            const count = target.size();
            for (let i = 0; i < count; i++) {
                const item = target.get(i);
                if (item) {
                    this.targetTextItems.push(item);
                }
            }
            if (this.targetTextItems.length === 0) {
                console.warn(`KatexReplaceTextItemCommand: Collection "${this.targetVariableName}" is empty`);
                return;
            }
        } else {
            // It's a single KatexTextItem (from item)
            this.targetTextItems.push(target);
        }

        // Create FadeOutCommand for the target
        this.fadeOutCommand = new FadeOutCommand([this.targetVariableName], 0.5);
        await this.fadeOutCommand.init(this.commandContext);

        await this._createKatexComponentsForTargets();
    }

    /**
     * Creates KatexComponents for all items in targetTextItems array.
     */
    async _createKatexComponentsForTargets() {
        for (const textItem of this.targetTextItems) {
            const targetKatexComponent = textItem.getMathComponent();
            const canvasBounds = textItem.getCanvasBounds();
            if (!canvasBounds) {
                console.warn('KatexReplaceTextItemCommand: Could not get canvas bounds for textItem');
                continue;
            }

            const katexComponent = new KatexComponent(
                this.sourceString,
                0, 0,  // row, col not used - we set position directly
                targetKatexComponent.coordinateMapper,
                targetKatexComponent.parentDOM,
                {
                    fontSize: targetKatexComponent.fontSizeValue,
                    color: targetKatexComponent.color
                }
            );

            // Get bounds and center-align the replacement with the target
            const newBounds = MathTextPositionUtil.getElementBounds(katexComponent.containerDOM);
            const position = MathTextPositionUtil.centerAlignPosition(canvasBounds, newBounds);
            katexComponent.setCanvasPosition(position.x, position.y);
            this.createdKatexComponents.push(katexComponent);
        }

        this.commandResult = this.createdKatexComponents.length === 1
            ? this.createdKatexComponents[0]
            : this.createdKatexComponents;
    }

    async playSingle() {
        if (this.createdKatexComponents.length === 0) return;

        // Fadeout target using FadeOutCommand
        if (this.fadeOutCommand) {
            await this.fadeOutCommand.play();
        }

        // Reveal all KatexComponent replacements with revealIn animation
        for (const katexComponent of this.createdKatexComponents) {
            await katexComponent.revealIn(0.5);
        }
    }

    doDirectPlay() {
        // Hide target immediately using FadeOutCommand
        if (this.fadeOutCommand) {
            this.fadeOutCommand.doDirectPlay();
        }

        // Show all KatexComponent replacements
        for (const katexComponent of this.createdKatexComponents) {
            katexComponent.show();
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
        for (const katexComponent of this.createdKatexComponents) {
            katexComponent.destroy();
        }
        this.targetTextItems = [];
        this.createdKatexComponents = [];
        this.fadeOutCommand = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
