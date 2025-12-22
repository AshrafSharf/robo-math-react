/**
 * step_descriptions.js
 * Educational step descriptions for the direction cosines visualization
 * Following the mathematical flow from step-by-step.json
 */

export const stepDescriptions = {
    // Title - concise but descriptive
    'title': 'Direction cosines of $\\mathbf{v} = \\langle 3, 4, 2 \\rangle$',
    
    // Step 1: Show the main vector
    'mainVector': 'Vector $\\mathbf{v} = \\langle 3, 4, 2 \\rangle$',
    'vectorLabel': 'Computing magnitude $\\|\\mathbf{v}\\| = MAGNITUDE$',
    
    // Step 2: Show unit vectors i, j, k
    'unitVectorI': 'Standard basis vector $\\mathbf{i} = \\langle 1, 0, 0 \\rangle$',
    'unitVectorJ': 'Standard basis vector $\\mathbf{j} = \\langle 0, 1, 0 \\rangle$', 
    'unitVectorK': 'Standard basis vector $\\mathbf{k} = \\langle 0, 0, 1 \\rangle$',
    'iLabel': 'x-axis unit vector $\\mathbf{i}$',
    'jLabel': 'y-axis unit vector $\\mathbf{j}$',
    'kLabel': 'z-axis unit vector $\\mathbf{k}$',
    
    // Step 3: Show angle α between v and i
    'angleArcAlpha': 'Computing $\\cos \\alpha = \\frac{v_x}{\\|\\mathbf{v}\\|} = COS_ALPHA$',
    'alphaLabel': 'Angle with x-axis: $\\alpha = ALPHA_DEG°$',
    
    // Step 4: Show angle β between v and j
    'angleArcBeta': 'Computing $\\cos \\beta = \\frac{v_y}{\\|\\mathbf{v}\\|} = COS_BETA$',
    'betaLabel': 'Angle with y-axis: $\\beta = BETA_DEG°$', 
    
    // Step 5: Show angle γ between v and k
    'angleArcGamma': 'Computing $\\cos \\gamma = \\frac{v_z}{\\|\\mathbf{v}\\|} = COS_GAMMA$',
    'gammaLabel': 'Angle with z-axis: $\\gamma = GAMMA_DEG°$'
};

/**
 * Get all descriptions with dynamic calculated values
 * @param {Object} values - Object containing calculated values
 * @param {number} values.magnitude - Vector magnitude
 * @param {number} values.alphaDeg - Alpha angle in degrees 
 * @param {number} values.betaDeg - Beta angle in degrees
 * @param {number} values.gammaDeg - Gamma angle in degrees
 * @param {number} values.cosAlpha - Direction cosine for alpha
 * @param {number} values.cosBeta - Direction cosine for beta
 * @param {number} values.cosGamma - Direction cosine for gamma
 * @param {number} values.verification - Sum of squares verification
 * @returns {Object} All descriptions with calculated values inserted
 */
export function getAllDescriptions(values) {
    const descriptions = {};
    
    for (const key in stepDescriptions) {
        let description = stepDescriptions[key];
        
        // Replace all placeholder values
        description = description
            .replace(/MAGNITUDE/g, values.magnitude)
            .replace(/ALPHA_DEG/g, values.alphaDeg)
            .replace(/BETA_DEG/g, values.betaDeg)
            .replace(/GAMMA_DEG/g, values.gammaDeg)
            .replace(/COS_ALPHA/g, values.cosAlpha)
            .replace(/COS_BETA/g, values.cosBeta)
            .replace(/COS_GAMMA/g, values.cosGamma)
            .replace(/VERIFICATION/g, values.verification);
            
        descriptions[key] = description;
    }
    
    return descriptions;
}

/**
 * Get single description with dynamic values
 * @param {string} key - The key for the description
 * @param {Object} values - Object containing calculated values
 * @returns {string} The description with values inserted
 */
export function getDescription(key, values) {
    if (!stepDescriptions[key]) return '';
    
    let description = stepDescriptions[key];
    
    // Replace all placeholder values
    description = description
        .replace(/MAGNITUDE/g, values.magnitude)
        .replace(/ALPHA_DEG/g, values.alphaDeg)
        .replace(/BETA_DEG/g, values.betaDeg)
        .replace(/GAMMA_DEG/g, values.gammaDeg)
        .replace(/COS_ALPHA/g, values.cosAlpha)
        .replace(/COS_BETA/g, values.cosBeta)
        .replace(/COS_GAMMA/g, values.cosGamma)
        .replace(/VERIFICATION/g, values.verification);
        
    return description;
}