// EffectsManager class for managing focus effects on 3D diagram objects
import { FocusHelper } from './focus_helper3d.js';

class EffectsManager3D {
    constructor(diagram) {
        this.diagram = diagram;
        this.scene = diagram.scene;
        
        // Use FocusHelper for focus/fade effects
        this.focusHelper = new FocusHelper();
    }
    
    /**
     * Focus on specific objects, reducing opacity of all other visible objects
     * @param {Array} objectsToFocus - Array of THREE objects to focus on
     * @param {number} unfocusedOpacity - Opacity to set for unfocused objects (default 0.2)
     * @param {number} duration - Animation duration in seconds (default 0.3)
     */
    focus(objectsToFocus, unfocusedOpacity = 0.2, duration = 0.3) {
        // Convert to Set for efficient lookup
        const focusSet = new Set(objectsToFocus);
        
        // Process each object in the diagram's objects array
        this.diagram.objects.forEach(obj => {
            // Skip if object is null
            if (!obj) {
                return;
            }
            
            // If object is not in focus set, fade it out
            if (!focusSet.has(obj)) {
                this.focusHelper.fadeOut(obj, unfocusedOpacity, duration);
            }
        });
    }
    
    /**
     * Restore all objects to their original state
     */
    restore() {
        // Restore all faded objects instantly (no animation)
        this.diagram.objects.forEach(obj => {
            if (obj) {
                this.focusHelper.fadeIn(obj, 0);
            }
        });
    }
    
    /**
     * Check if any effects are currently active
     * @returns {boolean} True if effects are active
     */
    hasActiveEffects() {
        return this.focusHelper.originalStates.size > 0;
    }
    
    /**
     * Clean up all resources
     */
    dispose() {
        this.restore(); // Instant restore
        this.focusHelper.dispose();
    }
}

// Export factory function to create EffectsManager instances
export function createEffectsManager(diagram) {
    return new EffectsManager(diagram);
}