// Step details for Rectangular Coordinate System
import { createHighlighter } from '../common/js/step_details_highlighter.js';
import { mathDisplay3D } from '../common/js/control-panel-3d.js';

export class StepDetails {
    constructor(controlPanel) {
        this.panel = controlPanel;
        this.sections = [];
        this.rows = [];
        
        // Map step names from rectangular_coordinate_system.js to panel elements
        const stepNameToElements = {
            'coordinate_system_established': ['axes-description', 'origin', 'perpendicular-axes'],
            'point_p_placed': ['point-p', 'position-vector'],
            'position_vector_diagonal': ['diagonal-length', 'diagonal-calculation'],
            'projection_x_axis': ['projection-x'],
            'projection_y_axis': ['projection-y'],
            'projection_z_axis': ['projection-z'],
            'x_coordinate_label': ['x-coordinate'],
            'y_coordinate_label': ['y-coordinate'],
            'z_coordinate_label': ['z-coordinate'],
            'rectangular_box_visualization': ['box-vertices', 'box-properties', 'box-dimensions']
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
        this.sections = [];
        this.rows = [];
        const tightStyle = { margin: '2px 0', padding: '2px 0', lineHeight: '1.2' };
        
        // SECTION 1: Coordinate System
        this.panel.createText('system-title',
            '<div class="step-details-title">Coordinate System</div>',
            tightStyle
        );
        this.sections.push('system-title');
        
        // From step 1 - Coordinate axes
        this.panel.createText('axes-description',
            mathDisplay3D(`\\text{Coordinate axes: } x\\text{-axis}, y\\text{-axis}, z\\text{-axis}`, { block: true }),
            tightStyle
        );
        this.rows.push('axes-description');
        
        this.panel.createText('origin',
            mathDisplay3D(`\\text{Origin: } O(0, 0, 0)`, { block: true }),
            tightStyle
        );
        this.rows.push('origin');
        
        this.panel.createText('perpendicular-axes',
            mathDisplay3D(`\\text{Axes are mutually perpendicular: } \\hat{i} \\perp \\hat{j} \\perp \\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('perpendicular-axes');
        
        // From step 2 - Point P
        this.panel.createText('point-p',
            mathDisplay3D(`P(x, y, z) = P(4, 3, 5)`, { block: true }),
            tightStyle
        );
        this.rows.push('point-p');
        
        this.panel.createText('position-vector',
            mathDisplay3D(`\\text{Position vector: } \\vec{OP} = 4\\hat{i} + 3\\hat{j} + 5\\hat{k}`, { block: true }),
            tightStyle
        );
        this.rows.push('position-vector');
        
        // From step 3 - Diagonal length
        this.panel.createText('diagonal-length',
            mathDisplay3D(`\\text{Diagonal length: } d = |\\vec{OP}| = \\sqrt{x^2 + y^2 + z^2}`, { block: true }),
            tightStyle
        );
        this.rows.push('diagonal-length');
        
        this.panel.createText('diagonal-calculation',
            mathDisplay3D(`d = \\sqrt{4^2 + 3^2 + 5^2} = \\sqrt{50} \\approx 7.07`, { block: true }),
            tightStyle
        );
        this.rows.push('diagonal-calculation');
        
        // SECTION 2: Projections
        this.panel.createText('projections-title',
            '<div class="step-details-title">Projections</div>',
            tightStyle
        );
        this.sections.push('projections-title');
        
        // From step 4 - Projections using compact notation
        this.panel.createText('projection-x',
            mathDisplay3D(`\\text{Projection along } x\\text{-axis: } (0, 3, 5) \\to P(4, 3, 5)`, { block: true }),
            tightStyle
        );
        this.rows.push('projection-x');
        
        this.panel.createText('projection-y',
            mathDisplay3D(`\\text{Projection along } y\\text{-axis: } (4, 0, 5) \\to P(4, 3, 5)`, { block: true }),
            tightStyle
        );
        this.rows.push('projection-y');
        
        this.panel.createText('projection-z',
            mathDisplay3D(`\\text{Projection along } z\\text{-axis: } (4, 3, 0) \\to P(4, 3, 5)`, { block: true }),
            tightStyle
        );
        this.rows.push('projection-z');
        
        // From step 5 - Coordinate values using compact notation
        this.panel.createText('x-coordinate',
            mathDisplay3D(`x = 4 \\text{ (distance from } yz\\text{-plane)}`, { block: true }),
            tightStyle
        );
        this.rows.push('x-coordinate');
        
        this.panel.createText('y-coordinate',
            mathDisplay3D(`y = 3 \\text{ (distance from } xz\\text{-plane)}`, { block: true }),
            tightStyle
        );
        this.rows.push('y-coordinate');
        
        this.panel.createText('z-coordinate',
            mathDisplay3D(`z = 5 \\text{ (distance from } xy\\text{-plane)}`, { block: true }),
            tightStyle
        );
        this.rows.push('z-coordinate');
        
        // SECTION 3: Rectangular Box
        this.panel.createText('box-title',
            '<div class="step-details-title">Rectangular Box</div>',
            tightStyle
        );
        this.sections.push('box-title');
        
        // From step 6 - Box properties using compact align environment
        this.panel.createText('box-vertices',
            mathDisplay3D(`\\begin{align}
\\text{Vertices: } &O(0,0,0), (4,0,0), (0,3,0), (0,0,5)\\\\
&(4,3,0), (4,0,5), (0,3,5), P(4,3,5)
\\end{align}`, { block: true }),
            tightStyle
        );
        this.rows.push('box-vertices');
        
        this.panel.createText('box-properties',
            mathDisplay3D(`\\text{Box edges are parallel to coordinate axes}`, { block: true }),
            tightStyle
        );
        this.rows.push('box-properties');
        
        this.panel.createText('box-dimensions',
            mathDisplay3D(`\\text{Box dimensions: } 4 \\times 3 \\times 5`, { block: true }),
            tightStyle
        );
        this.rows.push('box-dimensions');
        
        // Verify we're within limits
        console.log(`Sections: ${this.countSections()}, Rows: ${this.countRows()}`);
    }
    
    highlightDetails(stepName) {
        this.highlighter.highlightDetails(stepName);
    }
    
    reset() {
        this.highlighter.reset();
    }
}
