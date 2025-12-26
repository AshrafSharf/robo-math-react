import * as THREE from 'three';

/**
 * Material presets for common use cases in 3D lessons
 */

/**
 * Creates a glass-like material for transparent containers
 * @param {Object} options - Configuration options
 * @param {number} options.color - Base color (default: 0x0077cc)
 * @param {number} options.opacity - Opacity level (default: 0.3)
 * @param {number} options.transmission - Light transmission (default: 0.5)
 * @param {number} options.thickness - Glass thickness effect (default: 0.1)
 * @param {number} options.roughness - Surface roughness (default: 0.0)
 * @param {number} options.metalness - Metallic appearance (default: 0.0)
 * @param {number} options.clearcoat - Clear coat layer (default: 0.3)
 * @param {string} options.side - 'inside', 'outside', or 'both' (default: 'inside')
 * @returns {THREE.MeshPhysicalMaterial} Configured glass material
 */
export function glassMaterial(options = {}) {
    const {
        color = 0x0077cc,
        opacity = 0.3,
        transmission = 0.5,
        thickness = 0.1,
        roughness = 0.0,
        metalness = 0.0,
        clearcoat = 0.3,
        side = 'inside'
    } = options;
    
    let threeSide;
    switch(side) {
        case 'inside':
            threeSide = THREE.BackSide;
            break;
        case 'outside':
            threeSide = THREE.FrontSide;
            break;
        case 'both':
        default:
            threeSide = THREE.DoubleSide;
            break;
    }
    
    return new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: metalness,
        roughness: roughness,
        transparent: true,
        opacity: opacity,
        transmission: transmission,
        thickness: thickness,
        clearcoat: clearcoat,
        clearcoatRoughness: 0.0,
        side: threeSide,
        depthWrite: false  // Important for transparency
    });
}

/**
 * Creates a water-like material
 * @param {Object} options - Configuration options
 * @param {number} options.color - Water color (default: 0xffffff for clear water)
 * @param {number} options.opacity - Opacity level (default: 0.95)
 * @param {number} options.shininess - Surface shininess (default: 30)
 * @param {number} options.specular - Specular highlight color (default: 0xcccccc)
 * @param {boolean} options.transparent - Whether material is transparent (default: false)
 * @returns {THREE.MeshPhongMaterial} Configured water material
 */
export function waterMaterial(options = {}) {
    const {
        color = 0xffffff,
        opacity = 0.95,
        shininess = 30,
        specular = 0xcccccc,
        transparent = false
    } = options;
    
    return new THREE.MeshPhongMaterial({
        color: color,
        transparent: transparent,
        opacity: opacity,
        shininess: shininess,
        specular: specular,
        emissive: 0x111111,
        emissiveIntensity: 0.05,
        side: THREE.FrontSide,
        depthWrite: true,
        depthTest: true
    });
}

/**
 * Creates a translucent balloon/bubble material
 * @param {Object} options - Configuration options
 * @param {number} options.color - Base color (default: 0x90ee90)
 * @param {number} options.opacity - Opacity level (default: 0.35)
 * @param {number} options.shininess - Surface shininess (default: 60)
 * @param {number} options.specular - Specular highlight (default: 0x444444)
 * @returns {THREE.MeshPhongMaterial} Configured translucent material
 */
export function translucentMaterial(options = {}) {
    const {
        color = 0x90ee90,
        opacity = 0.35,
        shininess = 60,
        specular = 0x444444
    } = options;
    
    return new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        shininess: shininess,
        specular: specular,
        side: THREE.DoubleSide,
        depthWrite: false  // Allow seeing through
    });
}

/**
 * Creates a metallic material for mechanical parts
 * @param {Object} options - Configuration options
 * @param {number} options.color - Base color (default: 0x888888)
 * @param {number} options.roughness - Surface roughness (default: 0.2)
 * @param {number} options.metalness - Metallic level (default: 0.8)
 * @returns {THREE.MeshStandardMaterial} Configured metallic material
 */
export function metallicMaterial(options = {}) {
    const {
        color = 0x888888,
        roughness = 0.2,
        metalness = 0.8
    } = options;
    
    return new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness
    });
}

/**
 * Creates a simple solid material with no reflections
 * @param {Object} options - Configuration options
 * @param {number} options.color - Base color (default: 0xffffff)
 * @param {number} options.opacity - Opacity level (default: 1.0)
 * @param {string} options.side - 'front', 'back', or 'both' (default: 'both')
 * @returns {THREE.MeshBasicMaterial} Configured basic material
 */
export function solidMaterial(options = {}) {
    const {
        color = 0xffffff,
        opacity = 1.0,
        side = 'both'
    } = options;
    
    let threeSide;
    switch(side) {
        case 'front':
            threeSide = THREE.FrontSide;
            break;
        case 'back':
            threeSide = THREE.BackSide;
            break;
        case 'both':
        default:
            threeSide = THREE.DoubleSide;
            break;
    }
    
    return new THREE.MeshBasicMaterial({
        color: color,
        opacity: opacity,
        transparent: opacity < 1.0,
        side: threeSide
    });
}

/**
 * Creates a wireframe material for structural visualization
 * @param {Object} options - Configuration options
 * @param {number} options.color - Wire color (default: 0x000000)
 * @param {number} options.linewidth - Line width (default: 1)
 * @param {number} options.opacity - Opacity level (default: 1.0)
 * @returns {THREE.MeshBasicMaterial} Configured wireframe material
 */
export function wireframeMaterial(options = {}) {
    const {
        color = 0x000000,
        linewidth = 1,
        opacity = 1.0
    } = options;
    
    return new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        wireframeLinewidth: linewidth,
        opacity: opacity,
        transparent: opacity < 1.0
    });
}

/**
 * Applies a material to a mesh or all meshes in a group
 * @param {THREE.Mesh|THREE.Group|THREE.Object3D} object - The mesh, group, or 3D object to apply material to
 * @param {THREE.Material} material - The material to apply
 * @param {Object} options - Options for material application
 * @param {boolean} options.recursive - Apply to all nested groups (default: true)
 * @param {Function} options.filter - Optional filter function to select which meshes get the material
 * @returns {THREE.Mesh|THREE.Group|THREE.Object3D} The modified object (for chaining)
 * 
 * @example
 * // Simple usage with a mesh
 * const sphere = sphere(center, radius);
 * applyMaterial(sphere, glassMaterial());
 * 
 * @example
 * // Apply to a group with outline
 * const disk = disk(center, radius, orientation, { outline: true });
 * applyMaterial(disk, waterMaterial());
 * 
 * @example
 * // Selective application with filter
 * const group = complexGeometry();
 * applyMaterial(group, glassMaterial(), {
 *     filter: (mesh) => !mesh.name?.includes('outline')
 * });
 */
export function applyMaterial(object, material, options = {}) {
    const {
        recursive = true,
        filter = null
    } = options;
    
    if (!object || !material) {
        console.warn('applyMaterial: object and material are required');
        return object;
    }
    
    if (object.type === 'Mesh') {
        // Single mesh - apply directly if it passes filter
        if (!filter || filter(object)) {
            object.material = material;
        }
    } else if (object.type === 'Group' || object.isObject3D) {
        // Group or Object3D - traverse children
        if (recursive) {
            // Use traverse for recursive application
            object.traverse(child => {
                if (child.type === 'Mesh' && child !== object) {
                    if (!filter || filter(child)) {
                        child.material = material;
                    }
                }
            });
        } else {
            // Only apply to direct children
            object.children.forEach(child => {
                if (child.type === 'Mesh') {
                    if (!filter || filter(child)) {
                        child.material = material;
                    }
                }
            });
        }
    }
    
    return object; // For chaining
}

/**
 * Applies different materials to main geometry and outlines in a group
 * Useful for geometries created with outline options
 * @param {THREE.Group|THREE.Object3D} object - The group containing main geometry and outlines
 * @param {THREE.Material} mainMaterial - Material for the main geometry
 * @param {THREE.Material} outlineMaterial - Material for outline meshes
 * @param {Object} options - Options for identification
 * @param {string} options.outlineIdentifier - String to identify outline meshes (default: 'outline')
 * @returns {THREE.Group|THREE.Object3D} The modified object (for chaining)
 * 
 * @example
 * const disk = disk(center, radius, orientation, { outline: true });
 * applyMaterialWithOutline(
 *     disk,
 *     waterMaterial(),                    // Main disk
 *     solidMaterial({ color: 0x000000 })  // Black outline
 * );
 */
export function applyMaterialWithOutline(object, mainMaterial, outlineMaterial, options = {}) {
    const {
        outlineIdentifier = 'outline'
    } = options;
    
    // Apply main material to non-outline meshes
    applyMaterial(object, mainMaterial, {
        filter: (mesh) => {
            // Check both name and userData for outline identification
            const isOutline = mesh.name?.toLowerCase().includes(outlineIdentifier) ||
                             mesh.userData?.isOutline === true;
            return !isOutline;
        }
    });
    
    // Apply outline material to outline meshes
    if (outlineMaterial) {
        applyMaterial(object, outlineMaterial, {
            filter: (mesh) => {
                // Check both name and userData for outline identification
                const isOutline = mesh.name?.toLowerCase().includes(outlineIdentifier) ||
                                 mesh.userData?.isOutline === true;
                return isOutline;
            }
        });
    }
    
    return object;
}