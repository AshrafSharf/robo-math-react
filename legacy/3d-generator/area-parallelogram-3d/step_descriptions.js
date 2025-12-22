export function getAllDescriptions() {
    return {
        'title': 'Quadrilateral parallelogram verification and area calculation',
        
        // Step 1: Show the four vertices
        'point_a': 'Point $A = (5,\\ 2,\\ 0)$ establishes first vertex',
        'point_b': 'Point $B = (2,\\ 6,\\ 1)$ creates adjacent vertex for side $AB$',
        'point_c': 'Point $C = (2,\\ 4,\\ 7)$ forms opposite corner to $A$',
        'point_d': 'Point $D = (5,\\ 0,\\ 6)$ completes quadrilateral vertices',
        
        // Step 2: Draw quadrilateral edges
        'quadrilateral_edges': 'Quadrilateral $ABCD$ connects all four vertices',
        
        // Step 3-6: Compute vectors for sides
        'vector_ab': 'Vector $\\vec{AB} = \\langle -3,\\ 4,\\ 1 \\rangle$ from $A$ to $B$',
        'vector_ad': 'Vector $\\vec{AD} = \\langle 0,\\ -2,\\ 6 \\rangle$ from $A$ to $D$',
        'vector_cd': 'Vector $\\vec{CD} = \\langle 3,\\ -4,\\ -1 \\rangle$ from $C$ to $D$',
        'vector_cb': 'Vector $\\vec{CB} = \\langle 0,\\ 2,\\ -6 \\rangle$ from $C$ to $B$',
        
        // Step 7: Show parallelism
        'focus_opposite_sides_1': 'Vectors $\\vec{CD} = -\\vec{AB}$ confirm parallel opposite sides',
        'focus_opposite_sides_2': 'Vectors $\\vec{CB} = -\\vec{AD}$ verify parallelogram property',
        
        // Step 8: Visualize parallelogram
        'parallelogram_visual': 'Parallelogram with adjacent sides $\\vec{AB}$ and $\\vec{AD}$',
        
        // Step 9-10: Cross product for area
        'cross_product_computed': 'Cross product $\\vec{AB} \\times \\vec{AD}$ yields area vector',
        'cross_product_focus': 'Area vector perpendicular to parallelogram plane',
        
        // Step 11: Calculate area
        'area_value': 'Area equals magnitude $\\|\\vec{AB} \\times \\vec{AD}\\| = 32.19$',
        
        // Step 12: Check if rectangle
        'dot_product_check': 'Dot product $\\vec{AB} \\cdot \\vec{AD} = -2$ checks for rectangle'
    };
}
