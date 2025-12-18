import { SelectionUnit } from '../models/selection-unit.js';
import $ from './dom-query.js';
import { FracBarExtractor } from './frac-bar-extractor.js';
import { SqrtBarExtractor } from './sqrt-bar-extractor.js';
import { CharacterExtractor } from './character-extractor.js';

/**
 * BoundsByLatex - Handles structural patterns (\frac, \sqrt, etc.) and single characters
 *
 * For multi-character LaTeX patterns, use the bbox approach in commands.
 *
 * Usage:
 *   if (BoundsByLatex.isSpecialPattern('\\frac')) {
 *       const units = BoundsByLatex.getSelectionUnits(mathComponent, ['\\frac']);
 *   }
 */
export class BoundsByLatex {
    // Structural patterns that have dedicated extraction methods
    static STRUCTURAL_PATTERNS = ['\\frac', '\\sqrt', '\\overline', '\\underline'];

    /**
     * Check if a pattern is structural (handled by this class)
     */
    static isStructuralPattern(pattern) {
        return this.STRUCTURAL_PATTERNS.includes(pattern);
    }

    /**
     * Check if a pattern is a single character (handled by CharacterExtractor)
     */
    static isSingleCharacter(pattern) {
        return CharacterExtractor.isSingleCharacter(pattern);
    }

    /**
     * Check if a pattern is a Greek letter (handled by CharacterExtractor)
     */
    static isGreekLetter(pattern) {
        return CharacterExtractor.isGreekLetter(pattern);
    }

    /**
     * Check if a pattern is special (structural, single character, or Greek letter)
     */
    static isSpecialPattern(pattern) {
        return this.isStructuralPattern(pattern) || CharacterExtractor.canHandle(pattern);
    }

    /**
     * Get selection units for structural patterns, single characters, and Greek letters.
     * @param {MathTextComponent} mathComponent
     * @param {string[]} patterns - Structural patterns, single characters, or Greek letters
     * @returns {SelectionUnit[]}
     */
    static getSelectionUnits(mathComponent, patterns) {
        const selectionUnits = [];

        patterns.forEach(pattern => {
            if (this.isStructuralPattern(pattern)) {
                selectionUnits.push(...this._getStructuralUnits(mathComponent, pattern));
            } else if (CharacterExtractor.canHandle(pattern)) {
                // Handles both single characters and Greek letters
                selectionUnits.push(...CharacterExtractor.getSelectionUnits(mathComponent, pattern));
            }
        });

        return selectionUnits;
    }

    /**
     * Route to specific structural method
     * @private
     */
    static _getStructuralUnits(mathComponent, pattern) {
        switch (pattern) {
            case '\\frac':
                return this._getFracBarUnits(mathComponent);
            case '\\sqrt':
                return this._getSqrtBarUnits(mathComponent);
            case '\\overline':
                return this._getOverlineUnits(mathComponent);
            case '\\underline':
                return this._getUnderlineUnits(mathComponent);
            default:
                return [];
        }
    }

    /**
     * Get selection units for fraction bars
     * Delegates to FracBarExtractor for isolated frac handling
     */
    static _getFracBarUnits(mathComponent) {
        return FracBarExtractor.getSelectionUnits(mathComponent);
    }

    /**
     * Get selection units for square root bars
     * Delegates to SqrtBarExtractor for isolated sqrt handling
     */
    static _getSqrtBarUnits(mathComponent) {
        return SqrtBarExtractor.getSelectionUnits(mathComponent);
    }

    /**
     * Get selection units for overline bars
     */
    static _getOverlineUnits(mathComponent) {
        const svg = $(mathComponent.containerDOM).find('svg')[0];
        const units = [];

        svg.querySelectorAll('.mjx-svg-mover').forEach(container => {
            container.querySelectorAll('path[meta="rect"]').forEach(path => {
                const unit = this._pathToSelectionUnit(mathComponent, path);
                if (unit) units.push(unit);
            });
        });

        return units;
    }

    /**
     * Get selection units for underline bars
     */
    static _getUnderlineUnits(mathComponent) {
        const svg = $(mathComponent.containerDOM).find('svg')[0];
        const units = [];

        svg.querySelectorAll('.mjx-svg-munder').forEach(container => {
            container.querySelectorAll('path[meta="rect"]').forEach(path => {
                const unit = this._pathToSelectionUnit(mathComponent, path);
                if (unit) units.push(unit);
            });
        });

        return units;
    }

    /**
     * Convert a path element to a SelectionUnit using its nodepath
     * @private
     */
    static _pathToSelectionUnit(mathComponent, path) {
        const nodepath = path.getAttribute('nodepath');
        if (!nodepath) return null;

        const unit = new SelectionUnit();
        unit.addFragment(nodepath);
        return unit;
    }
}
