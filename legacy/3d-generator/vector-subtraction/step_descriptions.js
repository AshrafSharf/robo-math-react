// Step descriptions for vector subtraction lesson
// These provide brief mathematical context for each visual step

export const stepDescriptions = {
    // Problem statement from step-by-step.json
    'title': 'Vector Subtraction: Understanding $\\vec{u} - \\vec{v}$ geometrically and algebraically',
    
    // Step 1: Draw first vector u
    'vector_u': 'Vector $\\vec{u} = \\langle 4,\\ 2,\\ 3 \\rangle$ from origin to $(4,\\ 2,\\ 3)$',
    
    // Step 2: Draw second vector v
    'vector_v': 'Vector $\\vec{v} = \\langle 2,\\ 4,\\ 1 \\rangle$ from origin to $(2,\\ 4,\\ 1)$',
    
    // Step 3: Show -v (reverse of v)
    'negative_v': 'To subtract, we add the negative: $-\\vec{v} = \\langle -2,\\ -4,\\ -1 \\rangle$ points opposite to $\\vec{v}$',
    
    // Step 4: Translate -v to tip of u
    'translate_neg_v': 'Apply tip-to-tail rule: Move $-\\vec{v}$ to start at tip of $\\vec{u}$ for $\\vec{u} + (-\\vec{v})$',
    
    // Step 5: Show result vector from origin
    'result_vector': 'The diagonal from origin to tip of translated $-\\vec{v}$ gives $\\vec{u} - \\vec{v} = \\langle 2,\\ -2,\\ 2 \\rangle$',
    
    // Step 6: Show direct difference from v to u
    'difference_direct': 'Geometric meaning: $\\vec{u} - \\vec{v}$ is the displacement from $\\vec{v}$ to $\\vec{u}$',
    
    // Step 7: Focus on key elements
    'focus_key': 'Key insight: $\\vec{u} - \\vec{v}$ answers "What must I add to $\\vec{v}$ to get $\\vec{u}$?"',
    
    // Step 8: Restore view
    'restore_all': 'Summary: $\\vec{u} - \\vec{v} = \\vec{u} + (-\\vec{v}) = \\langle 2,\\ -2,\\ 2 \\rangle$'
};

// Export function to get all descriptions
export function getAllDescriptions() {
    return { ...stepDescriptions };
}