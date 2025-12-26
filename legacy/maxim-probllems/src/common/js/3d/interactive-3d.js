// Interactive coordinate system functionality for 3D Three.js lessons
import * as THREE from 'three';
import { COLORS } from './core-3d.js';
// Avoid circular dependency - createAxesView is imported dynamically when needed
import { createLabel } from './labels-3d.js';
import { formatNumber } from '../helpers.js';

// Global storage for coordinate projection system
export const projectionSystem = {
    scene: null,
    camera: null,
    renderer: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    currentProjections: null,
    currentAngleGetter: null,  // Store the current angle getter function
    currentCoordinateGetter: null,  // Store the current coordinate getter function
    interactiveObjects: [],
    isEnabled: false
};

// init3DCoordinateSystem has been moved to core-3d.js to avoid circular dependencies

/**
 * Initializes the coordinate projection system for interactive 3D objects
 * @param {THREE.Scene} scene - Three.js scene
 * @param {THREE.Camera} camera - Three.js camera
 * @param {THREE.Renderer} renderer - Three.js renderer
 * @param {HTMLElement} domElement - DOM element for event listeners (usually renderer.domElement)
 * @param {Object} controls - Optional camera controls (OrbitControls, etc.)
 * @param {Object} cameraOptions - Optional camera positioning options
 */
export function initCoordinateProjection(scene, camera, renderer, domElement, controls = null, cameraOptions = {}) {
    projectionSystem.scene = scene;
    projectionSystem.camera = camera;
    projectionSystem.renderer = renderer;
    projectionSystem.isEnabled = true;
    
    // Set up initial camera position and target (only if not already set)
    const {
        position = { x: 6, y: 4, z: -8 },
        target = { x: 0, y: 0, z: 0 }
    } = cameraOptions;
    
    // Only adjust camera if it hasn't been positioned yet
    if (camera.position.length() < 0.1) {
        camera.position.set(position.x, position.y, position.z);
        camera.lookAt(target.x, target.y, target.z);
        
        // Update controls after camera position change
        if (controls) {
            controls.target.set(target.x, target.y, target.z);
            controls.update();
        }
    }
    
    // Add event listeners for mouse and touch
    domElement.addEventListener('click', onProjectionClick, false);
    domElement.addEventListener('touchend', onProjectionTouch, false);
    
    console.log('Coordinate projection system initialized');
}

/**
 * Adds an object to the interactive projection system
 * @param {THREE.Object3D} object - Object to make interactive
 * @param {Function} getCoordinates - Function that returns {x, y, z} coordinates for this object
 * @param {String} label - Label for coordinate display
 */
export function addInteractiveObject(object, getCoordinates, label, options = {}) {
    if (!projectionSystem.isEnabled) {
        console.warn('Coordinate projection system not initialized');
        return;
    }
    
    projectionSystem.interactiveObjects.push({
        object: object,
        getCoordinates: getCoordinates,
        label: label,
        options: options
    });
}

/**
 * Removes all interactive objects (usually called when updating visualization)
 */
export function clearInteractiveObjects() {
    projectionSystem.interactiveObjects = [];
}

/**
 * Updates the currently displayed angle information
 */
export function updateAngleInformation() {
    if (projectionSystem.currentProjections && 
        projectionSystem.currentProjections.name === 'angleInformation' &&
        projectionSystem.currentAngleGetter) {
        
        // Get updated angle data
        const updatedData = projectionSystem.currentAngleGetter();
        
        // Find the existing label in the group
        const angleGroup = projectionSystem.currentProjections;
        if (angleGroup.children.length > 0) {
            const existingLabel = angleGroup.children[0];
            
            // Create new label with updated text
            const labelText = `${updatedData}°`;
            const newLabel = createLabel(labelText, existingLabel.position.clone(), {
                color: COLORS.BLACK,
                fontSize: 12,
                backgroundColor: 'transparent',
                padding: 2
            });
            
            // Replace the old label
            angleGroup.remove(existingLabel);
            angleGroup.add(newLabel);
        }
    }
    
    // Also update coordinate projections if they're displayed
    updateCoordinateProjections();
}

/**
 * Updates the currently displayed coordinate projections and labels
 */
export function updateCoordinateProjections() {
    if (projectionSystem.currentProjections && 
        projectionSystem.currentProjections.name === 'coordinateProjections' &&
        projectionSystem.currentCoordinateGetter) {
        
        // Get updated coordinate data (triggers recreation of projections)
        
        // Remove existing projections
        projectionSystem.scene.remove(projectionSystem.currentProjections);
        
        // Recreate projections with updated coordinates (preserve original options)
        const options = projectionSystem.currentOptions || {};
        showCoordinateProjections(projectionSystem.currentCoordinateGetter, 'Updated Point', options);
    }
}

/**
 * Disables the coordinate projection system and cleans up
 */
export function disableCoordinateProjection() {
    projectionSystem.isEnabled = false;
    hideCoordinateProjections();
    clearInteractiveObjects();
    
    // Remove event listeners if renderer exists
    if (projectionSystem.renderer && projectionSystem.renderer.domElement) {
        projectionSystem.renderer.domElement.removeEventListener('click', onProjectionClick);
        projectionSystem.renderer.domElement.removeEventListener('touchend', onProjectionTouch);
    }
}

/**
 * Handles mouse click events for coordinate projection
 */
function onProjectionClick(event) {
    handleProjectionEvent(event, 'mouse');
}

/**
 * Handles touch events for coordinate projection
 */
function onProjectionTouch(event) {
    event.preventDefault();
    if (event.changedTouches.length > 0) {
        handleProjectionEvent(event.changedTouches[0], 'touch');
    }
}

/**
 * Main handler for projection events (mouse or touch)
 */
function handleProjectionEvent(event, eventType) {
    if (!projectionSystem.isEnabled || !projectionSystem.scene) return;
    
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = projectionSystem.renderer.domElement.getBoundingClientRect();
    projectionSystem.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    projectionSystem.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update the raycaster
    projectionSystem.raycaster.setFromCamera(projectionSystem.mouse, projectionSystem.camera);
    
    // Check for intersections with interactive objects
    const allObjects = projectionSystem.interactiveObjects.map(item => item.object);
    const intersects = projectionSystem.raycaster.intersectObjects(allObjects, true);
    
    if (intersects.length > 0) {
        // Find which interactive object was clicked
        const clickedObject = intersects[0].object;
        let parentInteractiveObj = null;
        
        // Find the parent interactive object
        for (const item of projectionSystem.interactiveObjects) {
            if (item.object === clickedObject || item.object.children.includes(clickedObject)) {
                parentInteractiveObj = item;
                break;
            }
            // Check nested children
            if (isChildOf(clickedObject, item.object)) {
                parentInteractiveObj = item;
                break;
            }
        }
        
        if (parentInteractiveObj) {
            const data = parentInteractiveObj.getCoordinates();
            
            // Check if this is angle data or coordinate data
            if (data && typeof data === 'string') {
                // This is angle data (string) - pass the getter function, not static data
                showAngleInformation(parentInteractiveObj.getCoordinates);
            } else if (data && typeof data.x !== 'undefined') {
                // This is coordinate data - also pass the getter for dynamic updates
                showCoordinateProjections(parentInteractiveObj.getCoordinates, parentInteractiveObj.label, parentInteractiveObj.options);
            }
        }
    } else {
        // Clicked on empty space, hide projections
        hideCoordinateProjections();
    }
}

/**
 * Helper function to check if an object is a child of another object
 */
function isChildOf(child, parent) {
    let current = child.parent;
    while (current) {
        if (current === parent) return true;
        current = current.parent;
    }
    return false;
}

/**
 * Shows coordinate projections for a given point
 * @param {Object} coordsOrGetter - {x, y, z} coordinates in Three.js coordinate system or function returning this data
 * @param {String} label - Label for the point
 */
function showCoordinateProjections(coordsOrGetter, label, options = {}) {
    // Remove existing projections
    hideCoordinateProjections();
    
    // Store options for updates
    projectionSystem.currentOptions = options;
    
    // Handle both static coordinates and getter functions
    let coords;
    if (typeof coordsOrGetter === 'function') {
        coords = coordsOrGetter();
        projectionSystem.currentCoordinateGetter = coordsOrGetter; // Store getter for updates
    } else {
        coords = coordsOrGetter;
        projectionSystem.currentCoordinateGetter = () => coords; // Wrap static coords in getter
    }
    
    // Coordinates are already in Three.js coordinate system
    const threePos = new THREE.Vector3(coords.x, coords.y, coords.z);
    
    // For display purposes, we need the mathematical coordinates
    // In our system: Math X = Three.js -Z, Math Y = Three.js -X, Math Z = Three.js Y
    const x = -coords.z;
    const y = -coords.x; 
    const z = coords.y;
    
    // Create projection group
    const projectionGroup = new THREE.Group();
    projectionGroup.name = 'coordinateProjections';
    
    // Create thick dashed projection lines using tube geometry for reliable thickness
    const lineThickness = 0.02; // Really thick lines
    const dashLength = 0.15;
    const gapLength = 0.075;
    
    // Helper function to create thick dashed line
    const createThickDashedLine = (start, end, color = COLORS.BLACK) => {
        const lineGroup = new THREE.Group();
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const normalizedDirection = direction.normalize();
        
        // Calculate number of dashes
        const dashPlusGap = dashLength + gapLength;
        const numDashes = Math.floor(length / dashPlusGap);
        const remainder = length % dashPlusGap;
        
        // Create individual dash segments
        for (let i = 0; i < numDashes; i++) {
            const dashStart = start.clone().add(normalizedDirection.clone().multiplyScalar(i * dashPlusGap));
            const dashEnd = dashStart.clone().add(normalizedDirection.clone().multiplyScalar(dashLength));
            
            // Create tube for this dash
            const dashPoints = [dashStart, dashEnd];
            const curve = new THREE.CatmullRomCurve3(dashPoints);
            const tubeGeometry = new THREE.TubeGeometry(curve, 2, lineThickness, 6, false);
            const tubeMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 50,
                transparent: false
            });
            const dashTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            lineGroup.add(dashTube);
        }
        
        // Add final dash if there's remainder space
        if (remainder > dashLength) {
            const finalDashStart = start.clone().add(normalizedDirection.clone().multiplyScalar(numDashes * dashPlusGap));
            const finalDashEnd = finalDashStart.clone().add(normalizedDirection.clone().multiplyScalar(dashLength));
            
            const dashPoints = [finalDashStart, finalDashEnd];
            const curve = new THREE.CatmullRomCurve3(dashPoints);
            const tubeGeometry = new THREE.TubeGeometry(curve, 2, lineThickness, 6, false);
            const tubeMaterial = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 50,
                transparent: false
            });
            const dashTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
            lineGroup.add(dashTube);
        }
        
        return lineGroup;
    };
    
    // Project to X axis (User X axis is Three.js -Z axis)
    const xProjectionLine = createThickDashedLine(
        threePos,
        new THREE.Vector3(0, 0, threePos.z),
        COLORS.X_AXIS
    );
    projectionGroup.add(xProjectionLine);
    
    // Project to Y axis (User Y axis is Three.js -X axis)
    const yProjectionLine = createThickDashedLine(
        threePos,
        new THREE.Vector3(threePos.x, 0, 0),
        COLORS.Y_AXIS
    );
    projectionGroup.add(yProjectionLine);
    
    // Project to Z axis (User Z axis is Three.js Y axis)
    const zProjectionLine = createThickDashedLine(
        threePos,
        new THREE.Vector3(0, threePos.y, 0),
        COLORS.Z_AXIS
    );
    projectionGroup.add(zProjectionLine);
    
    // Create coordinate value labels at each axis (only if enabled)
    if (options.showCoordinateLabels !== false) {
        const xAxisLabel = createLabel(`${formatNumber(x, 1)}`, new THREE.Vector3(0, -0.2, threePos.z), {
            color: COLORS.X_AXIS,
            fontSize: 18,  // Increased from 10
            backgroundColor: 'transparent'
        });
        projectionGroup.add(xAxisLabel);
        
        const yAxisLabel = createLabel(`${formatNumber(y, 1)}`, new THREE.Vector3(threePos.x, -0.2, 0), {
            color: COLORS.Y_AXIS,
            fontSize: 18,  // Increased from 10
            backgroundColor: 'transparent'
        });
        projectionGroup.add(yAxisLabel);
        
        const zAxisLabel = createLabel(`${formatNumber(z, 1)}`, new THREE.Vector3(-0.2, threePos.y, 0), {
            color: COLORS.Z_AXIS,
            fontSize: 18,  // Increased from 10
            backgroundColor: 'transparent'
        });
        projectionGroup.add(zAxisLabel);
    }
    
    // Create spheres at projection points for better visibility
    const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 6);
    
    // X axis projection point (on Three.js Z axis)
    const xSphereMaterial = new THREE.MeshPhongMaterial({ 
        color: COLORS.X_AXIS,
        shininess: 150,
        specular: 0x444444
    });
    const xSphere = new THREE.Mesh(sphereGeometry, xSphereMaterial);
    xSphere.position.set(0, 0, threePos.z);
    projectionGroup.add(xSphere);
    
    // Y axis projection point (on Three.js X axis)
    const ySphereMaterial = new THREE.MeshPhongMaterial({ 
        color: COLORS.Y_AXIS,
        shininess: 150,
        specular: 0x444444
    });
    const ySphere = new THREE.Mesh(sphereGeometry, ySphereMaterial);
    ySphere.position.set(threePos.x, 0, 0);
    projectionGroup.add(ySphere);
    
    // Z axis projection point (on Three.js Y axis)
    const zSphereMaterial = new THREE.MeshPhongMaterial({ 
        color: COLORS.Z_AXIS,
        shininess: 150,
        specular: 0x444444
    });
    const zSphere = new THREE.Mesh(sphereGeometry, zSphereMaterial);
    zSphere.position.set(0, threePos.y, 0);
    projectionGroup.add(zSphere);
    
    // Add coordinate display label (only if enabled)
    if (options.showCoordinateLabels !== false) {
        const coordLabel = createLabel(
            `${label}: (${formatNumber(x, 1)}, ${formatNumber(y, 1)}, ${formatNumber(z, 1)})`,
            new THREE.Vector3(threePos.x + 0.5, threePos.y + 0.5, threePos.z),
            {
                color: COLORS.BLACK,
                fontSize: 20,  // Increased from 12
                backgroundColor: 'white',
                padding: 6     // Increased padding for better visibility
            }
        );
        projectionGroup.add(coordLabel);
    }
    
    // Add to scene
    projectionSystem.scene.add(projectionGroup);
    projectionSystem.currentProjections = projectionGroup;
}

/**
 * Shows angle information label at clicked position
 * @param {Function} angleGetter - Function that returns angle data as a string
 */
function showAngleInformation(angleGetter) {
    // Remove existing projections
    hideCoordinateProjections();
    
    // Store the angle getter for updates
    projectionSystem.currentAngleGetter = angleGetter;
    
    // Get current angle data
    const angleData = angleGetter();
    
    // Create angle display group
    const angleGroup = new THREE.Group();
    angleGroup.name = 'angleInformation';
    
    // Create angle label at a fixed position (can be improved to position near the angle)
    const labelText = `${angleData}°`;
    const angleLabel = createLabel(labelText, new THREE.Vector3(0, 3, 0), {
        color: COLORS.BLACK,
        fontSize: 20,  // Increased from 12
        backgroundColor: 'transparent',
        padding: 4     // Increased padding
    });
    angleGroup.add(angleLabel);
    
    // Add to scene
    projectionSystem.scene.add(angleGroup);
    projectionSystem.currentProjections = angleGroup;
}

/**
 * Hides coordinate projections or angle information
 */
function hideCoordinateProjections() {
    if (projectionSystem.currentProjections) {
        projectionSystem.scene.remove(projectionSystem.currentProjections);
        projectionSystem.currentProjections = null;
        projectionSystem.currentAngleGetter = null; // Clear angle getter
        projectionSystem.currentCoordinateGetter = null; // Clear coordinate getter
    }
}