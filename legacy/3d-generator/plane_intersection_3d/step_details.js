import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        
        const stepNameToElements = {
            // Plane definitions
            'plane1': ['plane1-equation'],
            'normal1': ['normal1-vector'],
            'plane2': ['plane2-equation'],
            'normal2': ['normal2-vector'],
            
            // Intersection calculation
            'cross_product': ['cross-product-formula', 'cross-product-result'],
            'cross_product_focus': ['cross-product-result', 'direction-interpretation'],
            'intersection_line': ['line-parametric', 'point-on-line'],
            'direction_vector': ['direction-vector'],
            'perpendicular_verification': ['perpendicular-note'],
            
            // Parallel/identical cases
            'parallel_normals': ['normal-parallel'],
            'parallel_planes': ['parallel-result'],
            'identical_planes': ['identical-result']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // === SECTION: Plane Equations ===
        this.panel.createText('planes-title',
            '<div class="step-details-title">Plane Equations</div>',
            tightStyle
        );
        
        this.panel.createText('plane1-equation',
            mathDisplay3D(`\\text{Plane } P_1\\colon x + y + z = 3`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('plane2-equation',
            mathDisplay3D(`\\text{Plane } P_2\\colon 2x - y + z = 1`, { block: true }),
            tightStyle
        );
        
        // === SECTION: Normal Vectors ===
        this.panel.createText('normals-title',
            '<div class="step-details-title">Normal Vectors</div>',
            tightStyle
        );
        
        this.panel.createText('normal1-vector',
            mathDisplay3D(`\\text{Normal to } P_1\\colon \\vec{n}_1 = \\langle 1, 1, 1 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('normal2-vector',
            mathDisplay3D(`\\text{Normal to } P_2\\colon \\vec{n}_2 = \\langle 2, -1, 1 \\rangle`, { block: true }),
            tightStyle
        );
        
        // === SECTION: Intersection Calculation ===
        this.panel.createText('intersection-title',
            '<div class="step-details-title">Intersection Line</div>',
            tightStyle
        );
        
        this.panel.createText('cross-product-formula',
            mathDisplay3D(`\\text{Direction: } \\vec{d} = \\vec{n}_1 \\times \\vec{n}_2`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('cross-product-result',
            mathDisplay3D(`\\vec{n}_1 \\times \\vec{n}_2 = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 1 & 1 & 1 \\\\ 2 & -1 & 1 \\end{vmatrix} = \\langle 2, 1, -3 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('direction-interpretation',
            mathDisplay3D(`\\text{Unit direction: } \\hat{d} = \\frac{1}{\\sqrt{14}}\\langle 2, 1, -3 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('point-on-line',
            mathDisplay3D(`\\text{Point on line (z=0): } P = \\left(\\frac{4}{3}, \\frac{5}{3}, 0\\right)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('line-parametric',
            mathDisplay3D(`\\text{Line } L\\colon \\vec{r} = \\left(\\frac{4}{3}, \\frac{5}{3}, 0\\right) + t\\langle 2, 1, -3 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('direction-vector',
            mathDisplay3D(`\\text{Direction vector: } \\vec{d} = \\langle 2, 1, -3 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('perpendicular-note',
            mathDisplay3D(`\\text{Verification: } \\vec{d} \\perp \\vec{n}_1 \\text{ and } \\vec{d} \\perp \\vec{n}_2`, { block: true }),
            tightStyle
        );
        
        // === Alternative results for parallel/identical cases ===
        this.panel.createText('normal-parallel',
            mathDisplay3D(`\\text{Normal vectors parallel: } \\vec{n}_1 \\times \\vec{n}_2 = \\vec{0}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('parallel-result',
            mathDisplay3D(`\\text{Result: Planes are parallel, no intersection}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('identical-result',
            mathDisplay3D(`\\text{Result: Planes are identical, infinite intersection}`, { block: true }),
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