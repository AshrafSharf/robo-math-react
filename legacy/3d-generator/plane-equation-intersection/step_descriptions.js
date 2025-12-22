export function getAllDescriptions() {
    return {
        'title': 'Find plane through intersection of two planes and point $A(-1, 2, 1)$',
        
        // First two planes establish the intersection
        'first_plane': 'Plane $P_1: \\vec{r} \\cdot (i + j + k) = -1$ defines first constraint',
        
        'second_plane': 'Plane $P_2: \\vec{r} \\cdot (2i - 3j + 5k) = 2$ defines second constraint',
        
        // Normal vectors determine plane orientations
        'normal_vectors': 'Normals $\\vec{n}_1$ and $\\vec{n}_2$ determine plane orientations',
        
        // Line of intersection is key geometric feature
        'intersection_line': 'Line $L$ where $P_1$ and $P_2$ intersect forms constraint for solution',
        
        // Given point provides additional constraint
        'given_point': 'Point $A(-1, 2, 1)$ must lie on the required plane',
        
        // Third plane is the solution
        'third_plane': 'Plane $P$ through line $L$ and point $A$ using formula with $\\lambda = \\frac{3}{5}$',
        
        // Combined normal shows the linear combination
        'combined_normal': 'Normal $\\vec{n}_1 + \\lambda\\vec{n}_2$ defines final plane orientation',
        
        // Focus on complete solution
        'solution_focus': 'Solution plane $P: 11x - 4y + 20z - 1 = 0$ contains line $L$ and point $A$'
    };
}
