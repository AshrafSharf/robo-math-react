/**
 * Focus Effect - Highlight specific objects by reducing opacity of others
 * Useful for guided learning and emphasizing specific concepts
 */
export class FocusEffect {
  constructor() {
    this.originalStates = new Map();
    this.isFocused = false;
  }
  
  /**
   * Focus on specific objects by dimming others
   * @param {Array} objectsToFocus - Array of shape objects to keep focused
   * @param {Array} allObjects - Array of all shape objects in diagram
   * @param {number} unfocusedOpacity - Opacity for unfocused objects (0-1)
   * @param {number} duration - Animation duration in seconds
   */
  focus(objectsToFocus, allObjects, unfocusedOpacity = 0.3, duration = 0.5) {
    // Clear any previous focus state
    this.clear();
    
    // Store original opacity for all objects
    allObjects.forEach(obj => {
      if (obj && obj.primitiveShape) {
        // Get current opacity
        const currentOpacity = obj.primitiveShape.attr('opacity') || 
                             obj.primitiveShape.attr('fill-opacity') || 
                             1;
        this.originalStates.set(obj, {
          opacity: currentOpacity,
          fillOpacity: obj.primitiveShape.attr('fill-opacity'),
          strokeOpacity: obj.primitiveShape.attr('stroke-opacity')
        });
        
        // If object is not in focus list, reduce its opacity
        if (!objectsToFocus.includes(obj)) {
          // Apply transition
          obj.primitiveShape
            .transition()
            .duration(duration * 1000)
            .attr('opacity', unfocusedOpacity);
        }
      }
    });
    
    this.isFocused = true;
  }
  
  /**
   * Restore all objects to their original opacity
   * @param {number} duration - Animation duration in seconds
   */
  restore(duration = 0.5) {
    if (!this.isFocused) return;
    
    // Restore all original opacities
    this.originalStates.forEach((state, obj) => {
      if (obj && obj.primitiveShape) {
        obj.primitiveShape
          .transition()
          .duration(duration * 1000)
          .attr('opacity', state.opacity);
        
        // Restore fill and stroke opacity if they were set
        if (state.fillOpacity !== undefined) {
          obj.primitiveShape.attr('fill-opacity', state.fillOpacity);
        }
        if (state.strokeOpacity !== undefined) {
          obj.primitiveShape.attr('stroke-opacity', state.strokeOpacity);
        }
      }
    });
    
    this.clear();
  }
  
  /**
   * Clear stored states
   */
  clear() {
    this.originalStates.clear();
    this.isFocused = false;
  }
  
  /**
   * Check if effect is currently active
   * @returns {boolean} True if focused
   */
  isActive() {
    return this.isFocused;
  }
  
  /**
   * Get objects that are currently focused
   * @returns {Array} Array of focused objects
   */
  getFocusedObjects() {
    if (!this.isFocused) return [];
    
    const focused = [];
    this.originalStates.forEach((state, obj) => {
      // Objects with original opacity are the focused ones
      const currentOpacity = obj.primitiveShape?.attr('opacity');
      if (currentOpacity === state.opacity) {
        focused.push(obj);
      }
    });
    return focused;
  }
}