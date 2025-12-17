/**
 * SequenceCommand - Executes multiple commands sequentially
 *
 * A composite command that runs child commands one after another.
 */
import { BaseCommand } from './BaseCommand.js';

export class SequenceCommand extends BaseCommand {
    /**
     * @param {Array<BaseCommand>} commands - Commands to execute sequentially
     */
    constructor(commands) {
        super();
        this.commands = commands;
    }

    async doInit() {
        // Don't initialize child commands here - defer to play time
        // This prevents commands like replace() from creating visible
        // elements before their turn in the sequence
    }

    async doPlay() {
        // Initialize and play each command sequentially
        for (const command of this.commands) {
            command.diagram2d = this.diagram2d;
            await command.init(this.commandContext);
            await command.play();
        }
    }

    async doDirectPlay() {
        // Initialize and direct play all commands sequentially
        for (const command of this.commands) {
            command.diagram2d = this.diagram2d;
            await command.init(this.commandContext);
            command.directPlay();
        }
    }

    async playSingle() {
        // Replay all commands sequentially
        for (const command of this.commands) {
            await command.playSingle();
        }
    }

    clear() {
        // Clear all child commands
        for (const command of this.commands) {
            command.clear();
        }
        super.clear();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
