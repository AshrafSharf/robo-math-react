import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'main_vector': ['vector-components'],
            'unit_i': ['dot-product-i'],
            'unit_j': ['dot-product-j'],
            'unit_k': ['dot-product-k'],
            'angle_alpha': ['cos-alpha', 'angle-alpha'],
            'angle_beta': ['cos-beta', 'angle-beta'],
            'angle_gamma': ['cos-gamma', 'angle-gamma'],
            'all_angles_focus': ['cos-alpha', 'cos-beta', 'cos-gamma'],
            'unit_v': ['unit-vector-formula', 'unit-vector-result'],
            'complete': ['identity-formula', 'identity-verification']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Vector and Basis
        this.sections.push('vector-basis-title');
        this.panel.createText('vector-basis-title',
            '<div class="step-details-title">Vector and Basis</div>',
            tightStyle
        );
        
        this.rows.push('vector-components');
        this.panel.createText('vector-components',
            mathDisplay3D(`\\text{Vector: } \\mathbf{v} = \\langle 3, 4, 2 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.rows.push('magnitude');
        this.panel.createText('magnitude',
            mathDisplay3D(`\\text{Magnitude: } \\|\\mathbf{v}\\| = \\sqrt{3^2 + 4^2 + 2^2} = \\sqrt{29}`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Dot Products
        this.sections.push('dot-products-title');
        this.panel.createText('dot-products-title',
            '<div class="step-details-title">Dot Products with Basis</div>',
            tightStyle
        );
        
        this.rows.push('dot-product-i');
        this.panel.createText('dot-product-i',
            mathDisplay3D(`\\mathbf{v} \\cdot \\hat{i} = \\langle 3, 4, 2 \\rangle \\cdot \\langle 1, 0, 0 \\rangle = 3`, { block: true }),
            tightStyle
        );
        
        this.rows.push('dot-product-j');
        this.panel.createText('dot-product-j',
            mathDisplay3D(`\\mathbf{v} \\cdot \\hat{j} = \\langle 3, 4, 2 \\rangle \\cdot \\langle 0, 1, 0 \\rangle = 4`, { block: true }),
            tightStyle
        );
        
        this.rows.push('dot-product-k');
        this.panel.createText('dot-product-k',
            mathDisplay3D(`\\mathbf{v} \\cdot \\hat{k} = \\langle 3, 4, 2 \\rangle \\cdot \\langle 0, 0, 1 \\rangle = 2`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Direction Cosines and Angles
        this.sections.push('direction-cosines-title');
        this.panel.createText('direction-cosines-title',
            '<div class="step-details-title">Direction Cosines</div>',
            tightStyle
        );
        
        this.rows.push('cos-alpha');
        this.panel.createText('cos-alpha',
            mathDisplay3D(`\\cos \\alpha = \\frac{v_1}{\\|\\mathbf{v}\\|} = \\frac{3}{\\sqrt{29}} \\approx 0.557`, { block: true }),
            tightStyle
        );
        
        this.rows.push('angle-alpha');
        this.panel.createText('angle-alpha',
            mathDisplay3D(`\\alpha = \\cos^{-1}(0.557) \\approx 56.1°`, { block: true }),
            tightStyle
        );
        
        this.rows.push('cos-beta');
        this.panel.createText('cos-beta',
            mathDisplay3D(`\\cos \\beta = \\frac{v_2}{\\|\\mathbf{v}\\|} = \\frac{4}{\\sqrt{29}} \\approx 0.743`, { block: true }),
            tightStyle
        );
        
        this.rows.push('angle-beta');
        this.panel.createText('angle-beta',
            mathDisplay3D(`\\beta = \\cos^{-1}(0.743) \\approx 42.0°`, { block: true }),
            tightStyle
        );
        
        this.rows.push('cos-gamma');
        this.panel.createText('cos-gamma',
            mathDisplay3D(`\\cos \\gamma = \\frac{v_3}{\\|\\mathbf{v}\\|} = \\frac{2}{\\sqrt{29}} \\approx 0.371`, { block: true }),
            tightStyle
        );
        
        this.rows.push('angle-gamma');
        this.panel.createText('angle-gamma',
            mathDisplay3D(`\\gamma = \\cos^{-1}(0.371) \\approx 68.2°`, { block: true }),
            tightStyle
        );
        
        // Unit vector representation
        this.rows.push('unit-vector-formula');
        this.panel.createText('unit-vector-formula',
            mathDisplay3D(`\\hat{v} = \\cos\\alpha\\hat{i} + \\cos\\beta\\hat{j} + \\cos\\gamma\\hat{k}`, { block: true }),
            tightStyle
        );
        
        this.rows.push('unit-vector-result');
        this.panel.createText('unit-vector-result',
            mathDisplay3D(`\\hat{v} = 0.557\\hat{i} + 0.743\\hat{j} + 0.371\\hat{k}`, { block: true }),
            tightStyle
        );
        
        // Identity verification
        this.rows.push('identity-formula');
        this.panel.createText('identity-formula',
            mathDisplay3D(`\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1`, { block: true }),
            tightStyle
        );
        
        this.rows.push('identity-verification');
        this.panel.createText('identity-verification',
            mathDisplay3D(`0.557^2 + 0.743^2 + 0.371^2 = 1.000`, { block: true }),
            tightStyle
        );
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