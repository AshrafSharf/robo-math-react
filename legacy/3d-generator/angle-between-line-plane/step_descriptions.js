export function getAllDescriptions() {
    return {
        'title': 'Find angle between line and plane',
        
        // Step 1: Plane visualization
        'plane': 'Plane establishes reference surface for angle measurement',
        
        // Step 2: Line visualization
        'line': 'Line $L$ whose angle with plane we need to find',
        
        // Step 3: Point on line
        'point_on_line': 'Point $P$ anchors line $L$ in space',
        
        // Step 4: Position vector
        'position_vector': 'Position $\\vec{r}_0$ locates where line $L$ passes through',
        
        // Step 5: Direction vector
        'direction_vector': 'Direction $\\vec{b}$ determines line $L$\'s orientation',
        
        // Step 6: Normal vector
        'normal_vector': 'Normal $\\vec{n}$ defines plane orientation for angle calculation',
        
        // Step 7: Vectors from common point
        'vectors_from_origin': 'Vectors $\\vec{b}$ and $\\vec{n}$ repositioned to measure angle',
        
        // Step 8: Angle phi
        'angle_phi': 'Angle $\\phi$ between $\\vec{b}$ and $\\vec{n}$ calculated first',
        
        // Step 9: Complementary angle theta
        'angle_theta': 'Line-plane angle $\\theta$ is complement of $\\phi$ since $\\vec{n}$ is perpendicular to plane',
        
        // Step 10: Focus on angle relationship
        'angle_relationship_focus': 'Perpendicularity creates complement: $\\theta + \\phi = 90°$',
        
        // Step 11: Final result
        'final_result': 'Angle $\\theta$ calculated using $\\sin^{-1}$ formula'
    };
}
