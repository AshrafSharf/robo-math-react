import { SelectionUnit } from '../models/selection-unit.js';
import $ from './dom-query.js';

/**
 * SqrtBarExtractor - Extracts selection units for square root bars (vinculum)
 *
 * Isolated class to handle sqrt pattern extraction without affecting other patterns.
 */
export class SqrtBarExtractor {
    /**
     * Get selection units for sqrt bars in a MathTextComponent
     * @param {MathTextComponent} mathComponent
     * @returns {SelectionUnit[]}
     */
    static getSelectionUnits(mathComponent) {
        const svg = $(mathComponent.containerDOM).find('svg')[0];
        const units = [];

        // Handle both msqrt (square root) and mroot (nth root like cube root)
        svg.querySelectorAll('.mjx-svg-msqrt, .mjx-svg-mroot').forEach(container => {
            const unit = new SelectionUnit();

            container.querySelectorAll('path').forEach(path => {
                const nodepath = path.getAttribute('nodepath');
                const meta = path.getAttribute('meta');

                // Include: radical sign (MJMAIN-221A) and horizontal bar (rect)
                if ((meta === 'MJMAIN-221A' || meta === 'rect') && nodepath) {
                    unit.addFragment(nodepath);
                }
            });

            if (unit.hasFragment()) {
                units.push(unit);
            }
        });

        return units;
    }
}
