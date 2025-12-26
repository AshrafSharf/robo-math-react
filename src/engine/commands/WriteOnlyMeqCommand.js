/**
 * WriteOnlyMeqCommand - Writes meq with line-by-line animation, showing ONLY included patterns
 *
 * Patterns are sorted by which line they belong to, then animated sequentially.
 */
import { BaseMeqCommand } from './BaseMeqCommand.js';
import { PatternSelector } from '../../mathtext/utils/pattern-selector.js';

export class WriteOnlyMeqCommand extends BaseMeqCommand {
    constructor(meqExpression, row, col, includePatterns, styleOptions = {}) {
        super(meqExpression, row, col, styleOptions);
        this.includePatterns = includePatterns;
        this.selectionUnits = null;
    }

    async doSubclassInit() {
        this.selectionUnits = PatternSelector.getSelectionUnits(
            this.mathComponent,
            this.includePatterns
        );
    }

    getSelectionUnitsForAnimation(sortedLineBounds) {
        if (!this.selectionUnits?.length) return [];
        return this._sortUnitsByLine(this.selectionUnits, sortedLineBounds);
    }

    prepareForAnimation() {
        // Hide non-selected strokes
        const nonSelectedNodes = this.mathComponent.excludeTweenNodes(this.selectionUnits);
        nonSelectedNodes.forEach(node => node.disableStroke());
    }

    shouldAutoComplete() {
        return false; // Only show included patterns
    }

    doDirectPlay() {
        if (!this.mathComponent || !this.selectionUnits?.length) return;

        const nonSelectedNodes = this.mathComponent.excludeTweenNodes(this.selectionUnits);
        nonSelectedNodes.forEach(node => node.disableStroke());

        this.mathComponent.show();
        this.selectionUnits.forEach(unit => {
            const nodes = this.mathComponent.includeTweenNodes([unit]);
            nodes.forEach(node => node.enableStroke());
        });
    }

    /**
     * Sort selection units by which line they belong to
     */
    _sortUnitsByLine(units, sortedLineBounds) {
        if (!sortedLineBounds.length) return units;

        const unitsWithIndex = units.map(unit => ({
            unit,
            lineIndex: this._getLineIndex(unit, sortedLineBounds)
        }));

        unitsWithIndex.sort((a, b) => a.lineIndex - b.lineIndex);
        return unitsWithIndex.map(item => item.unit);
    }

    _getLineIndex(unit, sortedLineBounds) {
        const bounds = this._getUnitBounds(unit);
        if (!bounds) return Infinity;

        const midY = (bounds.minY + bounds.maxY) / 2;

        // Find matching line
        let idx = sortedLineBounds.findIndex(lb => midY >= lb.minY && midY <= lb.maxY);
        if (idx !== -1) return idx;

        // Find closest line
        let minDist = Infinity;
        sortedLineBounds.forEach((lb, i) => {
            const dist = Math.abs(midY - (lb.minY + lb.maxY) / 2);
            if (dist < minDist) { minDist = dist; idx = i; }
        });
        return idx;
    }

    _getUnitBounds(unit) {
        if (!unit.fragments?.length) return null;

        let minY = Infinity, maxY = -Infinity;
        const allNodes = this.mathComponent.getTweenNodes();

        for (const fragId of unit.fragments) {
            const node = allNodes.find(n => n.fragmentId === fragId);
            if (node?.getBounds) {
                const b = node.getBounds();
                if (b) {
                    minY = Math.min(minY, b.minY ?? b.y ?? 0);
                    maxY = Math.max(maxY, b.maxY ?? (b.y + b.height) ?? 0);
                }
            }
        }
        return minY === Infinity ? null : { minY, maxY };
    }
}
