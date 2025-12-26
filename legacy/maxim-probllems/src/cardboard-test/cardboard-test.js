import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { CardboardBoxNet } from '../common/js/native/foldables/cardboard_box_net.js';

let boxInstance = null;
let controlPanel = null;

export function render(scene, panel) {
    controlPanel = panel;
    
    // Setup coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 15,
        axesTickStep: 5,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: 15, y: 12, z: 20 },
        cameraTarget: { x: 0, y: 3, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Create the cardboard box using the new class
    boxInstance = new CardboardBoxNet({
        width: 10,
        length: 12,
        depth: 8,
        thickness: 0.2,
        flapGap: 0.2,
        position: { x: 0, y: 1, z: 0 },
        color: 0x9C8D7B,
        animationDuration: 0.6,
        animationEase: 'power2.inOut'
    });
    
    // Add the box to the scene
    scene.add(boxInstance.getGroup());
    
    // Setup control panel
    if (controlPanel) {
        setupControls();
    }
    
    // Example of custom animation (commented out - can be enabled for testing)
    // demonstrateCustomAnimation();
}

function setupControls() {
    if (!controlPanel) return;
    
    controlPanel.createText('title', '<b>Cardboard Box Net (OOP Class)</b>', {
        style: 'text-align: center; font-size: 16px; margin-bottom: 10px;'
    });
    
    controlPanel.createButton('toggle-box', '📦 Fold Box', () => {
        boxInstance.toggle(() => {
            updateButtonState();
        });
    }, {
        style: 'width: 90%; padding: 10px; margin: 10px auto; display: block; background: #9C8D7B; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;'
    });
    
    controlPanel.createText('animations-title', '<b>Animation Examples:</b>', {
        style: 'margin-top: 20px; font-size: 14px; margin-bottom: 10px;'
    });
    
    // Wave animation button
    controlPanel.createButton('wave-animation', '🌊 Wave Animation', () => {
        runWaveAnimation();
    }, {
        style: 'width: 90%; padding: 8px; margin: 5px auto; display: block; background: #7A8B99; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;'
    });
    
    // Spiral animation button
    controlPanel.createButton('spiral-animation', '🌀 Spiral Animation', () => {
        runSpiralAnimation();
    }, {
        style: 'width: 90%; padding: 8px; margin: 5px auto; display: block; background: #7A8B99; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;'
    });
    
    // Reset button
    controlPanel.createButton('reset-box', '🔄 Reset Box', () => {
        boxInstance.reset();
        updateButtonState();
    }, {
        style: 'width: 90%; padding: 8px; margin: 5px auto; display: block; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;'
    });
    
    controlPanel.createText('info', 
        '<hr style="margin: 20px 0; opacity: 0.3;">' +
        '<b>OOP Implementation Features:</b><br>' +
        '• Self-contained CardboardBoxNet class<br>' +
        '• No need to pass timeline/duration<br>' +
        '• Built-in animation methods<br>' +
        '• Custom animation support<br>' +
        '• Clean API with method chaining',
        {
            style: 'font-size: 12px; color: #444; line-height: 1.5; margin-top: 10px;'
        }
    );
}

function updateButtonState() {
    if (!controlPanel || !boxInstance) return;
    
    const state = boxInstance.getState();
    const buttonText = state.isFolded ? '📋 Unfold Box' : '📦 Fold Box';
    controlPanel.updateButton('toggle-box', buttonText);
}

// Example custom animations using the class methods
function runWaveAnimation() {
    // First reset the box to open state
    boxInstance.reset();
    
    // Then run the wave animation
    setTimeout(() => {
        boxInstance.customAnimation(function() {
            // Wave pattern - each flap folds with a slight delay
            this.foldBottomBackWidthFlap(0.0);
            this.foldBottomFrontWidthFlap(0.1);
            this.foldBottomBackLengthFlap(0.2);
            this.foldBottomFrontLengthFlap(0.3);
            this.foldTopBackWidthFlap(0.4);
            this.foldTopFrontWidthFlap(0.5);
            this.foldTopBackLengthFlap(0.6);
            this.foldTopFrontLengthFlap(0.7);
        }, () => {
            boxInstance.isFolded = true;
            updateButtonState();
        });
    }, 100);
}

function runSpiralAnimation() {
    // First reset the box to open state
    boxInstance.reset();
    
    // Then run the spiral animation
    setTimeout(() => {
        boxInstance.customAnimation(function() {
            // Spiral pattern - alternating corners
            this.foldBottomBackWidthFlap(0.0, 0.4);
            this.foldTopFrontLengthFlap(0.2, 0.4);
            this.foldBottomFrontLengthFlap(0.4, 0.4);
            this.foldTopBackWidthFlap(0.6, 0.4);
            this.foldBottomBackLengthFlap(0.8, 0.4);
            this.foldTopFrontWidthFlap(1.0, 0.4);
            this.foldBottomFrontWidthFlap(1.2, 0.4);
            this.foldTopBackLengthFlap(1.4, 0.4);
        }, () => {
            boxInstance.isFolded = true;
            updateButtonState();
        });
    }, 100);
}

export function cleanup() {
    if (boxInstance) {
        boxInstance.dispose();
    }
}