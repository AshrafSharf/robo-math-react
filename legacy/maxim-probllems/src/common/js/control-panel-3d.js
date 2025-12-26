// 3D Control Panel Flow Layout System
// HTML-based control panel utilities specifically for Three.js 3D lessons

import * as THREE from 'three';
import katex from 'katex';

/**
 * FlowControlPanel class for 3D lessons
 * Provides an HTML-based control panel with flow layout specifically for Three.js
 */
export class FlowControlPanel {
    constructor(container, config = {}) {
        this.container = container;
        this.config = config;
        this.sections = new Map();
        this.vectorSteppers = new Map();
        
        this._initializePanel();
    }
    
    _initializePanel() {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Preserve important layout properties
        const preservedWidth = this.container.style.width;
        const preservedFloat = this.container.style.float;
        const preservedHeight = this.container.style.height;
        
        // Apply base styles for 3D lessons with compact spacing and no scrollbars
        this.container.style.cssText = `
            padding: 4px;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${this.config.fontSize || 12}px;
            line-height: 1.3;
            color: #000000;
            background: ${this.config.background || '#ffffff'};
            border: none;
            width: ${preservedWidth};
            float: ${preservedFloat};
            height: ${preservedHeight};
        `;
        
        // Add global styles for KaTeX and number inputs
        if (!document.head.querySelector('style[data-control-panel-style]')) {
            const style = document.createElement('style');
            style.setAttribute('data-control-panel-style', 'true');
            style.textContent = `
                /* Hide number input spinners */
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                
                /* Force all KaTeX to be black */
                #panel-board .katex,
                #panel-board .katex * {
                    color: #000000 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    
    /**
     * Create a new section in the panel
     * @param {string} id - Section identifier
     * @param {Object} options - Section options
     * @returns {HTMLElement} The section element
     */
    createSection(id, options = {}) {
        const section = document.createElement('div');
        section.className = 'control-section-3d';
        section.id = `section-${id}`;
        
        section.style.cssText = `
            margin-bottom: ${options.marginBottom || 2}px;
            padding: ${options.padding || '6px'};
            background: ${options.background || '#fff'};
            border-radius: ${options.borderRadius || '4px'};
            border: ${options.border || 'none'};
            box-shadow: none;
        `;
        
        // No titles at all
        
        this.container.appendChild(section);
        this.sections.set(id, section);
        
        return section;
    }
    
    /**
     * Create a compact separator between sections
     */
    createSeparator() {
        const separator = document.createElement('div');
        separator.style.cssText = `
            height: 1px;
            background: linear-gradient(to right, transparent, #ddd, transparent);
            margin: 2px 0;
        `;
        this.container.appendChild(separator);
        return separator;
    }
    
    /**
     * Create generic control steppers for any object with numeric properties
     * @param {string} id - Control identifier
     * @param {Object} obj - Object with numeric properties
     * @param {Object} options - Control options including:
     *   - components: Array of {key, label, min, max, step, precision} objects
     *   - updateCallback: Function to call when values change
     * @returns {Object} Stepper controls
     */
    createGenericControls(id, obj, options = {}) {
        const section = document.createElement('div');
        section.className = 'generic-controls-3d';
        section.style.cssText = `
            margin-bottom: 2px;
            padding: 2px;
            background: #ffffff;
            border-radius: 4px;
            border: none;
        `;
        
        // Create horizontal container for all components
        const horizontalContainer = document.createElement('div');
        horizontalContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 5px;
            flex-wrap: nowrap;
            padding: 0;
        `;
        
        const steppers = {};
        const components = options.components || [];
        
        components.forEach((comp) => {
            const stepperContainer = document.createElement('div');
            stepperContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1px;
                flex: 1;
                max-width: 100px;
            `;
            
            const label = document.createElement('span');
            label.textContent = comp.label;
            label.style.cssText = `
                font-weight: 500;
                color: #333;
                font-size: 14px;
                margin: 0 0 4px 0;
                line-height: 1.2;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            
            // Create stepper with plus/minus buttons
            const stepperRow = document.createElement('div');
            stepperRow.style.cssText = `
                display: flex;
                align-items: center;
                gap: 2px;
            `;
            
            const minusBtn = document.createElement('button');
            minusBtn.textContent = '−';
            minusBtn.style.cssText = `
                width: 20px;
                height: 20px;
                border: 1px solid #ccc;
                background: #f8f9fa;
                border-radius: 4px 0 0 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: normal;
                color: #333;
                padding: 0;
                line-height: 1;
                transition: background-color 0.2s;
            `;
            
            const valueInput = document.createElement('input');
            valueInput.type = 'number';
            const precision = comp.precision !== undefined ? comp.precision : 1;
            // Round the initial value to avoid floating-point display issues
            const roundedInitialValue = parseFloat(obj[comp.key].toFixed(precision));
            obj[comp.key] = roundedInitialValue; // Update the object with rounded value
            valueInput.value = roundedInitialValue.toFixed(precision);
            valueInput.step = comp.step || 0.1;
            valueInput.min = comp.min !== undefined ? comp.min : -10;
            valueInput.max = comp.max !== undefined ? comp.max : 10;
            valueInput.style.cssText = `
                width: 40px;
                height: 18px;
                padding: 1px;
                border: 1px solid #ccc;
                border-left: none;
                border-right: none;
                text-align: center;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                background: #fff;
                font-weight: normal;
                color: #333;
                -moz-appearance: textfield;
                -webkit-appearance: none;
                appearance: none;
            `;
            
            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';
            plusBtn.style.cssText = `
                width: 20px;
                height: 20px;
                border: 1px solid #ccc;
                background: #f8f9fa;
                border-radius: 0 4px 4px 0;
                cursor: pointer;
                font-size: 16px;
                font-weight: normal;
                color: #333;
                padding: 0;
                line-height: 1;
                transition: background-color 0.2s;
            `;
            
            // Event handlers
            const updateValue = (newValue) => {
                newValue = Math.max(comp.min !== undefined ? comp.min : -10, 
                                  Math.min(comp.max !== undefined ? comp.max : 10, newValue));
                // Round to the specified precision to avoid floating-point errors
                const roundedValue = parseFloat(newValue.toFixed(precision));
                valueInput.value = roundedValue.toFixed(precision);
                obj[comp.key] = roundedValue;
                if (options.updateCallback) {
                    options.updateCallback();
                }
            };
            
            minusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updateValue(currentValue - (comp.step || 0.1));
            };
            
            plusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updateValue(currentValue + (comp.step || 0.1));
            };
            
            valueInput.onchange = () => updateValue(parseFloat(valueInput.value));
            valueInput.oninput = () => updateValue(parseFloat(valueInput.value));
            
            // Add hover effects
            minusBtn.onmouseover = () => minusBtn.style.background = '#e9ecef';
            minusBtn.onmouseout = () => minusBtn.style.background = '#f8f9fa';
            plusBtn.onmouseover = () => plusBtn.style.background = '#e9ecef';
            plusBtn.onmouseout = () => plusBtn.style.background = '#f8f9fa';
            
            stepperRow.appendChild(minusBtn);
            stepperRow.appendChild(valueInput);
            stepperRow.appendChild(plusBtn);
            
            // Assemble the component: label above, stepper below
            stepperContainer.appendChild(label);
            stepperContainer.appendChild(stepperRow);
            
            // Add to horizontal container
            horizontalContainer.appendChild(stepperContainer);
            
            steppers[comp.key] = {
                container: stepperContainer,
                label,
                valueInput,
                minusBtn,
                plusBtn
            };
        });
        
        // Add horizontal container to section
        section.appendChild(horizontalContainer);
        this.container.appendChild(section);
        this.vectorSteppers.set(id, steppers);
        
        return steppers;
    }
    
    /**
     * Create vector control steppers for 3D vectors
     * @param {string} id - Control identifier
     * @param {Object} vector - Vector object with x, y, z components
     * @param {Object} options - Control options
     * @returns {Object} Stepper controls
     */
    createVectorControls(id, vector, options = {}) {
        const section = document.createElement('div');
        section.className = 'vector-controls-3d';
        section.style.cssText = `
            margin-bottom: 2px;
            padding: 2px;
            background: #ffffff;
            border-radius: 4px;
            border: none;
        `;
        
        // No titles at all
        
        // Create horizontal container for all components
        const horizontalContainer = document.createElement('div');
        horizontalContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 5px;
            flex-wrap: nowrap;
            padding: 0;
        `;
        
        const steppers = {};
        const components = ['x', 'y', 'z'];
        
        components.forEach((component, index) => {
            const stepperContainer = document.createElement('div');
            stepperContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1px;
                flex: 1;
                max-width: 100px;
            `;
            
            const label = document.createElement('span');
            label.textContent = component.toUpperCase();
            label.style.cssText = `
                font-weight: 500;
                color: #333;
                font-size: 14px;
                margin: 0 0 4px 0;
                line-height: 1.2;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            
            // Create stepper with plus/minus buttons
            const stepperRow = document.createElement('div');
            stepperRow.style.cssText = `
                display: flex;
                align-items: center;
                gap: 2px;
            `;
            
            const minusBtn = document.createElement('button');
            minusBtn.textContent = '−';
            minusBtn.style.cssText = `
                width: 20px;
                height: 20px;
                border: 1px solid #ccc;
                background: #f8f9fa;
                border-radius: 4px 0 0 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: normal;
                color: #333;
                padding: 0;
                line-height: 1;
                transition: background-color 0.2s;
            `;
            
            const valueInput = document.createElement('input');
            valueInput.type = 'number';
            const precision = options.precision !== undefined ? options.precision : 1;
            // Round the initial value to avoid floating-point display issues
            const roundedInitialValue = parseFloat(vector[component].toFixed(precision));
            vector[component] = roundedInitialValue; // Update the vector with rounded value
            valueInput.value = roundedInitialValue.toFixed(precision);
            valueInput.step = options.step || 0.1;
            valueInput.min = options.min !== undefined ? options.min : -10;
            valueInput.max = options.max !== undefined ? options.max : 10;
            valueInput.style.cssText = `
                width: 40px;
                height: 18px;
                padding: 1px;
                border: 1px solid #ccc;
                border-left: none;
                border-right: none;
                text-align: center;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                background: #fff;
                font-weight: normal;
                color: #333;
                -moz-appearance: textfield;
                -webkit-appearance: none;
                appearance: none;
            `;
            
            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';
            plusBtn.style.cssText = `
                width: 20px;
                height: 20px;
                border: 1px solid #ccc;
                background: #f8f9fa;
                border-radius: 0 4px 4px 0;
                cursor: pointer;
                font-size: 16px;
                font-weight: normal;
                color: #333;
                padding: 0;
                line-height: 1;
                transition: background-color 0.2s;
            `;
            
            // Event handlers
            const updateVector = (newValue) => {
                newValue = Math.max(options.min !== undefined ? options.min : -10, 
                                  Math.min(options.max !== undefined ? options.max : 10, newValue));
                // Round to the specified precision to avoid floating-point errors
                const precision = options.precision !== undefined ? options.precision : 1;
                const roundedValue = parseFloat(newValue.toFixed(precision));
                valueInput.value = roundedValue.toFixed(precision);
                vector[component] = roundedValue;
                if (options.updateCallback) {
                    options.updateCallback();
                }
            };
            
            minusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updateVector(currentValue - (options.step || 0.1));
            };
            
            plusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updateVector(currentValue + (options.step || 0.1));
            };
            
            valueInput.onchange = () => updateVector(parseFloat(valueInput.value));
            valueInput.oninput = () => updateVector(parseFloat(valueInput.value));
            
            // Add hover effects
            minusBtn.onmouseover = () => minusBtn.style.background = '#e9ecef';
            minusBtn.onmouseout = () => minusBtn.style.background = '#f8f9fa';
            plusBtn.onmouseover = () => plusBtn.style.background = '#e9ecef';
            plusBtn.onmouseout = () => plusBtn.style.background = '#f8f9fa';
            
            stepperRow.appendChild(minusBtn);
            stepperRow.appendChild(valueInput);
            stepperRow.appendChild(plusBtn);
            
            // Assemble the component: label above, stepper below
            stepperContainer.appendChild(label);
            stepperContainer.appendChild(stepperRow);
            
            // Add to horizontal container
            horizontalContainer.appendChild(stepperContainer);
            
            steppers[component] = {
                container: stepperContainer,
                label,
                valueInput,
                minusBtn,
                plusBtn
            };
        });
        
        // Add horizontal container to section
        section.appendChild(horizontalContainer);
        this.container.appendChild(section);
        this.vectorSteppers.set(id, steppers);
        
        return steppers;
    }
    
    /**
     * Create point control steppers for 3D points (same as vector controls but with different styling)
     * @param {string} id - Control identifier
     * @param {Object} point - Point object with x, y, z components
     * @param {Object} options - Control options
     * @returns {Object} Stepper controls
     */
    createPointControls(id, point, options = {}) {
        return this.createVectorControls(id, point, {
            ...options,
            title: options.title || 'Point'
        });
    }

    /**
     * Create plane control steppers for plane equation ax + by + cz = d
     * @param {string} id - Control identifier
     * @param {Object} plane - Plane object with a, b, c, d coefficients
     * @param {Object} options - Control options
     * @returns {Object} Stepper controls
     */
    createPlaneControls(id, plane, options = {}) {
        const section = document.createElement('div');
        section.className = 'plane-controls-3d';
        section.style.cssText = `
            margin-bottom: 2px;
            padding: 2px;
            background: #ffffff;
            border-radius: 4px;
            border: none;
        `;
        
        // No titles at all
        
        // Create horizontal container for all coefficients
        const horizontalContainer = document.createElement('div');
        horizontalContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 3px;
            flex-wrap: nowrap;
            padding: 0 2px;
        `;
        
        const steppers = {};
        const components = ['a', 'b', 'c', 'd'];
        const labels = ['A', 'B', 'C', 'D'];
        
        components.forEach((component, index) => {
            const stepperContainer = document.createElement('div');
            stepperContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 1px;
                flex: 1;
                max-width: 85px;
            `;
            
            const label = document.createElement('span');
            label.textContent = labels[index];
            label.style.cssText = `
                font-weight: 500;
                color: #333;
                font-size: 14px;
                margin: 0 0 4px 0;
                line-height: 1.2;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            
            // Create stepper with plus/minus buttons
            const stepperRow = document.createElement('div');
            stepperRow.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0;
                width: 100%;
            `;
            
            const minusBtn = document.createElement('button');
            minusBtn.textContent = '−';
            minusBtn.style.cssText = `
                width: 20px;
                height: 20px;
                border: 1px solid #ccc;
                background: #f8f9fa;
                border-radius: 4px 0 0 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: normal;
                color: #333;
                padding: 0;
                line-height: 1;
                transition: background-color 0.2s;
            `;
            
            const valueInput = document.createElement('input');
            valueInput.type = 'number';
            valueInput.value = plane[component].toFixed(options.precision || 1);
            valueInput.step = options.step || 0.1;
            valueInput.min = options.min !== undefined ? options.min : -10;
            valueInput.max = options.max !== undefined ? options.max : 10;
            valueInput.style.cssText = `
                flex: 1;
                min-width: 60px;
                height: 18px;
                padding: 1px;
                border: 1px solid #ccc;
                border-left: none;
                border-right: none;
                text-align: center;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                background: #fff;
                font-weight: normal;
                color: #333;
                -moz-appearance: textfield;
                -webkit-appearance: none;
                appearance: none;
            `;
            
            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';
            plusBtn.style.cssText = `
                width: 20px;
                height: 20px;
                border: 1px solid #ccc;
                background: #f8f9fa;
                border-radius: 0 4px 4px 0;
                cursor: pointer;
                font-size: 16px;
                font-weight: normal;
                color: #333;
                padding: 0;
                line-height: 1;
                transition: background-color 0.2s;
            `;
            
            // Event handlers
            const updatePlane = (newValue) => {
                newValue = Math.max(options.min !== undefined ? options.min : -10, 
                                  Math.min(options.max !== undefined ? options.max : 10, newValue));
                valueInput.value = newValue.toFixed(options.precision || 1);
                plane[component] = newValue;
                if (options.updateCallback) {
                    options.updateCallback();
                }
            };
            
            minusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updatePlane(currentValue - (options.step || 0.1));
            };
            
            plusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updatePlane(currentValue + (options.step || 0.1));
            };
            
            valueInput.onchange = () => updatePlane(parseFloat(valueInput.value));
            valueInput.oninput = () => updatePlane(parseFloat(valueInput.value));
            
            // Add hover effects
            minusBtn.onmouseover = () => minusBtn.style.background = '#e9ecef';
            minusBtn.onmouseout = () => minusBtn.style.background = '#f8f9fa';
            plusBtn.onmouseover = () => plusBtn.style.background = '#e9ecef';
            plusBtn.onmouseout = () => plusBtn.style.background = '#f8f9fa';
            
            stepperRow.appendChild(minusBtn);
            stepperRow.appendChild(valueInput);
            stepperRow.appendChild(plusBtn);
            
            // Assemble the component: label above, stepper below
            stepperContainer.appendChild(label);
            stepperContainer.appendChild(stepperRow);
            
            // Add to horizontal container
            horizontalContainer.appendChild(stepperContainer);
            
            steppers[component] = {
                container: stepperContainer,
                label,
                valueInput,
                minusBtn,
                plusBtn
            };
        });
        
        // Add horizontal container to section
        section.appendChild(horizontalContainer);
        this.container.appendChild(section);
        this.vectorSteppers.set(id, steppers);
        
        return steppers;
    }
    
    /**
     * Create a single stepper control with units displayed outside
     * @param {string} id - Control identifier
     * @param {string} label - Label text
     * @param {number} value - Initial value
     * @param {string} units - Units text (displayed outside stepper)
     * @param {Object} options - Control options
     * @returns {Object} Stepper control elements
     */
    createStepperWithUnits(id, label, value, units, options = {}) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin: ${options.margin || '8px 0'};
        `;
        
        if (options.showTitle !== false && (label || options.title)) {
            const title = document.createElement('div');
            title.style.cssText = `
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                color: #000000;
                margin-bottom: 4px;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            title.textContent = options.title || label;
            container.appendChild(title);
        }
        
        const controlRow = document.createElement('div');
        controlRow.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        `;
        
        if (label && !options.showTitle) {
            const labelEl = document.createElement('label');
            labelEl.style.cssText = `
                font-size: 14px;
                color: #333;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            labelEl.textContent = label + ':';
            controlRow.appendChild(labelEl);
        }
        
        const minusBtn = document.createElement('button');
        minusBtn.textContent = '−';
        minusBtn.style.cssText = `
            width: 24px;
            height: 24px;
            border: 1px solid #ccc;
            background: #f8f9fa;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: normal;
            color: #333;
            padding: 0;
            line-height: 1;
            transition: background-color 0.2s;
        `;
        
        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.value = value.toFixed(options.precision || 1);
        valueInput.step = options.step || 0.1;
        valueInput.min = options.min !== undefined ? options.min : -10;
        valueInput.max = options.max !== undefined ? options.max : 10;
        valueInput.style.cssText = `
            width: ${options.width || '60px'};
            height: 18px;
            padding: 1px;
            border: 1px solid #ccc;
            text-align: center;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            background: #fff;
            font-weight: normal;
            color: #333;
            -moz-appearance: textfield;
            -webkit-appearance: none;
            appearance: none;
        `;
        
        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.style.cssText = `
            width: 24px;
            height: 24px;
            border: 1px solid #ccc;
            background: #f8f9fa;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: normal;
            color: #333;
            padding: 0;
            line-height: 1;
            transition: background-color 0.2s;
        `;
        
        if (units) {
            const unitsEl = document.createElement('span');
            unitsEl.style.cssText = `
                font-size: 14px;
                color: #333;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            unitsEl.textContent = units;
            controlRow.appendChild(minusBtn);
            controlRow.appendChild(valueInput);
            controlRow.appendChild(plusBtn);
            controlRow.appendChild(unitsEl);
        } else {
            controlRow.appendChild(minusBtn);
            controlRow.appendChild(valueInput);
            controlRow.appendChild(plusBtn);
        }
        
        // Event handlers
        const updateValue = (newValue) => {
            newValue = Math.max(options.min !== undefined ? options.min : -10, 
                              Math.min(options.max !== undefined ? options.max : 10, newValue));
            valueInput.value = newValue.toFixed(options.precision || 1);
            if (options.onChange) {
                options.onChange(newValue);
            }
        };
        
        minusBtn.onclick = () => {
            const currentValue = parseFloat(valueInput.value);
            updateValue(currentValue - (options.step || 0.1));
        };
        
        plusBtn.onclick = () => {
            const currentValue = parseFloat(valueInput.value);
            updateValue(currentValue + (options.step || 0.1));
        };
        
        valueInput.onchange = () => updateValue(parseFloat(valueInput.value));
        valueInput.oninput = () => updateValue(parseFloat(valueInput.value));
        
        // Add hover effects
        minusBtn.onmouseover = () => minusBtn.style.background = '#e9ecef';
        minusBtn.onmouseout = () => minusBtn.style.background = '#f8f9fa';
        plusBtn.onmouseover = () => plusBtn.style.background = '#e9ecef';
        plusBtn.onmouseout = () => plusBtn.style.background = '#f8f9fa';
        
        container.appendChild(controlRow);
        this.container.appendChild(container);
        
        return {
            container,
            minusBtn,
            valueInput,
            plusBtn,
            getValue: () => parseFloat(valueInput.value),
            setValue: (val) => {
                valueInput.value = val.toFixed(options.precision || 1);
            }
        };
    }
    
    /**
     * Create a text element with ID for later updates
     * @param {string} id - Text element identifier
     * @param {string} content - Initial content
     * @param {Object} options - Text options
     */
    createText(id, content, options = {}) {
        const element = document.createElement('div');
        element.id = `text-${id}`;
        element.className = 'control-text-3d';
        element.style.cssText = `
            margin: ${options.margin || '4px 0'};
            padding: ${options.padding || '4px 0'};
            font-size: ${options.fontSize || '14px'};
            color: ${options.color || '#333'};
            line-height: 1.4;
            font-family: system-ui, -apple-system, sans-serif;
            ${options.style || ''}
        `;
        
        // Just set the content directly - no processing needed
        if (content) {
            element.innerHTML = content;
        }
        
        this.container.appendChild(element);
        return element;
    }
    
    /**
     * Update text content by ID
     * @param {string} id - Text element identifier
     * @param {string} content - New content
     */
    updateText(id, content) {
        const element = document.getElementById(`text-${id}`);
        if (element) {
            element.innerHTML = content;
        }
    }
    
    /**
     * Create a button element
     * @param {string} id - Button identifier
     * @param {string} text - Button text
     * @param {Function} onClick - Click handler
     * @param {Object} options - Button options
     */
    /**
     * Create a checkbox control
     * @param {string} id - Checkbox identifier
     * @param {string} label - Checkbox label
     * @param {boolean} checked - Initial checked state
     * @param {Function} onChange - Change handler
     * @param {Object} options - Checkbox options
     * @returns {HTMLInputElement} The checkbox element
     */
    createCheckbox(id, label, checked = true, onChange, options = {}) {
        const container = document.createElement('label');
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            color: #000;
            font-weight: 500;
            margin: ${options.margin || '4px 0'};
        `;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox-${id}`;
        checkbox.checked = checked;
        checkbox.style.cssText = `
            width: 22px;
            height: 22px;
            cursor: pointer;
            margin: 0;
        `;
        
        if (onChange) {
            checkbox.onchange = (e) => onChange(e.target.checked);
        }
        
        container.appendChild(checkbox);
        
        if (label) {
            const labelSpan = document.createElement('span');
            labelSpan.textContent = label;
            labelSpan.style.cssText = 'font-size: 16px; font-weight: 600;';
            container.appendChild(labelSpan);
        }
        
        this.container.appendChild(container);
        return checkbox;
    }
    
    /**
     * Create a control row with reset button and checkboxes
     * @param {Object} config - Configuration object
     * @returns {Object} Object containing references to all controls
     */
    createControlRow(config = {}) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin: ${config.margin || '6px 0'};
            flex-wrap: nowrap;
        `;
        
        const controls = {};
        
        // Add reset button if configured
        if (config.resetButton) {
            const resetBtn = document.createElement('button');
            resetBtn.textContent = config.resetButton.text || 'Reset';
            resetBtn.style.cssText = `
                padding: 8px 24px;
                font-size: 14px;
                background-color: #f0f0f0;
                border: 1px solid #ccc;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
                font-weight: 500;
            `;
            resetBtn.onmouseover = () => resetBtn.style.backgroundColor = '#e0e0e0';
            resetBtn.onmouseout = () => resetBtn.style.backgroundColor = '#f0f0f0';
            resetBtn.onclick = config.resetButton.onClick;
            container.appendChild(resetBtn);
            controls.resetButton = resetBtn;
        }
        
        // Add checkboxes if configured
        if (config.checkboxes) {
            config.checkboxes.forEach((checkboxConfig, index) => {
                const checkContainer = document.createElement('label');
                checkContainer.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #000;
                    font-weight: 500;
                `;
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = checkboxConfig.checked !== false;
                checkbox.style.cssText = `
                    width: 22px;
                    height: 22px;
                    cursor: pointer;
                    margin: 0;
                `;
                checkbox.onchange = (e) => {
                    if (checkboxConfig.onChange) {
                        checkboxConfig.onChange(e.target.checked);
                    }
                };
                
                checkContainer.appendChild(checkbox);
                
                if (checkboxConfig.label) {
                    const labelSpan = document.createElement('span');
                    labelSpan.textContent = checkboxConfig.label;
                    labelSpan.style.cssText = 'font-size: 16px; font-weight: 600;';
                    checkContainer.appendChild(labelSpan);
                }
                
                container.appendChild(checkContainer);
                controls[`checkbox${index + 1}`] = checkbox;
            });
        }
        
        this.container.appendChild(container);
        return controls;
    }

    createButton(id, text, onClick, options = {}) {
        const button = document.createElement('button');
        button.id = `button-${id}`;
        button.className = 'control-button-3d';
        button.textContent = text;
        button.style.cssText = options.style || `
            margin: 8px auto;
            display: block;
            padding: 8px 16px;
            background: #4dabf7;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-family: system-ui, -apple-system, sans-serif;
            transition: background-color 0.2s;
        `;
        
        if (onClick) {
            button.onclick = onClick;
        }
        
        // Add hover effect if not disabled
        if (!options.disabled) {
            button.onmouseover = () => {
                if (!button.disabled) {
                    button.style.opacity = '0.9';
                }
            };
            button.onmouseout = () => {
                button.style.opacity = '1';
            };
        }
        
        this.container.appendChild(button);
        return button;
    }
    
    /**
     * Update button properties by ID
     * @param {string} id - Button identifier
     * @param {string} text - New button text
     * @param {Function} onClick - New click handler
     * @param {Object} options - Button options
     */
    updateButton(id, text, onClick, options = {}) {
        const button = document.getElementById(`button-${id}`);
        if (button) {
            if (text !== undefined) button.textContent = text;
            if (onClick !== undefined) button.onclick = onClick;
            if (options.style) button.style.cssText = options.style;
            if (options.disabled !== undefined) button.disabled = options.disabled;
        }
    }
    
    /**
     * Add a Three.js mini scene to the control panel
     * @param {string} sectionId - Section to add to
     * @param {Object} options - Scene options
     * @returns {Object} Three.js scene components
     */
    addMiniScene(sectionId, options = {}) {
        const section = this.sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const sceneContainer = document.createElement('div');
        sceneContainer.className = 'control-mini-scene';
        sceneContainer.style.cssText = `
            width: ${options.width || '100%'};
            height: ${options.height || '150px'};
            margin: ${options.margin || '8px 0'};
            border: none;
            border-radius: 4px;
            overflow: hidden;
            background: #ffffff;
        `;
        
        section.appendChild(sceneContainer);
        
        // Create Three.js components
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            options.fov || 45,
            sceneContainer.offsetWidth / sceneContainer.offsetHeight,
            options.near || 0.1,
            options.far || 1000
        );
        
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(sceneContainer.offsetWidth, sceneContainer.offsetHeight);
        renderer.setClearColor(options.backgroundColor || 0xffffff);
        
        sceneContainer.appendChild(renderer.domElement);
        
        // Set default camera position
        camera.position.set(
            options.cameraPosition?.x || 5,
            options.cameraPosition?.y || 5,
            options.cameraPosition?.z || 5
        );
        camera.lookAt(0, 0, 0);
        
        return {
            container: sceneContainer,
            scene,
            camera,
            renderer,
            render: () => renderer.render(scene, camera)
        };
    }
    
    /**
     * Get vector stepper controls by ID
     * @param {string} id - Vector control identifier
     * @returns {Object} Stepper controls
     */
    getVectorSteppers(id) {
        return this.vectorSteppers.get(id);
    }
    
    /**
     * Update all math content in the panel (deprecated - no longer needed with KaTeX)
     */
    updateMath() {
        // Deprecated - KaTeX renders synchronously, no update needed
    }
    
    /**
     * Clear the entire panel
     */
    clear() {
        this.container.innerHTML = '';
        this.sections.clear();
        this.vectorSteppers.clear();
    }
}

/**
 * Helper function for 3D mathematical displays with compact spacing
 * @param {string} expression - Mathematical expression  
 * @param {Object} options - Display options
 * @returns {string} Formatted HTML string
 */
export function mathDisplay3D(expression, options = {}) {
    try {
        const rendered = katex.renderToString(expression, {
            displayMode: options.block || false,
            throwOnError: false,
            output: 'html'  // Force HTML output only, no MathML
        });
        
        if (options.block) {
            return `<div style="text-align: ${options.align || 'left'}; margin: ${options.margin || '0'}; padding: ${options.padding || '0'}; background: ${options.background || 'transparent'}; font-size: ${options.fontSize || '16px'}; line-height: 1.2;">${rendered}</div>`;
        }
        return `<span style="font-size: ${options.fontSize || '16px'};">${rendered}</span>`;
    } catch (error) {
        // Fallback to raw LaTeX if KaTeX fails
        if (options.block) {
            return `<div style="text-align: ${options.align || 'left'}; margin: ${options.margin || '0'}; padding: ${options.padding || '0'}; background: ${options.background || 'transparent'}; font-size: ${options.fontSize || '16px'};">$${expression}$</div>`;
        }
        return `<span style="font-size: ${options.fontSize || '16px'};">$${expression}$</span>`;
    }
}

// Note: Use Three.js methods directly in your lessons:
// - new THREE.Vector3(x, y, z).angleTo(otherVector) * THREE.MathUtils.RAD2DEG for angles
// - new THREE.Vector3().crossVectors(vecA, vecB) for cross product  
// - new THREE.Vector3(x, y, z).length() for magnitude
// - vector.normalize() for normalization