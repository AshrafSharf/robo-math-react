/**
 * control-panel-3d.js
 * Module for 3D control panel utilities and interactive controls
 * Part of the modularized common-3d system
 */

import { createVectorView } from './vectors-3d.js';

/**
 * Updates the control panel with MathJax support
 * @param {Object} controlPanel - Control panel object
 */
export function updateControlPanel(controlPanel) {
    // Trigger MathJax rendering for the entire panel
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([controlPanel.element]).catch(err => {
            console.warn('MathJax update error:', err);
        });
    }
}

/**
 * Creates a coordinate display that updates dynamically
 * @param {Object} controlPanel - Control panel object
 * @param {Array} position - [x, y] position in control panel
 * @param {Function} getCoords - Function returning {x, y, z} coordinates
 * @param {String} label - Label for the coordinates
 */
export function createCoordinateDisplay(controlPanel, position, getCoords, label = 'Point') {
    return controlPanel.createText(
        `${label}-coords`,
        `${label}: (0, 0, 0)`,
        position[0],
        position[1]
    );
}

/**
 * Creates interactive slider controls for a vector
 * @param {Object} controlPanel - Control panel object
 * @param {Object} vectorObj - Vector object to modify {x, y, z}
 * @param {Object} options - Configuration options
 * @returns {Object} Object containing slider references for each component
 */
export function createVectorControls(controlPanel, vectorObj, options = {}) {
    const {
        vectorName = 'vector',
        displayName = null,  // If not provided, will use vectorName
        yPosition = 60,
        min = -3,
        max = 3,
        step = 0.1,
        precision = 1,
        labelStyle = 'color: #333; font-weight: bold;',
        onChange = null,
        showValueDisplay = true,  // Whether to show numeric value next to slider
        width = 280  // Width of slider container
    } = options;
    
    const sliders = {};
    const components = ['x', 'y', 'z'];
    const colors = ['#ff0000', '#00aa00', '#0066ff'];  // Red, Green, Blue for x, y, z
    const actualDisplayName = displayName || vectorName;
    
    // Create container for all vector controls
    const container = controlPanel.createGroup(`${vectorName}-controls`, 10, yPosition);
    container.style.width = `${width}px`;
    
    // Create title
    const titleElement = document.createElement('div');
    titleElement.innerHTML = `<span style="${labelStyle}">${actualDisplayName}</span>`;
    titleElement.style.marginBottom = '10px';
    container.appendChild(titleElement);
    
    // Create sliders for each component
    components.forEach((component, index) => {
        const sliderContainer = document.createElement('div');
        sliderContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            gap: 10px;
        `;
        
        // Component label
        const label = document.createElement('span');
        label.style.cssText = `
            color: ${colors[index]};
            font-weight: bold;
            width: 20px;
            text-align: right;
        `;
        label.textContent = component.toUpperCase();
        sliderContainer.appendChild(label);
        
        // Slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = vectorObj[component];
        slider.style.cssText = `
            flex: 1;
            height: 4px;
            outline: none;
            -webkit-appearance: none;
            background: #ddd;
            border-radius: 2px;
        `;
        
        // Style the slider thumb
        const thumbStyle = `
            width: 16px;
            height: 16px;
            background: ${colors[index]};
            border: 2px solid white;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        
        slider.style.cssText += `
            ::-webkit-slider-thumb {
                -webkit-appearance: none;
                ${thumbStyle}
            }
            ::-moz-range-thumb {
                ${thumbStyle}
            }
        `;
        
        sliderContainer.appendChild(slider);
        
        // Value display
        let valueDisplay = null;
        if (showValueDisplay) {
            valueDisplay = document.createElement('span');
            valueDisplay.style.cssText = `
                color: #666;
                font-family: monospace;
                width: 45px;
                text-align: right;
            `;
            valueDisplay.textContent = vectorObj[component].toFixed(precision);
            sliderContainer.appendChild(valueDisplay);
        }
        
        // Event handling
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            vectorObj[component] = value;
            if (valueDisplay) {
                valueDisplay.textContent = value.toFixed(precision);
            }
            
            // Custom change handler
            if (onChange) {
                onChange(vectorObj, component, value);
            }
            
            // Trigger control panel update
            controlPanel.update();
        });
        
        container.appendChild(sliderContainer);
        
        // Store references
        sliders[component] = {
            slider: slider,
            valueDisplay: valueDisplay,
            container: sliderContainer
        };
    });
    
    // Add a method to update all sliders (useful for external updates)
    sliders.update = () => {
        components.forEach(component => {
            sliders[component].slider.value = vectorObj[component];
            if (sliders[component].valueDisplay) {
                sliders[component].valueDisplay.textContent = vectorObj[component].toFixed(precision);
            }
        });
    };
    
    // Add a method to enable/disable controls
    sliders.setEnabled = (enabled) => {
        components.forEach(component => {
            sliders[component].slider.disabled = !enabled;
            sliders[component].container.style.opacity = enabled ? '1' : '0.5';
        });
    };
    
    return sliders;
}

/**
 * Updates vector slider values and displays
 * @param {Object} sliders - Slider object returned by createVectorControls
 * @param {Object} vector - Vector object with {x, y, z} values
 * @param {number} precision - Number of decimal places (default: 1)
 */
export function updateVectorSliders(sliders, vector, precision = 1) {
    if (sliders) {
        ['x', 'y', 'z'].forEach(component => {
            if (sliders[component]) {
                sliders[component].slider.value = vector[component];
                sliders[component].valueDisplay.textContent = vector[component].toFixed(precision);
            }
        });
    }
}

/**
 * Backward compatibility: Creates an interactive vector with both 3D visualization and control sliders
 * @deprecated Use createVectorView with showControls: true instead
 */
export function createInteractiveVector(scene, controlPanel, vectorObj, options = {}) {
    return createVectorView(scene, vectorObj, {
        ...options,
        controlPanel,
        showControls: true
    });
}