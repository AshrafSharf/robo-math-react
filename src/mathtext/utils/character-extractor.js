import { SelectionUnit } from '../models/selection-unit.js';
import $ from './dom-query.js';

/**
 * CharacterExtractor - Extracts selection units for single alphanumeric characters and Greek letters
 *
 * Uses MathJax meta attributes (MJMATHI-xx for italic, MJMAIN-xx for roman)
 * to find characters directly, bypassing bbox wrapping.
 */
export class CharacterExtractor {
    // Map single characters to their MathJax meta values
    static CHARACTER_MAP = {
        // Uppercase italic letters (A-Z)
        'A': 'MJMATHI-41', 'B': 'MJMATHI-42', 'C': 'MJMATHI-43', 'D': 'MJMATHI-44',
        'E': 'MJMATHI-45', 'F': 'MJMATHI-46', 'G': 'MJMATHI-47', 'H': 'MJMATHI-48',
        'I': 'MJMATHI-49', 'J': 'MJMATHI-4A', 'K': 'MJMATHI-4B', 'L': 'MJMATHI-4C',
        'M': 'MJMATHI-4D', 'N': 'MJMATHI-4E', 'O': 'MJMATHI-4F', 'P': 'MJMATHI-50',
        'Q': 'MJMATHI-51', 'R': 'MJMATHI-52', 'S': 'MJMATHI-53', 'T': 'MJMATHI-54',
        'U': 'MJMATHI-55', 'V': 'MJMATHI-56', 'W': 'MJMATHI-57', 'X': 'MJMATHI-58',
        'Y': 'MJMATHI-59', 'Z': 'MJMATHI-5A',
        // Lowercase italic letters (a-z)
        'a': 'MJMATHI-61', 'b': 'MJMATHI-62', 'c': 'MJMATHI-63', 'd': 'MJMATHI-64',
        'e': 'MJMATHI-65', 'f': 'MJMATHI-66', 'g': 'MJMATHI-67', 'h': 'MJMATHI-68',
        'i': 'MJMATHI-69', 'j': 'MJMATHI-6A', 'k': 'MJMATHI-6B', 'l': 'MJMATHI-6C',
        'm': 'MJMATHI-6D', 'n': 'MJMATHI-6E', 'o': 'MJMATHI-6F', 'p': 'MJMATHI-70',
        'q': 'MJMATHI-71', 'r': 'MJMATHI-72', 's': 'MJMATHI-73', 't': 'MJMATHI-74',
        'u': 'MJMATHI-75', 'v': 'MJMATHI-76', 'w': 'MJMATHI-77', 'x': 'MJMATHI-78',
        'y': 'MJMATHI-79', 'z': 'MJMATHI-7A',
        // Numbers (0-9)
        '0': 'MJMAIN-30', '1': 'MJMAIN-31', '2': 'MJMAIN-32', '3': 'MJMAIN-33',
        '4': 'MJMAIN-34', '5': 'MJMAIN-35', '6': 'MJMAIN-36', '7': 'MJMAIN-37',
        '8': 'MJMAIN-38', '9': 'MJMAIN-39'
    };

    // Map Greek letter LaTeX commands to their MathJax meta values
    static GREEK_MAP = {
        // Lowercase Greek letters
        '\\alpha': 'MJMATHI-3B1',
        '\\beta': 'MJMATHI-3B2',
        '\\gamma': 'MJMATHI-3B3',
        '\\delta': 'MJMATHI-3B4',
        '\\epsilon': 'MJMATHI-3F5',
        '\\varepsilon': 'MJMATHI-3B5',
        '\\zeta': 'MJMATHI-3B6',
        '\\eta': 'MJMATHI-3B7',
        '\\theta': 'MJMATHI-3B8',
        '\\vartheta': 'MJMATHI-3D1',
        '\\iota': 'MJMATHI-3B9',
        '\\kappa': 'MJMATHI-3BA',
        '\\lambda': 'MJMATHI-3BB',
        '\\mu': 'MJMATHI-3BC',
        '\\nu': 'MJMATHI-3BD',
        '\\xi': 'MJMATHI-3BE',
        '\\pi': 'MJMATHI-3C0',
        '\\varpi': 'MJMATHI-3D6',
        '\\rho': 'MJMATHI-3C1',
        '\\varrho': 'MJMATHI-3F1',
        '\\sigma': 'MJMATHI-3C3',
        '\\varsigma': 'MJMATHI-3C2',
        '\\tau': 'MJMATHI-3C4',
        '\\upsilon': 'MJMATHI-3C5',
        '\\phi': 'MJMATHI-3D5',
        '\\varphi': 'MJMATHI-3C6',
        '\\chi': 'MJMATHI-3C7',
        '\\psi': 'MJMATHI-3C8',
        '\\omega': 'MJMATHI-3C9',
        // Uppercase Greek letters
        '\\Gamma': 'MJMAIN-393',
        '\\Delta': 'MJMAIN-394',
        '\\Theta': 'MJMAIN-398',
        '\\Lambda': 'MJMAIN-39B',
        '\\Xi': 'MJMAIN-39E',
        '\\Pi': 'MJMAIN-3A0',
        '\\Sigma': 'MJMAIN-3A3',
        '\\Upsilon': 'MJMAIN-3A5',
        '\\Phi': 'MJMAIN-3A6',
        '\\Psi': 'MJMAIN-3A8',
        '\\Omega': 'MJMAIN-3A9'
    };

    /**
     * Check if a pattern is a single character we can handle
     */
    static isSingleCharacter(pattern) {
        return pattern.length === 1 && pattern in this.CHARACTER_MAP;
    }

    /**
     * Check if a pattern is a Greek letter LaTeX command
     */
    static isGreekLetter(pattern) {
        return pattern in this.GREEK_MAP;
    }

    /**
     * Check if pattern is handled by this extractor (single char or Greek letter)
     */
    static canHandle(pattern) {
        return this.isSingleCharacter(pattern) || this.isGreekLetter(pattern);
    }

    /**
     * Get the meta attribute value for a character
     */
    static getMetaValue(char) {
        return this.CHARACTER_MAP[char] || null;
    }

    /**
     * Get the meta attribute value for a Greek letter
     */
    static getGreekMetaValue(pattern) {
        return this.GREEK_MAP[pattern] || null;
    }

    /**
     * Get selection units for single character or Greek letter patterns
     * @param {MathTextComponent} mathComponent
     * @param {string} pattern - Single character (a-z, 0-9) or Greek letter (\alpha, \beta, etc.)
     * @returns {SelectionUnit[]}
     */
    static getSelectionUnits(mathComponent, pattern) {
        // Try single character first, then Greek letter
        const meta = this.getMetaValue(pattern) || this.getGreekMetaValue(pattern);
        if (!meta) return [];

        const svg = $(mathComponent.containerDOM).find('svg')[0];

        // Group paths by their parent <g> element
        // Each character is wrapped in a <g> and may contain multiple paths (stroke/fill)
        const parentToNodepaths = new Map();

        svg.querySelectorAll(`path[meta="${meta}"]`).forEach(path => {
            // Skip paths inside <defs> - these are glyph definitions, not rendered characters
            if (path.closest('defs')) {
                return;
            }

            const nodepath = path.getAttribute('nodepath');
            if (!nodepath) return;

            // Use the parent <g> element as the grouping key
            const parentG = path.parentElement;
            if (!parentG) return;

            if (!parentToNodepaths.has(parentG)) {
                parentToNodepaths.set(parentG, []);
            }
            parentToNodepaths.get(parentG).push(nodepath);
        });

        // Create one SelectionUnit per unique character (parent <g>), containing all its paths
        const units = [];
        for (const [parentG, nodepaths] of parentToNodepaths) {
            const unit = new SelectionUnit();
            nodepaths.forEach(np => unit.addFragment(np));
            units.push(unit);
        }

        return units;
    }
}
