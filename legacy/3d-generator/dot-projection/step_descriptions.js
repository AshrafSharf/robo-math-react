// Step descriptions for Dot-projection
export function getAllDescriptions() {
    return {
        'title': 'Projection distance using dot product: $d = |\\vec{v} \\cdot \\hat{u}|$',
        
        // Example 1: 45° angle
        'vector_v_1': 'Vector $\\vec{v} = (2,\\ 2,\\ 1)$ to project onto direction $\\hat{u}$',
        'unit_vector_u_1': 'Unit vector $\\hat{u}$ defines projection axis with $|\\hat{u}| = 1$',
        'projection_line_1': 'Drop perpendicular to find $\\text{comp}_{\\hat{u}}\\vec{v}$',
        'measurement_1': 'Distance $d = 2.87$ shows shadow length at 45°',
        
        // Example 2: 60° angle
        'vector_v_2': 'Vector $\\vec{v} = (3,\\ 0,\\ 2)$ forms 60° with projection axis',
        'unit_vector_u_2': 'Unit $\\hat{u}$ ensures dot product equals scalar projection',
        'projection_line_2': 'Perpendicular reveals $\\text{proj}_{\\hat{u}}\\vec{v}$ endpoint',
        'measurement_2': 'At 60°, projection shrinks to $d = 2.6$ units',
        
        // Example 3: 70° angle
        'vector_v_3': 'Vector $\\vec{v} = (1,\\ 3,\\ 1)$ nearly perpendicular to $\\hat{u}$',
        'unit_vector_u_3': 'Direction $\\hat{u}$ normalized for direct distance calculation',
        'projection_line_3': 'Small projection due to large angle with axis',
        'measurement_3': 'At 70°, minimal projection $d = 1.97$ approaching zero',
        
        // Final view
        'final_view': 'Compare how projection distance decreases: 45° → 60° → 70°'
    };
}
