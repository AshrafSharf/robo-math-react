// Step descriptions for Image-point-plane
export function getAllDescriptions() {
    return {
        'title': 'Find image of point $\\vec{u} = i + 2j + 3k$ in plane $\\vec{r} \\cdot (i + 2j + 4k) = 38$',
        
        // Step 1: Show the plane
        'plane': 'Plane $\\Pi$ defined by dot product equation $\\vec{r} \\cdot \\vec{n} = 38$',
        
        // Step 2: Show the original point
        'original_point': 'Original point $U$ at $(1,\\ 2,\\ 3)$ to be reflected',
        
        // Step 3: Position vector to original point
        'position_vector_u': 'Position vector $\\vec{u}$ locates point $U$ from origin',
        
        // Step 4: Normal vector to the plane
        'normal_vector': 'Normal $\\vec{n} = i + 2j + 4k$ determines reflection direction',
        
        // Step 5: Calculate dot product
        'dot_product_calculation': 'Dot products measure alignment and normal magnitude for formula',
        
        // Step 6: Displacement vector
        'displacement_vector': 'Displacement $2\\vec{n}$ moves point perpendicular distance twice',
        
        // Step 7: Image point (final answer)
        'image_point': 'Image point $V$ at $(3,\\ 6,\\ 11)$ completes the reflection calculation',
        
        // Step 8: Perpendicular line
        'perpendicular_line': 'Perpendicular path confirms reflection occurs along normal direction',
        
        // Step 9: Midpoint on plane
        'midpoint_on_plane': 'Midpoint $M$ on plane verifies equal distances from $U$ and $V$',
        
        // Step 10: Final reflection
        'reflection_relationship': 'Geometric verification: plane bisects segment $UV$ perpendicularly'
    };
}
