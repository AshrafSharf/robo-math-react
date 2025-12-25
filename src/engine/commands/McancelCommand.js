/**
 * McancelCommand - Draws cancel strikethrough over TextItem(s)
 *
 * Uses the phantom spacer approach:
 *   \cancelto{text}{\phantom{\hspace{W}}} - for direction 'r'/'ur'
 *   \bcancel{\phantom{\hspace{W}}}        - for direction 'dr'
 *   \xcancel{\phantom{\hspace{W}}}        - for direction 'x'
 *
 * If the textItem is a collection, creates cancel for each item.
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { WriteEffect } from '../../mathtext/effects/write-effect.js';
import { MathTextPositionUtil } from '../../mathtext/utils/math-text-position-util.js';

export class McancelCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.mathComponents = [];  // Array for collection support
    }

    async doInit() {
        const textItemOrCollection = this.commandContext.shapeRegistry[this.options.textItemVariableName];
        if (!textItemOrCollection) {
            console.warn(`McancelCommand: "${this.options.textItemVariableName}" not found in registry`);
            return;
        }

        // Handle TextItemCollection or single TextItem
        const items = this._getItemsArray(textItemOrCollection);
        if (items.length === 0) {
            console.warn('McancelCommand: No TextItems found');
            return;
        }

        // Create cancel for each item
        for (const textItem of items) {
            const component = this._createCancelComponent(textItem);
            if (component) {
                this.mathComponents.push(component);
            }
        }

        this.commandResult = this.mathComponents.length === 1
            ? this.mathComponents[0]
            : this.mathComponents;
    }

    /**
     * Get items as array (handles both single TextItem and TextItemCollection)
     */
    _getItemsArray(textItemOrCollection) {
        // TextItemCollection has get() and size() methods
        if (textItemOrCollection.get && textItemOrCollection.size) {
            // It's a collection - use getAll() for efficiency
            return textItemOrCollection.getAll ? textItemOrCollection.getAll() : [];
        }
        // Single TextItem
        return [textItemOrCollection];
    }

    /**
     * Create cancel MathTextComponent for a single TextItem
     * Uses phantom spacer approach like TopWriteCommand
     */
    _createCancelComponent(textItem) {
        const targetBounds = textItem.getCanvasBounds();
        if (!targetBounds) {
            console.warn('McancelCommand: Could not get TextItem bounds');
            return null;
        }

        // Build the LaTeX with phantom matching target dimensions
        // Reduce slightly to avoid diagonal extending beyond text
        const padding = 8;
        const width = Math.max(targetBounds.width - padding, 4);
        const height = Math.max(targetBounds.height - padding, 4);
        const latex = this._buildCancelLatex(width, height);

        // Get parent MathTextComponent for styling
        const targetMathComponent = textItem.getMathComponent();

        // Create MathTextComponent
        const mathComponent = new MathTextComponent(
            latex,
            0, 0,
            targetMathComponent.coordinateMapper,
            targetMathComponent.parentDOM,
            {
                fontSize: targetMathComponent.fontSizeValue,
                stroke: this.options.color || 'red',
                fill: this.options.color || 'red'
            }
        );

        // Position to overlay the target
        // For cancelto, the phantom is at the BOTTOM of the component (text/arrow above).
        // For plain cancel, paths = diagonal = phantom dimensions.
        // Phantom width = target width, so left-align horizontally.
        // Bottom-align vertically since phantom is at bottom of cancelto structure.
        const pathBounds = MathTextPositionUtil.getPathBoundsInContainer(mathComponent.containerDOM);

        // Horizontal: left of paths aligns with left of target
        const x = targetBounds.minX - pathBounds.offsetX;
        // Vertical: paths bottom aligns with target bottom
        const y = targetBounds.maxY - pathBounds.offsetY - pathBounds.height;
        mathComponent.setCanvasPosition(x, y);

        // Start hidden for animation
        mathComponent.hide();
        mathComponent.disableStroke();

        return mathComponent;
    }

    /**
     * Build cancel LaTeX based on direction
     */
    _buildCancelLatex(width, height) {
        // Use \rule{W}{H} for exact box dimensions
        const phantomContent = `\\phantom{\\rule{${width}px}{${height}px}}`;
        const cancelText = this._formatCancelText(this.options.cancelText);
        const dir = this.options.direction || 'u';

        switch (dir) {
            case 'd':
                // bcancel - down diagonal
                return `\\bcancel{${phantomContent}}`;
            case 'x':
                // xcancel - X pattern
                return `\\xcancel{${phantomContent}}`;
            case 'u':
            default:
                // cancelto - up diagonal with value
                if (cancelText) {
                    return `\\cancelto{${cancelText}}{${phantomContent}}`;
                }
                return `\\cancel{${phantomContent}}`;
        }
    }

    /**
     * Format cancel text - wrap in \text{} if plain, use as LaTeX if special chars
     */
    _formatCancelText(text) {
        if (!text) return '';
        const hasLatexChars = /[\\^_{}]/.test(text);
        if (hasLatexChars) {
            return text;
        }
        return `\\text{${text}}`;
    }

    async playSingle() {
        if (this.mathComponents.length === 0) return;

        // Play all cancel effects
        const effects = this.mathComponents.map(mc => new WriteEffect(mc));
        return Promise.all(effects.map(e => e.play()));
    }

    doDirectPlay() {
        this.mathComponents.forEach(mc => {
            mc.show();
            mc.enableStroke();
        });
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }

    clear() {
        this.mathComponents.forEach(mc => {
            if (mc && mc.containerDOM && mc.containerDOM.parentNode) {
                mc.containerDOM.parentNode.removeChild(mc.containerDOM);
            }
        });
        this.mathComponents = [];
        this.commandResult = null;
        this.isInitialized = false;
    }
}
