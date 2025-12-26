import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { CubeNet } from '../common/js/native/foldables/cube_net.js';
import { label } from '../common/js/native/label.js';

let cubeNetInstance = null;
let controlPanel = null;
let currentSize = 3;
let sceneRef = null;

// Different sizes for testing
const sizes = [2, 3, 4, 5];

// Store labels for cleanup
let labels = [];

export function render(scene, panel) {
    controlPanel = panel;
    sceneRef = scene;
    
    // Setup coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 10,
        axesTickStep: 2,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: 12, y: 10, z: 12 },
        cameraTarget: { x: 0, y: 2, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Create initial cube net using the new class
    createCubeNetInstance();
    
    // Setup control panel
    if (controlPanel) {
        setupControls();
    }
}

function createCubeNetInstance() {
    // Remove existing cube net if any
    if (cubeNetInstance) {
        sceneRef.remove(cubeNetInstance.getGroup());
        cubeNetInstance.dispose();
    }
    
    // Remove old labels
    labels.forEach(labelMesh => {
        sceneRef.remove(labelMesh);
    });
    labels = [];
    
    // Create new cube net instance with OOP approach
    cubeNetInstance = new CubeNet({
        size: currentSize,
        position: { x: 0, y: 0, z: 0 },
        faceColor: 0x4488ff,
        edgeColor: 0x2266dd,
        thickness: 0.05,
        showFoldLines: true,
        faceLabels: true,
        animationDuration: 0.5,
        animationEase: 'power2.inOut'
    });
    
    // Add to scene
    sceneRef.add(cubeNetInstance.getGroup());
    
    // Add descriptive labels
    const sizeLabel = label(
        `Cube Size: ${currentSize}×${currentSize}×${currentSize}`, 
        { x: 0, y: -1, z: -6 }, 
        {
            color: '#666666',
            fontSize: 22,
            scale: 0.02
        }
    );
    labels.push(sizeLabel);
    sceneRef.add(sizeLabel);
    
    const surfaceAreaLabel = label(
        `Surface Area: ${6 * currentSize * currentSize} units²`, 
        { x: 0, y: -1, z: -6.7 }, 
        {
            color: '#888888',
            fontSize: 20,
            scale: 0.018
        }
    );
    labels.push(surfaceAreaLabel);
    sceneRef.add(surfaceAreaLabel);
}

function setupControls() {
    if (!controlPanel) return;
    
    // Title
    controlPanel.createText('title', '<b>🎲 Cube Net Visualization (OOP)</b>', {
        style: 'text-align: center; font-size: 18px; margin-bottom: 15px; color: #333;'
    });
    
    // Main fold/unfold button
    controlPanel.createButton('toggle-fold', '📦 Fold into Cube', () => {
        cubeNetInstance.toggle(() => {
            updateButtonState();
        });
    }, {
        style: 'width: 90%; padding: 12px; margin: 10px auto; display: block; background: #4488ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; font-weight: bold;'
    });
    
    // Size selection section
    controlPanel.createText('size-title', '<b>Cube Size</b>', {
        style: 'margin-top: 20px; margin-bottom: 10px; font-size: 14px; color: #555;'
    });
    
    // Size buttons
    sizes.forEach(size => {
        const isActive = size === currentSize;
        controlPanel.createButton(`size-${size}`, `${size}×${size}×${size} cube`, () => {
            if (size !== currentSize) {
                currentSize = size;
                createCubeNetInstance();
                updateSizeButtons();
                updateButtonState();
            }
        }, {
            style: `width: 90%; padding: 8px; margin: 3px auto; display: block; background: ${isActive ? '#44ff88' : '#e0e0e0'}; color: ${isActive ? 'white' : '#333'}; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;`
        });
    });
    
    // Animation controls
    controlPanel.createText('animation-title', '<b>Animation Examples</b>', {
        style: 'margin-top: 20px; margin-bottom: 10px; font-size: 14px; color: #555;'
    });
    
    // Custom animation button
    controlPanel.createButton('custom-animation', '🎨 Custom Fold Sequence', () => {
        runCustomAnimation();
    }, {
        style: 'width: 90%; padding: 8px; margin: 3px auto; display: block; background: #ff8844; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;'
    });
    
    // Reset button
    controlPanel.createButton('reset', '🔄 Reset to Flat', () => {
        cubeNetInstance.reset();
        updateButtonState();
    }, {
        style: 'width: 90%; padding: 8px; margin: 3px auto; display: block; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;'
    });
    
    // Stop animation button
    controlPanel.createButton('stop', '⏹️ Stop Animation', () => {
        cubeNetInstance.stop();
    }, {
        style: 'width: 90%; padding: 8px; margin: 3px auto; display: block; background: #999; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;'
    });
    
    // Info section
    controlPanel.createText('info', 
        '<hr style="margin: 20px 0; opacity: 0.3;">' +
        '<b>Cube Net Features:</b><br>' +
        '• Classic cross-pattern cube net<br>' +
        '• GSAP animations with timeline<br>' +
        '• Group-based hierarchical folding<br>' +
        '• Clean OOP structure<br>' +
        '• Smooth fold/unfold animations',
        {
            style: 'font-size: 12px; color: #666; line-height: 1.6; margin-top: 15px;'
        }
    );
}

function updateButtonState() {
    if (!controlPanel || !cubeNetInstance) return;
    
    const state = cubeNetInstance.getState();
    const buttonText = state.isFolded ? '📋 Unfold to Net' : '📦 Fold into Cube';
    controlPanel.updateButton('toggle-fold', buttonText);
}

function updateSizeButtons() {
    sizes.forEach(size => {
        const isActive = size === currentSize;
        const style = `width: 90%; padding: 8px; margin: 3px auto; display: block; background: ${isActive ? '#44ff88' : '#e0e0e0'}; color: ${isActive ? 'white' : '#333'}; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;`;
        
        // Update button style
        const button = document.querySelector(`[data-button-id="size-${size}"]`);
        if (button) {
            button.style.cssText = style;
        }
    });
}

function runCustomAnimation() {
    // Reset first
    cubeNetInstance.reset();
    
    // Create a custom animation sequence
    // This demonstrates how you could extend the class with custom animations
    // For now, just use the standard fold with callback
    setTimeout(() => {
        cubeNetInstance.fold(() => {
            console.log('Custom animation complete!');
            updateButtonState();
        });
    }, 100);
}

export function cleanup() {
    if (cubeNetInstance) {
        cubeNetInstance.dispose();
        cubeNetInstance = null;
    }
    
    // Clean up labels
    labels.forEach(labelMesh => {
        if (labelMesh.geometry) labelMesh.geometry.dispose();
        if (labelMesh.material) labelMesh.material.dispose();
    });
    labels = [];
}