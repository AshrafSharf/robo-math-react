// Step details for Plane-normal-distance-from-origin
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'origin': ['origin-o', 'origin-coords'],
            'unit_normal': ['unit-normal', 'unit-normal-value', 'unit-normal-verify'],
            'foot_perpendicular': ['foot-perpendicular', 'oa-vector-formula', 'oa-vector-value'],
            'position_vector_oa': ['oa-vector-formula', 'oa-vector-value'],
            'plane': ['plane-equation-vector', 'plane-distance'],
            'arbitrary_point': ['point-p', 'position-vector-r'],
            'vector_ap': ['vector-ap-formula', 'vector-ap-calc', 'vector-ap-result'],
            'position_vector_r': ['position-vector-r'],
            'right_angle': ['perpendicular-condition', 'dot-product-zero'],
            'perpendicular_focus': ['perpendicular-condition', 'dot-product-expand', 'dot-product-simplify', 'plane-equation-vector']
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
        
        // SECTION 1: Key Points and Vectors
        this.panel.createText('section-points',
            '<div class="step-details-title">Key Points and Vectors</div>',
            tightStyle
        );
        this.sections.push('section-points');
        
        // Origin O with coordinates
        this.panel.createText('origin-o',
            mathDisplay3D(`O \\text{ is the origin, } A \\text{ is the foot of perpendicular}`, { block: true }),
            tightStyle
        );
        this.rows.push('origin-o');
        
        this.panel.createText('origin-coords',
            mathDisplay3D(`O = (0, 0, 0)`, { block: true }),
            tightStyle
        );
        this.rows.push('origin-coords');
        
        // Unit normal vector with actual values
        this.panel.createText('unit-normal',
            mathDisplay3D(`\\text{Unit normal: } \\hat{d} = \\frac{2}{3}\\hat{i} - \\frac{2}{3}\\hat{j} + \\frac{1}{3}\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('unit-normal');
        
        this.panel.createText('unit-normal-value',
            mathDisplay3D(`\\hat{d} = \\left(\\frac{2}{3}, -\\frac{2}{3}, \\frac{1}{3}\\right)`, { block: true }),
            tightStyle
        );
        this.rows.push('unit-normal-value');
        
        // Verify it's a unit vector
        this.panel.createText('unit-normal-verify',
            mathDisplay3D(`\\|\\hat{d}\\| = \\sqrt{\\left(\\frac{2}{3}\\right)^2 + \\left(-\\frac{2}{3}\\right)^2 + \\left(\\frac{1}{3}\\right)^2} = 1`, { block: true }),
            tightStyle
        );
        this.rows.push('unit-normal-verify');
        
        // Foot of perpendicular with distance
        this.panel.createText('foot-perpendicular',
            mathDisplay3D(`A \\text{ at distance } p = 3 \\text{ from origin}`, { block: true }),
            tightStyle
        );
        this.rows.push('foot-perpendicular');
        
        // Vector OA formula and calculation
        this.panel.createText('oa-vector-formula',
            mathDisplay3D(`\\vec{OA} = p\\hat{d} = 3 \\cdot \\left(\\frac{2}{3}, -\\frac{2}{3}, \\frac{1}{3}\\right)`, { block: true }),
            tightStyle
        );
        this.rows.push('oa-vector-formula');
        
        this.panel.createText('oa-vector-value',
            mathDisplay3D(`\\vec{OA} = (2, -2, 1) \\quad \\text{so } A = (2, -2, 1)`, { block: true }),
            tightStyle
        );
        this.rows.push('oa-vector-value');
        
        // SECTION 2: Plane Equation Derivation
        this.panel.createText('section-derivation',
            '<div class="step-details-title">Plane Equation Derivation</div>',
            tightStyle
        );
        this.sections.push('section-derivation');
        
        // Arbitrary point P
        this.panel.createText('point-p',
            mathDisplay3D(`P \\text{ is arbitrary point on plane with position vector } \\vec{r}`, { block: true }),
            tightStyle
        );
        this.rows.push('point-p');
        
        // Position vector r
        this.panel.createText('position-vector-r',
            mathDisplay3D(`\\vec{r} = \\vec{OP} = (x, y, z)`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector-r');
        
        // Vector AP formula
        this.panel.createText('vector-ap-formula',
            mathDisplay3D(`\\text{Vector from } A \\text{ to } P: \\vec{AP}`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ap-formula');
        
        // Vector AP calculation
        this.panel.createText('vector-ap-calc',
            mathDisplay3D(`\\vec{AP} = \\vec{OP} - \\vec{OA} = \\vec{r} - p\\hat{d}`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ap-calc');
        
        // Vector AP with substitution
        this.panel.createText('vector-ap-result',
            mathDisplay3D(`\\vec{AP} = (x, y, z) - (2, -2, 1) = (x-2, y+2, z-1)`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ap-result');
        
        // SECTION 3: Perpendicular Condition and Final Equation
        this.panel.createText('section-equation',
            '<div class="step-details-title">Perpendicular Condition and Final Equation</div>',
            tightStyle
        );
        this.sections.push('section-equation');
        
        // Perpendicular condition
        this.panel.createText('perpendicular-condition',
            mathDisplay3D(`\\vec{AP} \\perp \\vec{OA} \\Rightarrow \\vec{AP} \\cdot \\hat{d} = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('perpendicular-condition');
        
        // Dot product equals zero
        this.panel.createText('dot-product-zero',
            mathDisplay3D(`(\\vec{r} - p\\hat{d}) \\cdot \\hat{d} = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-zero');
        
        // Dot product expansion
        this.panel.createText('dot-product-expand',
            mathDisplay3D(`\\vec{r} \\cdot \\hat{d} - p(\\hat{d} \\cdot \\hat{d}) = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-expand');
        
        // Simplify using unit vector property
        this.panel.createText('dot-product-simplify',
            mathDisplay3D(`\\vec{r} \\cdot \\hat{d} - p \\cdot 1 = 0 \\quad \\text{(since } \\hat{d} \\cdot \\hat{d} = 1\\text{)}`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-simplify');
        
        // Final vector equation
        this.panel.createText('plane-equation-vector',
            mathDisplay3D(`\\boxed{\\vec{r} \\cdot \\hat{d} = p} \\quad \\text{Vector equation of plane}`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-equation-vector');
        
        // Substituting actual values
        this.panel.createText('plane-distance',
            mathDisplay3D(`\\text{For our plane: } \\vec{r} \\cdot \\left(\\frac{2}{3}, -\\frac{2}{3}, \\frac{1}{3}\\right) = 3`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-distance');
        
        // Log the counts for verification
        console.log(`Step Details - Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}