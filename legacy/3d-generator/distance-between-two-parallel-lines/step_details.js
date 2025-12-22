// Step details for distance between two parallel lines
import { mathDisplay3D } from '../common/js/control-panel-3d.js';
import { createHighlighter } from '../common/js/step_details_highlighter.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        
        // Define the mapping of step names to element IDs
        // MUST match exactly what's pushed to stepsArray in main file
        const stepNameToElements = {
            'line1': ['line1-equation'],
            'line2': ['line2-equation'],
            'point_a_with_vector': ['point-a', 'vector-a'],
            'point_c_with_vector': ['point-c', 'vector-c'],
            'point_d': ['point-d'],
            'direction_vector': ['direction-b'],
            'perpendicular_distance': ['distance-ad'],
            'vector_ac_difference': ['vector-ac-calc'],
            'triangle_angles': ['right-angle-info', 'angle-theta', 'sin-identity', 'distance-formula', 'distance-result'],
            'focus_triangle': ['distance-formula', 'distance-result'],
            'restore_all': []
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Parallel Lines
        this.panel.createText('lines-title', 
            '<div class="step-details-title">Parallel Lines</div>',
            tightStyle
        );
        
        this.panel.createText('line1-equation',
            mathDisplay3D(`\\text{Line } L_1: \\vec{r} = \\langle 1, 2, 3 \\rangle + t\\langle 2, -1, 2 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('line2-equation',
            mathDisplay3D(`\\text{Line } L_2: \\vec{r} = \\langle 4, 0, 1 \\rangle + s\\langle 2, -1, 2 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('direction-b',
            mathDisplay3D(`\\text{Direction vector: } \\vec{b} = \\langle 2, -1, 2 \\rangle`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Points and Position Vectors
        this.panel.createText('points-title', 
            '<div class="step-details-title">Points and Position Vectors</div>',
            tightStyle
        );
        
        this.panel.createText('point-a',
            mathDisplay3D(`\\text{Point } A \\text{ on } L_1: A = (1, 2, 3) \\quad \\text{(at } t = 0\\text{)}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('vector-a',
            mathDisplay3D(`\\text{Position vector: } \\vec{a} = \\langle 1, 2, 3 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('point-c',
            mathDisplay3D(`\\text{Point } C \\text{ on } L_2: C = (4, 0, 1) \\quad \\text{(at } s = 0\\text{)}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('vector-c',
            mathDisplay3D(`\\text{Position vector: } \\vec{c} = \\langle 4, 0, 1 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('point-d',
            mathDisplay3D(`\\text{Point } D \\text{ on } L_2: \\text{perpendicular projection of } A`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Vector Calculations
        this.panel.createText('vectors-title', 
            '<div class="step-details-title">Vector Calculations</div>',
            tightStyle
        );
        
        this.panel.createText('vector-ac-calc',
            mathDisplay3D(`\\vec{a} - \\vec{c} = \\langle 1, 2, 3 \\rangle - \\langle 4, 0, 1 \\rangle = \\langle -3, 2, 2 \\rangle`, { block: true }),
            tightStyle
        );
        
        // SECTION 4: Distance Calculation
        this.panel.createText('distance-title', 
            '<div class="step-details-title">Distance Calculation</div>',
            tightStyle
        );
        
        this.panel.createText('distance-ad',
            mathDisplay3D(`\\text{Perpendicular distance: } d = |AD|`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('right-angle-info',
            mathDisplay3D(`\\text{Right angles at } A \\text{ and } D \\text{ (perpendicular to lines)}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('angle-theta',
            mathDisplay3D(`\\text{Angle } \\theta \\text{ at } C \\text{ in triangle } ACD`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('sin-identity',
            mathDisplay3D(`\\text{Key identity: } \\sin(180° - \\theta) = \\sin(\\theta)`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('distance-formula',
            mathDisplay3D(`d = \\frac{|\\vec{AC} \\times \\vec{b}|}{|\\vec{b}|} = \\frac{\\sqrt{117}}{3}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('distance-result',
            mathDisplay3D(`\\boxed{\\text{Distance} = \\sqrt{13} \\approx 3.61}`, { block: true }),
            tightStyle
        );
    }
    
    highlightDetails(stepName) {
        console.log(`[StepDetails] highlightDetails called for step: ${stepName}`);
        // Use the correct method name
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}