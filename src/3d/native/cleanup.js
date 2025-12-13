/**
 * cleanup.js
 * Generic utility for cleaning up Three.js objects from a scene
 */

/**
 * Disposes of a Three.js object's geometry and materials
 * @param {THREE.Object3D} obj - The object to dispose
 */
function disposeObject(obj) {
    if (obj.geometry) {
        obj.geometry.dispose();
    }
    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
        } else {
            obj.material.dispose();
        }
    }
}

/**
 * Cleans up all objects from an objectsMap and removes temporary objects from scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {Object} objectsMap - Map of objects with structure { name: { mesh, ... } }
 */
export function cleanupObjects(scene, objectsMap) {
    // Remove all objects from objectsMap
    Object.values(objectsMap).forEach(objData => {
        const obj = objData.mesh;
        if (obj && obj.parent) {
            scene.remove(obj);
            disposeObject(obj);
        }
    });
    
    // Also remove any temporary objects that were added directly to the scene
    const objectsToRemove = [];
    scene.children.forEach(child => {
        if (child.userData && child.userData.isTemporary) {
            objectsToRemove.push(child);
        }
    });
    
    objectsToRemove.forEach(obj => {
        scene.remove(obj);
        disposeObject(obj);
    });
}

/**
 * Removes and disposes a single object from the scene
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Object3D} obj - The object to remove
 */
export function removeSingleObject(scene, obj) {
    if (obj && obj.parent) {
        scene.remove(obj);
        disposeObject(obj);
    }
}