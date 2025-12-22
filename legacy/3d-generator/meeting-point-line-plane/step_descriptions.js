// Step descriptions for Meeting-point-line-plane
export function getAllDescriptions() {
    return {
        'title': 'Find intersection of line $\\vec{r} = (2\\hat{i} - \\hat{j} + 2\\hat{k}) + t(3\\hat{i} + 4\\hat{j} + 2\\hat{k})$ with plane $x - y + z - 5 = 0$',
        
        // Line and plane setup
        'line': 'Line $L\\colon \\vec{r} = \\vec{a} + t\\vec{b}$ in parametric form',
        'plane': 'Plane $x - y + z - 5 = 0$ with normal $\\vec{n} = \\hat{i} - \\hat{j} + \\hat{k}$',
        
        // Point and vectors
        'point_a_on_line': 'Point $A = (2,\\ -1,\\ 2)$ on the line',
        'position_vector_a': 'Position vector $\\vec{a} = 2\\hat{i} - \\hat{j} + 2\\hat{k}$',
        'direction_vector_b': 'Direction vector $\\vec{b} = 3\\hat{i} + 4\\hat{j} + 2\\hat{k}$',
        'normal_vector_n': 'Normal vector $\\vec{n} = \\hat{i} - \\hat{j} + \\hat{k}$ to the plane',
        
        // Calculation steps
        'check_parallel_condition': 'Check $\\vec{b} \\cdot \\vec{n} = 1 \\neq 0$: line not parallel to plane',
        'intersection_point': 'Intersection point $U = (2,\\ -1,\\ 2)$ using formula $\\vec{u} = \\vec{a} + \\frac{p - (\\vec{a} \\cdot \\vec{n})}{\\vec{b} \\cdot \\vec{n}} \\vec{b}$',
        'focus_intersection': 'Point $U$ where line meets plane at coordinates $(2,\\ -1,\\ 2)$'
    };
}
