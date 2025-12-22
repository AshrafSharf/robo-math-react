export function getAllDescriptions() {
    return {
        'title': 'Check coplanarity of lines and find plane equation',
        
        // Step 1: First line
        'line1': 'Line $L_1$ establishes first geometric element to test',
        
        // Step 2: Second line
        'line2': 'Line $L_2$ provides second element for coplanarity check',
        
        // Step 3: Point A on line L1
        'point_a_on_l1': 'Point $A$ on $L_1$ anchors first line position',
        
        // Step 4: Point C on line L2
        'point_c_on_l2': 'Point $C$ on $L_2$ anchors second line position',
        
        // Step 4: Position vectors
        'position_vectors': 'Position vectors $\\vec{a}$ and $\\vec{c}$ locate lines in space',
        
        // Step 5: Direction vectors
        'direction_vectors': 'Direction vectors $\\vec{b}$ and $\\vec{d}$ define line orientations',
        
        // Step 6: Cross product computation
        'cross_product_computed': 'Cross product $\\vec{b} \\times \\vec{d}$ yields potential plane normal',
        
        // Step 7: Focus on cross product
        'cross_product_focus': 'Normal vector perpendicular to both direction vectors',
        
        // Step 8: Vector from A to C
        'vector_ac': 'Vector $\\vec{AC}$ connects lines for coplanarity test',
        
        // Step 9: Scalar triple product focus
        'scalar_triple_product_focus': 'Triple product tests if $\\vec{AC}$ lies in plane of $\\vec{b}$ and $\\vec{d}$',
        
        // Step 10: Coplanarity confirmed
        'coplanarity_confirmed': 'Zero triple product confirms lines are coplanar',
        
        // Step 11: Plane containing both lines
        'plane_containing_lines': 'Plane $\\pi$ contains both lines $L_1$ and $L_2$',
        
        // Step 12: Normal to the plane
        'plane_normal': 'Normal $\\vec{n}$ defines plane $\\pi$ orientation'
    };
}
