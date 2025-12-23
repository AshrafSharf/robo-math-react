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

    /**
     * Clear 3D object from scene
     */
    clear() {
        if (this.commandResult && this.graphContainer) {
            const scene = this.graphContainer.getScene();
            if (scene) {
                scene.remove(this.commandResult);
            }
            // Dispose geometry and material to prevent memory leaks
            if (this.commandResult.geometry) {
                this.commandResult.geometry.dispose();
            }
            if (this.commandResult.material) {
                this.commandResult.material.dispose();
            }
            this.commandResult = null;
        }
        this.isInitialized = false;
    }
}
