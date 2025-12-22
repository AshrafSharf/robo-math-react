// Step details for Distance From Point to Plane
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'plane': ['plane-equation', 'plane-constant'],
            'point_u': ['point-u'],
            'position_vector_u': ['position-vector'],
            'normal_vector': ['normal-vector'],
            'dot_product_calculation': ['dot-product-calc', 'dot-product-expanded', 'dot-product-result'],
            'perpendicular_distance': ['distance-formula', 'numerator-calc', 'numerator-result', 'magnitude-calc', 'magnitude-result'],
            'final_result': ['final-distance', 'final-answer']
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
        
        // SECTION 1: Input Data
        this.panel.createText('input-title',
            '<div class="step-details-title">Input Data</div>',
            tightStyle
        );
        this.sections.push('input-title');
        
        // Plane equation: r·(6i - 3j + 2k) = 5
        this.panel.createText('plane-equation',
            mathDisplay3D(`\\text{Plane: } \\vec{r} \\cdot \\vec{n} = p`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-equation');
        
        // Normal vector and constant
        this.panel.createText('normal-vector',
            mathDisplay3D(`\\text{Normal: } \\vec{n} = 6\\hat{i} - 3\\hat{j} + 2\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('normal-vector');
        
        this.panel.createText('plane-constant',
            mathDisplay3D(`\\text{Constant: } p = 5`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-constant');
        
        // Point U
        this.panel.createText('point-u',
            mathDisplay3D(`\\text{Point: } U = (2, 5, -3)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-u');
        
        // Position vector
        this.panel.createText('position-vector',
            mathDisplay3D(`\\text{Position vector: } \\vec{u} = 2\\hat{i} + 5\\hat{j} - 3\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector');
        
        // SECTION 2: Distance Calculation
        this.panel.createText('calc-title',
            '<div class="step-details-title">Distance Calculation</div>',
            tightStyle
        );
        this.sections.push('calc-title');
        
        // Distance formula
        this.panel.createText('distance-formula',
            mathDisplay3D(`\\text{Formula: } \\delta = \\frac{|\\vec{u} \\cdot \\vec{n} - p|}{|\\vec{n}|}`, { block: true }),
            tightStyle
        );
        this.rows.push('distance-formula');
        
        // Dot product calculation
        this.panel.createText('dot-product-calc',
            mathDisplay3D(`\\text{Dot product: } \\vec{u} \\cdot \\vec{n}`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-calc');
        
        this.panel.createText('dot-product-expanded',
            mathDisplay3D(`= (2)(6) + (5)(-3) + (-3)(2)`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-expanded');
        
        this.panel.createText('dot-product-result',
            mathDisplay3D(`= 12 - 15 - 6 = -9`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-result');
        
        // Numerator calculation
        this.panel.createText('numerator-calc',
            mathDisplay3D(`\\text{Numerator: } |\\vec{u} \\cdot \\vec{n} - p|`, { block: true }),
            tightStyle
        );
        this.rows.push('numerator-calc');
        
        this.panel.createText('numerator-result',
            mathDisplay3D(`= |-9 - 5| = |-14| = 14`, { block: true }),
            tightStyle
        );
        this.rows.push('numerator-result');
        
        // Magnitude calculation
        this.panel.createText('magnitude-calc',
            mathDisplay3D(`\\text{Magnitude: } |\\vec{n}| = \\sqrt{6^2 + (-3)^2 + 2^2}`, { block: true }),
            tightStyle
        );
        this.rows.push('magnitude-calc');
        
        this.panel.createText('magnitude-result',
            mathDisplay3D(`= \\sqrt{36 + 9 + 4} = \\sqrt{49} = 7`, { block: true }),
            tightStyle
        );
        this.rows.push('magnitude-result');
        
        // SECTION 3: Result
        this.panel.createText('result-title',
            '<div class="step-details-title">Result</div>',
            tightStyle
        );
        this.sections.push('result-title');
        
        // Final calculation
        this.panel.createText('final-distance',
            mathDisplay3D(`\\text{Distance: } \\delta = \\frac{14}{7} = 2`, { block: true }),
            tightStyle
        );
        this.rows.push('final-distance');
        
        this.panel.createText('final-answer',
            mathDisplay3D(`\\therefore \\text{ Distance = 2 units}`, { block: true }),
            tightStyle
        );
        this.rows.push('final-answer');
        
        // Verify we're within limits: 3 sections, 15 rows
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
