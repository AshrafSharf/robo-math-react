// Step details for Dot-projection
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        
        // Map step names to control panel element IDs
        const stepNameToElements = {
            // Example 1: 45° angle
            'vector_v_1': ['dot-product-calculation', 'scalar-projection', 'v1-vector'],
            'unit_vector_u_1': ['u1-vector'],
            'projection_line_1': ['vector-projection', 'proj1-calc'],
            'measurement_1': ['projection-distance', 'proj1-calc', 'proj1-dot'],
            
            // Example 2: 60° angle
            'vector_v_2': ['dot-product-calculation', 'scalar-projection', 'v2-vector'],
            'unit_vector_u_2': ['u2-vector'],
            'projection_line_2': ['vector-projection', 'proj2-calc'],
            'measurement_2': ['projection-distance', 'proj2-calc', 'proj2-dot'],
            
            // Example 3: 70° angle
            'vector_v_3': ['dot-product-calculation', 'scalar-projection', 'v3-vector'],
            'unit_vector_u_3': ['u3-vector'],
            'projection_line_3': ['vector-projection', 'proj3-calc'],
            'measurement_3': ['projection-distance', 'proj3-calc', 'proj3-dot'],
            
            // Final view
            'final_view': ['projection-interpretation', 'example1-title', 'example2-title', 'example3-title']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // MAIN FORMULA
        this.panel.createText('formula-title',
            '<div class="step-details-title">Projection Formulas</div>',
            tightStyle
        );
        
        this.panel.createText('dot-product-calculation',
            mathDisplay3D(`\\vec{v} \\cdot \\hat{u} = v_x u_x + v_y u_y + v_z u_z`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('scalar-projection',
            mathDisplay3D(`\\text{comp}_{\\hat{u}}\\vec{v} = \\vec{v} \\cdot \\hat{u} = |\\vec{v}|\\cos\\theta`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('vector-projection',
            mathDisplay3D(`\\text{proj}_{\\hat{u}}\\vec{v} = (\\vec{v} \\cdot \\hat{u})\\hat{u}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('projection-distance',
            mathDisplay3D(`d = |\\vec{v} \\cdot \\hat{u}| = |\\vec{v}||\\cos\\theta|`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('projection-interpretation',
            mathDisplay3D(`\\vec{v} \\cdot \\hat{u} = \\text{signed distance when } |\\hat{u}| = 1`, { block: true }),
            tightStyle
        );
        
        // EXAMPLE 1: 45° angle between vectors
        this.panel.createText('example1-title',
            '<div class="step-details-title">Example 1: 45° Angle</div>',
            tightStyle
        );
        
        this.panel.createText('v1-vector',
            mathDisplay3D(`\\vec{v} = (2,2,1)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('u1-vector',
            mathDisplay3D(`\\hat{u} = (0.82, 0.41, 0.41)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('proj1-calc',
            mathDisplay3D(`\\vec{v}\\cdot\\hat{u} = (2)(0.82) + (2)(0.41) + (1)(0.41) = 2.87`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('proj1-dot',
            mathDisplay3D(`d = |\\vec{v}\\cdot\\hat{u}| = |2.87| = 2.87`, { block: true }),
            tightStyle
        );
        
        // EXAMPLE 2: 60° angle between vectors
        this.panel.createText('example2-title',
            '<div class="step-details-title">Example 2: 60° Angle</div>',
            tightStyle
        );
        
        this.panel.createText('v2-vector',
            mathDisplay3D(`\\vec{v} = (3,0,2)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('u2-vector',
            mathDisplay3D(`\\hat{u} = (0.6, 0.7, 0.4)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('proj2-calc',
            mathDisplay3D(`\\vec{v}\\cdot\\hat{u} = (3)(0.6) + (0)(0.7) + (2)(0.4) = 2.6`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('proj2-dot',
            mathDisplay3D(`d = |\\vec{v}\\cdot\\hat{u}| = |2.6| = 2.6`, { block: true }),
            tightStyle
        );
        
        // EXAMPLE 3: 70° angle between vectors
        this.panel.createText('example3-title',
            '<div class="step-details-title">Example 3: 70° Angle</div>',
            tightStyle
        );
        
        this.panel.createText('v3-vector',
            mathDisplay3D(`\\vec{v} = (1,3,1)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('u3-vector',
            mathDisplay3D(`\\hat{u} = (0.8, 0.2, 0.57)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('proj3-calc',
            mathDisplay3D(`\\vec{v}\\cdot\\hat{u} = (1)(0.8) + (3)(0.2) + (1)(0.57) = 1.97`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('proj3-dot',
            mathDisplay3D(`d = |\\vec{v}\\cdot\\hat{u}| = |1.97| = 1.97`, { block: true }),
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
