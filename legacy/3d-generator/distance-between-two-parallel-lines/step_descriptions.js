// Step descriptions for distance between two parallel lines
export function getAllDescriptions() {
    return {
        'title': 'Finding the shortest distance between two parallel lines in 3D',
        'line1': 'First line $L_1: \\vec{r} = \\vec{a} + t\\vec{b} = (1,2,3) + t(2,-1,2)$',
        'line2': 'Second line $L_2: \\vec{r} = \\vec{c} + s\\vec{b} = (4,0,1) + s(2,-1,2)$',
        'point_a_with_vector': 'Point $A$ on $L_1$ with position vector $\\vec{a} = (1,2,3)$',
        'point_c_with_vector': 'Point $C$ on $L_2$ with position vector $\\vec{c} = (4,0,1)$',
        'point_d': 'Point $D$ - perpendicular projection of $A$ onto $L_2$',
        'direction_vector': 'Common direction vector $\\vec{b} = (2,-1,2)$ showing both lines are parallel',
        'perpendicular_distance': 'Perpendicular distance $d$ from $A$ to $D$ (shortest distance between lines)',
        'vector_ac_difference': 'Vector $\\vec{a} - \\vec{c} = (-3, 2, 2)$ from $C$ to $A$',
        'triangle_angles': 'Right triangle $ACD$ where $\\sin\\theta = \\frac{|\\vec{AC} \\times \\vec{b}|}{|\\vec{AC}||\\vec{b}|}$',
        'focus_triangle': 'Distance formula: $\\delta = |\\vec{AC}|\\sin\\theta = \\frac{|\\vec{AC} \\times \\vec{b}|}{|\\vec{b}|}$',
        'restore_all': 'Result: shortest distance between parallel lines is $\\delta = \\sqrt{13}$ units'
    };
}