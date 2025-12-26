// Test file for square cut folding and unfolding APIs
import { setupCoordinateSystem } from '../common/js/native/coordinate_system.js';
import { createFoldableBoxNet } from '../common/js/native/foldables/foldable_box_net.js';
import { measurementIndicator } from '../common/js/native/measurement_indicator.js';

let controlPanel = null;
let foldableNet = null;

export function render(scene, panel) {
    // Panel is already a FlowControlPanel instance created by the layout
    controlPanel = panel;
    
    // Setup coordinate system
    setupCoordinateSystem(scene, {
        showAxes: false,  // No axes needed for this demonstration
        axesRange: 10,
        axesTickStep: 2,
        showGrid: false,  // Disable grid to avoid lines showing through
        enableInteraction: true,
        cameraPosition: { x: 12, y: 8, z: 12 },  // Zoomed out for better view
        cameraTarget: { x: 0, y: 0, z: 0 },
        lightingProfile: 'phong'
    });
    
    // Create single foldable box net
    console.log('Creating foldable box net...');
    foldableNet = createFoldableBoxNet({
        sheetSize: 8,
        cutSize: 1.33,  // Approximately 8/6 for optimal volume
        position: { x: 0, y: 0, z: 0 },
        colors: {
            sheet: 0x4488ff,
            cuts: 0xffb3ba
        },
        animation: {
            duration: 2000,
            easing: 'easeInOut',
            stagger: true
        },
        showOutlines: false  // Remove white edge lines
    });
    scene.add(foldableNet.group);
    
    // Add measurement indicators
    const sheetSize = 8;
    const cutSize = 1.33;
    const halfSheet = sheetSize / 2;
    const innerSize = sheetSize - 2 * cutSize;  // Width/height of the box base
    const halfInner = innerSize / 2;
    
    // Full width measurement (along Z-axis) - left edge
    const widthIndicator = measurementIndicator(
        { x: -halfSheet - 0.5, y: 0.01, z: -halfSheet },
        { x: -halfSheet - 0.5, y: 0.01, z: halfSheet },
        {
            color: 0x333333,
            mainRadius: 0.015,
            markerRadius: 0.01,
            markerLength: 0.3,
            label: 'w'
        }
    );
    scene.add(widthIndicator);
    
    // Inner width measurement (width after cuts) - bottom edge, shows the actual box base width
    const innerWidthIndicator = measurementIndicator(
        { x: -halfInner, y: 0.01, z: -halfSheet - 0.5 },
        { x: halfInner, y: 0.01, z: -halfSheet - 0.5 },
        {
            color: 0x4488ff,  // Blue to match the sheet color
            mainRadius: 0.015,
            markerRadius: 0.01,
            markerLength: 0.25,
            label: 'w - 2x'
        }
    );
    scene.add(innerWidthIndicator);
    
    
    // Cut size measurement - in corner (this becomes the box height when folded)
    const cutIndicator = measurementIndicator(
        { x: halfSheet - cutSize, y: 0.02, z: halfSheet + 0.3 },
        { x: halfSheet, y: 0.02, z: halfSheet + 0.3 },
        {
            color: 0xff6666,
            mainRadius: 0.012,
            markerRadius: 0.008,
            markerLength: 0.2,
            label: 'x'
        }
    );
    scene.add(cutIndicator);
    
    // Flap height indicator (shows that flap width = cut size = box height)
    // Positioned INSIDE the right flap area
    const flapIndicator = measurementIndicator(
        { x: halfInner + cutSize/2, y: 0.02, z: halfSheet - cutSize },
        { x: halfInner + cutSize/2, y: 0.02, z: halfSheet },
        {
            color: 0x66ff66,  // Green to distinguish from cut indicator
            mainRadius: 0.012,
            markerRadius: 0.008,
            markerLength: 0.2,
            label: 'h'
        }
    );
    scene.add(flapIndicator);
    
    // Vertical height indicator for folded state - positioned at the actual corner edge
    // This will be visible when the box is folded up
    const verticalHeightIndicator = measurementIndicator(
        { x: halfInner, y: 0, z: halfInner },  // Corner of the box base
        { x: halfInner, y: cutSize, z: halfInner },  // Top of the corner edge
        {
            color: 0x9966ff,  // Purple to distinguish from other indicators
            mainRadius: 0.012,
            markerRadius: 0.008,
            markerLength: 0.2,
            label: 'h',
            labelPosition: { x: halfInner + 0.3, y: cutSize/2, z: halfInner + 0.3 }
        }
    );
    scene.add(verticalHeightIndicator);
    
    // Add control panel elements
    if (controlPanel) {
        // Title
        controlPanel.createText('title', '<b>Square Cut Box - Fold/Unfold Test</b>', {
            style: 'text-align: center; font-size: 18px; margin-bottom: 15px;'
        });
        
        // Main fold/unfold button
        controlPanel.createButton('fold-main', '📦 Fold into Box', () => {
            if (foldableNet) {
                foldableNet.toggle(() => {
                    const isFolded = foldableNet.isFolded();
                    controlPanel.updateButton('fold-main', 
                        isFolded ? '📋 Unfold to Sheet' : '📦 Fold into Box'
                    );
                    
                    // Update status text
                    controlPanel.updateText('status', 
                        isFolded ? 'State: Folded Box' : 'State: Flat Sheet'
                    );
                });
            }
        }, {
            style: 'width: 90%; padding: 12px; margin: 10px auto; display: block; background: #4488ff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold;'
        });
        
        // Status display
        controlPanel.createText('status', 'State: Flat Sheet', {
            style: 'text-align: center; font-size: 14px; color: #666; margin: 10px 0;'
        });
        
        // Information panel
        controlPanel.createText('info', 
            '<hr style="margin: 20px 0; opacity: 0.3;">' +
            '<b>About this test:</b><br>' +
            '• Shows a flat square sheet with corner cuts<br>' +
            '• Click the button to fold/unfold into a box<br>' +
            '• Sheet size: 8×8 units<br>' +
            '• Cut size: 1.33 units<br>' +
            '• Creates an open-top box when folded',
            {
                style: 'font-size: 12px; color: #444; line-height: 1.6; margin-top: 15px;'
            }
        );
    }
    
    console.log('Square cut box fold/unfold test ready!');
}

export function cleanup() {
    if (foldableNet) {
        foldableNet.stop();
        foldableNet = null;
    }
}