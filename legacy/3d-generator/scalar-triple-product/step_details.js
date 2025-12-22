import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        const stepNameToElements = {
            // Vector steps
            'vector_u': ['vector-u'],
            'vector_v': ['vector-v'],
            'vector_w': ['vector-w'],
            
            // Base parallelogram 
            'base_parallelogram': ['base-area'],
            
            // Cross product and normal
            'cross_product': ['cross-product-determinant', 'base-area'],
            
            // Angle visualization
            'angle_arc': ['height-definition'],
            
            // Height projection
            'height_projection': ['height-definition', 'height-projection'],
            
            // Complete parallelepiped
            'parallelepiped': ['volume-formula', 'cyclic-permutation'],
            
            // Final volume formula
            'volume_formula': ['volume-formula', 'volume-result', 'volume-calculation']
        };
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Vectors
        this.panel.createText('vectors-title',
            '<div class="step-details-title">Vectors</div>',
            tightStyle
        );
        
        this.panel.createText('vector-u',
            mathDisplay3D(`\\vec{u} = \\langle 2, 1, 3 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('vector-v',
            mathDisplay3D(`\\vec{v} = \\langle 2, 0, 0 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('vector-w',
            mathDisplay3D(`\\vec{w} = \\langle 0, 2, 0 \\rangle`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Cross Product
        this.panel.createText('cross-product-title',
            '<div class="step-details-title">Cross Product</div>',
            tightStyle
        );
        
        this.panel.createText('cross-product-determinant',
            mathDisplay3D(`\\vec{v} \\times \\vec{w} = \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ 2 & 0 & 0 \\\\ 0 & 2 & 0 \\end{vmatrix} = \\langle 0, 0, 4 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('base-area',
            mathDisplay3D(`\\text{Base area: } \\|\\vec{v} \\times \\vec{w}\\| = 4`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Dot Product
        this.panel.createText('angle-title',
            '<div class="step-details-title">Dot Product</div>',
            tightStyle
        );
        
        this.panel.createText('height-definition',
            mathDisplay3D(`\\vec{u} \\cdot (\\vec{v} \\times \\vec{w}) = \\langle 2, 1, 3 \\rangle \\cdot \\langle 0, 0, 4 \\rangle`, { block: true }) +
            mathDisplay3D(`= (2)(0) + (1)(0) + (3)(4) = 12`, { block: true }),
            tightStyle
        );
        
        // SECTION 4: Scalar Triple Product
        this.panel.createText('formula-title',
            '<div class="step-details-title">Scalar Triple Product</div>',
            tightStyle
        );
        
        this.panel.createText('volume-formula',
            mathDisplay3D(`\\vec{u} \\cdot (\\vec{v} \\times \\vec{w}) = \\begin{vmatrix} 2 & 1 & 3 \\\\ 2 & 0 & 0 \\\\ 0 & 2 & 0 \\end{vmatrix}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('volume-calculation',
            mathDisplay3D(`\\text{Expansion: } 2(0) - 1(0) + 3(4) = 12`, { block: true }),
            tightStyle
        );
        
        // SECTION 5: Volume
        this.panel.createText('volume-title',
            '<div class="step-details-title">Volume</div>',
            tightStyle
        );
        
        this.panel.createText('volume-result',
            mathDisplay3D(`V = |\\vec{u} \\cdot (\\vec{v} \\times \\vec{w})| = 12`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('cyclic-permutation',
            mathDisplay3D(`\\text{Cyclic: } \\vec{u} \\cdot (\\vec{v} \\times \\vec{w}) = \\vec{v} \\cdot (\\vec{w} \\times \\vec{u}) = \\vec{w} \\cdot (\\vec{u} \\times \\vec{v})`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('height-projection',
            mathDisplay3D(`\\text{Height: } h = \\frac{|\\vec{u} \\cdot (\\vec{v} \\times \\vec{w})|}{\\|\\vec{v} \\times \\vec{w}\\|} = \\frac{12}{4} = 3`, { block: true }),
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