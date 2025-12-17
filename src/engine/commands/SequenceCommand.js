/**
 * SequenceCommand - Executes multiple commands sequentially
 *
 * A composite command that runs child commands one after another.
 * Supports:
 *   - Variable references: looks up from commandRegistry and replays
 *   - New commands: initializes and plays them
 */
import { BaseCommand } from './BaseCommand.js';

export class SequenceCommand extends BaseCommand {
    /**
     * @param {Array<string|null>} commandNames - Variable names for registry lookup (null for new commands)
     * @param {Array<BaseCommand|null>} commands - New commands (null for variable references)
     */
    constructor(commandNames = [], commands = []) {
        super();
        this.commandNames = commandNames;
        this.commands = commands;
    }

    async doInit() {
        // Don't initialize child commands here - defer to play time
        // This prevents commands like replace() from creating visible
        // elements before their turn in the sequence
    }

    async doPlay() {
        // Play each command sequentially
        for (let i = 0; i < this.commandNames.length; i++) {
            const name = this.commandNames[i];
            const command = this.commands[i];

            if (name) {
                // Variable reference - look up from registry and replay
                const refCommand = this.commandContext.commandRegistry[name];
                if (refCommand) {
                    await refCommand.playSingle();
                }
            } else if (command) {
                // New command - initialize and play
                command.diagram2d = this.diagram2d;
                await command.init(this.commandContext);
                await command.play();
            }
        }
    }

    async doDirectPlay() {
        // Direct play all commands sequentially
        for (let i = 0; i < this.commandNames.length; i++) {
            const name = this.commandNames[i];
            const command = this.commands[i];

            if (name) {
                // Variable reference - already rendered, nothing to do
            } else if (command) {
                // New command - initialize and direct play
                command.diagram2d = this.diagram2d;
                await command.init(this.commandContext);
                command.directPlay();
            }
        }
    }

    async playSingle() {
        // Replay all commands sequentially
        for (let i = 0; i < this.commandNames.length; i++) {
            const name = this.commandNames[i];
            const command = this.commands[i];

            if (name) {
                // Variable reference - look up and replay
                const refCommand = this.commandContext.commandRegistry[name];
                if (refCommand) {
                    await refCommand.playSingle();
                }
            } else if (command) {
                // New command - replay
                await command.playSingle();
            }
        }
    }

    clear() {
        // Only clear new commands we created
        for (const command of this.commands) {
            if (command) {
                command.clear();
            }
        }
        // Don't clear referenced commands - they belong to their original expressions
        super.clear();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
