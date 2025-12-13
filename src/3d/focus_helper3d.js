// FocusHelper class for hiding/showing objects

class FocusHelper {
    constructor() {
        this.hiddenObjects = new Map();
    }
    
    /**
     * Hide an object and its label if it has one
     * @param {THREE.Object3D} obj - The object to hide
     */
    fadeOut(obj) {
        if (!obj) return;
        
        // Store original visibility state only if not already stored
        if (!this.hiddenObjects.has(obj)) {
            const state = {
                visible: obj.visible,
                labelDisplay: null
            };
            
            // Store label's display state if it's a CSS2DObject
            // CSS2DObject has an element property but not isCSS2DObject
            if (obj.label && obj.label.element) {
                state.labelDisplay = obj.label.element.style.display || 'block';
            }
            
            this.hiddenObjects.set(obj, state);
        }
        
        // Hide the object
        obj.visible = false;
        
        // Hide CSS2DObject labels by setting display to none
        // CSS2DObject has an element property
        if (obj.label && obj.label.element) {
            obj.label.element.style.display = 'none';
        }
        
        // Also hide any CSS2DObject children
        if (obj.children) {
            obj.children.forEach(child => {
                // CSS2DObject has an element property
                if (child.element && child.element.style) {
                    child.element.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Show an object and its label if it has one
     * @param {THREE.Object3D} obj - The object to show
     */
    fadeIn(obj) {
        if (!obj) return;
        
        // Only restore if we previously hid it
        const originalState = this.hiddenObjects.get(obj);
        if (originalState) {
            // Restore object visibility
            obj.visible = originalState.visible;
            
            // Restore CSS2DObject label display
            if (obj.label && obj.label.element && originalState.labelDisplay !== null) {
                obj.label.element.style.display = originalState.labelDisplay;
            }
            
            // Also restore any CSS2DObject children
            if (obj.children) {
                obj.children.forEach(child => {
                    if (child.element && child.element.style) {
                        child.element.style.display = 'block';
                    }
                });
            }
            
            this.hiddenObjects.delete(obj);
        }
    }
    
    /**
     * Clean up all resources
     */
    dispose() {
        // Restore all hidden objects
        this.hiddenObjects.forEach((originalState, obj) => {
            obj.visible = originalState.visible;
            
            // Restore CSS2DObject label display
            if (obj.label && obj.label.element && originalState.labelDisplay !== null) {
                obj.label.element.style.display = originalState.labelDisplay;
            }
            
            // Also restore any CSS2DObject children
            if (obj.children) {
                obj.children.forEach(child => {
                    if (child.element && child.element.style) {
                        child.element.style.display = 'block';
                    }
                });
            }
        });
        this.hiddenObjects.clear();
    }
}

// Export factory function
export function createFocusHelper() {
    return new FocusHelper();
}

export { FocusHelper };