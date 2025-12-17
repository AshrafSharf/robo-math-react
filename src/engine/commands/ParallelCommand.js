/**
 * ParallelCommand - Plays multiple commands in parallel
 *
 * Supports:
 *   - Variable references: looks up from commandRegistry and replays
 *   - New commands: initializes and plays them
 */
import { BaseCommand } from './BaseCommand.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';

export class ParallelCommand extends BaseCommand {
    /**
     * @param {Array<string>} commandNames - Variable names for registry lookup
     * @param {Array<BaseCommand>} commands - New commands to create and play
     */
    constructor(commandNames = [], commands = []) {
        super();
        this.commandNames = commandNames;
        this.commands = commands;          // New commands passed in
        this.referencedCommands = [];      // Looked up from registry
    }

    async doInit() {
        // Look up referenced commands from registry
        this.referencedCommands = this.commandNames
            .map(name => this.commandContext.commandRegistry[name])
            .filter(cmd => cmd != null);

        // Initialize new commands in parallel
        if (this.commands.length > 0) {
            await Promise.all(
                this.commands.map(command => {
                    command.diagram2d = this.diagram2d;
                    return command.init(this.commandContext);
                })
            );
        }
    }

    async doPlay() {
        const wasPenActive = RoboEventManager.isPenActive();
        RoboEventManager.setPenActive(false);
        try {
            // Play all in parallel
            const promises = [
                // Replay referenced commands
                ...this.referencedCommands.map(cmd => cmd.playSingle()),
                // Play new commands
                ...this.commands.map(cmd => cmd.play())
            ];
            await Promise.all(promises);
        } finally {
            RoboEventManager.setPenActive(wasPenActive);
        }
    }

    async doDirectPlay() {
        // Direct play new commands
        for (const cmd of this.commands) {
            cmd.directPlay();
        }
        // Referenced commands are already rendered
    }

    async playSingle() {
        const wasPenActive = RoboEventManager.isPenActive();
        RoboEventManager.setPenActive(false);
        try {
            // Replay all in parallel
            const promises = [
                ...this.referencedCommands.map(cmd => cmd.playSingle()),
                ...this.commands.map(cmd => cmd.playSingle())
            ];
            await Promise.all(promises);
        } finally {
            RoboEventManager.setPenActive(wasPenActive);
        }
    }

    clear() {
        // Only clear new commands we created
        for (const cmd of this.commands) {
            cmd.clear();
        }
        // Don't clear referenced commands - they belong to their original expressions
        super.clear();
    }

    getLabelPosition() {
        return { x: 0, y: 0 };
    }
}
