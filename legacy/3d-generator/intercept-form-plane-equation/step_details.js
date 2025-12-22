import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from stepsArray to panel element IDs
        const stepNameToElements = {
            'x_intercept': ['given-intercepts', 'intercept-points'],
            'y_intercept': ['given-intercepts', 'intercept-points'],
            'z_intercept': ['given-intercepts', 'intercept-points'],
            'edge_xy': ['intercept-form', 'substituted-form'],
            'edge_yz': ['intercept-form', 'substituted-form'],
            'edge_zx': ['intercept-form', 'substituted-form'],
            'plane_triangle': ['substituted-form', 'cartesian-form'],
            'equation_label': ['cartesian-form', 'verify-a', 'verify-b', 'verify-c', 'final-result']
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
        
        // SECTION 1: Formula and Given Values
        this.panel.createText('form-title',
            '<div class="step-details-title">Formula and Given Values</div>',
            tightStyle
        );
        this.sections.push('form-title');
        
        // Step 1: General intercept form (Formula)
        this.panel.createText('intercept-form',
            mathDisplay3D(`\\text{General intercept form: } \\frac{x}{a}+\\frac{y}{b}+\\frac{z}{c}=1`, { block: true }),
            tightStyle
        );
        this.rows.push('intercept-form');
        
        // Show the three intercept points in a more compact way
        this.panel.createText('given-intercepts',
            mathDisplay3D(`\\text{Given intercepts: } a = 4, \\quad b = -6, \\quad c = 8`, { block: true }),
            tightStyle
        );
        this.rows.push('given-intercepts');
        
        this.panel.createText('intercept-points',
            mathDisplay3D(`\\text{Points: } A(4,0,0)\\hat{i}, \\quad B(0,-6,0)\\hat{j}, \\quad C(0,0,8)\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('intercept-points');
        
        // SECTION 2: Substitution and Calculation
        this.panel.createText('calc-title',
            '<div class="step-details-title">Substitution and Calculation</div>',
            tightStyle
        );
        this.sections.push('calc-title');
        
        // Step 2: Substitution (applying values)
        this.panel.createText('substituted-form',
            mathDisplay3D(`\\text{Substituting values: } \\frac{x}{4}+\\frac{y}{-6}+\\frac{z}{8}=1`, { block: true }),
            tightStyle
        );
        this.rows.push('substituted-form');
        
        // Step 3: Cartesian form
        this.panel.createText('cartesian-form',
            mathDisplay3D(`\\text{Cartesian form: } 6x - 4y + 3z = 24`, { block: true }),
            tightStyle
        );
        this.rows.push('cartesian-form');
        
        // SECTION 3: Result and Verification
        this.panel.createText('result-title',
            '<div class="step-details-title">Result and Verification</div>',
            tightStyle
        );
        this.sections.push('result-title');
        
        // Verification - show that intercepts satisfy the equation
        this.panel.createText('verify-a',
            mathDisplay3D(`\\text{Check } A(4,0,0): \\quad \\frac{4}{4} + \\frac{0}{-6} + \\frac{0}{8} = 1 \\quad \\checkmark`, { block: true }),
            tightStyle
        );
        this.rows.push('verify-a');
        
        this.panel.createText('verify-b',
            mathDisplay3D(`\\text{Check } B(0,-6,0): \\quad \\frac{0}{4} + \\frac{-6}{-6} + \\frac{0}{8} = 1 \\quad \\checkmark`, { block: true }),
            tightStyle
        );
        this.rows.push('verify-b');
        
        this.panel.createText('verify-c',
            mathDisplay3D(`\\text{Check } C(0,0,8): \\quad \\frac{0}{4} + \\frac{0}{-6} + \\frac{8}{8} = 1 \\quad \\checkmark`, { block: true }),
            tightStyle
        );
        this.rows.push('verify-c');
        
        // Final result (boxed)
        this.panel.createText('final-result',
            mathDisplay3D(`\\boxed{\\text{Intercept form: } \\frac{x}{4}+\\frac{y}{-6}+\\frac{z}{8}=1}`, { block: true }),
            tightStyle
        );
        this.rows.push('final-result');
        
        // Verify we're within limits (3 sections + 8 rows = 11 total, well under 18 limit)
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
