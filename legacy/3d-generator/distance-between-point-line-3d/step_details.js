import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { createHighlighter } from '../common/js/step_details_highlighter.js';

/**
 * StepDetails class manages the display and highlighting of mathematical expressions
 * for each step of the distance between point and line calculation
 */
export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        
        // Map step names to their corresponding math detail element IDs
        // Step names must match exactly what's pushed to stepsArray in main file
        const stepNameToElements = {
            // Step 1: Showing the line
            'line': ['parametric-equations', 'direction-vector'],
            
            // Step 2: Point P on the line
            'point_on_line': ['point-p'],
            
            // Step 3: External point Q
            'external_point': ['point-q'],
            
            // Step 4: Vector PQ
            'vector_pq': ['vector-pq'],
            
            // Step 5: Direction vector
            'direction_vector': ['direction-vector'],
            
            // Step 6: Parallelogram area
            'parallelogram_area': ['cross-product', 'cross-magnitude'],
            
            // Step 7: Perpendicular distance
            'perpendicular_distance': ['cross-magnitude', 'direction-magnitude', 'distance-formula', 'distance-result']
        };
        
        // Create the highlighter with the step mapping
        this.highlighter = createHighlighter(stepNameToElements);
        
        // Initialize all expressions on creation
        this.initializeExpressions();
    }
    
    /**
     * Initialize all mathematical expressions in the control panel
     * Based on step-by-step.json content
     */
    initializeExpressions() {
        // Clear the panel first
        this.panel.clear();
        
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Line and Points
        this.panel.createText('line-title', 
            '<div class="step-details-title">Line and Points</div>',
            tightStyle
        );
        
        // Parametric equations of the line
        this.panel.createText('parametric-equations', 
            mathDisplay3D(`\\text{Line: } \\begin{cases} x = -2 + 3t \\\\ y = -2t \\\\ z = 1 + 4t \\end{cases}`, { block: true }),
            tightStyle
        );
        
        // Direction vector from parametric equations
        this.panel.createText('direction-vector',
            mathDisplay3D(`\\text{Direction vector: } \\vec{u} = \\langle 3, -2, 4 \\rangle`, { block: true }),
            tightStyle
        );
        
        // Point P on the line (when t=0)
        this.panel.createText('point-p',
            mathDisplay3D(`\\text{Point on line: } P = (-2, 0, 1) \\quad \\text{(at } t = 0\\text{)}`, { block: true }),
            tightStyle
        );
        
        // External point Q
        this.panel.createText('point-q',
            mathDisplay3D(`\\text{External point: } Q = (3, -1, 4)`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Vector Calculations
        this.panel.createText('vector-title', 
            '<div class="step-details-title">Vector Calculations</div>',
            tightStyle
        );
        
        // Vector PQ
        this.panel.createText('vector-pq',
            mathDisplay3D(`\\vec{PQ} = \\langle 3-(-2), -1-0, 4-1 \\rangle = \\langle 5, -1, 3 \\rangle`, { block: true }),
            tightStyle
        );
        
        // Cross product calculation
        this.panel.createText('cross-product',
            mathDisplay3D(`\\vec{PQ} \\times \\vec{u} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 5 & -1 & 3 \\\\ 3 & -2 & 4 \\end{vmatrix} = \\langle 2, -11, -7 \\rangle`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Magnitudes and Distance
        this.panel.createText('distance-title', 
            '<div class="step-details-title">Magnitudes and Distance</div>',
            tightStyle
        );
        
        // Magnitude of cross product
        this.panel.createText('cross-magnitude',
            mathDisplay3D(`\\|\\vec{PQ} \\times \\vec{u}\\| = \\sqrt{2^2 + (-11)^2 + (-7)^2} = \\sqrt{174}`, { block: true }),
            tightStyle
        );
        
        // Magnitude of direction vector
        this.panel.createText('direction-magnitude',
            mathDisplay3D(`\\|\\vec{u}\\| = \\sqrt{3^2 + (-2)^2 + 4^2} = \\sqrt{29}`, { block: true }),
            tightStyle
        );
        
        // Distance formula
        this.panel.createText('distance-formula',
            mathDisplay3D(`D = \\frac{\\|\\vec{PQ} \\times \\vec{u}\\|}{\\|\\vec{u}\\|} = \\frac{\\sqrt{174}}{\\sqrt{29}} = \\sqrt{6} \\approx 2.45`, { block: true }),
            tightStyle
        );
        
        // Final result
        this.panel.createText('distance-result',
            mathDisplay3D(`\\text{Distance} = \\sqrt{6} \\approx 2.45`, { block: true }),
            tightStyle
        );
    }
    
    /**
     * Highlight details for a specific step using step name
     * @param {string} stepName - The name of the step object being shown
     */
    highlightDetails(stepName) {
        console.log(`[StepDetails] highlightDetails called for step: ${stepName}`);
        // Delegate to the common highlighter
        this.highlighter.highlightDetails(stepName);
    }
    
    /**
     * Reset to initial state
     */
    reset() {
        this.highlighter.reset();
        // Don't automatically highlight anything - wait for user to press next
    }
    
    /**
     * Get the current step name
     * @returns {string} Current step name
     */
    getCurrentStepName() {
        return this.highlighter.getCurrentStepName();
    }
}