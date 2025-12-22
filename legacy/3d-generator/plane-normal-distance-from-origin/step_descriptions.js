// Step descriptions for Plane-normal-distance-from-origin
export function getAllDescriptions() {
    return {
        'title': 'Derive plane equations at distance $p$ from origin',
        
        // Step 1: Origin
        'origin': 'Origin $O$ at $(0,\\ 0,\\ 0)$',
        
        // Step 2: Unit normal vector
        'unit_normal': 'Unit normal $\\hat{d}$ with $\\|\\hat{d}\\| = 1$',
        
        // Step 3: Foot of perpendicular
        'foot_perpendicular': 'Point $A$: foot of perpendicular from $O$ to plane',
        
        // Step 4: Position vector OA
        'position_vector_oa': 'Vector $\\vec{OA} = p\\hat{d}$ of length $p$ along unit normal',
        
        // Step 5: Plane at distance p
        'plane': 'Plane perpendicular to $\\hat{d}$ at distance $p = 3$',
        
        // Step 6: Arbitrary point on plane
        'arbitrary_point': 'Point $P$: general point on the plane',
        
        // Step 7: Vector AP - from A to P
        'vector_ap': 'Vector $\\vec{AP}$ from point $A$ to point $P$ on the plane',
        
        // Step 8: Position vector to P for equation
        'position_vector_r': 'Position vector $\\vec{r} = \\vec{OP}$ to point $P$ for equation',
        
        // Step 9: Right angle
        'right_angle': 'Right angle: $\\vec{AP} \\perp \\vec{OA}$ for perpendicular vectors',
        
        // Step 10: Perpendicular focus
        'perpendicular_focus': 'Perpendicular condition gives $\\vec{r} \\cdot \\hat{d} = p$'
    };
}
