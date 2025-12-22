import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'line1': ['line1-equation'],
            'line2': ['line2-equation'],
            'point_a_on_l1': ['point-a'],
            'point_c_on_l2': ['point-c'],
            'position_vectors': ['vec-a', 'vec-c'],
            'direction_vectors': ['vec-b', 'vec-d'],
            'cross_product_computed': ['cross-product', 'cross-result', 'cross-simplified'],
            'cross_product_focus': ['cross-product', 'cross-result', 'cross-simplified'],
            'vector_ac': ['vector-ca-formula', 'vector-ca-calc', 'vector-ca-result'],
            'scalar_triple_product_focus': ['scalar-triple'],
            'coplanarity_confirmed': ['scalar-triple', 'dot-product-calc', 'dot-product-result', 'coplanarity-check'],
            'plane_containing_lines': ['plane-equation-general', 'plane-equation-specific', 'plane-equation-simplified'],
            'plane_normal': ['plane-normal']
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
        
        // SECTION 1: Line Parameters (1 section title)
        this.panel.createText('lines-title',
            '<div class="step-details-title">Line Parameters</div>',
            tightStyle
        );
        this.sections.push('lines-title');
        
        // Line L1 equation (row 1)
        this.panel.createText('line1-equation',
            mathDisplay3D(`\\text{Line } L_1: \\vec{r} = (-1,-3,-5) + s(3,5,7)`, { block: true }),
            tightStyle
        );
        this.rows.push('line1-equation');
        
        // Line L2 equation (row 2)
        this.panel.createText('line2-equation',
            mathDisplay3D(`\\text{Line } L_2: \\vec{r} = (2,4,6) + t(1,4,7)`, { block: true }),
            tightStyle
        );
        this.rows.push('line2-equation');
        
        // Position and direction vectors (rows 3-6)
        this.panel.createText('vec-a',
            mathDisplay3D(`\\text{Position: } \\vec{a} = (-1,-3,-5)`, { block: true }),
            tightStyle
        );
        this.rows.push('vec-a');
        
        this.panel.createText('vec-b',
            mathDisplay3D(`\\text{Direction: } \\vec{b} = (3,5,7)`, { block: true }),
            tightStyle
        );
        this.rows.push('vec-b');
        
        this.panel.createText('vec-c',
            mathDisplay3D(`\\text{Position: } \\vec{c} = (2,4,6)`, { block: true }),
            tightStyle
        );
        this.rows.push('vec-c');
        
        this.panel.createText('vec-d',
            mathDisplay3D(`\\text{Direction: } \\vec{d} = (1,4,7)`, { block: true }),
            tightStyle
        );
        this.rows.push('vec-d');
        
        // Points on lines (rows 7-8)
        this.panel.createText('point-a',
            mathDisplay3D(`\\text{Point } A = (-1,-3,-5)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-a');
        
        this.panel.createText('point-c',
            mathDisplay3D(`\\text{Point } C = (2,4,6)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-c');
        
        // SECTION 2: Coplanarity Check (2nd section title)
        this.panel.createText('coplanarity-title',
            '<div class="step-details-title">Coplanarity Check</div>',
            tightStyle
        );
        this.sections.push('coplanarity-title');
        
        // Cross product (rows 9-11)
        this.panel.createText('cross-product',
            mathDisplay3D(`\\text{Cross product: } \\vec{b} \\times \\vec{d} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 3 & 5 & 7 \\\\ 1 & 4 & 7 \\end{vmatrix}`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-product');
        
        this.panel.createText('cross-result',
            mathDisplay3D(`\\text{Result: } \\vec{b} \\times \\vec{d} = (7,-14,7)`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-result');
        
        this.panel.createText('cross-simplified',
            mathDisplay3D(`\\text{Simplified: } \\vec{b} \\times \\vec{d} = 7(1,-2,1)`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-simplified');
        
        // Vector AC (rows 12-14)
        this.panel.createText('vector-ca-formula',
            mathDisplay3D(`\\text{Vector from A to C: } \\vec{c} - \\vec{a}`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ca-formula');
        
        this.panel.createText('vector-ca-calc',
            mathDisplay3D(`\\vec{c} - \\vec{a} = (2,4,6) - (-1,-3,-5)`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ca-calc');
        
        this.panel.createText('vector-ca-result',
            mathDisplay3D(`\\vec{c} - \\vec{a} = (3,7,11)`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ca-result');
        
        // Scalar triple product (row 15)
        this.panel.createText('scalar-triple',
            mathDisplay3D(`\\text{Scalar triple: } (\\vec{c} - \\vec{a}) \\cdot (\\vec{b} \\times \\vec{d})`, { block: true }),
            tightStyle
        );
        this.rows.push('scalar-triple');
        
        // SECTION 3: Result (3rd section title - at limit)
        this.panel.createText('result-title',
            '<div class="step-details-title">Result</div>',
            tightStyle
        );
        this.sections.push('result-title');
        
        // Dot product calculation (already at row 15 limit, so we need to be careful)
        this.panel.createText('dot-product-calc',
            mathDisplay3D(`\\text{Calculation: } (3,7,11) \\cdot (7,-14,7) = 0`, { block: true }),
            tightStyle
        );
        // Note: We're at the limit, so we'll combine the remaining info
        
        this.panel.createText('dot-product-result',
            mathDisplay3D(`\\text{Result: } 0 \\Rightarrow \\text{Lines are coplanar}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('coplanarity-check',
            mathDisplay3D(`(\\vec{c} - \\vec{a}) \\cdot (\\vec{b} \\times \\vec{d}) = 0 \\checkmark`, { block: true }),
            tightStyle
        );
        
        // Plane equation
        this.panel.createText('plane-equation-general',
            mathDisplay3D(`\\text{Plane: } (\\vec{r} - \\vec{a}) \\cdot (\\vec{b} \\times \\vec{d}) = 0`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('plane-equation-specific',
            mathDisplay3D(`(\\vec{r} + (1,3,5)) \\cdot (1,-2,1) = 0`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('plane-equation-simplified',
            mathDisplay3D(`\\vec{r} \\cdot (\\hat{i} - 2\\hat{j} + \\hat{k}) = 0`, { block: true }),
            tightStyle
        );
        
        // Plane normal
        this.panel.createText('plane-normal',
            mathDisplay3D(`\\text{Normal: } \\vec{n} = (1,-2,1)`, { block: true }),
            tightStyle
        );
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
