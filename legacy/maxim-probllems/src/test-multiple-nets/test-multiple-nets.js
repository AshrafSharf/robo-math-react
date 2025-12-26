// Test file for multiple foldable nets with different cut sizes
import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { createMultipleFoldableNets } from '../common/js/native/foldables/foldable_box_net.js';
import { label } from '../common/js/native/label.js';

let controlPanel = null;
let multipleNets = [];

export function render(scene, panel) {
    // Panel is already a FlowControlPanel instance created by the layout
    controlPanel = panel;
    
    // Setup coordinate system
    setupCoordinateSystem(scene, {
        showAxes: true,
        axesRange: 20,
        axesTickStep: 5,
        showGrid: true,
        enableInteraction: true,
        cameraPosition: { x: 15, y: 12, z: 15 },
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Test 1: Row arrangement with different cut sizes
    console.log('Testing row arrangement...');
    const rowNets = createMultipleFoldableNets(
        [0.5, 1.0, 1.5, 2.0],  // Different cut sizes
        {
            sheetSize: 4,
            spacing: 5,
            arrangement: 'row',
            position: { x: -7.5, y: 0, z: -6 },
            colors: {
                sheet: 0x4488ff,
                cuts: 0xffb3ba
            },
            showFoldLines: true,
            animation: {
                duration: 1500,
                easing: 'easeInOut'
            }
        }
    );
    
    rowNets.forEach((net, index) => {
        scene.add(net.group);
        multipleNets.push(net);
        
        // Add labels for each
        const cutLabel = label(`Cut: ${net.config.cutSize}`, 
            { x: -7.5 + index * 5, y: 0.5, z: -8 }, 
            {
                color: '#000000',
                fontSize: 20,
                scale: 0.018
            }
        );
        scene.add(cutLabel);
        
        const volumeLabel = label(`Vol: ${net.getVolume().toFixed(1)}`, 
            { x: -7.5 + index * 5, y: 0.5, z: -8.5 }, 
            {
                color: '#666666',
                fontSize: 16,
                scale: 0.015
            }
        );
        scene.add(volumeLabel);
    });
    
    // Test 2: Column arrangement with uniform cut sizes
    console.log('Testing column arrangement...');
    const columnNets = createMultipleFoldableNets(
        [1.0, 1.0, 1.0],  // Same cut size
        {
            sheetSize: 4,
            spacing: 5,
            arrangement: 'column',
            position: { x: -10, y: 0, z: -2 },
            colors: {
                sheet: 0x44ff88,
                cuts: 0xffaa88
            },
            showFoldLines: true,
            animation: {
                duration: 1500,
                easing: 'easeInOut'
            }
        }
    );
    
    columnNets.forEach((net, index) => {
        scene.add(net.group);
        multipleNets.push(net);
        
        const label1 = label(`Uniform Cut: 1.0`, 
            { x: -12, y: 0.5, z: -2 + index * 5 }, 
            {
                color: '#000000',
                fontSize: 18,
                scale: 0.016
            }
        );
        scene.add(label1);
    });
    
    // Test 3: Grid arrangement with varying sizes
    console.log('Testing grid arrangement...');
    const gridNets = createMultipleFoldableNets(
        [0.8, 1.2, 1.6, 2.0, 0.6, 1.0],  // 6 different sizes
        {
            sheetSize: 3,
            spacing: 4,
            arrangement: 'grid',
            position: { x: 5, y: 0, z: -4 },
            colors: {
                sheet: 0xff8844,
                cuts: 0x88ccff
            },
            showFoldLines: true,
            animation: {
                duration: 1800,
                easing: 'easeInOut',
                stagger: true
            }
        }
    );
    
    gridNets.forEach((net, index) => {
        scene.add(net.group);
        multipleNets.push(net);
        
        // Calculate grid position for labels
        const cols = 3;
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const gridLabel = label(`${net.config.cutSize.toFixed(1)}`, 
            { x: 5 + col * 4, y: 0.5, z: -6 + row * 4 }, 
            {
                color: '#000000',
                fontSize: 16,
                scale: 0.014
            }
        );
        scene.add(gridLabel);
    });
    
    // Add title labels for each arrangement
    const rowTitle = label('Row Arrangement', { x: 0, y: 3, z: -6 }, {
        color: '#000000',
        fontSize: 24,
        scale: 0.02
    });
    scene.add(rowTitle);
    
    const columnTitle = label('Column', { x: -10, y: 3, z: 3 }, {
        color: '#000000',
        fontSize: 24,
        scale: 0.02
    });
    scene.add(columnTitle);
    
    const gridTitle = label('Grid Arrangement', { x: 6.5, y: 3, z: -2 }, {
        color: '#000000',
        fontSize: 24,
        scale: 0.02
    });
    scene.add(gridTitle);
    
    // Add control panel elements
    if (controlPanel) {
        controlPanel.createText('title', '<b>Multiple Nets Test Controls</b>', {
            style: 'text-align: center; font-size: 16px; margin-bottom: 10px;'
        });
        
        // Fold all nets
        controlPanel.createButton('fold-all', '📦 Fold All Nets', () => {
            multipleNets.forEach(net => {
                if (!net.isFolded()) {
                    net.fold();
                }
            });
            controlPanel.updateButton('fold-all', '📋 Unfold All Nets');
            controlPanel.updateButton('fold-all-action', 'unfold');
        }, {
            style: 'width: 90%; padding: 10px; margin: 5px auto; display: block; background: #4488ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;'
        });
        
        // Toggle all nets
        controlPanel.createButton('toggle-all', '🔄 Toggle All Nets', () => {
            multipleNets.forEach(net => {
                net.toggle();
            });
        }, {
            style: 'width: 90%; padding: 8px; margin: 5px auto; display: block; background: #44ff88; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;'
        });
        
        // Fold by arrangement
        controlPanel.createText('arrangement-title', '<b>Fold by Arrangement</b>', {
            style: 'text-align: center; font-size: 14px; margin-top: 15px; margin-bottom: 10px;'
        });
        
        controlPanel.createButton('toggle-row', '↔️ Toggle Row Nets', () => {
            rowNets.forEach(net => net.toggle());
        }, {
            style: 'width: 90%; padding: 6px; margin: 3px auto; display: block; background: #6688ff; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;'
        });
        
        controlPanel.createButton('toggle-column', '↕️ Toggle Column Nets', () => {
            columnNets.forEach(net => net.toggle());
        }, {
            style: 'width: 90%; padding: 6px; margin: 3px auto; display: block; background: #66ff88; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;'
        });
        
        controlPanel.createButton('toggle-grid', '⚏ Toggle Grid Nets', () => {
            gridNets.forEach(net => net.toggle());
        }, {
            style: 'width: 90%; padding: 6px; margin: 3px auto; display: block; background: #ff8866; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;'
        });
        
        // Animation control
        controlPanel.createText('animation-title', '<b>Animation Patterns</b>', {
            style: 'text-align: center; font-size: 14px; margin-top: 15px; margin-bottom: 10px;'
        });
        
        controlPanel.createButton('cascade-fold', '🌊 Cascade Fold', async () => {
            for (let i = 0; i < multipleNets.length; i++) {
                if (!multipleNets[i].isFolded()) {
                    multipleNets[i].fold();
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }, {
            style: 'width: 90%; padding: 6px; margin: 3px auto; display: block; background: #aa66ff; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;'
        });
        
        controlPanel.createButton('cascade-unfold', '🌊 Cascade Unfold', async () => {
            for (let i = 0; i < multipleNets.length; i++) {
                if (multipleNets[i].isFolded()) {
                    multipleNets[i].unfold();
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
        }, {
            style: 'width: 90%; padding: 6px; margin: 3px auto; display: block; background: #ff66aa; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;'
        });
        
        // Information panel
        controlPanel.createText('info', 
            '<hr style="margin: 20px 0; opacity: 0.3;">' +
            '<b>Multiple Nets Features:</b><br>' +
            '• Row, column, and grid arrangements<br>' +
            '• Different cut sizes for comparison<br>' +
            '• Individual volume calculations<br>' +
            '• Synchronized animations<br>' +
            '• Cascade animation patterns',
            {
                style: 'font-size: 12px; color: #444; line-height: 1.5; margin-top: 10px;'
            }
        );
    }
    
    console.log('Multiple nets test initialized successfully!');
}

export function cleanup() {
    multipleNets.forEach(net => {
        if (net && net.stop) {
            net.stop();
        }
    });
    multipleNets = [];
}