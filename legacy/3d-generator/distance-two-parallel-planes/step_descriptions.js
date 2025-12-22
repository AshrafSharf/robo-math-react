// Step descriptions for Distance-two-parallel-planes
export function getAllDescriptions() {
    return {
        'title': 'Find distance between parallel planes $x + 2y - 2z + 1 = 0$ and $2x + 4y - 4z + 5 = 0$',
        
        // Step 1: First plane with normal
        'first_plane': 'First plane $\\pi_1$ coefficients $(1,\\ 2,\\ -2)$ define normal vector $\\vec{n}_1$',
        
        // Step 2: Second plane with normal
        'second_plane': 'Second plane $\\pi_2$ coefficients $(2,\\ 4,\\ -4)$ define normal vector $\\vec{n}_2$',
        
        // Step 3: Show normals are parallel
        'normals_parallel': 'Proportional normals $\\vec{n}_2 = 2\\vec{n}_1$ confirm planes are parallel',
        
        // Step 4: Normalized form
        'normalized_form': 'Matching coefficients by dividing $\\pi_2$ by 2 enables distance formula',
        
        // Step 5: Distance visualization
        'distance_visualization': 'Parallel plane distance formula uses perpendicular separation',
        
        // Step 6: Calculation components
        'calculation_components': 'Constant difference $|1 - \\frac{5}{2}|$ divided by normal magnitude $\\sqrt{9}$',
        
        // Step 7: Final result
        'final_distance': 'Perpendicular distance between planes: $\\delta = \\frac{1}{2}$ units'
    };
}
