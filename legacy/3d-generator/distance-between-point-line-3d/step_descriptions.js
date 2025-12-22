/**
 * Step descriptions for Distance Between Point and Line in 3D visualization
 * Following the mathematical flow from step-by-step.json
 */

/**
 * Get all step descriptions with dynamic values
 * @returns {Object} Map of step descriptions
 */
export function getAllDescriptions() {
    return {
        // Title
        'title': 'Finding the distance between point Q(3, -1, 4) and a line in 3D',
        
        // Step 1: Show the line
        'line': 'Line $\\ell$ given by parametric equations: $x = -2 + 3t$,\\ $y = -2t$,\\ $z = 1 + 4t$',
        
        // Step 2: Point on the line
        'point_on_line': 'Point $P(-2, 0, 1)$ on the line when $t = 0$',
        
        // Step 3: External point
        'external_point': 'External point $Q(3, -1, 4)$ not on the line',
        
        // Step 4: Vector from P to Q
        'vector_pq': 'Vector $\\vec{PQ} = \\langle 5, -1, 3 \\rangle$ from point on line to external point',
        
        // Step 5: Parametric vector from coefficients of t
        'direction_vector': 'Parametric vector $\\vec{u} = \\langle 3, -2, 4 \\rangle$ from coefficients of $t$',
        
        // Step 6: Parallelogram formed by vectors PQ and u
        'parallelogram_area': 'Parallelogram formed by $\\vec{PQ}$ and $\\vec{u}$. Area = $\\|\\vec{PQ} \\times \\vec{u}\\| = \\sqrt{174} \\approx 13.2$',
        
        // Step 7: Perpendicular distance (height of parallelogram)
        'perpendicular_distance': 'Distance = $\\frac{\\text{Area}}{\\text{Base}} = \\frac{\\sqrt{174}}{\\sqrt{29}} = \\sqrt{6} \\approx 2.45$'
    };
}