/**
 * WriteWithoutMeqCommand - Writes meq with line-by-line animation, EXCLUDING specified patterns
 *
 * Non-excluded content is animated line by line.
 */
import { BaseMeqCommand } from './BaseMeqCommand.js';
import { PatternSelector } from '../../mathtext/utils/pattern-selector.js';
import { SelectionUnit } from '../../mathtext/models/selection-unit.js';

export class WriteWithoutMeqCommand extends BaseMeqCommand {
    constructor(meqExpression, row, col, excludePatterns, styleOptions = {}) {
        super(meqExpression, row, col, styleOptions);
        this.excludePatterns = excludePatterns;
        this.excludedUnits = null;
    }

    async doSubclassInit() {
        this.excludedUnits = PatternSelector.getSelectionUnits(
            this.mathComponent,
            this.excludePatterns
        );
    }

    getSelectionUnitsForAnimation(sortedLineBounds) {
        const lineUnits = this.buildLineSelectionUnits(sortedLineBounds);

        // Filter out excluded fragments from each line
        return lineUnits
            .map(unit => this._filterExcluded(unit))
            .filter(unit => unit.hasFragment());
    }

    prepareForAnimation() {
        // Hide excluded strokes
        if (this.excludedUnits?.length) {
            const excludedNodes = this.mathComponent.includeTweenNodes(this.excludedUnits);
            excludedNodes.forEach(node => node.disableStroke());
        }
    }

    shouldAutoComplete() {
        return false; // Don't auto-complete, we've already filtered
    }

    doDirectPlay() {
        if (!this.mathComponent) return;

        // Disable excluded strokes
        if (this.excludedUnits?.length) {
            const excludedNodes = this.mathComponent.includeTweenNodes(this.excludedUnits);
            excludedNodes.forEach(node => node.disableStroke());
        }

        // Show and enable non-excluded
        this.mathComponent.show();
        const allNodes = this.mathComponent.getTweenNodes();
        const excludedNodes = this.excludedUnits?.length
            ? new Set(this.mathComponent.includeTweenNodes(this.excludedUnits))
            : new Set();

        allNodes.forEach(node => {
            if (!excludedNodes.has(node)) node.enableStroke();
        });
    }

    _filterExcluded(lineUnit) {
        const filtered = new SelectionUnit();

        // Collect excluded fragment IDs
        const excludedIds = new Set();
        if (this.excludedUnits) {
            for (const unit of this.excludedUnits) {
                unit.fragments?.forEach(id => excludedIds.add(id));
            }
        }

        // Copy only non-excluded fragments
        lineUnit.fragments?.forEach(fragId => {
            if (!excludedIds.has(fragId)) filtered.addFragment(fragId);
        });

        return filtered;
    }
}
