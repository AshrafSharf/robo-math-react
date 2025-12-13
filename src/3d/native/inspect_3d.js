/**
 * inspect_3d.js
 * Functions to extract and inspect elements from 3D objects
 */

/**
 * Gets a specific disk from a disk stack
 * @param {THREE.Group} diskStackGroup - The disk stack group from diskStack()
 * @param {Number} index - Index of disk to get (0-based)
 * @returns {THREE.Mesh|null} The disk mesh or null if not found
 */
export function getDiskFromStack(diskStackGroup, index) {
    if (!diskStackGroup || !diskStackGroup.userData.diskMeshes) {
        console.warn('Invalid disk stack group');
        return null;
    }
    
    const diskMeshes = diskStackGroup.userData.diskMeshes;
    
    if (index < 0 || index >= diskMeshes.length) {
        console.warn(`Disk index ${index} out of range (0-${diskMeshes.length - 1})`);
        return null;
    }
    
    return diskMeshes[index];
}

/**
 * Gets disk metadata from stack
 * @param {THREE.Group} diskStackGroup - The disk stack group
 * @param {Number} index - Index of disk
 * @returns {Object|null} Metadata object with position, thickness, etc.
 */
export function getDiskMetadata(diskStackGroup, index) {
    const disk = getDiskFromStack(diskStackGroup, index);
    if (!disk) return null;
    
    return {
        index: disk.userData.diskIndex,
        position: disk.userData.diskPosition,
        thickness: disk.userData.diskThickness,
        mesh: disk
    };
}