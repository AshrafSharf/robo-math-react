import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'point_a': ['point-a'],
            'position_vector_oa': ['position-vector-oa'],
            'vector_r_ao': ['vector-r'],
            'force_vector': ['force-vector'],
            'line_of_action': ['force-vector'],
            'unit_i': ['unit-vectors'],
            'unit_j': ['unit-vectors'],
            'unit_k': ['unit-vectors'],
            'torque_vector': ['torque-cross-product', 'torque-result'],
            'cross_product_focus': ['torque-cross-product', 'torque-result'],
            'torque_at_origin': ['torque-magnitude'],
            'angle_alpha': ['direction-cosines'],
            'angle_gamma': ['direction-cosines'],
            'direction_angles_focus': ['direction-cosines'],
            'complete': ['torque-magnitude', 'direction-cosines']
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
        
        // SECTION 1: Vectors and Point
        this.panel.createText('section-vectors',
            '<div class="step-details-title">Vectors and Point</div>',
            tightStyle
        );
        this.sections.push('section-vectors');
        
        // Point A about which torque is calculated
        this.panel.createText('point-a',
            mathDisplay3D(`\\text{Point: } A = (2, 0, -1)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-a');
        
        // Position vector OA
        this.panel.createText('position-vector-oa',
            mathDisplay3D(`\\text{Position vector: } \\vec{OA} = 2\\hat{i} - \\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector-oa');
        
        // Vector r from A to O
        this.panel.createText('vector-r',
            mathDisplay3D(`\\text{Vector: } \\vec{r} = \\vec{AO} = -2\\hat{i} + \\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-r');
        
        // Force vector
        this.panel.createText('force-vector',
            mathDisplay3D(`\\text{Force: } \\vec{F} = 2\\hat{i} + \\hat{j} - \\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('force-vector');
        
        // Unit vectors reference
        this.panel.createText('unit-vectors',
            mathDisplay3D(`\\text{Unit vectors: } \\hat{i}, \\hat{j}, \\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('unit-vectors');
        
        // SECTION 2: Torque Calculation
        this.panel.createText('section-torque',
            '<div class="step-details-title">Torque Calculation</div>',
            tightStyle
        );
        this.sections.push('section-torque');
        
        // Cross product calculation with determinant
        this.panel.createText('torque-cross-product',
            mathDisplay3D(`\\text{Cross product: } \\vec{\\tau} = \\vec{r} \\times \\vec{F} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ -2 & 0 & 1 \\\\ 2 & 1 & -1 \\end{vmatrix}`, { block: true }),
            tightStyle
        );
        this.rows.push('torque-cross-product');
        
        // Torque result
        this.panel.createText('torque-result',
            mathDisplay3D(`\\text{Torque: } \\vec{\\tau} = -\\hat{i} - 2\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('torque-result');
        
        // SECTION 3: Magnitude and Direction
        this.panel.createText('section-magnitude',
            '<div class="step-details-title">Magnitude and Direction</div>',
            tightStyle
        );
        this.sections.push('section-magnitude');
        
        // Magnitude calculation
        this.panel.createText('torque-magnitude',
            mathDisplay3D(`\\text{Magnitude: } |\\vec{\\tau}| = \\sqrt{(-1)^2 + 0^2 + (-2)^2} = \\sqrt{5}`, { block: true }),
            tightStyle
        );
        this.rows.push('torque-magnitude');
        
        // Direction cosines
        this.panel.createText('direction-cosines',
            mathDisplay3D(`\\text{Direction cosines: } l = \\frac{-1}{\\sqrt{5}}, \\quad m = 0, \\quad n = \\frac{-2}{\\sqrt{5}}`, { block: true }),
            tightStyle
        );
        this.rows.push('direction-cosines');
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}