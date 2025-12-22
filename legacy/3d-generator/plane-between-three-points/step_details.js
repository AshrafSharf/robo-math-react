import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from stepsArray to panel element IDs
        const stepNameToElements = {
            'point_a': ['point-a'],
            'point_b': ['point-b'],
            'point_c': ['point-c'],
            'position_vector_a': ['pos-vec-a'],
            'position_vector_b': ['pos-vec-b'],
            'position_vector_c': ['pos-vec-c'],
            'vector_ab': ['vector-ab'],
            'vector_ab_focus': ['vector-ab'],
            'vector_ac': ['vector-ac'],
            'vector_ac_focus': ['vector-ac'],
            'plane_through_points': ['non-collinear'],
            'arbitrary_point_p': ['point-p-plane'],
            'position_vector_r': ['point-p-plane', 'vector-ap-relation'],
            'vector_ap': ['vector-ap-relation'],
            'vector_ap_focus': ['vector-ap-relation'],
            'linear_combination': ['linear-combination', 'rearranged'],
            'linear_combination_focus': ['linear-combination'],
            'trace_vector_path': ['rearranged', 'final-equation'],
            'parametric_equation_components': ['rearranged', 'final-equation']
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
        
        // SECTION 1: Given Data (1 section)
        this.panel.createText('section-data',
            '<div class="step-details-title">Given Data</div>',
            tightStyle
        );
        this.sections.push('section-data');
        
        // Points - separate rows for each
        this.panel.createText('point-a',
            mathDisplay3D(`\\text{Point } A = (2, 1, 0)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-a');
        
        this.panel.createText('point-b',
            mathDisplay3D(`\\text{Point } B = (-1, 3, 2)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-b');
        
        this.panel.createText('point-c',
            mathDisplay3D(`\\text{Point } C = (0, -2, 4)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-c');
        
        // Position vectors - separate rows for each
        this.panel.createText('pos-vec-a',
            mathDisplay3D(`\\vec{a} = \\text{position vector to } A`, { block: true }),
            tightStyle
        );
        this.rows.push('pos-vec-a');
        
        this.panel.createText('pos-vec-b',
            mathDisplay3D(`\\vec{b} = \\text{position vector to } B`, { block: true }),
            tightStyle
        );
        this.rows.push('pos-vec-b');
        
        this.panel.createText('pos-vec-c',
            mathDisplay3D(`\\vec{c} = \\text{position vector to } C`, { block: true }),
            tightStyle
        );
        this.rows.push('pos-vec-c');
        
        // Direction vectors
        this.panel.createText('vector-ab',
            mathDisplay3D(`\\vec{AB} = \\vec{b} - \\vec{a} = (-3, 2, 2)`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ab');
        
        this.panel.createText('vector-ac',
            mathDisplay3D(`\\vec{AC} = \\vec{c} - \\vec{a} = (-2, -3, 4)`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ac');
        
        this.panel.createText('non-collinear',
            mathDisplay3D(`\\vec{AB} \\times \\vec{AC} \\neq \\vec{0} \\quad \\text{(non-collinear)}`, { block: true }),
            tightStyle
        );
        this.rows.push('non-collinear');
        
        // SECTION 2: Arbitrary Point on Plane (1 section)
        this.panel.createText('section-arbitrary',
            '<div class="step-details-title">Arbitrary Point on Plane</div>',
            tightStyle
        );
        this.sections.push('section-arbitrary');
        
        // Step 2: Point P and its relation (2 rows)
        this.panel.createText('point-p-plane',
            mathDisplay3D(`P \\text{ lies on plane} \\Rightarrow \\vec{AP} \\text{ lies in the plane through } A`, { block: true }),
            tightStyle
        );
        this.rows.push('point-p-plane');
        
        this.panel.createText('vector-ap-relation',
            mathDisplay3D(`\\vec{r} \\text{ is position vector of } P \\Rightarrow \\vec{AP} = \\vec{r} - \\vec{a}`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-ap-relation');
        
        // SECTION 3: Parametric Equation (1 section)
        this.panel.createText('section-parametric',
            '<div class="step-details-title">Parametric Equation</div>',
            tightStyle
        );
        this.sections.push('section-parametric');
        
        // Step 3: Linear combination (2 rows)
        this.panel.createText('linear-combination',
            mathDisplay3D(`\\exists\\ s,t \\in \\mathbb{R}: \\vec{AP} = s\\vec{AB} + t\\vec{AC} \\quad \\text{(spanning property)}`, { block: true }),
            tightStyle
        );
        this.rows.push('linear-combination');
        
        // Step 4: Rearranged form (2 rows)
        this.panel.createText('rearranged',
            mathDisplay3D(`\\vec{r} - \\vec{a} = s(\\vec{b} - \\vec{a}) + t(\\vec{c} - \\vec{a})`, { block: true }),
            tightStyle
        );
        this.rows.push('rearranged');
        
        // Step 5: Final boxed equation (1 row)
        this.panel.createText('final-equation',
            mathDisplay3D(`\\boxed{\\vec{r} = \\vec{a} + s(\\vec{b} - \\vec{a}) + t(\\vec{c} - \\vec{a}), \\quad s,t \\in \\mathbb{R}}`, { block: true }),
            tightStyle
        );
        this.rows.push('final-equation');
        
        // Total: 3 sections + 10 rows = 13 items (within limit of 18)
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
