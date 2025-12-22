// Step details for vector subtraction lesson
// Shows mathematical expressions from step-by-step.json

import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        
        // Step names MUST match exactly what's pushed to stepsArray in main file
        const stepNameToElements = {
            'vector_u': ['vector-u-def'],
            'vector_v': ['vector-v-def'],
            'negative_v': ['negative-v-calc', 'subtraction-method'],
            'translate_neg_v': ['tip-to-tail', 'translated-position'],
            'result_vector': ['subtraction-calc', 'result-components'],
            'difference_direct': ['geometric-meaning', 'displacement-insight'],
            'focus_key': ['key-insight'],
            'restore_all': ['final-result-boxed']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Given Vectors
        this.panel.createText('vectors-title', 
            '<div class="step-details-title">Given Vectors</div>',
            tightStyle
        );
        
        // Vector u definition
        this.panel.createText('vector-u-def',
            mathDisplay3D(`\\vec{u} = \\langle 4, 2, 3 \\rangle`, { block: true }),
            tightStyle
        );
        
        // Vector v definition
        this.panel.createText('vector-v-def',
            mathDisplay3D(`\\vec{v} = \\langle 2, 4, 1 \\rangle`, { block: true }),
            tightStyle
        );
        
        // SECTION 2: Subtraction Method
        this.panel.createText('method-title', 
            '<div class="step-details-title">Subtraction Method: Add the Negative</div>',
            tightStyle
        );
        
        // Key concept
        this.panel.createText('subtraction-method',
            mathDisplay3D(`\\vec{u} - \\vec{v} = \\vec{u} + (-\\vec{v})`, { block: true }),
            tightStyle
        );
        
        // Negative v calculation
        this.panel.createText('negative-v-calc',
            mathDisplay3D(`-\\vec{v} = \\langle -2, -4, -1 \\rangle`, { block: true }),
            tightStyle
        );
        
        // Tip-to-tail rule
        this.panel.createText('tip-to-tail',
            mathDisplay3D(`\\text{Tip-to-tail: Place } -\\vec{v} \\text{ at tip of } \\vec{u}`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('translated-position',
            mathDisplay3D(`\\text{New position: } (4,2,3) + \\langle -2,-4,-1 \\rangle = (2,-2,2)`, { block: true }),
            tightStyle
        );
        
        // SECTION 3: Result Calculation
        this.panel.createText('calculation-title', 
            '<div class="step-details-title">Component-wise Calculation</div>',
            tightStyle
        );
        
        // Detailed calculation
        this.panel.createText('subtraction-calc',
            mathDisplay3D(`\\vec{u} - \\vec{v} = \\langle 4-2, 2-4, 3-1 \\rangle`, { block: true }),
            tightStyle
        );
        
        this.panel.createText('result-components',
            mathDisplay3D(`= \\langle 2, -2, 2 \\rangle`, { block: true }),
            tightStyle
        );
        
        // SECTION 4: Geometric Insight
        this.panel.createText('geometric-title', 
            '<div class="step-details-title">Geometric Understanding</div>',
            tightStyle
        );
        
        // Geometric meaning
        this.panel.createText('geometric-meaning',
            mathDisplay3D(`\\vec{u} - \\vec{v} \\text{ = displacement from } \\vec{v} \\text{ to } \\vec{u}`, { block: true }),
            tightStyle
        );
        
        // Displacement insight
        this.panel.createText('displacement-insight',
            mathDisplay3D(`\\vec{v} + (\\vec{u} - \\vec{v}) = \\vec{u}`, { block: true }),
            tightStyle
        );
        
        // Key insight
        this.panel.createText('key-insight',
            mathDisplay3D(`\\text{Key: } \\vec{u} - \\vec{v} \\text{ answers "What adds to } \\vec{v} \\text{ to get } \\vec{u}\\text{?"}`, { block: true }),
            tightStyle
        );
        
        // Final boxed answer
        this.panel.createText('final-result-boxed',
            mathDisplay3D(`\\boxed{\\vec{u} - \\vec{v} = \\langle 2, -2, 2 \\rangle}`, { block: true }),
            { margin: '8px 0', padding: '4px 0', lineHeight: '1.4' }
        );
    }
    
    highlightDetails(stepName) {
        console.log(`[StepDetails] highlightDetails called for step: ${stepName}`);
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}