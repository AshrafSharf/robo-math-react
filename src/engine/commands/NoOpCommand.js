/**
 * NoOpCommand - A null object command that does nothing
 *
 * Used by expressions that don't render anything (e.g., x(), y(), st(), ed())
 * This avoids null checks throughout the pipeline - every expression can
 * return a command, but NoOpCommand simply does nothing.
 */
import { BaseCommand } from './BaseCommand.js';

export class NoOpCommand extends BaseCommand {
    constructor() {
        super();
        this.isInitialized = true; // Always considered initialized
    }

    /**
     * No-op init - does nothing
     */
    async doInit() {
        // Nothing to initialize
    }

    /**
     * No-op play - resolves immediately
     */
    async doPlay() {
        return Promise.resolve();
    }

    /**
     * No-op direct play - does nothing
     */
    doDirectPlay() {
        // Nothing to render
    }

    /**
     * No-op play single - resolves immediately
     */
    async playSingle() {
        return Promise.resolve();
    }

    /**
     * No-op clear - nothing to clear
     */
    clear() {
        // Nothing to clear
    }

    /**
     * Label position - return origin
     */
    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
