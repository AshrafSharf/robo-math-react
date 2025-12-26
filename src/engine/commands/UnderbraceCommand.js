/**
 * UnderbraceCommand - Draws annotation text below a TextItem with underbrace
 *
 * Creates a MathTextComponent with \underbrace{\phantom{\hspace{W}}}_{annotation}
 * positioned so the phantom aligns with the textItem.
 *
 * Lifecycle (same as WriteCommand 'create' mode):
 *   doInit(): Create MathTextComponent, hidden, strokes disabled
 *   playSingle(): Animate with WriteEffect
 *   doDirectPlay(): Show instantly
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { MathTextPositionUtil } from '../../mathtext/utils/math-text-position-util.js';

export class UnderbraceCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.mathComponent = null;
    }

    async doInit() {
        // 1. Get textItem from registry
        const textItemOrCollection = this.commandContext.shapeRegistry[this.options.textItemVariableName];
        if (!textItemOrCollection) {
            console.warn(`UnderbraceCommand: "${this.options.textItemVariableName}" not found in registry`);
            return;
        }

        // Handle TextItemCollection (get first item) or single TextItem
        const textItem = textItemOrCollection.get ? textItemOrCollection.get(0) : textItemOrCollection;
        if (!textItem) {
            console.warn('UnderbraceCommand: No TextItem found');
            return;
        }

        // 2. Get target bounds
        const targetBounds = textItem.getCanvasBounds();
        if (!targetBounds) {
            console.warn('UnderbraceCommand: Could not get TextItem bounds');
            return;
        }

        // 3. Format annotation text
        const annotation = this._formatAnnotation(this.options.annotationText);

        // 4. Build LaTeX with underbrace and phantom spacer
        const latex = `\\underbrace{\\phantom{\\hspace{${targetBounds.width}px}}}_{${annotation}}`;

        // 5. Get parent MathTextComponent for styling and coordinate mapper
        const targetMathComponent = textItem.getMathComponent();

        // 6. Create MathTextComponent (position will be set after measuring)
        this.mathComponent = new MathTextComponent(
            latex,
            0, 0,  // row, col not used - we set position directly
            targetMathComponent.coordinateMapper,
            targetMathComponent.parentDOM,
            {
                fontSize: this.fontSize || targetMathComponent.fontSizeValue,
                stroke: this.color || targetMathComponent.strokeColor,
                fill: this.color || targetMathComponent.fillColor
            }
        );

        // 7. Get source bounds and calculate position using utility
        const sourceBounds = MathTextPositionUtil.getPathBoundsInContainer(this.mathComponent.containerDOM);
        const buffer = this.options.buffer ?? 15;  // Default 15px gap
        const position = MathTextPositionUtil.bottomAlignPosition(targetBounds, sourceBounds, buffer);
        this.mathComponent.setCanvasPosition(position.x, position.y);

        // 8. Start hidden, strokes disabled (ready for animation)
        this.mathComponent.hide();
        this.mathComponent.disableStroke();

        this.commandResult = this.mathComponent;
    }

    /**
     * Format annotation - wrap in \text{} if plain text, otherwise use as raw LaTeX
     */
    _formatAnnotation(text) {
        const hasLatexChars = /[\\^_{}]/.test(text);
        if (hasLatexChars) {
            return text;
        }
        return `\\text{${text}}`;
    }

    async playSingle() {
        if (!this.mathComponent) return;
        const effect = new WriteEffect(this.mathComponent);
        return effect.play();
    }

    doDirectPlay() {
        if (this.mathComponent) {
            this.mathComponent.show();
            this.mathComponent.enableStroke();
        }
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
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
