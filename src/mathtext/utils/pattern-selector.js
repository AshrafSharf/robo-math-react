/**
 * PatternSelector - Single abstraction for extracting selection units from any pattern
 *
 * Commands just call getSelectionUnits() with patterns - all routing logic is internal.
 *
 * Usage:
 *   const units = PatternSelector.getSelectionUnits(mathComponent, ["\\frac", "x", "\\alpha", "xy"]);
 */
import { BoundsByLatex } from './bounds-by-latex.js';
import { wrapMultipleWithBBox } from './bbox-latex-wrapper.js';
import { MathTextComponent } from '../components/math-text-component.js';

export class PatternSelector {
    /**
     * Get selection units for ANY patterns - handles all routing internally
     * @param {MathTextComponent} mathComponent
     * @param {string[]} patterns - Any mix of structural, single char, Greek, or LaTeX patterns
     * @returns {SelectionUnit[]}
     */
    static getSelectionUnits(mathComponent, patterns) {
        // Separate special patterns from LaTeX patterns
        const specialPatterns = patterns.filter(p => BoundsByLatex.isSpecialPattern(p));
        const latexPatterns = patterns.filter(p => !BoundsByLatex.isSpecialPattern(p));

        const selectionUnits = [];

        // Special patterns → BoundsByLatex (direct nodepath lookup)
        if (specialPatterns.length > 0) {
            const units = BoundsByLatex.getSelectionUnits(mathComponent, specialPatterns);
            selectionUnits.push(...units);
        }

        // LaTeX patterns → temp component + bbox approach
        if (latexPatterns.length > 0) {
            const originalContent = mathComponent.getContent();
            const wrappedContent = wrapMultipleWithBBox(originalContent, latexPatterns);

            const tempComponent = MathTextComponent.createTempAtSamePosition(
                mathComponent,
                wrappedContent
            );

            const bboxBounds = tempComponent.getBBoxHighlightBounds();
            tempComponent.destroy();

            const bboxUnits = mathComponent.computeSelectionUnitsFromBounds(bboxBounds);
            selectionUnits.push(...bboxUnits);
        }

        return selectionUnits;
    }
}
