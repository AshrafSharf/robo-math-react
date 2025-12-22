// Step details for Line Through Point with Given Direction
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from stepsArray.push() to panel element IDs
        const stepNameToElements = {
            'point_a': ['point-a', 'point-meaning'],
            'position_vector_a': ['position-vec-a'],
            'direction_vector_b': ['direction-vec-b', 'direction-meaning'],
            'focus_direction_vector': ['position-vec-a', 'direction-vec-b', 'line-definition'],
            'line': ['parametric-form', 'line-definition'],
            'sample_point': ['sample-point-calc', 'sample-point-result', 'parameter-meaning'],
            'position_vector_r': ['position-vector-r', 'general-point'],
            'trace_vector_path': ['vector-addition-formula', 'vector-path-explanation'],
            'parametric_equation': ['parametric-components', 'parameter-range']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Given Information
        this.panel.createText('given-title',
            '<div class="step-details-title">Given Information</div>',
            tightStyle
        );
        this.sections.push('given-title');
        
        // Point and its meaning combined
        this.panel.createText('point-a',
            mathDisplay3D(`\\text{Point } A = (2, -3, 4) \\text{ - line passes through this point}`, { block: true }),
            tightStyle
        );
        this.rows.push('point-a');
        
        // Position vector
        this.panel.createText('position-vec-a',
            mathDisplay3D(`\\text{Position vector: } \\vec{a} = 2\\hat{i} - 3\\hat{j} + 4\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vec-a');
        
        // Direction vector
        this.panel.createText('direction-vec-b',
            mathDisplay3D(`\\text{Direction vector: } \\vec{b} = 3\\hat{i} + 2\\hat{j} + 2\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('direction-vec-b');
        
        // Direction meaning
        this.panel.createText('direction-meaning',
            mathDisplay3D(`\\text{Line is parallel to } \\vec{b} \\text{ at every point}`, { block: true }),
            tightStyle
        );
        this.rows.push('direction-meaning');
        
        // SECTION 2: Line Equation
        this.panel.createText('line-title',
            '<div class="step-details-title">Line Equation</div>',
            tightStyle
        );
        this.sections.push('line-title');
        
        // Line definition
        this.panel.createText('line-definition',
            mathDisplay3D(`\\text{Line through } A \\text{ parallel to } \\vec{b}`, { block: true }),
            tightStyle
        );
        this.rows.push('line-definition');
        
        // Parametric form formula
        this.panel.createText('parametric-form',
            mathDisplay3D(`\\text{General form: } \\vec{r} = \\vec{a} + t\\vec{b}, \\; t \\in \\mathbb{R}`, { block: true }),
            tightStyle
        );
        this.rows.push('parametric-form');
        
        // Vector addition formula with substitution
        this.panel.createText('vector-addition-formula',
            mathDisplay3D(`\\vec{r} = (2\\hat{i} - 3\\hat{j} + 4\\hat{k}) + t(3\\hat{i} + 2\\hat{j} + 2\\hat{k})`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-addition-formula');
        
        // Component form
        this.panel.createText('parametric-components',
            mathDisplay3D(`\\text{Components: } x = 2 + 3t, \\; y = -3 + 2t, \\; z = 4 + 2t`, { block: true }),
            tightStyle
        );
        this.rows.push('parametric-components');
        
        // Parameter range explanation
        this.panel.createText('parameter-range',
            mathDisplay3D(`t \\in (-\\infty, +\\infty) \\text{ generates entire line}`, { block: true }),
            tightStyle
        );
        this.rows.push('parameter-range');
        
        // SECTION 3: Understanding the Parameter
        this.panel.createText('sample-title',
            '<div class="step-details-title">Understanding Parameter t</div>',
            tightStyle
        );
        this.sections.push('sample-title');
        
        // Parameter meaning
        this.panel.createText('parameter-meaning',
            mathDisplay3D(`t = 0 \\Rightarrow \\text{point } A, \\quad t = 1 \\Rightarrow \\text{one } \\vec{b} \\text{ from } A`, { block: true }),
            tightStyle
        );
        this.rows.push('parameter-meaning');
        
        // Sample point calculation
        this.panel.createText('sample-point-calc',
            mathDisplay3D(`\\text{At } t = 1: \\; \\vec{r} = \\vec{a} + 1 \\cdot \\vec{b}`, { block: true }),
            tightStyle
        );
        this.rows.push('sample-point-calc');
        
        // Sample point result
        this.panel.createText('sample-point-result',
            mathDisplay3D(`\\vec{r} = (2, -3, 4) + (3, 2, 2) = (5, -1, 6)`, { block: true }),
            tightStyle
        );
        this.rows.push('sample-point-result');
        
        // Position vector to sample point
        this.panel.createText('position-vector-r',
            mathDisplay3D(`\\text{Point } R: \\; \\vec{r} = 5\\hat{i} - \\hat{j} + 6\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector-r');
        
        // General point on line
        this.panel.createText('general-point',
            mathDisplay3D(`\\text{General point: } (2+3t, -3+2t, 4+2t)`, { block: true }),
            tightStyle
        );
        this.rows.push('general-point');
        
        // Vector path explanation
        this.panel.createText('vector-path-explanation',
            mathDisplay3D(`\\text{Path: Origin } \\xrightarrow{\\vec{a}} A \\xrightarrow{t\\vec{b}} \\text{point on line}`, { block: true }),
            tightStyle
        );
        this.rows.push('vector-path-explanation');
        
        // Additional meaning row to remove confusion
        this.panel.createText('point-meaning',
            mathDisplay3D(``, { block: true }),
            { display: 'none' }  // Hidden element for mapping compatibility
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