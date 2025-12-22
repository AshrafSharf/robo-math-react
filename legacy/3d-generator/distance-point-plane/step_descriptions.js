// Step descriptions for Distance From Point to Plane
export function getAllDescriptions() {
    return {
        'title': 'Find distance of point $(2,\\ 5,\\ -3)$ from plane $\\vec{r} \\cdot (6\\hat{i} - 3\\hat{j} + 2\\hat{k}) = 5$',
        
        // Show the plane
        'plane': 'Plane $\\vec{r} \\cdot \\vec{n} = 5$ defines reference surface',
        
        // Show the point
        'point_u': 'Point $U(2,\\ 5,\\ -3)$ whose distance we need',
        
        // Position vector from origin
        'position_vector_u': 'Position vector $\\vec{u} = 2\\hat{i} + 5\\hat{j} - 3\\hat{k}$',
        
        // Normal vector of the plane
        'normal_vector': 'Normal $\\vec{n} = 6\\hat{i} - 3\\hat{j} + 2\\hat{k}$ perpendicular to plane',
        
        // Dot product calculation
        'dot_product_calculation': 'Dot product $\\vec{u} \\cdot \\vec{n} = -9$ measures projection',
        
        // Perpendicular distance
        'perpendicular_distance': 'Distance formula: $\\delta = \\frac{|\\vec{u} \\cdot \\vec{n} - p|}{|\\vec{n}|}$',
        
        // Final result
        'final_result': 'Perpendicular distance: $\\delta = 2$ units'
    };
}
