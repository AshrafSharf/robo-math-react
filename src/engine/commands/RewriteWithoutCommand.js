import { BaseCommand } from './BaseCommand.js';
import { RewriteWithoutEffect } from '../../mathtext/effects/rewrite-without-effect.js';
import { wrapWithBBox } from '../../mathtext/utils/bbox-latex-wrapper.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';

/**
 * RewriteWithoutCommand - Animates everything EXCEPT the pattern-matched parts
 * on an existing MathTextComponent.
 *
 * Uses temp component to extract bounds, then queries original component for nodePaths.
 *
 * Usage:
 *   M = mathtext(5, 2, "\tan(\theta) = ...")
 *   writewithout(M, "\theta")
 */
export class RewriteWithoutCommand extends BaseCommand {
    constructor(options = {}) {
        super();
        this.options = options;
        this.mathComponent = null;
        this.selectionUnits = null;
    }

    async doInit() {
        // 1. Get original component
        this.mathComponent = this.commandContext.shapeRegistry[this.options.targetVariableName];
        if (!this.mathComponent) {
            console.warn(`RewriteWithoutCommand: "${this.options.targetVariableName}" not found in registry`);
            return;
        }

        const originalContent = this.mathComponent.getContent();

        // 2. Create TEMP component with wrapped bbox content (same position)
        const wrappedContent = wrapWithBBox(originalContent, this.options.excludePattern);
        const tempComponent = MathTextComponent.createTempAtSamePosition(
            this.mathComponent,
            wrappedContent
        );

        // 3. Extract BOUNDS from temp's bbox regions
        const bboxBounds = tempComponent.getBBoxHighlightBounds();

        // 4. Destroy temp - we only needed the bounds
        tempComponent.destroy();

        // 5. Use bounds to get nodePaths from ORIGINAL component (these are parts to EXCLUDE)
        this.selectionUnits = this.mathComponent.computeSelectionUnitsFromBounds(bboxBounds);

        this.commandResult = this.mathComponent;
    }

    async playSingle() {
        if (!this.mathComponent || !this.selectionUnits) return;

        const effect = new RewriteWithoutEffect(this.mathComponent, this.selectionUnits);
        return effect.play();
    }

    doDirectPlay() {
        if (this.mathComponent && this.selectionUnits) {
            const effect = new RewriteWithoutEffect(this.mathComponent, this.selectionUnits);
            effect.toEndState();
        }
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }

    clear() {
        this.mathComponent = null;
        this.selectionUnits = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
