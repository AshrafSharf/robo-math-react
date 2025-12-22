// Step descriptions for Distance Between Skew Lines
export function getAllDescriptions() {
    return {
        // Problem statement from step-by-step.json
        'title': 'Finding the shortest distance between two skew lines in 3D space',
        
        // First skew line
        'line1': 'First skew line $L_1$ through point $A$ with direction $\\vec{b}$',
        
        // Second skew line
        'line2': 'Second skew line $L_2$ through point $C$ with direction $\\vec{d}$',
        
        // Point A on L1
        'point_a_on_l1': 'Point $A$ on line $L_1$ as reference point',
        
        // Point C on L2
        'point_c_on_l2': 'Point $C$ on line $L_2$ as reference point',
        
        // Direction vectors
        'direction_vectors': 'Direction vectors $\\vec{b}$ for $L_1$ and $\\vec{d}$ for $L_2$',
        
        // Vector from A to C
        'vector_ac': 'Vector from $A$ to $C$ calculated as $\\vec{c} - \\vec{a}$',
        
        // Cross product computed
        'cross_product_computed': 'Computing $\\vec{b} \\times \\vec{d}$ perpendicular to both',
        
        // Focus on vectors to be crossed
        'cross_product_focus': 'Focus on $\\vec{b}$, $\\vec{d}$ and their cross product',
        
        // Unit vector normalization
        'unit_vector': 'Unit vector $\\hat{n}$ along common perpendicular',
        
        // Critical projection calculation step
        'projection_calculation': 'Projecting $AC$ onto $\\vec{b} \\times \\vec{d}$ for distance',
        
        // Closest points on the lines
        'closest_points': 'Points $P$ and $Q$ are closest on $L_1$ and $L_2$',
        
        // Move vector to show direction
        'move_for_direction': 'Moving $\\vec{b} \\times \\vec{d}$ to show direction',
        
        // Shortest distance visualization
        'shortest_distance': 'Perpendicular segment $PQ$ with length $\\delta$',
        
        // Perpendicular verification
        'perpendicular_verification': 'Verifying $PQ$ perpendicular to both lines'
    };
}
