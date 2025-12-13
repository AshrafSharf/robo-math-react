/**
 * Base3DCommand - Base class for all 3D commands
 *
 * Overrides 2D-specific methods from BaseCommand for 3D compatibility.
 */
import { BaseCommand } from '../BaseCommand.js';

export class Base3DCommand extends BaseCommand {
    /**
     * Override doDirectPlay - 3D objects don't have renderEndState/show
     * They render immediately when added to the scene
     */
    doDirectPlay() {
        // 3D objects are visible immediately when added to scene
        // No renderEndState/show needed
    }
}
