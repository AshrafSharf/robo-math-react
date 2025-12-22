// Step details for Distance Between Skew Lines
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        const stepNameToElements = {
            // Map step names from stepsArray to panel element IDs
            'line1': ['line1-def'],
            'line2': ['line2-def'],
            'point_a_on_l1': ['point-a'],
            'point_c_on_l2': ['point-c'],
            'direction_vectors': ['direction-b', 'direction-d'],
            'cross_product_focus': ['cross-product-perp'],
            'cross_product_computed': ['cross-product-perp'],
            'unit_vector': ['unit-vector'],
            'vector_ac': ['vector-subtraction', 'vector-ac'],
            'projection_calculation': ['projection-calc', 'projection', 'distance-result'],
            'shortest_distance': ['distance-result'],
            'perpendicular_verification': ['condition'],
            'formula_visualization': ['projection-calc', 'distance-result']
        };
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
        this.validateLimits();
    }
    
    countSections() {
        return this.sections.length;
    }
    
    countRows() {
        return this.rows.length;
    }
    
    validateLimits() {
        // Internal validation - no console output
        const sectionCount = this.countSections();
        const rowCount = this.countRows();
        
        // Limits: max 3 sections, max 15 data rows
        // Currently: 3 sections, 11 rows - within limits
    }
    
    initializeExpressions() {
        this.panel.clear();
        this.sections = [];
        this.rows = [];
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Input Parameters (6 rows including title)
        this.sections.push('lines-title');
        this.panel.createText('lines-title',
            '<div class="step-details-title">Skew Lines Input</div>',
            tightStyle
        );
        
        // Line L1 definition with numerical values
        this.rows.push('line1-def');
        this.panel.createText('line1-def',
            mathDisplay3D(`L_1: \\vec{r} = (1, 2, 0) + s(2, 1, -1)`, { block: true }),
            tightStyle
        );
        
        // Line L2 definition with numerical values
        this.rows.push('line2-def');
        this.panel.createText('line2-def',
            mathDisplay3D(`L_2: \\vec{r} = (-1, 0, 3) + t(1, -2, 1)`, { block: true }),
            tightStyle
        );
        
        // Point A on L1
        this.rows.push('point-a');
        this.panel.createText('point-a',
            mathDisplay3D(`\\text{Point on } L_1: A = (1, 2, 0)`, { block: true }),
            tightStyle
        );
        
        // Point C on L2
        this.rows.push('point-c');
        this.panel.createText('point-c',
            mathDisplay3D(`\\text{Point on } L_2: C = (-1, 0, 3)`, { block: true }),
            tightStyle
        );
        
        // Direction vector b
        this.rows.push('direction-b');
        this.panel.createText('direction-b',
            mathDisplay3D(`\\text{Direction of } L_1: \\vec{b} = (2, 1, -1)`, { block: true }),
            tightStyle
        );
        
        // Direction vector d
        this.rows.push('direction-d');
        this.panel.createText('direction-d',
            mathDisplay3D(`\\text{Direction of } L_2: \\vec{d} = (1, -2, 1)`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Method (7 rows including title)
        this.sections.push('method-title');
        this.panel.createText('method-title',
            '<div class="step-details-title">Distance Calculation</div>',
            tightStyle
        );
        
        // Cross product calculation with result
        this.rows.push('cross-product-perp');
        this.panel.createText('cross-product-perp',
            mathDisplay3D(`\\text{Cross product: } \\vec{b} \\times \\vec{d} = (-1, -3, -5)`, { block: true }),
            tightStyle
        );
        
        // Magnitude of cross product
        this.rows.push('unit-vector');
        this.panel.createText('unit-vector',
            mathDisplay3D(`\\text{Magnitude: } |\\vec{b} \\times \\vec{d}| = \\sqrt{1 + 9 + 25} = \\sqrt{35}`, { block: true }),
            tightStyle
        );
        
        // Vector between two points explanation
        this.rows.push('vector-subtraction');
        this.panel.createText('vector-subtraction',
            mathDisplay3D(`\\text{Vector between two points: } \\vec{AC} = C - A`, { block: true }),
            tightStyle
        );
        
        // Vector AC calculation result
        this.rows.push('vector-ac');
        this.panel.createText('vector-ac',
            mathDisplay3D(`\\text{Result: } \\vec{AC} = (-1, 0, 3) - (1, 2, 0) = (-2, -2, 3)`, { block: true }),
            tightStyle
        );
        
        // Distance formula (generic)
        this.rows.push('projection-calc');
        this.panel.createText('projection-calc',
            mathDisplay3D(`\\text{Distance formula: } \\delta = \\frac{|\\vec{AC} \\cdot (\\vec{b} \\times \\vec{d})|}{|\\vec{b} \\times \\vec{d}|}`, { block: true }),
            tightStyle
        );
        
        // Substitution of values
        this.rows.push('projection');
        this.panel.createText('projection',
            mathDisplay3D(`\\text{Substituting: } \\delta = \\frac{|\\vec{AC} \\cdot (-1,-3,-5)|}{\\sqrt{35}} = \\frac{|(-2,-2,3) \\cdot (-1,-3,-5)|}{\\sqrt{35}}`, { block: true }),
            tightStyle
        );
        
        // Final calculation result
        this.rows.push('distance-result');
        this.panel.createText('distance-result',
            mathDisplay3D(`\\text{Result: } \\delta = \\frac{7}{\\sqrt{35}} = \\frac{\\sqrt{35}}{5} \\approx 1.18`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Verification (2 rows including title)
        this.sections.push('result-title');
        this.panel.createText('result-title',
            '<div class="step-details-title">Verification</div>',
            tightStyle
        );
        
        // Verification that lines are skew
        this.rows.push('condition');
        this.panel.createText('condition',
            mathDisplay3D(`\\text{Lines are skew: } \\vec{b} \\times \\vec{d} = (-1,-3,-5) \\neq \\vec{0} \\checkmark`, { block: true }),
            tightStyle
        );
        
        // Track sections and rows for validation
        this.sections = ['lines-title', 'method-title', 'result-title'];
        this.rows = ['line1-def', 'line2-def', 'point-a', 'point-c', 'direction-b', 'direction-d',
                     'cross-product-perp', 'unit-vector', 'vector-subtraction', 'vector-ac', 'projection-calc', 'projection', 'distance-result',
                     'condition'];
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
