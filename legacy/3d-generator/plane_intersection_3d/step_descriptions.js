export function getAllDescriptions() {
    return {
        // Problem statement
        'title': 'Find the intersection of two planes in 3D space',
        
        // === Plane definitions ===
        'plane1': 'Plane $P_1\\colon x + y + z = 3$',
        'normal1': 'Normal vector $\\vec{n}_1 = \\langle 1, 1, 1 \\rangle$ to $P_1$',
        'plane2': 'Plane $P_2\\colon 2x - y + z = 1$',
        'normal2': 'Normal vector $\\vec{n}_2 = \\langle 2, -1, 1 \\rangle$ to $P_2$',
        
        // === Intersection calculation ===
        'cross_product': 'Cross product $\\vec{n}_1 \\times \\vec{n}_2$ gives line direction',
        'cross_product_focus': 'Direction perpendicular to both normal vectors',
        'intersection_line': 'Intersection line $L$ where planes meet',
        'direction_vector': 'Direction $\\vec{d} = \\vec{n}_1 \\times \\vec{n}_2$ of line $L$',
        'perpendicular_verification': 'Line direction perpendicular to both normals',
        
        // === Parallel/identical cases ===
        'parallel_normals': 'Normal vectors are parallel',
        'parallel_planes': 'Planes are parallel with no intersection',
        'identical_planes': 'Planes are identical with infinite intersection'
    };
}