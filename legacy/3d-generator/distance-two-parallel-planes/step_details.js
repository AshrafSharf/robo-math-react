// Step details for Distance-two-parallel-planes
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'first_plane': ['plane1-equation', 'normal1'],
            'second_plane': ['plane2-equation', 'normal2'],
            'normals_parallel': ['parallel-check'],
            'normalized_form': ['plane2-normalized'],
            'distance_visualization': ['distance-formula'],
            'calculation_components': ['numerator-calc', 'denominator-calc'],
            'final_distance': ['distance-result', 'final-answer']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    countSections() {
        return this.sections.length;
    }
    
    countRows() {
        return this.rows.length;
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Plane Equations
        this.panel.createText('planes-title',
            '<div class="step-details-title">Plane Equations</div>',
            tightStyle
        );
        this.sections.push('planes-title');
        
        // Step 1: First plane equation and normal
        this.panel.createText('plane1-equation',
            mathDisplay3D(`\\text{Plane 1: } \\pi_1: x + 2y - 2z + 1 = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('plane1-equation');
        
        this.panel.createText('normal1',
            mathDisplay3D(`\\text{Normal: } \\vec{n}_1 = (1, 2, -2)`, { block: true }),
            tightStyle
        );
        this.rows.push('normal1');
        
        // Step 2: Second plane equation and normal
        this.panel.createText('plane2-equation',
            mathDisplay3D(`\\text{Plane 2: } \\pi_2: 2x + 4y - 4z + 5 = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('plane2-equation');
        
        this.panel.createText('normal2',
            mathDisplay3D(`\\text{Normal: } \\vec{n}_2 = (2, 4, -4) = 2\\vec{n}_1`, { block: true }),
            tightStyle
        );
        this.rows.push('normal2');
        
        // Step 3: Parallel check
        this.panel.createText('parallel-check',
            mathDisplay3D(`\\text{Parallel: } \\vec{n}_2 = 2\\vec{n}_1`, { block: true }),
            tightStyle
        );
        this.rows.push('parallel-check');
        
        // SECTION 2: Normalized Form
        this.panel.createText('normalized-title',
            '<div class="step-details-title">Normalized Form</div>',
            tightStyle
        );
        this.sections.push('normalized-title');
        
        // Step 4: Normalized second plane
        this.panel.createText('plane2-normalized',
            mathDisplay3D(`\\text{Normalized: } x + 2y - 2z + \\frac{5}{2} = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('plane2-normalized');
        
        // Coefficients and constants
        this.panel.createText('coefficients',
            mathDisplay3D(`\\text{Coefficients: } a = 1, b = 2, c = -2`, { block: true }),
            tightStyle
        );
        this.rows.push('coefficients');
        
        this.panel.createText('constants',
            mathDisplay3D(`\\text{Constants: } d_1 = 1, d_2 = \\frac{5}{2}`, { block: true }),
            tightStyle
        );
        this.rows.push('constants');
        
        // SECTION 3: Distance Calculation
        this.panel.createText('distance-title',
            '<div class="step-details-title">Distance Calculation</div>',
            tightStyle
        );
        this.sections.push('distance-title');
        
        // Step 5: Distance formula
        this.panel.createText('distance-formula',
            mathDisplay3D(`\\delta = \\frac{|d_1 - d_2|}{\\sqrt{a^2 + b^2 + c^2}}`, { block: true }),
            tightStyle
        );
        this.rows.push('distance-formula');
        
        // Values substituted
        this.panel.createText('substitution',
            mathDisplay3D(`\\delta = \\frac{|1 - \\frac{5}{2}|}{\\sqrt{1^2 + 2^2 + (-2)^2}}`, { block: true }),
            tightStyle
        );
        this.rows.push('substitution');
        
        // Step 6: Calculation components
        this.panel.createText('numerator-calc',
            mathDisplay3D(`\\text{Numerator: } |1 - \\frac{5}{2}| = \\frac{3}{2}`, { block: true }),
            tightStyle
        );
        this.rows.push('numerator-calc');
        
        this.panel.createText('denominator-calc',
            mathDisplay3D(`\\text{Denominator: } \\sqrt{9} = 3`, { block: true }),
            tightStyle
        );
        this.rows.push('denominator-calc');
        
        // Step 7: Final result
        this.panel.createText('distance-result',
            mathDisplay3D(`\\text{Distance: } \\delta = \\frac{\\frac{3}{2}}{3} = \\frac{1}{2}`, { block: true }),
            tightStyle
        );
        this.rows.push('distance-result');
        
        this.panel.createText('final-answer',
            mathDisplay3D(`\\boxed{\\frac{1}{2} \\text{ units}}`, { block: true }),
            tightStyle
        );
        this.rows.push('final-answer');
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
