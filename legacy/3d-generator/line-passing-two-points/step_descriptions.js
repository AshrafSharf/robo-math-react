// Step descriptions for Line Through Point with Given Direction
export function getAllDescriptions() {
    return {
        'title': 'Find line through point with given direction',
        
        // Step 1: Point A that the line passes through
        'point_a': 'Point $A$ anchors where line must pass through',
        
        // Step 2: Position vector from origin to point A
        'position_vector_a': 'Position vector $\\vec{a}$ locates point $A$ in space',
        
        // Step 3: Direction vector from point A
        'direction_vector_b': 'Direction vector $\\vec{b}$ determines line orientation',
        
        // Step 4: Focus on direction vector
        'focus_direction_vector': 'Vectors $\\vec{a}$ and $\\vec{b}$ together define line $L$',
        
        // Step 5: The line L through A with direction b
        'line': 'Line $L$ constructed using parametric form $\\vec{r} = \\vec{a} + t\\vec{b}$',
        
        // Step 6: Sample point R on the line at t = 1
        'sample_point': 'Point $R$ at $t = 1$ demonstrates line generation',
        
        // Step 7: Position vector to sample point
        'position_vector_r': 'Position vector $\\vec{r}$ reaches any point on line',
        
        // Step 8: Trace animation showing vector addition
        'trace_vector_path': 'Vector addition shows how $\\vec{a} + t\\vec{b}$ traces line',
        
        // Step 9: Parametric equation visualization
        'parametric_equation': 'Parametric form gives coordinates for any $t$'
    };
}
