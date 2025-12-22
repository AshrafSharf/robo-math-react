export function getAllDescriptions() {
    return {
        // Problem statement from step-by-step.json
        'title': 'Compute $\\vec{u} \\times \\vec{v}$, verify magnitude formula, find areas, and unit normal',
        
        // Step 1: Show vector u
        'vector_u': 'Vector $\\vec{u} = \\langle 2,\\ 1,\\ 1 \\rangle$ from origin',
        
        // Step 2: Show vector v
        'vector_v': 'Vector $\\vec{v} = \\langle -4,\\ 3,\\ 1 \\rangle$ from origin',
        
        // Step 3: Parallelogram formed by u and v
        'parallelogram': 'Parallelogram spanned by $\\vec{u}$ and $\\vec{v}$',
        
        // Step 4: Cross product computation
        'cross_product_computed': 'Cross product $\\vec{u} \\times \\vec{v} = \\langle -2,\\ -6,\\ 10 \\rangle$',
        
        // Step 5: Focus on perpendicularity
        'cross_product_focus': 'Cross product perpendicular to both $\\vec{u}$ and $\\vec{v}$',
        
        // Step 6: Triangle area (half of parallelogram)
        'triangle_area': 'Triangle area: $\\frac{1}{2}\\|\\vec{u} \\times \\vec{v}\\| = \\sqrt{35}$',
        
        // Step 7: Unit normal vector
        'unit_normal': 'Unit normal $\\hat{n} = \\left\\langle \\frac{-1}{\\sqrt{35}},\\ \\frac{-3}{\\sqrt{35}},\\ \\frac{5}{\\sqrt{35}} \\right\\rangle$',
        
        // Step 8: Anti-commutativity
        'anti_commutativity': 'Anti-commutativity: $\\vec{v} \\times \\vec{u} = -\\vec{u} \\times \\vec{v}$',
        
        // Step 9: Focus on opposite directions
        'opposite_directions_focus': 'Opposite directions show anti-commutative property',
        
        // Step 10: Right-hand rule
        'right_hand_rule': 'Right-hand rule determines cross product direction'
    };
}
