import 'animate.css';
import '../css/step_details.css';

/**
 * Common StepDetailsHighlighter class for managing mathematical expression highlighting
 * This class provides reusable highlighting functionality for all lessons
 */
export class StepDetailsHighlighter {
    constructor() {
        this.currentStepName = '';
        this.highlightedElements = [];
        this.stepNameToElements = {};
    }
    
    /**
     * Set the mapping of step names to element IDs
     * @param {Object} mapping - Object mapping step names to arrays of element IDs
     */
    setStepMapping(mapping) {
        this.stepNameToElements = mapping;
    }
    
    /**
     * Highlight details for a specific step using step name
     * @param {string} stepName - The name of the step object being shown
     */
    highlightDetails(stepName) {
        console.log(`[StepDetailsHighlighter] highlightDetails called for step: ${stepName}`);
        
        // Get the elements to highlight for this step
        const elementsToHighlight = this.stepNameToElements[stepName];
        
        // If no elements mapped for this step, just clear highlights and return
        if (!elementsToHighlight) {
            console.log(`[StepDetailsHighlighter] No elements mapped for step: ${stepName} - clearing highlights only`);
            this.clearHighlights();
            this.currentStepName = stepName;
            return;
        }
        
        // Check if the highlighting needs to change
        const currentElements = this.highlightedElements.map(el => el.id);
        const newElements = elementsToHighlight.map(id => `text-${id}`);
        const needsUpdate = !this.arraysEqual(currentElements, newElements);
        
        if (!needsUpdate) {
            console.log(`[StepDetailsHighlighter] Same elements already highlighted, keeping animation`);
            this.currentStepName = stepName;
            return;
        }
        
        console.log(`[StepDetailsHighlighter] Elements to highlight for ${stepName}:`, elementsToHighlight);
        
        // Clear previous highlights
        this.clearHighlights();
        
        // Store the current step name
        this.currentStepName = stepName;
        
        // Apply highlighting and animation to each element for this step
        elementsToHighlight.forEach(elementId => {
            const fullId = `text-${elementId}`;
            const element = document.getElementById(fullId);
            
            if (element) {
                console.log(`[StepDetailsHighlighter] Highlighting element: ${fullId}`);
                // Add highlight class
                element.classList.add('step-details-highlight');
                
                // Add animate.css animation classes with infinite loop
                element.classList.add('animate__animated', 'animate__pulse', 'animate__infinite');
                
                // Store reference for cleanup
                this.highlightedElements.push(element);
            } else {
                console.warn(`[StepDetailsHighlighter] Element not found: ${fullId}`);
            }
        });
    }
    
    /**
     * Helper function to check if two arrays are equal
     * @param {Array} a - First array
     * @param {Array} b - Second array
     * @returns {boolean} True if arrays have same elements in same order
     */
    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
    
    /**
     * Clear all highlights and animations
     */
    clearHighlights() {
        this.highlightedElements.forEach(element => {
            // Remove highlight class
            element.classList.remove('step-details-highlight');
            
            // Remove animation classes
            element.classList.remove('animate__animated', 'animate__pulse', 'animate__infinite',
                                    'animate__flash', 'animate__bounce', 'animate__fadeIn', 'animate__zoomIn');
        });
        
        // Clear the array
        this.highlightedElements = [];
    }
    
    /**
     * Reset to initial state
     */
    reset() {
        this.clearHighlights();
        this.currentStepName = '';
    }
    
    /**
     * Get the current step name
     * @returns {string} Current step name
     */
    getCurrentStepName() {
        return this.currentStepName;
    }
}

/**
 * Factory function to create a highlighter instance
 * @param {Object} stepMapping - Object mapping step names to arrays of element IDs
 * @returns {StepDetailsHighlighter} A new highlighter instance
 */
export function createHighlighter(stepMapping = {}) {
    const highlighter = new StepDetailsHighlighter();
    if (stepMapping && Object.keys(stepMapping).length > 0) {
        highlighter.setStepMapping(stepMapping);
    }
    return highlighter;
}