// Control Panel Flow Layout System
// HTML-based control panel utilities for flow-based layouts

// Import KaTeX for fast LaTeX rendering
import katex from 'katex';

/**
 * Create an HTML-based control panel with flow layout
 * @param {HTMLElement} container - The container element for the panel
 * @param {Object} config - Configuration options
 * @returns {Object} Panel API with utility methods
 */
export function createControlPanel(container, config = {}) {
    // Clear existing content
    container.innerHTML = '';
    
    // Apply base styles with compact spacing and no scrollbars
    // Preserve existing critical styles
    const existingWidth = container.style.width;
    const existingHeight = container.style.height;
    const existingFloat = container.style.float;
    const existingBoxSizing = container.style.boxSizing;
    
    container.style.cssText = `
        width: ${existingWidth};
        height: ${existingHeight};
        float: ${existingFloat};
        box-sizing: ${existingBoxSizing};
        padding: 8px;
        overflow-y: auto;
        overflow-x: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${config.fontSize || 12}px;
        line-height: 1.3;
        color: #333;
        background: #ffffff;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    `;
    
    // Hide webkit scrollbar
    const styleId = 'control-panel-scrollbar-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #jxgbox-panel::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create sections container
    const sections = new Map();
    
    /**
     * Create a new section in the panel
     * @param {string} id - Section identifier
     * @param {Object} options - Section options
     * @returns {HTMLElement} The section element
     */
    function createSection(id, options = {}) {
        const section = document.createElement('div');
        section.className = 'control-section';
        section.id = `section-${id}`;
        
        section.style.cssText = `
            margin-bottom: ${options.marginBottom || 6}px;
            padding: ${options.padding || '4px'};
            background: ${options.background || 'transparent'};
            border-radius: ${options.borderRadius || '3px'};
            ${options.border ? `border: ${options.border};` : ''}
        `;
        
        // No titles at all
        
        container.appendChild(section);
        sections.set(id, section);
        
        return section;
    }
    
    /**
     * Add a text element with optional dynamic content
     * @param {string} sectionId - Section to add to
     * @param {string|Function} content - Static text or function returning text
     * @param {Object} options - Text options
     * @returns {HTMLElement} The text element
     */
    function addText(sectionId, content, options = {}) {
        const section = sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const element = document.createElement(options.tag || 'div');
        element.className = 'control-text';
        
        element.style.cssText = `
            margin: ${options.margin || '4px 0'};
            font-size: ${options.fontSize || '14px'};
            color: ${options.color || '#333'};
            line-height: 1.4;
            font-family: system-ui, -apple-system, sans-serif;
            ${options.style || ''}
        `;
        
        // Store update function if content is dynamic
        if (typeof content === 'function') {
            element._lastContent = null;
            element._updateContent = () => {
                try {
                    const newContent = content();
                    // Only update if content actually changed
                    if (newContent === element._lastContent) {
                        return;
                    }
                    element._lastContent = newContent;
                    
                    // Safety check for valid content
                    if (typeof newContent === 'string' && !newContent.includes('NaN')) {
                        if (options.useKaTeX) {
                            // For KaTeX content, render synchronously (no flickering!)
                            try {
                                // Handle mathDisplay formatted content
                                if (newContent.includes('<div') || newContent.includes('<span')) {
                                    // Replace all LaTeX expressions in the HTML
                                    let processedContent = newContent;
                                    const latexPattern = /\$([^$]+)\$/g;
                                    processedContent = processedContent.replace(latexPattern, (match, latex) => {
                                        return katex.renderToString(latex, {
                                            displayMode: newContent.includes('block'),
                                            throwOnError: false
                                        });
                                    });
                                    element.innerHTML = processedContent;
                                } else {
                                    // Handle raw LaTeX strings
                                    const latexMatch = newContent.match(/\$([^$]+)\$/);
                                    if (latexMatch) {
                                        element.innerHTML = katex.renderToString(latexMatch[1], {
                                            displayMode: true,
                                            throwOnError: false
                                        });
                                    } else {
                                        element.innerHTML = newContent;
                                    }
                                }
                            } catch (error) {
                                console.warn('KaTeX error:', error);
                                element.innerHTML = newContent;
                            }
                        } else {
                            if (element.innerHTML !== newContent) {
                                element.innerHTML = newContent;
                            }
                        }
                    } else {
                        // Fallback for invalid content
                        element.textContent = 'Loading...';
                    }
                } catch (error) {
                    console.warn('Content update error:', error);
                    element.textContent = 'Error loading content';
                }
            };
            element._updateContent();
        } else {
            if (options.useKaTeX && typeof content === 'string' && !content.includes('NaN')) {
                try {
                    const match = content.match(/>\$([^$]+)\$</);
                    if (match) {
                        const latex = match[1];
                        const rendered = katex.renderToString(latex, {
                            displayMode: content.includes('block'),
                            throwOnError: false
                        });
                        element.innerHTML = content.replace(/>\$[^$]+\$</, `>${rendered}<`);
                    } else {
                        element.innerHTML = content;
                    }
                } catch (error) {
                    element.innerHTML = content;
                }
            } else {
                element.textContent = content;
            }
        }
        
        section.appendChild(element);
        return element;
    }
    
    /**
     * Add a value display with label
     * @param {string} sectionId - Section to add to
     * @param {string} label - Label text
     * @param {Function} valueGetter - Function that returns the value
     * @param {Object} options - Display options
     * @returns {Object} Object with label and value elements
     */
    function addValue(sectionId, label, valueGetter, options = {}) {
        const section = sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const container = document.createElement('div');
        container.className = 'control-value';
        container.style.cssText = `
            display: flex;
            align-items: baseline;
            gap: 8px;
            margin: ${options.margin || '4px 0'};
        `;
        
        const labelEl = document.createElement('span');
        labelEl.className = 'control-label';
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-weight: ${options.labelWeight || '500'};
            color: ${options.labelColor || '#555'};
            min-width: ${options.labelWidth || 'auto'};
        `;
        
        const valueEl = document.createElement('span');
        valueEl.className = 'control-value-text';
        valueEl.style.cssText = `
            color: ${options.valueColor || '#000'};
            font-family: ${options.mono ? 'monospace' : 'inherit'};
        `;
        
        valueEl._lastValue = null;
        valueEl._updateContent = () => {
            const value = valueGetter();
            // Only update if value actually changed
            if (value === valueEl._lastValue) {
                return;
            }
            valueEl._lastValue = value;
            
            if (options.useKaTeX) {
                try {
                    // Handle LaTeX content with KaTeX
                    const latexMatch = value.match(/\$([^$]+)\$/);
                    if (latexMatch) {
                        valueEl.innerHTML = katex.renderToString(latexMatch[1], {
                            displayMode: false,
                            throwOnError: false
                        });
                    } else {
                        valueEl.innerHTML = value;
                    }
                } catch (error) {
                    valueEl.textContent = value;
                }
            } else {
                if (valueEl.textContent !== value) {
                    valueEl.textContent = value;
                }
            }
        };
        valueEl._updateContent();
        
        container.appendChild(labelEl);
        container.appendChild(valueEl);
        section.appendChild(container);
        
        return { container, label: labelEl, value: valueEl };
    }
    
    /**
     * Add a button
     * @param {string} sectionId - Section to add to
     * @param {string} text - Button text
     * @param {Function} onClick - Click handler
     * @param {Object} options - Button options
     * @returns {HTMLElement} The button element
     */
    function addButton(sectionId, text, onClick, options = {}) {
        const section = sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = onClick;
        button.className = 'control-button';
        
        // Set ID if provided
        if (options.id) {
            button.id = options.id;
        }
        
        button.style.cssText = options.style || `
            padding: ${options.padding || '12px 24px'};
            margin: ${options.margin || '10px 0'};
            border: 1px solid #ddd;
            background: #f5f5f5;
            color: #000000;
            border-radius: 6px;
            cursor: pointer;
            font-size: ${options.fontSize || '16px'};
            font-weight: 600;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            width: 100%;
            display: block;
            text-align: center;
            outline: none;
        `;
        
        // Add hover effect
        button.onmouseover = () => {
            button.style.background = '#e8e8e8';
            button.style.borderColor = '#ccc';
            button.style.transform = 'translateY(-1px)';
            button.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.15)';
        };
        button.onmouseout = () => {
            button.style.background = '#f5f5f5';
            button.style.borderColor = '#ddd';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        };
        
        // Add active effect
        button.onmousedown = () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        };
        button.onmouseup = () => {
            if (button.matches(':hover')) {
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.12)';
            }
        };
        
        section.appendChild(button);
        return button;
    }
    
    
    /**
     * Add a divider
     * @param {string} sectionId - Section to add to
     * @param {Object} options - Divider options
     * @returns {HTMLElement} The divider element
     */
    function addDivider(sectionId, options = {}) {
        const section = sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const divider = document.createElement('hr');
        divider.style.cssText = `
            margin: ${options.margin || '12px 0'};
            border: none;
            border-top: ${options.style || 'none'};
        `;
        
        section.appendChild(divider);
        return divider;
    }
    
    /**
     * Update all dynamic content in the panel
     */
    let updateTimer = null;
    function update() {
        // Debounce updates to prevent excessive re-rendering
        if (updateTimer) {
            cancelAnimationFrame(updateTimer);
        }
        
        updateTimer = requestAnimationFrame(() => {
            // Find all elements with update functions
            container.querySelectorAll('[class*="control-"]').forEach(element => {
                if (element._updateContent) {
                    element._updateContent();
                }
            });
            updateTimer = null;
        });
    }
    
    /**
     * Update button text
     * @param {string} sectionId - Section containing the button
     * @param {number} buttonIndex - Index of button in section (0-based)
     * @param {string} newText - New text for the button
     */
    function updateButton(sectionId, buttonIndex, newText) {
        const section = sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const buttons = section.querySelectorAll('button.control-button');
        if (buttonIndex >= 0 && buttonIndex < buttons.length) {
            buttons[buttonIndex].textContent = newText;
        }
    }
    
    /**
     * Clear a section
     * @param {string} sectionId - Section to clear
     */
    function clearSection(sectionId) {
        const section = sections.get(sectionId);
        if (section) {
            section.innerHTML = '';
            // Restore title if it had one
            const title = section.querySelector('h3');
            if (title) {
                section.appendChild(title);
            }
        }
    }
    
    /**
     * Remove a section
     * @param {string} sectionId - Section to remove
     */
    function removeSection(sectionId) {
        const section = sections.get(sectionId);
        if (section) {
            section.remove();
            sections.delete(sectionId);
        }
    }
    
    /**
     * Add a single stepper control with units displayed outside
     * @param {string} sectionId - Section to add to
     * @param {string} label - Label text
     * @param {Object} config - Stepper configuration
     * @returns {Object} Stepper control elements
     */
    function addStepper(sectionId, label, config = {}) {
        const section = sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const container = document.createElement('div');
        container.style.cssText = `
            margin: ${config.margin || '8px 0'};
        `;
        
        if (config.showTitle) {
            const title = document.createElement('div');
            title.style.cssText = `
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                color: #000000;
                margin-bottom: 4px;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            title.textContent = config.title || label;
            container.appendChild(title);
        }
        
        const controlRow = document.createElement('div');
        controlRow.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        `;
        
        let labelEl = null;
        if (label && !config.showTitle) {
            labelEl = document.createElement('label');
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
        valueInput.value = (config.value || 0).toFixed(config.precision || 1);
        valueInput.step = config.step || 0.1;
        valueInput.min = config.min !== undefined ? config.min : -10;
        valueInput.max = config.max !== undefined ? config.max : 10;
        valueInput.style.cssText = `
            width: ${config.width || '60px'};
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
        
        if (config.units) {
            const unitsEl = document.createElement('span');
            unitsEl.style.cssText = `
                font-size: 14px;
                color: #333;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            unitsEl.textContent = config.units;
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
            newValue = Math.max(config.min !== undefined ? config.min : -10, 
                              Math.min(config.max !== undefined ? config.max : 10, newValue));
            valueInput.value = newValue.toFixed(config.precision || 1);
            if (config.onChange) {
                config.onChange(newValue);
            }
        };
        
        minusBtn.onclick = () => {
            const currentValue = parseFloat(valueInput.value);
            updateValue(currentValue - (config.step || 0.1));
        };
        
        plusBtn.onclick = () => {
            const currentValue = parseFloat(valueInput.value);
            updateValue(currentValue + (config.step || 0.1));
        };
        
        valueInput.onchange = () => updateValue(parseFloat(valueInput.value));
        valueInput.oninput = () => updateValue(parseFloat(valueInput.value));
        
        // Add hover effects
        minusBtn.onmouseover = () => minusBtn.style.background = '#e9ecef';
        minusBtn.onmouseout = () => minusBtn.style.background = '#f8f9fa';
        plusBtn.onmouseover = () => plusBtn.style.background = '#e9ecef';
        plusBtn.onmouseout = () => plusBtn.style.background = '#f8f9fa';
        
        container.appendChild(controlRow);
        section.appendChild(container);
        
        return {
            container,
            label: labelEl,
            minusBtn,
            valueInput,
            plusBtn,
            getValue: () => parseFloat(valueInput.value),
            setValue: (val) => {
                valueInput.value = val.toFixed(config.precision || 1);
            }
        };
    }
    
    /**
     * Add stepper controls in a single row
     * @param {string} sectionId - Section to add to
     * @param {Array} steppers - Array of stepper configs [{ label, value, min, max, step, onChange }]
     * @param {Object} options - Container options
     * @returns {Array} Array of stepper elements
     */
    function addSteppers(sectionId, steppers, options = {}) {
        const section = sections.get(sectionId);
        if (!section) throw new Error(`Section ${sectionId} not found`);
        
        const container = document.createElement('div');
        container.className = 'control-steppers';
        container.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
            margin: ${options.margin || '2px 0'};
            flex-wrap: wrap;
        `;
        
        const stepperElements = steppers.map((config, index) => {
            const stepperContainer = document.createElement('div');
            stepperContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                min-width: 70px;
                flex: 1;
            `;
            
            const label = document.createElement('span');
            label.textContent = config.label;
            label.style.cssText = `
                font-weight: 500;
                color: ${config.color || '#333'};
                font-size: 14px;
                margin-bottom: 4px;
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
                width: 24px;
                height: 24px;
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
            valueInput.value = (config.value || 0).toFixed(config.precision || 1);
            valueInput.step = config.step || 0.1;
            valueInput.min = config.min !== undefined ? config.min : -10;
            valueInput.max = config.max !== undefined ? config.max : 10;
            valueInput.style.cssText = `
                width: 60px;
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
            
            // Add style to hide spinner controls for webkit browsers
            const style = document.createElement('style');
            style.textContent = `
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `;
            if (!document.head.querySelector('style[data-stepper-style]')) {
                style.setAttribute('data-stepper-style', 'true');
                document.head.appendChild(style);
            }
            
            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';
            plusBtn.style.cssText = `
                width: 24px;
                height: 24px;
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
                newValue = Math.max(config.min !== undefined ? config.min : -10, 
                                  Math.min(config.max !== undefined ? config.max : 10, newValue));
                valueInput.value = newValue.toFixed(config.precision || 1);
                if (config.onChange) {
                    config.onChange(newValue);
                }
            };
            
            minusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updateValue(currentValue - (config.step || 0.1));
            };
            
            plusBtn.onclick = () => {
                const currentValue = parseFloat(valueInput.value);
                updateValue(currentValue + (config.step || 0.1));
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
            
            stepperContainer.appendChild(label);
            stepperContainer.appendChild(stepperRow);
            container.appendChild(stepperContainer);
            
            return {
                container: stepperContainer,
                label,
                valueInput,
                minusBtn,
                plusBtn
            };
        });
        
        section.appendChild(container);
        return stepperElements;
    }

    // Return panel API
    return {
        container,
        createSection,
        addText,
        addValue,
        addButton,
        addStepper,
        addSteppers,
        addDivider,
        update,
        updateButton,
        clearSection,
        removeSection,
        sections
    };
}


/**
 * Helper to create formatted mathematical displays
 * @param {string} expression - Mathematical expression
 * @param {Object} options - Display options
 * @returns {string} Formatted HTML string
 */
export function mathDisplay(expression, options = {}) {
    // KaTeX is imported at the top of this file, so it's always available
    const rendered = katex.renderToString(expression, {
        displayMode: options.block || false,
        throwOnError: false
    });
    
    if (options.block) {
        return `<div style="text-align: ${options.align || 'center'}; margin: ${options.margin || '3px 0'}; font-size: ${options.fontSize || '16px'};">${rendered}</div>`;
    }
    return `<span style="font-size: ${options.fontSize || '16px'};">${rendered}</span>`;
}