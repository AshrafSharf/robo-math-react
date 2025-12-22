export function getAllDescriptions() {
    return {
        'title': 'Parametric equation of plane through three points $A$, $B$, $C$',
        
        // Step 1: Point A
        'point_a': 'Point $A$ establishes first vertex of the plane',
        
        // Step 2: Point B
        'point_b': 'Point $B$ provides second vertex for direction',
        
        // Step 3: Point C
        'point_c': 'Point $C$ completes the non-collinear triple',
        
        // Step 4: Position vector to A
        'position_vector_a': 'Position vector $\\vec{a}$ locates point $A$ from origin',
        
        // Step 5: Position vector to B
        'position_vector_b': 'Position vector $\\vec{b}$ locates point $B$ from origin',
        
        // Step 6: Position vector to C
        'position_vector_c': 'Position vector $\\vec{c}$ locates point $C$ from origin',
        
        // Step 7: Direction vector AB
        'vector_ab': 'Vector from $A$ to $B$ calculated as $\\vec{b} - \\vec{a}$',
        
        // Step 8: Focus on vector subtraction for AB
        'vector_ab_focus': 'Vector subtraction $\\vec{b} - \\vec{a}$ gives direction in plane',
        
        // Step 9: Direction vector AC
        'vector_ac': 'Vector from $A$ to $C$ calculated as $\\vec{c} - \\vec{a}$',
        
        // Step 10: Focus on vector subtraction for AC
        'vector_ac_focus': 'Vector subtraction $\\vec{c} - \\vec{a}$ gives second direction',
        
        // Step 11: Plane spanned by AB and AC
        'plane_through_points': 'Plane spanned by $\\vec{AB}$ and $\\vec{AC}$ from point $A$',
        
        // Step 12: Arbitrary point P on plane
        'arbitrary_point_p': 'Point $P$ represents any location on the plane',
        
        // Step 13: Position vector to P
        'position_vector_r': 'Position vector $\\vec{r}$ locates point $P$ from origin',
        
        // Step 14: Vector AP
        'vector_ap': 'Vector from $A$ to $P$ calculated as $\\vec{r} - \\vec{a}$',
        
        // Step 15: Focus on vector subtraction for AP
        'vector_ap_focus': 'Vector $\\vec{AP} = \\vec{r} - \\vec{a}$ must lie in plane',
        
        // Step 16: Linear combination visualization
        'linear_combination': 'Linear combination: $\\vec{AP} = s(\\vec{b} - \\vec{a}) + t(\\vec{c} - \\vec{a})$',
        
        // Step 17: Focus on linear combination
        'linear_combination_focus': 'Parameters $s,t$ span all points in the plane',
        
        // Step 18: Trace vector path animation
        'trace_vector_path': 'Path construction: $\\vec{r} = \\vec{a} + s(\\vec{b} - \\vec{a}) + t(\\vec{c} - \\vec{a})$',
        
        // Step 19: Parametric equation components
        'parametric_equation_components': 'Parametric form: $\\vec{r} = \\vec{a} + s(\\vec{b} - \\vec{a}) + t(\\vec{c} - \\vec{a})$'
    };
}
