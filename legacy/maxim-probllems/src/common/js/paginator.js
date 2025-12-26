/**
 * paginator.js
 * Paginator control bar for sequencing animations
 */

import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { animateByMethod } from '../animator/mesh_type_animation_map.js';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Register GSAP TextPlugin
gsap.registerPlugin(TextPlugin);

export class Paginator {
    constructor(objects, descriptions = {}, onStepChange = null) {
        this.objects = objects;
        this.descriptions = descriptions; // Object descriptions for typewriter text
        this.onStepChange = onStepChange; // Callback for step changes
        this.currentIndex = -2; // -2 means not started, -1 means started but nothing shown yet
        this.currentStepName = ''; // Track current step name
        this.container = null;
        this.buttons = {};
        this.textDisplay = null;
        this.currentTypewriter = null; // Track current typewriter animation
        this.isDragging = false; // Track dragging state
        this.dragOffset = { x: 0, y: 0 }; // Track drag offset
        this.createPaginator();
        this.updateButtonStates();
        this.setupDraggable(); // Setup drag functionality
        
        // Display title if provided
        if (descriptions.title) {
            this.updateText(descriptions.title, false);
        }
    }
    
    createPaginator() {
        // Create container
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.85);
            padding: 10px 24px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
            cursor: move;
            user-select: none;
        `;
        
        // Create text display area (80% of width)
        this.textDisplay = document.createElement('div');
        this.textDisplay.style.cssText = `
            flex: 1;
            color: #ffffff;
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 15px;
            font-weight: 400;
            line-height: 1.6;
            min-height: 28px;
            max-height: 60px;
            padding-right: 20px;
            overflow-y: auto;
            overflow-x: hidden;
            white-space: normal;
            display: flex;
            align-items: center;
            letter-spacing: 0.3px;
        `;
        this.textDisplay.innerHTML = '';
        
        // Create button container (20% of width)
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            flex-shrink: 0;
        `;
        
        // Button style (increased size)
        const baseButtonStyle = `
            padding: 8px 16px;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.5px;
            transition: all 0.15s ease;
            min-width: 80px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transform: translateY(0);
            user-select: none;
            position: relative;
        `;
        
        // Start/Stop toggle button (green/red)
        this.buttons.toggle = document.createElement('button');
        this.buttons.toggle.textContent = 'Start';
        this.buttons.toggle.style.cssText = baseButtonStyle + 'background: #2a9d2a;';
        this.buttons.toggle.onclick = () => this.handleToggle();
        
        // Add push effect on click
        this.buttons.toggle.onmousedown = () => {
            this.buttons.toggle.style.transform = 'translateY(2px)';
            this.buttons.toggle.style.boxShadow = '0 2px 3px rgba(0, 0, 0, 0.3)';
        };
        this.buttons.toggle.onmouseup = () => {
            this.buttons.toggle.style.transform = 'translateY(0)';
            this.buttons.toggle.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
        };
        this.buttons.toggle.onmouseleave = () => {
            this.buttons.toggle.style.transform = 'translateY(0)';
            this.buttons.toggle.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
        };
        
        // Next button (blue) - initially disabled
        this.buttons.next = document.createElement('button');
        this.buttons.next.textContent = 'Next';
        this.buttons.next.style.cssText = baseButtonStyle + 'background: #222; color: #666; cursor: not-allowed;';
        this.buttons.next.disabled = true;
        this.buttons.next.onclick = () => this.handleNext();
        
        // Add push effect on click (when enabled)
        this.buttons.next.onmousedown = () => {
            if (!this.buttons.next.disabled) {
                this.buttons.next.style.transform = 'translateY(2px)';
                this.buttons.next.style.boxShadow = '0 2px 3px rgba(0, 0, 0, 0.3)';
            }
        };
        this.buttons.next.onmouseup = () => {
            if (!this.buttons.next.disabled) {
                this.buttons.next.style.transform = 'translateY(0)';
                this.buttons.next.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }
        };
        this.buttons.next.onmouseleave = () => {
            if (!this.buttons.next.disabled) {
                this.buttons.next.style.transform = 'translateY(0)';
                this.buttons.next.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            }
        };
        
        // Add buttons to button container
        buttonContainer.appendChild(this.buttons.toggle);
        buttonContainer.appendChild(this.buttons.next);
        
        // Add text display and button container to main container
        this.container.appendChild(this.textDisplay);
        this.container.appendChild(buttonContainer);
        
        // Add to DOM - append to the Three.js board div instead of boards-container
        const threejsBoard = document.getElementById('threejs-board');
        if (threejsBoard) {
            threejsBoard.style.position = 'relative';
            threejsBoard.appendChild(this.container);
        } else {
            // Fallback to boards-container if threejs-board not found
            const boardContainer = document.getElementById('boards-container');
            if (boardContainer) {
                boardContainer.style.position = 'relative';
                boardContainer.appendChild(this.container);
            }
        }
    }
    
    updateButtonStates() {
        const baseButtonStyle = `
            padding: 8px 16px;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.5px;
            transition: all 0.15s ease;
            min-width: 80px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transform: translateY(0);
            user-select: none;
            position: relative;
        `;
        
        const disabledStyle = `
            padding: 8px 16px;
            background: #222;
            color: #666;
            border: none;
            border-radius: 6px;
            cursor: not-allowed;
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.5px;
            min-width: 80px;
            box-shadow: none;
        `;
        
        // Toggle button - changes between Start and Stop
        if (this.currentIndex === -2) {
            // Show as "Start" button (green)
            this.buttons.toggle.textContent = 'Start';
            this.buttons.toggle.style.cssText = baseButtonStyle + 'background: #2a9d2a;';
            this.buttons.toggle.disabled = false;
            this.buttons.toggle.onmouseover = () => {
                this.buttons.toggle.style.background = '#3db03d';
                this.buttons.toggle.style.transform = 'translateY(-1px)';
                this.buttons.toggle.style.boxShadow = '0 5px 8px rgba(0, 0, 0, 0.35)';
            };
            this.buttons.toggle.onmouseout = () => {
                this.buttons.toggle.style.background = '#2a9d2a';
                this.buttons.toggle.style.transform = 'translateY(0)';
                this.buttons.toggle.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            };
        } else {
            // Show as "Stop" button (red)
            this.buttons.toggle.textContent = 'Stop';
            this.buttons.toggle.style.cssText = baseButtonStyle + 'background: #c73e3e;';
            this.buttons.toggle.disabled = false;
            this.buttons.toggle.onmouseover = () => {
                this.buttons.toggle.style.background = '#da5151';
                this.buttons.toggle.style.transform = 'translateY(-1px)';
                this.buttons.toggle.style.boxShadow = '0 5px 8px rgba(0, 0, 0, 0.35)';
            };
            this.buttons.toggle.onmouseout = () => {
                this.buttons.toggle.style.background = '#c73e3e';
                this.buttons.toggle.style.transform = 'translateY(0)';
                this.buttons.toggle.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            };
        }
        
        // Next button - enabled only after Start is clicked and not at last item
        if (this.currentIndex === -2 || this.currentIndex >= this.objects.length - 1) {
            this.buttons.next.style.cssText = disabledStyle;
            this.buttons.next.disabled = true;
            this.buttons.next.onmouseover = null;
            this.buttons.next.onmouseout = null;
        } else {
            this.buttons.next.style.cssText = baseButtonStyle + 'background: #2a6cbd;';
            this.buttons.next.disabled = false;
            this.buttons.next.onmouseover = () => {
                this.buttons.next.style.background = '#3d7fd0';
                this.buttons.next.style.transform = 'translateY(-1px)';
                this.buttons.next.style.boxShadow = '0 5px 8px rgba(0, 0, 0, 0.35)';
            };
            this.buttons.next.onmouseout = () => {
                this.buttons.next.style.background = '#2a6cbd';
                this.buttons.next.style.transform = 'translateY(0)';
                this.buttons.next.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
            };
        }
    }
    
    hideObject(obj) {
        const { mesh, name, method } = obj;
        
        // Special handling for solid of revolution - restore original geometry
        if (method === 'solidOfRevolution' && mesh.userData.originalGeometry) {
            console.log('Restoring original geometry for solid of revolution');
            if (mesh.geometry !== mesh.userData.originalGeometry) {
                mesh.geometry.dispose();
                mesh.geometry = mesh.userData.originalGeometry.clone();
            }
        }
        
        // Simply set visibility to false for immediate hiding
        mesh.visible = false;
        
        // Handle Sprites (labels) specifically
        if (mesh.type === 'Sprite' && mesh.material) {
            // Store original opacity for sprites
            if (mesh.userData.originalOpacity === undefined) {
                mesh.userData.originalOpacity = mesh.material.opacity || 1;
            }
            mesh.material.transparent = true;
            mesh.material.opacity = 0;
        }
        // Handle Groups
        else if (mesh.type === 'Group') {
            mesh.traverse((child) => {
                // Handle both Mesh and LineSegments (for edges)
                if (child.material) {
                    // Store original opacity
                    if (child.userData.originalOpacity === undefined) {
                        child.userData.originalOpacity = child.material.opacity || 1;
                    }
                    child.material.transparent = true;
                    child.material.opacity = 0;
                }
            });
        } 
        // Handle regular meshes with materials
        else if (mesh.material) {
            // Store original opacity for any object with material
            if (mesh.userData.originalOpacity === undefined) {
                mesh.userData.originalOpacity = mesh.material.opacity || 1;
            }
            
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = 0;
                });
            } else {
                mesh.material.transparent = true;
                mesh.material.opacity = 0;
            }
        }
    }
    
    renderMathText(text) {
        // Parse text for LaTeX expressions between $ signs or $$ signs
        // Replace LaTeX with rendered KaTeX HTML
        let html = text;
        
        // Handle display math ($$...$$) first to avoid conflicts
        html = html.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
            try {
                const rendered = katex.renderToString(latex, {
                    displayMode: true,
                    throwOnError: false,
                    output: 'html'
                });
                return ` <span class="katex-display-wrapper">${rendered}</span> `;
            } catch (e) {
                console.warn('KaTeX rendering error:', e);
                return match;
            }
        });
        
        // Handle inline math ($...$) and add spaces around it
        html = html.replace(/\$(.*?)\$/g, (match, latex) => {
            try {
                const rendered = katex.renderToString(latex, {
                    displayMode: false,
                    throwOnError: false,
                    output: 'html'
                });
                // Add a non-breaking space before and after math expressions
                return `&nbsp;<span class="katex-inline-wrapper">${rendered}</span>&nbsp;`;
            } catch (e) {
                console.warn('KaTeX rendering error:', e);
                return match;
            }
        });
        
        // Handle markdown bold text (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffff00; font-weight: 600;">$1</strong>');
        
        // Add custom styling to KaTeX elements
        const styledHtml = `
            <style>
                .katex { 
                    font-size: 1.1em !important; 
                    color: #00ff00 !important;
                }
                .katex .mord { 
                    color: #00ff00 !important; 
                }
                .katex-display-wrapper {
                    display: inline-block;
                    margin: 0 6px;
                }
                .katex-inline-wrapper {
                    display: inline;
                    margin: 0 3px;
                    vertical-align: middle;
                }
                strong {
                    color: #ffff00 !important;
                    font-weight: 600;
                }
            </style>
            ${html}
        `;
        
        return styledHtml;
    }
    
    updateText(text, useTypewriter = true) {
        // Kill any existing text animation
        if (this.currentTypewriter) {
            this.currentTypewriter.kill();
            this.currentTypewriter = null;
        }
        
        if (useTypewriter && text) {
            // Check if text contains math (has $ symbols)
            const hasMath = text.includes('$');
            
            if (hasMath) {
                // For text with math, use a progressive reveal effect
                const renderedHTML = this.renderMathText(text);
                this.textDisplay.innerHTML = renderedHTML;
                
                // Create a clip-path animation for typewriter-like effect
                this.textDisplay.style.clipPath = 'inset(0 100% 0 0)';
                
                this.currentTypewriter = gsap.to(this.textDisplay, {
                    duration: Math.max(1.5, text.length * 0.05), // Slower speed, minimum 1.5 seconds
                    clipPath: 'inset(0 0% 0 0)',
                    ease: "none",
                    onComplete: () => {
                        this.textDisplay.style.clipPath = 'none';
                        this.currentTypewriter = null;
                    }
                });
            } else {
                // For plain text, use character-by-character typewriter
                this.textDisplay.innerHTML = '';
                this.currentTypewriter = gsap.to(this.textDisplay, {
                    duration: Math.max(1.2, text.length * 0.06), // Slower, about 60ms per character
                    text: {
                        value: text,
                        delimiter: ""
                    },
                    ease: "none",
                    onComplete: () => {
                        this.currentTypewriter = null;
                    }
                });
            }
        } else {
            // Set HTML directly without animation
            const renderedHTML = this.renderMathText(text || '');
            this.textDisplay.innerHTML = renderedHTML || '';
            this.textDisplay.style.clipPath = 'none';
        }
    }
    
    showObject(obj) {
        console.log('[Paginator] showObject received object:', obj);
        const { mesh, method, name } = obj;
        
        console.log('showObject called for:', name, 'method:', method);
        
        // Always call the callback with the current object name
        // The StepDetails class will decide if it needs to update highlighting
        if (this.onStepChange && name) {
            console.log(`[Paginator] Calling onStepChange callback with step name: ${name}`);
            this.onStepChange(name);
            this.currentStepName = name;
        } else if (!this.onStepChange) {
            console.log('[Paginator] No onStepChange callback registered');
        }
        
        // Update text description if available (skip 'title' key and empty strings)
        const description = (this.descriptions[name] && this.descriptions[name].trim()) 
            ? this.descriptions[name] 
            : null;
        
        // Only update text if we have a description
        if (description) {
            this.updateText(description);
        }
        
        // Make visible first
        mesh.visible = true;
        
        // Restore material opacity immediately for solid meshes
        if (mesh.material) {
            const targetOpacity = mesh.userData.originalOpacity || 1;
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => {
                    mat.transparent = true;
                    mat.opacity = targetOpacity;
                });
            } else {
                mesh.material.transparent = true;
                mesh.material.opacity = targetOpacity;
            }
        }
        
        // Use method-based animation if available
        if (method) {
            console.log('Calling animateByMethod for:', name, 'with method:', method);
            // Use custom animation options if provided, otherwise use defaults
            const animOptions = obj.animationOptions || {
                duration: 0.5,
                ease: "power2.inOut"
            };
            const result = animateByMethod(mesh, method, animOptions);
            console.log('Animation result:', result);
        } else {
            console.log('No method provided for:', name, '- using fallback');
            // Fallback: just restore opacity
            const animTargets = [];
            
            if (mesh.type === 'Group') {
                mesh.traverse((child) => {
                    if (child.material) {
                        const target = child.userData.originalOpacity || 1;
                        child.material.transparent = true;
                        animTargets.push({ material: child.material, target });
                    }
                });
            } else if (mesh.material) {
                const target = mesh.userData.originalOpacity || 1;
                
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(mat => {
                        mat.transparent = true;
                        animTargets.push({ material: mat, target });
                    });
                } else {
                    mesh.material.transparent = true;
                    animTargets.push({ material: mesh.material, target });
                }
            }
            
            // Restore opacity
            animTargets.forEach(({ material, target }) => {
                gsap.to(material, {
                    opacity: target,
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            });
        }
    }
    
    handleToggle() {
        const scene = this.objects[0]?.mesh?.parent;
        
        if (this.currentIndex === -2) {
            // Start: Just hide all objects, don't recreate
            this.objects.forEach(obj => this.hideObject(obj));
            
            this.currentIndex = -1; // -1 means started, ready for first Next
            // Keep the title text displayed
            if (this.descriptions.title) {
                this.updateText(this.descriptions.title, false);
            }
        } else {
            // Stop: Recreate everything to restore initial state
            if (scene && scene.userData.recreateLesson) {
                scene.userData.recreateLesson();
                // After recreation, this paginator instance is disposed
                // The new paginator will show everything in initial state
                return;
            }
            
            // Fallback if no recreate function - just show initial objects
            this.objects.forEach(obj => this.hideObject(obj));
            let foundSolid = false;
            this.objects.forEach(obj => {
                if (obj.name === 'solidOfRevolution') {
                    foundSolid = true;
                }
                if (!foundSolid) {
                    obj.mesh.visible = true;
                }
            });
            
            this.currentIndex = -2; // Reset to not started state
            
            // Return to title text
            if (this.descriptions.title) {
                this.updateText(this.descriptions.title, false);
            }
        }
        this.updateButtonStates();
    }
    
    handleNext() {
        if (this.currentIndex < this.objects.length - 1) {
            // Move to next index
            this.currentIndex++;
            // Show the current object at the new index with proper animation
            if (this.currentIndex >= 0 && this.currentIndex < this.objects.length) {
                this.showObject(this.objects[this.currentIndex]);
            }
            this.updateButtonStates();
        }
    }
    
    setupDraggable() {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;

        const handleMouseDown = (e) => {
            // Only drag if clicking on the container itself or text area, not buttons
            if (e.target.tagName === 'BUTTON') return;
            
            isDragging = true;
            this.container.style.cursor = 'grabbing';
            
            // Get the current transform values
            const rect = this.container.getBoundingClientRect();
            const parentRect = this.container.parentElement.getBoundingClientRect();
            
            // Calculate initial position relative to parent
            initialLeft = rect.left - parentRect.left;
            initialTop = rect.top - parentRect.top;
            
            startX = e.clientX;
            startY = e.clientY;
            
            e.preventDefault();
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Update position
            this.container.style.left = `${initialLeft + deltaX}px`;
            this.container.style.top = `${initialTop + deltaY}px`;
            this.container.style.transform = 'none'; // Remove the translateX centering
            
            e.preventDefault();
        };

        const handleMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                this.container.style.cursor = 'move';
            }
        };

        // Add event listeners
        this.container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Store references for cleanup
        this.dragHandlers = { handleMouseDown, handleMouseMove, handleMouseUp };
    }
    
    dispose() {
        // Remove drag event listeners
        if (this.dragHandlers) {
            this.container.removeEventListener('mousedown', this.dragHandlers.handleMouseDown);
            document.removeEventListener('mousemove', this.dragHandlers.handleMouseMove);
            document.removeEventListener('mouseup', this.dragHandlers.handleMouseUp);
        }
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

export function createPaginator(objects, descriptions = {}, onStepChange = null) {
    return new Paginator(objects, descriptions, onStepChange);
}