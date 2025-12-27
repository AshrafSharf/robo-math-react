/**
 * BaseMeqCommand - Base class for meq (multi-line equation) commands
 *
 * Provides common functionality:
 * - MathTextComponent creation with meq latex
 * - Line bounds extraction via bbox
 * - Y-sorted line animation
 *
 * Subclasses override:
 * - getSelectionUnitsForAnimation() - what to animate
 * - prepareForAnimation() - disable/hide setup
 */
import { BaseCommand } from './BaseCommand.js';
import { MathTextComponent } from '../../mathtext/components/math-text-component.js';
import { SelectionUnit } from '../../mathtext/models/selection-unit.js';
import { PenDef } from '../../pen/pen-def.js';

export class BaseMeqCommand extends BaseCommand {
    /**
     * @param {MeqExpression} meqExpression - The meq expression
     * @param {number} row - Row position
     * @param {number} col - Column position
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
     * Initialize - create MathTextComponent with regular LaTeX
     */
    async doInit() {
        const coordinateMapper = this.diagram2d.coordinateMapper;
        const canvasSection = this.diagram2d.canvasSection;
        const effectiveColor = this.styleOptions.color || this.color;

        this.mathComponent = new MathTextComponent(
            this.meqExpression.getStringValue(),
            this.row,
            this.col,
            coordinateMapper,
            canvasSection,
            {
                fontSize: this.styleOptions.fontSize,
                stroke: effectiveColor,
                fill: effectiveColor
            }
        );

        // Subclass-specific initialization
        await this.doSubclassInit();

        this.mathComponent.hide();
        this.mathComponent.disableStroke();

        this.commandResult = this.mathComponent;

        if (this.meqExpression.setMathTextComponent) {
            this.meqExpression.setMathTextComponent(this.mathComponent);
        }
    }

    /**
     * Override in subclass for additional initialization
     */
    async doSubclassInit() {}

    /**
     * Get Y-sorted line bounds from meq's bbox structure
     * @returns {Object[]} Sorted line bounds
     */
    getLineBounds() {
        const bboxLatex = this.meqExpression.getStringValueWithBBox();
        const tempComponent = MathTextComponent.createTempAtSamePosition(
            this.mathComponent,
            bboxLatex
        );
        const lineBounds = tempComponent.getBBoxHighlightBounds();
        tempComponent.destroy();

        return [...lineBounds].sort((a, b) => a.minY - b.minY);
    }

    /**
     * Build selection units for each line
     * @param {Object[]} sortedLineBounds
     * @returns {SelectionUnit[]}
     */
    buildLineSelectionUnits(sortedLineBounds) {
        // Temporarily show to compute selection units
        this.mathComponent.containerDOM.style.display = 'block';

        const units = sortedLineBounds.map(bounds => {
            const unit = new SelectionUnit();
            this.mathComponent.computeSelectionUnit(bounds, unit);
            return unit;
        });

        this.mathComponent.containerDOM.style.display = 'none';
        return units;
    }

    /**
     * Get selection units to animate (override in subclass)
     * @param {Object[]} sortedLineBounds
     * @returns {SelectionUnit[]}
     */
    getSelectionUnitsForAnimation(sortedLineBounds) {
        return this.buildLineSelectionUnits(sortedLineBounds);
    }

    /**
     * Prepare component for animation (override in subclass to disable specific strokes)
     */
    prepareForAnimation() {}

    /**
     * Play animation - animate line by line
     */
    async playSingle() {
        if (!this.mathComponent) return;

        const sortedLineBounds = this.getLineBounds();
        const selectionUnits = this.getSelectionUnitsForAnimation(sortedLineBounds);

        if (!selectionUnits?.length) {
            // Fallback to normal write
            this.mathComponent.showContainer();
            return new Promise(resolve => this.mathComponent.writeAnimate(resolve));
        }

        this.prepareForAnimation();
        this.mathComponent.showContainer();
        PenDef.setInkColor(this.mathComponent.getFontStroke());

        await new Promise(resolve => {
            this.mathComponent.writeSelectionOnlyAnimate(selectionUnits, this.shouldAutoComplete(), resolve);
        });
    }

    /**
     * Whether to auto-complete remaining content after selections (override in subclass)
     */
    shouldAutoComplete() {
        return true;
    }

    /**
     * Direct play - show immediately (override in subclass for specific behavior)
     */
    doDirectPlay() {
        if (this.mathComponent) {
            this.mathComponent.show();
            this.mathComponent.enableStroke();
        }
    }

    getLabelPosition() {
        return { x: this.col, y: this.row };
    }

    clear() {
        if (this.mathComponent?.containerDOM?.parentNode) {
            this.mathComponent.containerDOM.parentNode.removeChild(this.mathComponent.containerDOM);
        }
        this.mathComponent = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
