// Layout configuration for 3D (Three.js) lessons with 900px/300px split
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FlowControlPanel } from './control-panel-3d.js';

// Cache for created boards
let cachedBoards = null;

/**
 * Creates the 3D layout with Three.js and control panel
 * @param {Object} globalStyle - Global style configuration (optional)
 * @param {Object} threejsConfig - Three.js-specific configuration (optional)
 * @returns {Object} Created boards with threejs and panel
 */
export function createLayout(globalStyle = {}, threejsConfig = {}) {
    // Return cached boards if already created
    if (cachedBoards) {
        return cachedBoards;
    }
    
    // Ensure we have a container
    const container = document.getElementById('boards-container');
    if (!container) {
        throw new Error('Container element with id "boards-container" not found');
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Set up container with fixed layout - 900px diagram + 400px panel = 1300px total
    const totalWidth = 1300;
    const diagramWidth = 900;
    const panelWidth = 400;
    const totalHeight = 800;
    
    // Apply container styles with constrained dimensions
    Object.assign(container.style, {
        display: 'flex',
        width: `${totalWidth}px`,
        height: `${totalHeight}px`,
        margin: '0 auto', // Center the container
        padding: '0',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
    });
    
    // Create board containers
    const boardDivs = {
        threejs: createBoardDiv('threejs-board', `${diagramWidth}px`, 'left'),
        panel: createBoardDiv('panel-board', `${panelWidth}px`, 'right')
    };
    
    // Append divs to container
    container.appendChild(boardDivs.threejs);
    container.appendChild(boardDivs.panel);
    
    // Initialize boards
    const boards = initializeBoards3D(boardDivs, globalStyle, threejsConfig);
    
    // Cache the boards
    cachedBoards = boards;
    
    // Handle window resize
    window.addEventListener('resize', () => handleResize(boards));
    
    // Handle reset events
    window.addEventListener('lesson-reset', () => resetBoards(boards));
    document.addEventListener('reset-lesson', () => resetBoards(boards));
    
    return boards;
}

/**
 * Creates a div element for a board
 * @param {string} id - The div ID
 * @param {string} width - Width of the div
 * @param {string} float - Float direction
 * @returns {HTMLElement} The created div
 */
function createBoardDiv(id, width, float) {
    const div = document.createElement('div');
    div.id = id;
    
    const styles = {
        width: width,
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '0',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'none',
        float: float
    };
    
    // Add specific styles based on the board type
    if (id === 'panel-board') {
        styles.backgroundColor = '#f8f9fa';
        styles.borderLeft = '1px solid #dee2e6';
        styles.overflowY = 'auto';
        styles.padding = '10px';
        styles.boxSizing = 'border-box';
    } else {
        styles.backgroundColor = '#f5f5f5';
    }
    
    Object.assign(div.style, styles);
    
    return div;
}

/**
 * Initializes the Three.js scene and control panel
 * @param {Object} boardDivs - The board div elements
 * @param {Object} globalStyle - Global style configuration
 * @param {Object} threejsConfig - Three.js configuration
 * @returns {Object} Initialized boards
 */
function initializeBoards3D(boardDivs, globalStyle, threejsConfig) {
    const boards = {};
    
    // Initialize Three.js
    const threejsDiv = boardDivs.threejs;
    const width = threejsDiv.offsetWidth;
    const height = threejsDiv.offsetHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(threejsConfig.backgroundColor || 0xf5f5f5);
    
    // Create OrthographicCamera (will be properly configured by setupCoordinateSystem)
    const viewSize = threejsConfig.viewSize || 15;
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
        -viewSize * aspect / 2,
        viewSize * aspect / 2,
        viewSize / 2,
        -viewSize / 2,
        threejsConfig.near || 0.1,
        threejsConfig.far || 1000
    );
    
    // Set default camera position (can be overridden by lessons)
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    threejsDiv.appendChild(renderer.domElement);
    
    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    
    // Add basic ambient lighting (lessons will add more specific lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Store renderer and camera in scene.userData for setupCoordinateSystem to use
    scene.userData = {
        renderer: renderer,
        camera: camera,
        controls: controls
    };
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Store Three.js objects
    boards.threejs = {
        scene,
        camera,
        renderer,
        controls,
        width,
        height
    };
    
    // Initialize Control Panel
    const panelDiv = boardDivs.panel;
    const controlPanel = new FlowControlPanel(panelDiv, {
        fontSize: globalStyle.fontSize || 12,
        background: globalStyle.panelBackground || '#f8f9fa'
    });
    
    boards.panel = controlPanel;
    
    return boards;
}

/**
 * Handles window resize events
 * @param {Object} boards - The boards object
 */
function handleResize(boards) {
    // Update container height
    const container = document.getElementById('boards-container');
    if (container) {
        const newHeight = window.innerHeight;
        container.style.height = `${newHeight}px`;
    }
    
    if (boards.threejs) {
        const threejsDiv = document.getElementById('threejs-board');
        if (threejsDiv) {
            const width = threejsDiv.offsetWidth;
            const height = threejsDiv.offsetHeight;
            
            // Update camera aspect ratio
            if (boards.threejs.camera.isOrthographicCamera) {
                // For orthographic camera
                const currentViewHeight = boards.threejs.camera.top - boards.threejs.camera.bottom;
                const viewSize = currentViewHeight;
                const aspect = width / height;
                boards.threejs.camera.left = -viewSize * aspect / 2;
                boards.threejs.camera.right = viewSize * aspect / 2;
                boards.threejs.camera.top = viewSize / 2;
                boards.threejs.camera.bottom = -viewSize / 2;
                boards.threejs.camera.updateProjectionMatrix();
            } else {
                // For perspective camera
                boards.threejs.camera.aspect = width / height;
                boards.threejs.camera.updateProjectionMatrix();
            }
            
            boards.threejs.renderer.setSize(width, height);
            
            boards.threejs.width = width;
            boards.threejs.height = height;
        }
    }
}

/**
 * Resets boards to initial state
 * @param {Object} boards - The boards object
 */
function resetBoards(boards) {
    // Reset camera position (if it's a perspective camera)
    if (boards.threejs && boards.threejs.camera && !boards.threejs.camera.isOrthographicCamera) {
        boards.threejs.camera.position.set(8, 6, 8);
        boards.threejs.camera.lookAt(0, 0, 0);
        if (boards.threejs.controls) {
            boards.threejs.controls.update();
        }
    }
    
    // Control panel will be reset by the lesson's reset function if needed
}

/**
 * Destroys the layout and cleans up resources
 */
export function destroyLayout() {
    if (cachedBoards) {
        // Destroy Three.js
        if (cachedBoards.threejs) {
            // Clean up Three.js resources
            if (cachedBoards.threejs.renderer) {
                cachedBoards.threejs.renderer.dispose();
            }
            if (cachedBoards.threejs.controls) {
                cachedBoards.threejs.controls.dispose();
            }
        }
        
        // Clear control panel
        if (cachedBoards.panel) {
            cachedBoards.panel.clear();
        }
        
        cachedBoards = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('lesson-reset', resetBoards);
    document.removeEventListener('reset-lesson', resetBoards);
}