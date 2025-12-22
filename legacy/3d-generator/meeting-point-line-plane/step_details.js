// Step details for Meeting-point-line-plane
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'line': ['line-parametric', 'direction-vector'],
            'plane': ['plane-equation', 'normal-vector'],
            'point_a_on_line': ['point-a'],
            'position_vector_a': ['position-vector-a'],
            'direction_vector_b': ['direction-vector-b'],
            'normal_vector_n': ['normal-vector-n'],
            'check_parallel_condition': ['parallel-check', 'not-parallel'],
            'intersection_point': ['intersection-formula', 'compute-a-dot-n', 'compute-difference', 'final-calculation', 'result-vector', 'coordinates'],
            'focus_intersection': ['coordinates']
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
        
        // SECTION 1: Line and Plane
        this.panel.createText('section-line-plane',
            '<div class="step-details-title">Line and Plane</div>',
            tightStyle
        );
        this.sections.push('section-line-plane');
        
        // Line parametric form
        this.panel.createText('line-parametric',
            mathDisplay3D(`\\text{Line: } \\vec{r} = (2,-1,2) + t(3,4,2)`, { block: true }),
            tightStyle
        );
        this.rows.push('line-parametric');
        
        // Components from line
        this.panel.createText('point-a',
            mathDisplay3D(`\\vec{a} = 2\\hat{i} - \\hat{j} + 2\\hat{k} = (2,-1,2)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-a');
        
        this.panel.createText('direction-vector',
            mathDisplay3D(`\\vec{b} = 3\\hat{i} + 4\\hat{j} + 2\\hat{k} = (3,4,2)`, { block: true }),
            tightStyle
        );
        this.rows.push('direction-vector');
        
        // Plane equation
        this.panel.createText('plane-equation',
            mathDisplay3D(`\\text{Plane: } x - y + z - 5 = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-equation');
        
        this.panel.createText('normal-vector',
            mathDisplay3D(`\\vec{n} = \\hat{i} - \\hat{j} + \\hat{k} = (1,-1,1), \\quad p = 5`, { block: true }),
            tightStyle
        );
        this.rows.push('normal-vector');
        
        // SECTION 2: Parallel Check
        this.panel.createText('section-parallel',
            '<div class="step-details-title">Parallel Check</div>',
            tightStyle
        );
        this.sections.push('section-parallel');
        
        // These are duplicates for highlighting purposes
        this.panel.createText('position-vector-a',
            mathDisplay3D(`\\text{Position vector: } \\vec{a} = (2,-1,2)`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector-a');
        
        this.panel.createText('direction-vector-b',
            mathDisplay3D(`\\text{Direction vector: } \\vec{b} = (3,4,2)`, { block: true }),
            tightStyle
        );
        this.rows.push('direction-vector-b');
        
        this.panel.createText('normal-vector-n',
            mathDisplay3D(`\\text{Normal vector: } \\vec{n} = (1,-1,1)`, { block: true }),
            tightStyle
        );
        this.rows.push('normal-vector-n');
        
        this.panel.createText('parallel-check',
            mathDisplay3D(`\\vec{b} \\cdot \\vec{n} = 3 - 4 + 2 = 1 \\neq 0`, { block: true }),
            tightStyle
        );
        this.rows.push('parallel-check');
        
        this.panel.createText('not-parallel',
            mathDisplay3D(`\\therefore \\text{ Line is not parallel to plane}`, { block: true }),
            tightStyle
        );
        this.rows.push('not-parallel');
        
        // SECTION 3: Intersection Calculation
        this.panel.createText('section-intersection',
            '<div class="step-details-title">Intersection Point</div>',
            tightStyle
        );
        this.sections.push('section-intersection');
        
        // Formula from Theorem 6.23
        this.panel.createText('intersection-formula',
            mathDisplay3D(`\\vec{u} = \\vec{a} + \\frac{p - (\\vec{a} \\cdot \\vec{n})}{\\vec{b} \\cdot \\vec{n}} \\vec{b}`, { block: true }),
            tightStyle
        );
        this.rows.push('intersection-formula');
        
        // Compute a·n
        this.panel.createText('compute-a-dot-n',
            mathDisplay3D(`\\vec{a} \\cdot \\vec{n} = 2 + 1 + 2 = 5`, { block: true }),
            tightStyle
        );
        this.rows.push('compute-a-dot-n');
        
        // Compute difference
        this.panel.createText('compute-difference',
            mathDisplay3D(`p - (\\vec{a} \\cdot \\vec{n}) = 5 - 5 = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('compute-difference');
        
        // Final calculation
        this.panel.createText('final-calculation',
            mathDisplay3D(`\\vec{u} = \\vec{a} + \\frac{0}{1} \\vec{b} = \\vec{a}`, { block: true }),
            tightStyle
        );
        this.rows.push('final-calculation');
        
        // Result vector
        this.panel.createText('result-vector',
            mathDisplay3D(`\\vec{u} = 2\\hat{i} - \\hat{j} + 2\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('result-vector');
        
        // Final coordinates
        this.panel.createText('coordinates',
            mathDisplay3D(`\\text{Intersection point: } (2, -1, 2)`, { block: true }),
            tightStyle
        );
        this.rows.push('coordinates');
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
