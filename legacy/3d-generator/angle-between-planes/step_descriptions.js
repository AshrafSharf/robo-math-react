/**
 * Step descriptions for Angle Between Planes visualization
 * Following the mathematical flow from the problem
 */

/**
 * Get all step descriptions with dynamic angle value
 * @param {string} angleDegrees - The calculated angle in degrees
 * @returns {Object} Map of step descriptions
 */
export function getAllDescriptions(angleDegrees) {
    return {
        // Title
        'title': 'Finding the angle between two planes in 3D space',
        
        // Step 1: First plane
        'plane1': 'Plane 1: $x + y + z = 3$ (tilted plane)',
        
        // Step 2: Second plane
        'plane2': 'Plane 2: $z = 2$ (horizontal plane)',
        
        // Step 3: Normal vector 1
        'normal1': 'Normal vector $\\vec{n_1} = \\langle 1, 1, 1 \\rangle$ from plane 1 coefficients',
        
        // Step 4: Normal vector 2
        'normal2': 'Normal vector $\\vec{n_2} = \\langle 0, 0, 1 \\rangle$ from plane 2 coefficients',
        
        // Step 5: Angle between normals
        'angle_between_normals': `Angle between normals: $\\theta = \\cos^{-1}\\left(\\frac{|\\vec{n_1} \\cdot \\vec{n_2}|}{\\|\\vec{n_1}\\| \\cdot \\|\\vec{n_2}\\|}\\right) = ${angleDegrees}°$`,
        
        // Step 6: First line at intersection
        'intersection_line1': 'Line in plane 1 perpendicular to intersection line',
        
        // Step 7: Second line at intersection
        'intersection_line2': 'Line in plane 2 perpendicular to intersection line',
        
        // Step 8: Intersection angle
        'intersection_angle': `Dihedral angle at intersection: $\\theta = ${angleDegrees}°$`
    };
}