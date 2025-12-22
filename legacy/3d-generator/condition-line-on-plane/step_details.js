// Step details for Condition-line-on-plane
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        const stepNameToElements = {
            'plane': ['plane-equation', 'normal-vector'],
            'line': ['line-point', 'direction-ratios'],
            'point_on_line': ['line-point'],
            'direction_vector': ['direction-ratios'],
            'normal_vector': ['normal-vector'],
            'check_point_on_plane': ['point-check-formula', 'point-check-calculation', 'point-check-result'],
            'check_perpendicularity': ['dot-product-formula', 'dot-product-calculation', 'dot-product-result'],
            'conclusion': ['conclusion-text']
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
        
        // SECTION 1: Line and Plane Definition
        this.panel.createText('geometry-title',
            '<div class="step-details-title">Geometry</div>',
            tightStyle
        );
        this.sections.push('geometry-title');
        
        // Line point and direction from step 1
        this.panel.createText('line-point',
            mathDisplay3D(`\\text{Point on line: } P = (3, 4, -3)`, { block: true }),
            tightStyle
        );
        this.rows.push('line-point');
        
        this.panel.createText('direction-ratios',
            mathDisplay3D(`\\text{Direction: } \\vec{d} = (-4, -7, 12)`, { block: true }),
            tightStyle
        );
        this.rows.push('direction-ratios');
        
        // Plane equation and normal from step 2
        this.panel.createText('plane-equation',
            mathDisplay3D(`\\text{Plane: } 5x - y + z = 8`, { block: true }),
            tightStyle
        );
        this.rows.push('plane-equation');
        
        this.panel.createText('normal-vector',
            mathDisplay3D(`\\text{Normal: } \\vec{n} = (5, -1, 1)`, { block: true }),
            tightStyle
        );
        this.rows.push('normal-vector');
        
        // SECTION 2: Condition Checks
        this.panel.createText('checks-title',
            '<div class="step-details-title">Condition Checks</div>',
            tightStyle
        );
        this.sections.push('checks-title');
        
        // Point on plane check from step 3
        this.panel.createText('point-check-formula',
            mathDisplay3D(`\\text{Point check: } 5x - y + z`, { block: true }),
            tightStyle
        );
        this.rows.push('point-check-formula');
        
        this.panel.createText('point-check-calculation',
            mathDisplay3D(`\\text{Substituting P: } 5(3) - (4) + (-3)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-check-calculation');
        
        this.panel.createText('point-check-result',
            mathDisplay3D(`\\text{Result: } 8 = 8 \\checkmark \\text{ (point on plane)}`, { block: true }),
            tightStyle
        );
        this.rows.push('point-check-result');
        
        // Perpendicularity check from step 4
        this.panel.createText('dot-product-formula',
            mathDisplay3D(`\\text{Perpendicular: } \\vec{d} \\cdot \\vec{n}`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-formula');
        
        this.panel.createText('dot-product-calculation',
            mathDisplay3D(`\\text{Calculation: } (-4)(5) + (-7)(-1) + (12)(1)`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-calculation');
        
        this.panel.createText('dot-product-result',
            mathDisplay3D(`\\text{Result: } -1 \\neq 0 \\text{ (not perpendicular)}`, { block: true }),
            tightStyle
        );
        this.rows.push('dot-product-result');
        
        // SECTION 3: Conclusion
        this.panel.createText('result-title',
            '<div class="step-details-title">Result</div>',
            tightStyle
        );
        this.sections.push('result-title');
        
        // Conclusion from step 5
        this.panel.createText('conclusion-text',
            mathDisplay3D(`\\boxed{\\text{Line does not lie in the plane}}`, { block: true }),
            tightStyle
        );
        this.rows.push('conclusion-text');
        
        // Verify limits
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
