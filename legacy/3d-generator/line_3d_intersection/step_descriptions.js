/**
 * Step descriptions for line 3D intersection visualization
 * Based on step-by-step.json mathematical flow
 */

export function getAllDescriptions() {
    return {
        // Title - Problem statement from step-by-step.json
        'title': 'Find line through intersection of two lines, perpendicular to both',
        
        // Step 1: First line L1
        'line1': 'Line $L_1\\colon \\vec{r} = (1,\\ 3,\\ -1) + t(2,\\ 3,\\ 2)$ in parametric form',
        
        // Step 2: Second line L2
        'line2': 'Line $L_2\\colon \\frac{x-2}{1} = \\frac{y-4}{2} = \\frac{z+3}{4}$ in symmetric form',
        
        // Step 3: Intersection point
        'intersection_point': 'Intersection point $I(3,\\ 6,\\ 1)$ where $s = 1$ and $t = 1$',
        
        // Step 4: Position vector to point A
        'position_vector_a': 'Position vector $\\vec{a} = (1,\\ 3,\\ -1)$ to point on $L_1$',
        
        // Step 5: Position vector to point C
        'position_vector_c': 'Position vector $\\vec{c} = (2,\\ 4,\\ -3)$ to point on $L_2$',
        
        // Step 6: Direction vector b
        'direction_vector_b': 'Direction vector $\\vec{b} = (2,\\ 3,\\ 2)$ parallel to $L_1$',
        
        // Step 7: Direction vector d
        'direction_vector_d': 'Direction vector $\\vec{d} = (1,\\ 2,\\ 4)$ parallel to $L_2$',
        
        // Step 8: Cross product computation
        'cross_product_computed': 'Cross product $\\vec{b} \\times \\vec{d} = (8,\\ -6,\\ 1)$ perpendicular to both',
        
        // Step 9: Focus on cross product
        'cross_product_focus': 'Cross product gives direction perpendicular to both lines',
        
        // Step 10: Perpendicular line
        'perpendicular_line': 'Required line $L\\colon \\vec{r} = (3,\\ 6,\\ 1) + m(8,\\ -6,\\ 1)$',
        
        // Step 11: Right angle with L1
        'right_angle_l1': 'Right angle confirms perpendicularity to $L_1$',
        
        // Step 12: Right angle with L2
        'right_angle_l2': 'Right angle confirms perpendicularity to $L_2$',
        
        // Step 13: Final construction
        'final_construction': 'Complete construction with perpendicular line through intersection'
    };
}