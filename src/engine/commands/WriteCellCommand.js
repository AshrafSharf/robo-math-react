/**
 * WriteCellCommand - Writes table cell content with animation
 *
 * For LaTeX content: Uses pen-tracing animation (stroke-dasharray)
 * For plain text: Uses typewriter effect
 *
 * Lifecycle:
 *   doInit():
 *     - Gets TableCell reference from table collection
 *     - Hides cell content for animation
 *
 *   playSingle() (animated):
 *     - Effect.show() → cell visible, content hidden
 *     - Effect.doPlay() → animate content (pen-trace or typewriter)
 *
 *   doDirectPlay() (instant):
 *     - show() → cell and content visible immediately
 */
import { BaseCommand } from './BaseCommand.js';
import { WriteCellEffect } from '../../effects/write-cell-effect.js';

export class WriteCellCommand extends BaseCommand {
    /**
     * Create a write cell command
     * @param {string} tableVariableName - Variable name of the table
     * @param {number} rowIndex - Row index of the cell
     * @param {number} colIndex - Column index of the cell
     */
    constructor(tableVariableName, rowIndex, colIndex) {
        super();
        this.tableVariableName = tableVariableName;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.tableCell = null;
    }

    /**
     * Initialize the command - look up TableCell from table
     */
    async doInit() {
        // Get table from shape registry
        const tableResult = this.commandContext.shapeRegistry[this.tableVariableName];
        if (!tableResult || !tableResult.tableCollection) {
            console.warn(`WriteCellCommand: Table "${this.tableVariableName}" not found or has no collection`);
            return;
        }

        // Get the specific cell
        this.tableCell = tableResult.tableCollection.getCell(this.rowIndex, this.colIndex);
        if (!this.tableCell) {
            console.warn(`WriteCellCommand: Cell [${this.rowIndex}, ${this.colIndex}] not found in table`);
            return;
        }

        // Prepare for animation - hide content
        if (this.tableCell.isMath()) {
            this.tableCell.disableStrokes();
        }

        this.commandResult = this.tableCell;
    }

    /**
     * Play the write animation
     */
    async playSingle() {
        if (!this.tableCell) return;

        const effect = new WriteCellEffect(this.tableCell);
        return effect.play();
    }

    /**
     * Instant render without animation
     */
    doDirectPlay() {
        if (this.tableCell) {
            this.tableCell.show();
            if (this.tableCell.isMath()) {
                this.tableCell.enableStrokes();
            }
        }
    }

    /**
     * Get label position for compatibility
     */
    getLabelPosition() {
        return { x: this.colIndex, y: this.rowIndex };
    }

    /**
     * Clear - no-op for cells (they're managed by table)
     */
    clear() {
        this.tableCell = null;
        this.commandResult = null;
        this.isInitialized = false;
    }
}
