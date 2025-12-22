import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'point_a': ['point-a'],
            'point_b': ['point-b'],
            'point_c': ['point-c'],
            'point_d': ['point-d'],
            'quadrilateral_edges': ['point-a', 'point-b', 'point-c', 'point-d'],
            'vector_ab': ['vector-ab-formula', 'vector-ab'],
            'vector_ad': ['vector-ad-formula', 'vector-ad'],
            'vector_cd': ['vector-cd-formula', 'vector-cd'],
            'vector_cb': ['vector-cb-formula', 'vector-cb'],
            'focus_opposite_sides_1': ['parallel-check-1'],
            'focus_opposite_sides_2': ['parallel-check-2'],
            'parallelogram_visual': ['parallelogram-conclusion'],
            'cross_product_computed': ['cross-product-formula', 'cross-product-calc', 'cross-product-result'],
            'cross_product_focus': ['cross-product-formula', 'cross-product-calc', 'cross-product-result'],
            'area_value': ['area-formula', 'area-result'],
            'dot_product_check': ['perpendicular-check']
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
        this.sections = [];
        this.rows = [];
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Points of Quadrilateral
        this.panel.createText('points-title',
            '<div class="step-details-title">Points of Quadrilateral</div>',
            tightStyle
        );
        this.sections.push('points-title');
        
        // Points from step 1
        this.panel.createText('point-a',
            mathDisplay3D(`A = (5, 2, 0)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-a');
        
        this.panel.createText('point-b',
            mathDisplay3D(`B = (2, 6, 1)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-b');
        
        this.panel.createText('point-c',
            mathDisplay3D(`C = (2, 4, 7)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-c');
        
        this.panel.createText('point-d',
            mathDisplay3D(`D = (5, 0, 6)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-d');
        
        // SECTION 2: Vector Calculations
        this.panel.createText('vectors-title',
            '<div class="step-details-title">Vector Calculations</div>',
            tightStyle
        );
        this.sections.push('vectors-title');
        
        // Vector AB
        this.panel.createText('vector-ab-formula',
            mathDisplay3D(`\\vec{AB} = B - A`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ab-formula');
        
        this.panel.createText('vector-ab',
            mathDisplay3D(`\\vec{AB} = \\langle -3, 4, 1 \\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ab');
        
        // Vector AD
        this.panel.createText('vector-ad-formula',
            mathDisplay3D(`\\vec{AD} = D - A`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ad-formula');
        
        this.panel.createText('vector-ad',
            mathDisplay3D(`\\vec{AD} = \\langle 0, -2, 6 \\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ad');
        
        // Vector CD
        this.panel.createText('vector-cd-formula',
            mathDisplay3D(`\\vec{CD} = D - C`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-cd-formula');
        
        this.panel.createText('vector-cd',
            mathDisplay3D(`\\vec{CD} = \\langle 3, -4, -1 \\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-cd');
        
        // Vector CB
        this.panel.createText('vector-cb-formula',
            mathDisplay3D(`\\vec{CB} = B - C`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-cb-formula');
        
        this.panel.createText('vector-cb',
            mathDisplay3D(`\\vec{CB} = \\langle 0, 2, -6 \\rangle`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-cb');
        
        // Parallel check
        this.panel.createText('parallel-check-1',
            mathDisplay3D(`\\vec{CD} = -\\vec{AB}`, { block: true }),
            tightStyle
        );
        this.rows.push('parallel-check-1');
        
        this.panel.createText('parallel-check-2',
            mathDisplay3D(`\\vec{CB} = -\\vec{AD}`, { block: true }),
            tightStyle
        );
        this.rows.push('parallel-check-2');
        
        this.panel.createText('parallelogram-conclusion',
            mathDisplay3D(`\\text{Parallelogram confirmed}`, { block: true }),
            tightStyle
        );
        this.rows.push('parallelogram-conclusion');
        
        // SECTION 3: Area Calculation
        this.panel.createText('area-title',
            '<div class="step-details-title">Area Calculation</div>',
            tightStyle
        );
        this.sections.push('area-title');
        
        // Cross product formula
        this.panel.createText('cross-product-formula',
            mathDisplay3D(`\\vec{AB} \\times \\vec{AD}`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-product-formula');
        
        // Cross product calculation - compressed format
        this.panel.createText('cross-product-calc',
            mathDisplay3D(`= \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ -3 & 4 & 1 \\\\ 0 & -2 & 6 \\end{vmatrix}`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-product-calc');
        
        // Cross product result
        this.panel.createText('cross-product-result',
            mathDisplay3D(`= 26\\mathbf{i} + 18\\mathbf{j} + 6\\mathbf{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('cross-product-result');
        
        // Area formula
        this.panel.createText('area-formula',
            mathDisplay3D(`\\text{Area} = \\|\\vec{AB} \\times \\vec{AD}\\|`, { block: true }),
            tightStyle
        );
        this.rows.push('area-formula');
        
        // Area result
        this.panel.createText('area-result',
            mathDisplay3D(`\\boxed{\\text{Area} = 32.19}`, { block: true }),
            tightStyle
        );
        this.rows.push('area-result');
        
        // Perpendicular check
        this.panel.createText('perpendicular-check',
            mathDisplay3D(`\\text{Rectangle check: } \\vec{AB} \\cdot \\vec{AD} = -2 \\neq 0`, { block: true }),
            tightStyle
        );
        this.rows.push('perpendicular-check');
        
        // Verify limits
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
