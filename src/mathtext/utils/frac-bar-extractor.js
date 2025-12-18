import { SelectionUnit } from '../models/selection-unit.js';
import $ from './dom-query.js';

/**
 * FracBarExtractor - Extracts selection units for fraction bars
 *
 * Isolated class to handle frac pattern extraction.
 */
export class FracBarExtractor {
    /**
     * Get selection units for fraction bars in a MathTextComponent
     * @param {MathTextComponent} mathComponent
     * @returns {SelectionUnit[]}
     */
    static getSelectionUnits(mathComponent) {
        const svg = $(mathComponent.containerDOM).find('svg')[0];
        const units = [];

        svg.querySelectorAll('.mjx-svg-mfrac').forEach(container => {
            container.querySelectorAll('path').forEach(path => {
                const nodepath = path.getAttribute('nodepath');
                const meta = path.getAttribute('meta');

                // Include only the fraction bar (rect)
                if (meta === 'rect' && nodepath) {
                    const unit = new SelectionUnit();
                    unit.addFragment(nodepath);
                    units.push(unit);
                }
            });
        });

        return units;
    }
}
