export function getAllDescriptions() {
    return {
        // Title from step-by-step.json problem statement
        'title': 'Volume of parallelepiped using triple scalar product',
        
        // Step 1: First vector
        'vector_u': 'Vector $\\vec{u} = \\langle 2,\\ 1,\\ 3 \\rangle$ forms first edge',
        
        // Step 2: Second vector
        'vector_v': 'Vector $\\vec{v} = \\langle 2,\\ 0,\\ 0 \\rangle$ forms second edge',
        
        // Step 3: Third vector
        'vector_w': 'Vector $\\vec{w} = \\langle 0,\\ 2,\\ 0 \\rangle$ forms third edge',
        
        // Step 4: Base parallelogram
        'base_parallelogram': 'Parallelogram base formed by $\\vec{v}$ and $\\vec{w}$',
        
        // Step 5: Cross product (area of base)
        'cross_product': 'Cross product $\\vec{v} \\times \\vec{w}$ gives normal and base area',
        
        // Step 6: Angle between u and normal
        'angle_arc': 'Angle $\\theta$ between $\\vec{u}$ and $\\vec{v} \\times \\vec{w}$',
        
        // Step 7: Height projection
        'height_projection': 'Height $h$: projection of $\\vec{u}$ onto normal',
        
        // Step 8: Complete parallelepiped
        'parallelepiped': 'Parallelepiped formed by $\\vec{u}$, $\\vec{v}$, $\\vec{w}$',
        
        // Step 9: Volume formula
        'volume_formula': 'Volume: $V = |\\vec{u} \\cdot (\\vec{v} \\times \\vec{w})|$'
    };
}