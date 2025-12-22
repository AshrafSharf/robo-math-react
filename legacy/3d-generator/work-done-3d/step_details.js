// Step details for Work-done-3d
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from stepsArray to panel element IDs
        const stepNameToElements = {
            'initial_position': ['initial-position'],
            'final_position': ['final-position'],
            'force_vector_1': ['force-1'],
            'force_vector_2': ['force-2'],
            'resultant_force': ['resultant-force'],
            'force_addition_focus': ['force-1', 'force-2', 'resultant-force'],
            'displacement_vector': ['displacement-formula', 'displacement-vector'],
            'parallel_vectors_for_angle': ['angle-visualization'],
            'angle_between_vectors': ['angle-visualization'],
            'work_calculation_focus': ['work-formula', 'work-substitution', 'work-calculation'],
            'work_projection': ['work-formula'],
            'final_result': ['solve-lambda', 'lambda-result']
        };
        
        this.highlighter = createHighlighter(stepNameToElements);
        this.initializeExpressions();
    }
    
    initializeExpressions() {
        this.panel.clear();
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Given Data
        this.panel.createText('section-positions',
            '<div class="step-details-title">Positions and Forces</div>',
            tightStyle
        );
        this.sections.push('section-positions');
        
        // Initial position from step-by-step.json
        this.panel.createText('initial-position',
            mathDisplay3D(`\\text{Initial position: } A(1, 3, -1)`, { block: true }),
            tightStyle
        );
        this.rows.push('initial-position');
        
        // Final position from step-by-step.json
        this.panel.createText('final-position',
            mathDisplay3D(`\\text{Final position: } B(4, -1, \\lambda)`, { block: true }),
            tightStyle
        );
        this.rows.push('final-position');
        
        // Force vectors from step-by-step.json
        this.panel.createText('force-1',
            mathDisplay3D(`\\vec{F}_1 = 3\\hat{i} - 2\\hat{j} + 2\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('force-1');
        
        this.panel.createText('force-2',
            mathDisplay3D(`\\vec{F}_2 = 2\\hat{i} + \\hat{j} - \\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('force-2');
        
        // Resultant force from step-by-step.json
        this.panel.createText('resultant-force',
            mathDisplay3D(`\\vec{F} = \\vec{F}_1 + \\vec{F}_2 = 5\\hat{i} - \\hat{j} + \\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('resultant-force');
        
        // SECTION 2: Displacement Calculation
        this.panel.createText('section-displacement',
            '<div class="step-details-title">Displacement Vector</div>',
            tightStyle
        );
        this.sections.push('section-displacement');
        
        // Displacement formula from step-by-step.json
        this.panel.createText('displacement-formula',
            mathDisplay3D(`\\vec{d} = \\vec{B} - \\vec{A}`, { block: true }),
            tightStyle
        );
        this.rows.push('displacement-formula');
        
        // Displacement calculation from step-by-step.json
        this.panel.createText('displacement-vector',
            mathDisplay3D(`\\vec{d} = 3\\hat{i} - 4\\hat{j} + (\\lambda + 1)\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('displacement-vector');
        
        // Angle visualization note
        this.panel.createText('angle-visualization',
            mathDisplay3D(`\\text{Angle } \\theta \\text{ between } \\vec{F} \\text{ and } \\vec{d}`, { block: true }),
            tightStyle
        );
        this.rows.push('angle-visualization');
        
        // SECTION 3: Work Calculation
        this.panel.createText('section-work',
            '<div class="step-details-title">Work Calculation</div>',
            tightStyle
        );
        this.sections.push('section-work');
        
        // Work formula from step-by-step.json
        this.panel.createText('work-formula',
            mathDisplay3D(`W = \\vec{F} \\cdot \\vec{d}`, { block: true }),
            tightStyle
        );
        this.rows.push('work-formula');
        
        // Work substitution from step-by-step.json
        this.panel.createText('work-substitution',
            mathDisplay3D(`16 = (5\\hat{i} - \\hat{j} + \\hat{k}) \\cdot (3\\hat{i} - 4\\hat{j} + (\\lambda + 1)\\hat{k})`, { block: true }),
            tightStyle
        );
        this.rows.push('work-substitution');
        
        // Work calculation from step-by-step.json
        this.panel.createText('work-calculation',
            mathDisplay3D(`16 = 15 + 4 + \\lambda + 1 = 20 + \\lambda`, { block: true }),
            tightStyle
        );
        this.rows.push('work-calculation');
        
        // Solve for lambda from step-by-step.json
        this.panel.createText('solve-lambda',
            mathDisplay3D(`16 = 20 + \\lambda`, { block: true }),
            tightStyle
        );
        this.rows.push('solve-lambda');
        
        // Final result from step-by-step.json
        this.panel.createText('lambda-result',
            mathDisplay3D(`\\boxed{\\lambda = -4}`, { block: true }),
            tightStyle
        );
        this.rows.push('lambda-result');
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
