/**
 * CopyCommand - executes copied expressions from another page
 *
 * This command wraps multiple child commands and calls directPlay() on each.
 * The copied commands are executed instantly without animation.
 */
import { BaseCommand } from './BaseCommand.js';

export class CopyCommand extends BaseCommand {
    /**
     * @param {BaseCommand[]} childCommands - Array of commands to execute
     */
    constructor(childCommands) {
        super();
        this.childCommands = childCommands || [];
    }

    /**
     * Initialize all child commands
     */
    async doInit() {
        for (const cmd of this.childCommands) {
            cmd.diagram2d = this.diagram2d;
            await cmd.init(this.commandContext);
        }
    }

    /**
     * Play calls directPlay on all children (no animation for copy)
     */
    async doPlay() {
        for (const cmd of this.childCommands) {
            cmd.directPlay();
        }
    }

    /**
     * Direct play all child commands
     */
    doDirectPlay() {
        for (const cmd of this.childCommands) {
            cmd.directPlay();
        }
    }

    /**
     * Clear all child commands
     */
    clear() {
        for (const cmd of this.childCommands) {
            cmd.clear();
        }
        this.childCommands = [];
        super.clear();
    }

    /**
     * Get all command results from children
     */
    getCommandResult() {
        return this.childCommands.map(cmd => cmd.getCommandResult());
    }
}
