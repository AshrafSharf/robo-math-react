// 3D lesson initializer for Three.js-based lessons
import { createLayout, destroyLayout } from './layout-3d.js';

export async function initLesson3D(lessonName, lessonModule, config = {}) {
    try {
        if (typeof lessonModule.render !== 'function') {
            throw new Error(`3D Lesson ${lessonName} must export a render function`);
        }
        
        // Add lesson ID for tracking
        const enhancedConfig = {
            ...config,
            lessonId: lessonName
        };
        
        // Get global style and Three.js config from config
        const globalStyle = enhancedConfig.style || {};
        const threejsConfig = enhancedConfig.threejs || {};
        
        // Create 3D layout with Three.js and control panel
        const boards = createLayout(globalStyle, threejsConfig);
        
        // Store Three.js components in scene.userData for compatibility with setupCoordinateSystem
        boards.threejs.scene.userData = {
            ...boards.threejs.scene.userData,
            camera: boards.threejs.camera,
            renderer: boards.threejs.renderer,
            controls: boards.threejs.controls
        };
        
        // Call render with scene and panel (lesson will call setupCoordinateSystem)
        await lessonModule.render(boards.threejs.scene, boards.panel, enhancedConfig);
        
        // Set up reset event listeners if lesson exports a reset function
        if (typeof lessonModule.reset === 'function') {
            // Listen for reset events
            window.addEventListener('lesson-reset', () => {
                lessonModule.reset();
            });
            
            document.addEventListener('reset-lesson', () => {
                lessonModule.reset();
            });
        }
        
        // Set up cleanup on page unload
        window.addEventListener('beforeunload', () => {
            destroyLayout();
        });
        
        // Return for external control if needed
        return { 
            config: enhancedConfig, 
            boards, 
            module: lessonModule,
            destroy: () => destroyLayout()
        };
        
    } catch (error) {
        console.error(`Error loading 3D lesson ${lessonName}:`, error);
        const container = document.getElementById('boards-container');
        if (container) {
            container.innerHTML = `<div style="color: red; padding: 20px;">Error loading 3D lesson: ${error.message}</div>`;
        }
        return null;
    }
}