import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from stepsArray to panel element IDs
        const stepNameToElements = {
            'first_plane': ['plane1-normal', 'plane1-equation'],
            'second_plane': ['plane2-normal', 'plane2-equation'],
            'normal_vectors': ['plane1-normal', 'plane2-normal'],
            'intersection_line': ['intersection-formula', 'intersection-equation'],
            'given_point': ['given-point'],
            'third_plane': ['substitution-point', 'lambda-calc1', 'lambda-calc2', 'lambda-result'],
            'combined_normal': ['final-substitution', 'final-expansion', 'final-simplification'],
            'solution_focus': ['final-equation']
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
        
        // SECTION 1: Given Planes
        this.panel.createText('planes-title',
            '<div class="step-details-title">Given Planes</div>',
            tightStyle
        );
        this.sections.push('planes-title');
        
        // From step 2: Normal vectors and constants
        this.panel.createText('plane1-normal',
            mathDisplay3D(`\\vec{n}_1 = \\hat{i} + \\hat{j} + \\hat{k}, \\quad d_1 = -1`, { block: true }),
            tightStyle
        );
        this.rows.push('plane1-normal');
        
        this.panel.createText('plane1-equation',
            mathDisplay3D(`\\vec{r} \\cdot (\\hat{i} + \\hat{j} + \\hat{k}) + 1 = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('plane1-equation');
        
        this.panel.createText('plane2-normal',
            mathDisplay3D(`\\vec{n}_2 = 2\\hat{i} - 3\\hat{j} + 5\\hat{k}, \\quad d_2 = 2`, { block: true }),
            tightStyle
        );
        this.rows.push('plane2-normal');
        
        this.panel.createText('plane2-equation',
            mathDisplay3D(`\\vec{r} \\cdot (2\\hat{i} - 3\\hat{j} + 5\\hat{k}) = 2`, { block: true }),
            tightStyle
        );
        this.rows.push('plane2-equation');
        
        // SECTION 2: Intersection Formula
        this.panel.createText('formula-title',
            '<div class="step-details-title">Intersection Formula</div>',
            tightStyle
        );
        this.sections.push('formula-title');
        
        // From step 1: General formula
        this.panel.createText('intersection-formula',
            mathDisplay3D(`(\\vec{r} \\cdot \\vec{n}_1 - d_1) + \\lambda(\\vec{r} \\cdot \\vec{n}_2 - d_2) = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('intersection-formula');
        
        // From step 3: Substituted form
        this.panel.createText('intersection-equation',
            mathDisplay3D(`(x + y + z + 1) + \\lambda(2x - 3y + 5z - 2) = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('intersection-equation');
        
        // Given point
        this.panel.createText('given-point',
            mathDisplay3D(`\\text{Point: } A = (-1, 2, 1)`, { block: true }),
            tightStyle
        );
        this.rows.push('given-point');
        
        // SECTION 3: Finding λ and Final Equation
        this.panel.createText('lambda-title',
            '<div class="step-details-title">Finding λ and Final Equation</div>',
            tightStyle
        );
        this.sections.push('lambda-title');
        
        // From step 4: Finding lambda
        this.panel.createText('substitution-point',
            mathDisplay3D(`\\text{Substitute } x = -1, y = 2, z = 1:`, { block: true }),
            tightStyle
        );
        this.rows.push('substitution-point');
        
        this.panel.createText('lambda-calc1',
            mathDisplay3D(`((-1) + 2 + 1 + 1) + \\lambda(2(-1) - 3(2) + 5(1) - 2) = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('lambda-calc1');
        
        this.panel.createText('lambda-calc2',
            mathDisplay3D(`3 + \\lambda(-3 - 6 + 5 - 2) = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('lambda-calc2');
        
        this.panel.createText('lambda-result',
            mathDisplay3D(`3 + \\lambda(-6) = 0 \\implies \\lambda = \\tfrac{3}{5}`, { block: true }),
            tightStyle
        );
        this.rows.push('lambda-result');
        
        // From step 5: Final equation derivation
        this.panel.createText('final-substitution',
            mathDisplay3D(`(x + y + z + 1) + \\tfrac{3}{5}(2x - 3y + 5z - 2) = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('final-substitution');
        
        this.panel.createText('final-expansion',
            mathDisplay3D(`5(x + y + z + 1) + 3(2x - 3y + 5z - 2) = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('final-expansion');
        
        this.panel.createText('final-simplification',
            mathDisplay3D(`5x + 5y + 5z + 5 + 6x - 9y + 15z - 6 = 0`, { block: true }),
            tightStyle
        );
        this.rows.push('final-simplification');
        
        this.panel.createText('final-equation',
            mathDisplay3D(`\\boxed{11x - 4y + 20z - 1 = 0}`, { block: true }),
            tightStyle
        );
        this.rows.push('final-equation');
        
        // Log counts for verification
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
