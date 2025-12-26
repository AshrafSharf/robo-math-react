/**
 * WriteMeqCommand - Writes meq (multi-line equation) with bounds-based line animation
 *
 * Uses bbox markers in LaTeX to extract bounds for each line, then animates
 * each line sequentially in Y-sorted order (top to bottom).
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { SelectionUnit } from '../../mathtext/models/selection-unit.js';
import { PenDef } from '../../pen/pen-def.js';

export class WriteMeqCommand extends BaseCommand {
    /**
     * Create a WriteMeqCommand
     * @param {MeqExpression} meqExpression - The meq expression with lines
     * @param {number} row - Row position (logical coordinate)
     * @param {number} col - Column position (logical coordinate)
     * @param {Object} styleOptions - Style options {color, fontSize}
     */
    constructor(meqExpression, row, col, styleOptions = {}) {
        super();
        this.meqExpression = meqExpression;
        this.row = row;
        this.col = col;
        this.styleOptions = styleOptions;
        this.mathComponent = null;
    }

    /**
     * Initialize - create MathTextComponent with regular LaTeX (no bbox)
     * Bbox is only used temporarily during animation for bounds extraction
     */
    async doInit() {
        const coordinateMapper = this.diagram2d.coordinateMapper;
        const canvasSection = this.diagram2d.canvasSection;
        const effectiveColor = this.styleOptions.color || this.color;

        // Use regular LaTeX (no bbox) for the stored component
        // This ensures select() and other operations work correctly
        const regularLatex = this.meqExpression.getStringValue();

        this.mathComponent = new MathTextComponent(
            regularLatex,
            this.row,
            this.col,
            coordinateMapper,
            canvasSection,
            {
                fontSize: this.styleOptions.fontSize ?? 22,
                stroke: effectiveColor,
                fill: effectiveColor
            }
        );

        // Start hidden with strokes disabled for animation
        this.mathComponent.hide();
        this.mathComponent.disableStroke();

        this.commandResult = this.mathComponent;

        // Store reference in meq expression if needed
        if (this.meqExpression.setMathTextComponent) {
            this.meqExpression.setMathTextComponent(this.mathComponent);
        }
    }

    /**
     * Play animation - animate each line in Y-sorted order
     */
    async playSingle() {
        if (!this.mathComponent) return;

        // Create a temporary component with bbox-wrapped content to extract bounds
        const bboxLatex = this.meqExpression.getStringValueWithBBox();
        const tempComponent = MathTextComponent.createTempAtSamePosition(
            this.mathComponent,
            bboxLatex
        );

        // Get bbox bounds from temp component
        const bboxBounds = tempComponent.getBBoxHighlightBounds();
        tempComponent.destroy();

        if (bboxBounds.length === 0) {
            // No bounds found - fall back to normal write animation
            this.mathComponent.showContainer();
            return new Promise((resolve) => {
                this.mathComponent.writeAnimate(resolve);
            });
        }

        // Sort by minY ascending (smaller Y = top in SVG coordinates)
        const sortedBounds = [...bboxBounds].sort((a, b) => a.minY - b.minY);

        console.log('WriteMeqCommand: sorted bounds:', sortedBounds.map(b => ({ minY: b.minY, maxY: b.maxY })));

        // Temporarily show main component for computeSelectionUnit to work
        this.mathComponent.containerDOM.style.display = 'block';

        // Build all selection units in Y-sorted order using the main component
        const allSelectionUnits = sortedBounds.map(bounds => {
            const selectionUnit = new SelectionUnit();
            this.mathComponent.computeSelectionUnit(bounds, selectionUnit);
            return selectionUnit;
        });

        // Hide container
        this.mathComponent.containerDOM.style.display = 'none';

        // Show container (but strokes are still disabled)
        this.mathComponent.showContainer();

        // Set pen color
        PenDef.setInkColor(this.mathComponent.getFontStroke());

        // Animate all selection units together in the correct order
        // Using autoComplete=true to include any remaining content after all selections
        await new Promise((resolve) => {
            this.mathComponent.writeSelectionOnlyAnimate(allSelectionUnits, true, resolve);
        });
    }

    /**
     * Direct play - show immediately without animation
     */
    doDirectPlay() {
        if (this.mathComponent) {
            this.mathComponent.show();
            this.mathComponent.enableStroke();
        }
    }

    /**
     * Get label position for compatibility
     */
    getLabelPosition() {
        return { x: this.col, y: this.row };
    }

    /**
     * Clear the math text component
     */
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
