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
            'intersection_point': ['intersection-calc', 'intersection-result'],
            'position_vector_a': ['position-a'],
            'position_vector_c': ['position-c'],
            'direction_vector_b': ['direction-b'],
            'direction_vector_d': ['direction-d'],
            'cross_product_computed': ['cross-product-calc', 'cross-product-result'],
            'cross_product_focus': ['cross-product-calc', 'cross-product-result'],
            'perpendicular_line': ['perpendicular-equation'],
            'right_angle_l1': ['perpendicular-note'],
            'right_angle_l2': ['perpendicular-note'],
            'final_construction': ['perpendicular-equation']
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
        
        // SECTION 1: Lines and Intersection (1 section + 5 rows = 6 items)
        this.sections.push('lines-title');
        this.panel.createText('lines-title',
            '<div class="step-details-title">Lines and Intersection</div>',
            tightStyle
        );
        
        // Line equations in align environment
        this.rows.push('lines-equations');
        this.panel.createText('line1-equation',
            mathDisplay3D(`L_1\\colon \\vec{r} = (1, 3, -1) + t(2, 3, 2)`, { block: true }),
            tightStyle
        );
        
        this.rows.push('line2-equation');
        this.panel.createText('line2-equation',
            mathDisplay3D(`L_2\\colon \\frac{x-2}{1} = \\frac{y-4}{2} = \\frac{z+3}{4}`, { block: true }),
            tightStyle
        );
        
        // Intersection calculation
        this.rows.push('intersection-calc');
        this.panel.createText('intersection-calc',
            mathDisplay3D(`\\text{Setting equal: } (2s+1, 3s+3, 2s-1) = (t+2, 2t+4, 4t-3)`, { block: true }),
            tightStyle
        );
        
        this.rows.push('intersection-result');
        this.panel.createText('intersection-result',
            mathDisplay3D(`\\text{Solution: } s = 1, t = 1 \\Rightarrow I(3, 6, 1)`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Direction Vectors (1 section + 4 rows = 5 items)
        this.sections.push('directions-title');
        this.panel.createText('directions-title',
            '<div class="step-details-title">Direction Vectors</div>',
            tightStyle
        );
        
        // Position vectors
        this.rows.push('position-a');
        this.panel.createText('position-a',
            mathDisplay3D(`\\text{Position: } \\vec{a} = (1, 3, -1) \\text{ on } L_1`, { block: true }),
            tightStyle
        );
        
        this.rows.push('position-c');
        this.panel.createText('position-c',
            mathDisplay3D(`\\text{Position: } \\vec{c} = (2, 4, -3) \\text{ on } L_2`, { block: true }),
            tightStyle
        );
        
        // Direction vectors
        this.rows.push('direction-b');
        this.panel.createText('direction-b',
            mathDisplay3D(`\\text{Direction: } \\vec{b} = (2, 3, 2) \\text{ for } L_1`, { block: true }),
            tightStyle
        );
        
        this.rows.push('direction-d');
        this.panel.createText('direction-d',
            mathDisplay3D(`\\text{Direction: } \\vec{d} = (1, 2, 4) \\text{ for } L_2`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Perpendicular Direction (1 section + 4 rows = 5 items)
        this.sections.push('perpendicular-title');
        this.panel.createText('perpendicular-title',
            '<div class="step-details-title">Perpendicular Direction</div>',
            tightStyle
        );
        
        // Cross product calculation
        this.rows.push('cross-product-calc');
        this.panel.createText('cross-product-calc',
            mathDisplay3D(`\\vec{b} \\times \\vec{d} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 2 & 3 & 2 \\\\ 1 & 2 & 4 \\end{vmatrix}`, { block: true }),
            tightStyle
        );
        
        this.rows.push('cross-product-result');
        this.panel.createText('cross-product-result',
            mathDisplay3D(`\\text{Result: } \\vec{b} \\times \\vec{d} = (8, -6, 1)`, { block: true }),
            tightStyle
        );
        
        // Perpendicularity note
        this.rows.push('perpendicular-note');
        this.panel.createText('perpendicular-note',
            mathDisplay3D(`\\text{Property: } (\\vec{b} \\times \\vec{d}) \\perp \\vec{b} \\text{ and } (\\vec{b} \\times \\vec{d}) \\perp \\vec{d}`, { block: true }),
            tightStyle
        );
        
        // Final equation
        this.rows.push('perpendicular-equation');
        this.panel.createText('perpendicular-equation',
            mathDisplay3D(`\\boxed{\\vec{r} = (3, 6, 1) + m(8, -6, 1), \\quad m \\in \\mathbb{R}}`, { block: true }),
            tightStyle
        );
        
        // Total: 3 sections + 13 rows = 16 items (within limit of 18)
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}