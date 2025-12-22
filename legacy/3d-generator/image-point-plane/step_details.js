// Step details for Image-point-plane
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map animation step names to panel element IDs
        const stepNameToElements = {
            'plane': ['plane-equation'],
            'original_point': ['point-u'],
            'position_vector_u': ['point-u', 'position-vector-u'],
            'normal_vector': ['normal-vector', 'plane-equation'],
            'dot_product_calculation': ['dot-product-calc', 'magnitude-squared'],
            'displacement_vector': ['substitution', 'scalar-simplify', 'displacement-calc'],
            'image_point': ['image-expand', 'image-result'],
            'position_vector_v': ['image-result', 'final-answer'],
            'perpendicular_line': ['image-formula'],
            'midpoint_on_plane': ['image-formula'],
            'reflection_relationship': ['final-answer']
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
        
        // SECTION 1: Input Parameters (1 section)
        this.panel.createText('input-title',
            '<div class="step-details-title">Input Parameters</div>',
            tightStyle
        );
        this.sections.push('input-title');
        
        // Row 1: Point U
        this.panel.createText('point-u',
            mathDisplay3D(`\\text{Point: } \\vec{u} = i + 2j + 3k`, { block: true }),
            tightStyle
        );
        this.rows.push('point-u');
        
        // Row 2: Position vector notation
        this.panel.createText('position-vector-u',
            mathDisplay3D(`\\text{Position vector: } \\vec{u} = (1, 2, 3)`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector-u');
        
        // Row 3: Normal vector
        this.panel.createText('normal-vector',
            mathDisplay3D(`\\text{Normal: } \\vec{n} = i + 2j + 4k = (1, 2, 4)`, { block: true }),
            tightStyle
        );
        this.rows.push('normal-vector');
        
        // Row 4: Plane equation
        this.panel.createText('plane-equation',
            mathDisplay3D(`\\text{Plane: } \\vec{r} \\cdot \\vec{n} = p \\quad \\Rightarrow \\quad x + 2y + 4z = 38`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-equation');
        
        // SECTION 2: Image Formula and Calculations (1 section)
        this.panel.createText('formula-title',
            '<div class="step-details-title">Image Point Formula</div>',
            tightStyle
        );
        this.sections.push('formula-title');
        
        // Row 5: General formula
        this.panel.createText('image-formula',
            mathDisplay3D(`\\text{Image formula: } \\vec{v} = \\vec{u} + \\dfrac{2[p - (\\vec{u} \\cdot \\vec{n})]}{|\\vec{n}|^2} \\vec{n}`, { block: true }),
            tightStyle
        );
        this.rows.push('image-formula');
        
        // Row 6: Dot product calculation
        this.panel.createText('dot-product-calc',
            mathDisplay3D(`\\vec{u} \\cdot \\vec{n} = (1)(1) + (2)(2) + (3)(4) = 17`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-calc');
        
        // Row 7: Magnitude squared
        this.panel.createText('magnitude-squared',
            mathDisplay3D(`|\\vec{n}|^2 = 1^2 + 2^2 + 4^2 = 21`, { block: true }),
            tightStyle
        );
        this.rows.push('magnitude-squared');
        
        // Row 8: Substitution
        this.panel.createText('substitution',
            mathDisplay3D(`\\vec{v} = (i + 2j + 3k) + \\dfrac{2[38 - 17]}{21}(i + 2j + 4k)`, { block: true }),
            tightStyle
        );
        this.rows.push('substitution');
        
        // Row 9: Simplify scalar
        this.panel.createText('scalar-simplify',
            mathDisplay3D(`\\text{Scalar: } \\dfrac{2 \\times 21}{21} = 2`, { block: true }),
            tightStyle
        );
        this.rows.push('scalar-simplify');
        
        // Row 10: Displacement calculation
        this.panel.createText('displacement-calc',
            mathDisplay3D(`\\vec{v} = (i + 2j + 3k) + 2(i + 2j + 4k)`, { block: true }),
            tightStyle
        );
        this.rows.push('displacement-calc');
        
        // SECTION 3: Result (1 section)
        this.panel.createText('result-title',
            '<div class="step-details-title">Result</div>',
            tightStyle
        );
        this.sections.push('result-title');
        
        // Row 11: Expand expression
        this.panel.createText('image-expand',
            mathDisplay3D(`\\vec{v} = (i + 2j + 3k) + (2i + 4j + 8k)`, { block: true }),
            tightStyle
        );
        this.rows.push('image-expand');
        
        // Row 12: Final result
        this.panel.createText('image-result',
            mathDisplay3D(`\\text{Image point: } \\vec{v} = 3i + 6j + 11k = (3, 6, 11)`, { block: true }),
            tightStyle
        );
        this.rows.push('image-result');
        
        // Row 13: Final answer
        this.panel.createText('final-answer',
            mathDisplay3D(`\\therefore \\text{ The image of point } (1, 2, 3) \\text{ is } (3, 6, 11)`, { block: true }),
            tightStyle
        );
        this.rows.push('final-answer');
        
        // Verify limits: 3 sections, 13 data rows (within limits)
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
