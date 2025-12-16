/**
 * TextItem - Represents a single extracted part of a MathTextComponent
 *
 * Created by subonly/subwithout expressions to capture specific regions
 * of math text that can be animated later with write().
 */
export class TextItem {
    /**
     * @param {MathTextComponent} mathComponent - Parent MathTextComponent
     * @param {SelectionUnit} selectionUnit - SelectionUnit with fragmentPaths
     * @param {Bounds2} bounds - Bounding box coordinates
     */
    constructor(mathComponent, selectionUnit, bounds) {
        this.mathComponent = mathComponent;
        this.selectionUnit = selectionUnit;
        this.bounds = bounds;
    }

    /**
     * Get the fragment paths for animation
     * @returns {Array<string>} Array of fragment IDs
     */
    getFragmentPaths() {
        return this.selectionUnit.toFragmentPaths();
    }

    /**
     * Get the parent MathTextComponent
     * @returns {MathTextComponent}
     */
    getMathComponent() {
        return this.mathComponent;
    }

    /**
     * Get the bounding box
     * @returns {Bounds2}
     */
    getBounds() {
        return this.bounds;
    }

    /**
     * Get the selection unit
     * @returns {SelectionUnit}
     */
    getSelectionUnit() {
        return this.selectionUnit;
    }
}
