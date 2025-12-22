import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { createHighlighter } from '../common/js/step_details_highlighter.js';

/**
 * StepDetails class manages the display and highlighting of mathematical expressions
 * for each step of the angle between planes calculation
 */
export class StepDetails {
    constructor(controlPanel, angleDegrees) {
        this.panel = controlPanel;
        this.angleDegrees = angleDegrees;
        
        // Map step names to their corresponding math detail element IDs
        // Step names must match exactly what's pushed to stepsArray in main file
        const stepNameToElements = {
            // Step 1: First plane
            'plane1': ['plane1-equation'],
            
            // Step 2: Second plane  
            'plane2': ['plane2-equation'],
            
            // Step 3: Normal vector 1
            'normal1': ['normal1-vector', 'normal1-components'],
            
            // Step 4: Normal vector 2
            'normal2': ['normal2-vector', 'normal2-components'],
            
            // Step 5: Angle between normals
            'angle_between_normals': ['angle-formula', 'dot-product', 'magnitudes', 'cos-theta'],
            
            // Step 6: First intersection line
            'intersection_line1': ['intersection-explanation'],
            
            // Step 7: Second intersection line
            'intersection_line2': ['intersection-explanation'],
            
            // Step 8: Intersection angle
            'intersection_angle': ['angle-result']
        };
        
        // Create the highlighter with the step mapping
        this.highlighter = createHighlighter(stepNameToElements);
        
        // Initialize all expressions on creation
        this.initializeExpressions();
    }
    
    /**
     * Initialize all mathematical expressions in the control panel
     * Using our specific planes: x + y + z = 3 and z = 2
     */
    initializeExpressions() {
        // Clear the panel first
        this.panel.clear();
        
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Plane Equations
        this.panel.createText('planes-title', 
            '<div class="step-details-title">Plane Equations</div>',
            tightStyle
        );
        
        // Plane 1 equation
        this.panel.createText('plane1-equation', 
            mathDisplay3D(`\\text{Plane 1: } x + y + z = 3`, { block: true }),
            tightStyle
        );
        
        // Plane 2 equation
        this.panel.createText('plane2-equation',
            mathDisplay3D(`\\text{Plane 2: } z = 2`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Normal Vectors
        this.panel.createText('normals-title', 
            '<div class="step-details-title">Normal Vectors</div>',
            tightStyle
        );
        
        // Normal vector 1
        this.panel.createText('normal1-vector',
            mathDisplay3D(`\\text{Normal 1: } \\vec{n_1} = \\langle 1, 1, 1 \\rangle`, { block: true }),
            tightStyle
        );
        
        // Normal 1 components
        this.panel.createText('normal1-components',
            mathDisplay3D(`\\text{From coefficients of } x, y, z \\text{ in plane 1}`, { block: true }),
            tightStyle
        );
        
        // Normal vector 2
        this.panel.createText('normal2-vector',
            mathDisplay3D(`\\text{Normal 2: } \\vec{n_2} = \\langle 0, 0, 1 \\rangle`, { block: true }),
            tightStyle
        );
        
        // Normal 2 components
        this.panel.createText('normal2-components',
            mathDisplay3D(`\\text{From coefficients in plane 2: } 0x + 0y + z = 2`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Angle Calculation
        this.panel.createText('angle-title', 
            '<div class="step-details-title">Angle Between Planes</div>',
            tightStyle
        );
        
        // Angle formula
        this.panel.createText('angle-formula',
            mathDisplay3D(`\\cos \\theta = \\frac{|\\vec{n_1} \\cdot \\vec{n_2}|}{\\|\\vec{n_1}\\| \\cdot \\|\\vec{n_2}\\|}`, { block: true }),
            tightStyle
        );
        
        // Dot product
        this.panel.createText('dot-product',
            mathDisplay3D(`\\vec{n_1} \\cdot \\vec{n_2} = (1)(0) + (1)(0) + (1)(1) = 1`, { block: true }),
            tightStyle
        );
        
        // Magnitudes
        this.panel.createText('magnitudes',
            mathDisplay3D(`\\|\\vec{n_1}\\| = \\sqrt{1^2 + 1^2 + 1^2} = \\sqrt{3}`, { block: true }) +
            mathDisplay3D(`\\|\\vec{n_2}\\| = \\sqrt{0^2 + 0^2 + 1^2} = 1`, { block: true }),
            tightStyle
        );
        
        // Cos theta calculation
        this.panel.createText('cos-theta',
            mathDisplay3D(`\\cos \\theta = \\frac{|1|}{\\sqrt{3} \\cdot 1} = \\frac{1}{\\sqrt{3}}`, { block: true }),
            tightStyle
        );
        
        // SECTION 4: Result
        this.panel.createText('result-title', 
            '<div class="step-details-title">Result</div>',
            tightStyle
        );
        
        // Angle result
        this.panel.createText('angle-result',
            mathDisplay3D(`\\theta = \\cos^{-1}\\left(\\frac{1}{\\sqrt{3}}\\right) \\approx ${this.angleDegrees}°`, { block: true }),
            tightStyle
        );
        
        // Intersection explanation
        this.panel.createText('intersection-explanation',
            mathDisplay3D(`\\text{Angle visualized at plane intersection line}`, { block: true }),
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