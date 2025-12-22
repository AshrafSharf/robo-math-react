import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from stepsArray to panel element IDs
        const stepNameToElements = {
            'plane': ['plane-equation'],
            'line': ['line-equation'],
            'point_on_line': ['position-vector-value'],
            'position_vector': ['position-vector-value'],
            'direction_vector': ['direction-vector'],
            'normal_vector': ['normal-vector'],
            'vectors_from_origin': ['direction-vector', 'normal-vector'],
            'angle_phi': ['angle-formula', 'dot-product'],
            'angle_theta': ['angle-formula', 'angle-relationship'],
            'angle_relationship_focus': ['angle-relationship', 'angle-formula'],
            'final_result': ['magnitudes', 'angle-substitution', 'angle-result']
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
        
        // SECTION 1: Input Geometry (2 items)
        this.panel.createText('input-title',
            '<div class="step-details-title">Input Geometry</div>',
            tightStyle
        );
        this.sections.push('input-title');
        
        // Line equation from step-by-step.json
        this.panel.createText('line-equation',
            mathDisplay3D(`\\text{Line: } \\vec{r} = (2i + 3j + k) + t(i - j + k)`, { block: true }),
            tightStyle
        );
        this.rows.push('line-equation');
        
        // Plane equation from problem statement
        this.panel.createText('plane-equation',
            mathDisplay3D(`\\text{Plane: } 2x - y + z = 5`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-equation');
        
        // SECTION 2: Vectors (4 items)
        this.panel.createText('vectors-title',
            '<div class="step-details-title">Vectors</div>',
            tightStyle
        );
        this.sections.push('vectors-title');
        
        // Position vector (from line equation)
        this.panel.createText('position-vector-value',
            mathDisplay3D(`\\text{Position: } \\vec{r}_0 = (2, 3, 1)`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector-value');
        
        // Direction vector from step 1
        this.panel.createText('direction-vector',
            mathDisplay3D(`\\text{Direction: } \\vec{b} = (1, -1, 1)`, { block: true }),
            tightStyle
        );
        this.rows.push('direction-vector');
        
        // Normal vector from step 1
        this.panel.createText('normal-vector',
            mathDisplay3D(`\\text{Normal: } \\vec{n} = (2, -1, 1)`, { block: true }),
            tightStyle
        );
        this.rows.push('normal-vector');
        
        // Angle relationship from step 2
        this.panel.createText('angle-relationship',
            mathDisplay3D(`\\text{Since } \\vec{n} \\perp \\text{plane: } \\theta_{\\text{line-plane}} = 90° - \\phi_{\\text{line-normal}}`, { block: true }),
            tightStyle
        );
        this.rows.push('angle-relationship');
        
        // SECTION 3: Calculation (7 items)
        this.panel.createText('calculation-title',
            '<div class="step-details-title">Angle Calculation</div>',
            tightStyle
        );
        this.sections.push('calculation-title');
        
        // Formula from step 2
        this.panel.createText('angle-formula',
            mathDisplay3D(`\\text{Angle formula: } \\theta = \\sin^{-1}\\left( \\frac{|\\vec{b} \\cdot \\vec{n}|}{|\\vec{b}||\\vec{n}|} \\right)`, { block: true }),
            tightStyle
        );
        this.rows.push('angle-formula');
        
        // Dot product from step 3
        this.panel.createText('dot-product',
            mathDisplay3D(`\\text{Dot product: } \\vec{b} \\cdot \\vec{n} = 2 + 1 + 1 = 4`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product');
        
        // Magnitudes from step 4 (combined in align for compactness)
        this.panel.createText('magnitudes',
            mathDisplay3D(`\\text{Magnitudes: } \\begin{align}
|\\vec{b}| &= \\sqrt{1^2 + (-1)^2 + 1^2} = \\sqrt{3}\\\\
|\\vec{n}| &= \\sqrt{2^2 + (-1)^2 + 1^2} = \\sqrt{6}
\\end{align}`, { block: true }),
            tightStyle
        );
        this.rows.push('magnitudes');
        
        // Substitution from step 5
        this.panel.createText('angle-substitution',
            mathDisplay3D(`\\text{Angle } \\theta: \\sin^{-1}\\left( \\frac{4}{\\sqrt{3} \\cdot \\sqrt{6}} \\right) = \\sin^{-1}\\left( \\frac{4}{3\\sqrt{2}} \\right)`, { block: true }),
            tightStyle
        );
        this.rows.push('angle-substitution');
        
        // Final result from step 6
        this.panel.createText('angle-result',
            mathDisplay3D(`\\text{Result: } \\boxed{\\theta = \\sin^{-1}\\left( \\frac{2\\sqrt{2}}{3} \\right)}`, { block: true }),
            tightStyle
        );
        this.rows.push('angle-result');
        
        // Verify we're within limits
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
