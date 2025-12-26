// Combined 2D+3D Layout for Solid of Revolution Lessons
// Three panels: 3D (Three.js) + 2D (JSXGraph) + HTML Control Panel

import { createControlPanel } from './control-panel-2d.js';
import { SIZE_PRESETS_2D3D } from './sizes.js';
import * as THREE from 'three';

// Re-export SIZE_PRESETS_2D3D for backward compatibility
export { SIZE_PRESETS_2D3D };

// Legacy format for backward compatibility with existing code
const SIZE_PRESETS_2D3D_LEGACY = {
    'threepanel-2d3d': {
        desktop: { 
            totalWidth: SIZE_PRESETS_2D3D.TOTAL_WIDTH, 
            totalHeight: SIZE_PRESETS_2D3D.HEIGHT,
            panel3D: { width: SIZE_PRESETS_2D3D.SCENE_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT },     // 33.3% width for 3D
            panel2D: { width: SIZE_PRESETS_2D3D.BOARD_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT },     // 33.3% width for 2D  
            panelControl: { width: SIZE_PRESETS_2D3D.PANEL_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT } // 33.4% width for controls
        },
        tablet: { 
            totalWidth: SIZE_PRESETS_2D3D.TOTAL_WIDTH, 
            totalHeight: SIZE_PRESETS_2D3D.HEIGHT,
            panel3D: { width: SIZE_PRESETS_2D3D.SCENE_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT },
            panel2D: { width: SIZE_PRESETS_2D3D.BOARD_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT },
            panelControl: { width: SIZE_PRESETS_2D3D.PANEL_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT }
        },
        mobile: { 
            totalWidth: SIZE_PRESETS_2D3D.TOTAL_WIDTH, 
            totalHeight: SIZE_PRESETS_2D3D.HEIGHT,  // Same dimensions for all devices
            panel3D: { width: SIZE_PRESETS_2D3D.SCENE_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT },
            panel2D: { width: SIZE_PRESETS_2D3D.BOARD_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT },
            panelControl: { width: SIZE_PRESETS_2D3D.PANEL_WIDTH, height: SIZE_PRESETS_2D3D.HEIGHT }
        }
    }
};

/**
 * Detect device type based on screen width for 2D+3D lessons
 */
export function getDeviceType2D3D() {
    const width = window.innerWidth;
    if (width < 600) return 'mobile';
    if (width < 1000) return 'tablet';
    return 'desktop';
}

/**
 * Create the combined 2D+3D layout with three panels
 * @param {string} containerId - Container element ID
 * @param {Object} config - Layout configuration
 * @returns {Object} Layout with 3D scene, 2D board, and control panel
 */
export function create2D3DLayout(containerId, config = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error(`Container element with id "${containerId}" not found`);
    }

    // Get device-appropriate sizing
    const deviceType = getDeviceType2D3D();
    const containerSize = SIZE_PRESETS_2D3D_LEGACY['threepanel-2d3d'][deviceType];
    const { totalWidth, totalHeight, panel3D, panel2D, panelControl } = containerSize;

    // Apply container styling
    container.style.cssText = `
        width: ${totalWidth}px;
        height: ${totalHeight}px;
        display: flex;
        flex-direction: ${deviceType === 'mobile' ? 'column' : 'row'};
        gap: 0;
        margin: 0 auto;
        border: none;
        border-radius: 0;
        overflow: hidden;
        background: #ffffff;
        box-shadow: none;
    `;

    // Create 3D panel (Three.js)
    const threeDPanel = document.createElement('div');
    threeDPanel.id = 'panel-3d';
    threeDPanel.style.cssText = `
        width: ${panel3D.width}px;
        height: ${panel3D.height}px;
        background: #ffffff;
        border-right: none;
        border-bottom: none;
        position: relative;
        overflow: hidden;
    `;

    // Create 2D panel (JSXGraph)
    const twoDPanel = document.createElement('div');
    twoDPanel.id = 'panel-2d';
    twoDPanel.style.cssText = `
        width: ${panel2D.width}px;
        height: ${panel2D.height}px;
        background: #ffffff;
        border-right: none;
        border-bottom: none;
        position: relative;
        overflow: hidden;
    `;

    // Create control panel (HTML)
    const controlPanelContainer = document.createElement('div');
    controlPanelContainer.id = 'panel-control';
    controlPanelContainer.style.cssText = `
        width: ${panelControl.width}px;
        height: ${panelControl.height}px;
        background: #fff;
        position: relative;
        overflow: hidden;
    `;

    // Assemble the layout
    container.appendChild(threeDPanel);
    container.appendChild(twoDPanel);
    container.appendChild(controlPanelContainer);

    // Initialize Three.js scene
    const scene3D = initializeThreeJS(threeDPanel, panel3D);
    
    // Initialize JSXGraph board
    const board2D = initializeJSXGraph(twoDPanel, panel2D, config);
    
    // Initialize HTML control panel
    const controlPanel = createControlPanel(controlPanelContainer, {
        fontSize: deviceType === 'mobile' ? 14 : 16
    });

    // No panel labels needed
    
    return {
        container,
        scene3D,
        board2D, 
        controlPanel,
        panels: {
            threeD: threeDPanel,
            twoD: twoDPanel,
            control: controlPanelContainer
        },
        deviceType,
        dimensions: containerSize
    };
}

/**
 * Initialize Three.js scene for 3D panel
 */
function initializeThreeJS(container, dimensions) {
    // Import Three.js dynamically
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background
    
    const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(renderer.domElement);
    
    // Add camera controls for rotation/zoom
    let controls = null;
    
    // Try to add OrbitControls if available
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 20;
        controls.maxPolarAngle = Math.PI;
    } else {
        // Fallback: Basic mouse controls
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            // Rotate camera around the origin
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            camera.position.setFromSpherical(spherical);
            camera.lookAt(0, 0, 0);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        renderer.domElement.addEventListener('wheel', (event) => {
            const scale = event.deltaY > 0 ? 1.1 : 0.9;
            camera.position.multiplyScalar(scale);
            camera.position.clampLength(3, 20);
            event.preventDefault();
        });
    }
    
    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add coordinate axes
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update controls if available
        if (controls && controls.update) {
            controls.update();
        }
        
        renderer.render(scene, camera);
    }
    animate();
    
    return {
        scene,
        camera,
        renderer,
        controls,
        container
    };
}

/**
 * Initialize JSXGraph board for 2D panel
 */
function initializeJSXGraph(container, dimensions, config) {
    const boardId = 'jsxboard-' + Date.now();
    container.id = boardId;
    
    const board = JXG.JSXGraph.initBoard(boardId, {
        boundingbox: config.boundingbox || [-5, 5, 5, -5],
        keepaspectratio: config.keepaspectratio !== false,
        showNavigation: false,
        showCopyright: false,
        axis: false,  // Disable default axes to avoid overlap with createCoordinateSystem
        grid: config.showGrid === true,
        zoom: {
            factorX: 1.25,
            factorY: 1.25,
            wheel: false,
            needshift: false,
            eps: 0.1
        },
        pan: {
            enabled: true,
            needshift: false
        },
        resize: {
            enabled: true
        }
    });
    
    return board;
}

/**
 * Add a small label to identify each panel
 */
function addPanelLabel(panel, text, color) {
    const label = document.createElement('div');
    label.textContent = text;
    label.style.cssText = `
        position: absolute;
        top: 4px;
        left: 8px;
        font-size: 10px;
        font-weight: 600;
        color: ${color};
        background: rgba(0,0,0,0.1);
        padding: 2px 6px;
        border-radius: 3px;
        z-index: 1000;
        pointer-events: none;
    `;
    panel.appendChild(label);
}

/**
 * Handle responsive layout changes
 */
export function handleResize2D3D(layout) {
    const newDeviceType = getDeviceType2D3D();
    if (newDeviceType !== layout.deviceType) {
        // Recreate layout with new device type
        const container = layout.container;
        const config = { /* preserve config */ };
        
        // Clear existing content
        container.innerHTML = '';
        
        // Recreate layout
        return create2D3DLayout(container.id, config);
    }
    
    return layout;
}

// Fullscreen functionality has been removed