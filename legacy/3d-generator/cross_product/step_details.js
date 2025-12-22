import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from cross_product.js to panel element IDs
        const stepNameToElements = {
            'vector_u': ['vector-u'],
            'vector_v': ['vector-v'],
            'parallelogram': ['parallelogram-area'],
            'cross_product_computed': ['cross-determinant', 'cross-expansion', 'cross-result'],
            'cross_product_focus': ['cross-result', 'anti-commutativity'],
            'triangle_area': ['triangle-area'],
            'unit_normal': ['normal-vector', 'unit-normal'],
            'anti_commutativity': ['anti-commutativity'],
            'opposite_directions_focus': ['cross-result', 'anti-commutativity'],
            'right_hand_rule': ['normal-vector', 'right-hand-note']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Input Vectors
        this.panel.createText('vectors-title',
            '<div class="step-details-title">Input Vectors</div>',
            tightStyle
        );
        this.sections.push('vectors-title');
        
        // From step 1: vector u
        this.panel.createText('vector-u',
            mathDisplay3D(`\\mathbf{u} = \\langle 2, 1, 1 \\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-u');
        
        // From step 1: vector v
        this.panel.createText('vector-v',
            mathDisplay3D(`\\mathbf{v} = \\langle -4, 3, 1 \\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-v');
        
        // SECTION 2: Cross Product Calculation
        this.panel.createText('cross-title',
            '<div class="step-details-title">Cross Product</div>',
            tightStyle
        );
        this.sections.push('cross-title');
        
        // From step 1: Determinant form
        this.panel.createText('cross-determinant',
            mathDisplay3D(`\\mathbf{u} \\times \\mathbf{v} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ 2 & 1 & 1 \\\\ -4 & 3 & 1 \\end{vmatrix}`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-determinant');
        
        // From step 2: Cofactor expansion (compact form)
        this.panel.createText('cross-expansion',
            mathDisplay3D(`= \\mathbf{i}(1 - 3) - \\mathbf{j}(2 - (-4)) + \\mathbf{k}(6 - (-4))`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-expansion');
        
        // From step 2: Final result
        this.panel.createText('cross-result',
            mathDisplay3D(`\\mathbf{u} \\times \\mathbf{v} = -2\\mathbf{i} - 6\\mathbf{j} + 10\\mathbf{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-result');
        
        // From step 2: Anti-commutativity
        this.panel.createText('anti-commutativity',
            mathDisplay3D(`\\mathbf{v} \\times \\mathbf{u} = -( \\mathbf{u} \\times \\mathbf{v}) = 2\\mathbf{i} + 6\\mathbf{j} - 10\\mathbf{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('anti-commutativity');
        
        // From step 3: Magnitude
        this.panel.createText('cross-magnitude',
            mathDisplay3D(`\\|\\mathbf{u} \\times \\mathbf{v}\\| = \\sqrt{4 + 36 + 100} = 2\\sqrt{35}`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-magnitude');
        
        // From step 4: Vector magnitudes (combined)
        this.panel.createText('vector-magnitudes',
            mathDisplay3D(`\\|\\mathbf{u}\\| = \\sqrt{6}, \\quad \\|\\mathbf{v}\\| = \\sqrt{26}`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-magnitudes');
        
        // From step 5: sin θ calculation
        this.panel.createText('sin-theta',
            mathDisplay3D(`|\\sin\\theta| = \\frac{2\\sqrt{35}}{\\sqrt{6} \\cdot \\sqrt{26}} = \\sqrt{\\frac{35}{39}}`, { block: true }),
            tightStyle
        );
        this.rows.push('sin-theta');
        
        // SECTION 3: Areas and Normal
        this.panel.createText('areas-title',
            '<div class="step-details-title">Areas & Normal Vector</div>',
            tightStyle
        );
        this.sections.push('areas-title');
        
        // From step 6: Parallelogram area
        this.panel.createText('parallelogram-area',
            mathDisplay3D(`\\text{Area}_{\\text{parallelogram}} = \\|\\mathbf{u} \\times \\mathbf{v}\\| = 2\\sqrt{35}`, { block: true }),
            tightStyle
        );
        this.rows.push('parallelogram-area');
        
        // From step 6: Triangle area
        this.panel.createText('triangle-area',
            mathDisplay3D(`\\text{Area}_{\\triangle} = \\tfrac{1}{2} \\cdot 2\\sqrt{35} = \\sqrt{35}`, { block: true }),
            tightStyle
        );
        this.rows.push('triangle-area');
        
        // From step 7: Normal vector
        this.panel.createText('normal-vector',
            mathDisplay3D(`\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v} = \\langle -2, -6, 10 \\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('normal-vector');
        
        // From step 7: Unit normal (compact form)
        this.panel.createText('unit-normal',
            mathDisplay3D(`\\hat{\\mathbf{n}} = \\left\\langle \\frac{-1}{\\sqrt{35}}, \\frac{-3}{\\sqrt{35}}, \\frac{5}{\\sqrt{35}} \\right\\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('unit-normal');
        
        // Right-hand rule note
        this.panel.createText('right-hand-note',
            mathDisplay3D(`\\text{Direction follows right-hand rule}`, { block: true }),
            tightStyle
        );
        this.rows.push('right-hand-note');
    }
    
    countSections() {
        return this.sections.length;
    }
    
    countRows() {
        return this.rows.length;
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
