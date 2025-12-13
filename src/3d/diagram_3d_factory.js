/**
 * Diagram3DFactory - Static factory for creating 3D diagram instances
 */

import { LHS3DDiagram } from './lhs_diagram3d.js';
import { RHS3DDiagram } from './rhs_diagram3d.js';
import { LHSAnimatedDiagram } from './lhs_animated_diagram_3d.js';
import { RHSAnimatedDiagram } from './rhs_animated_diagram_3d.js';

export class Diagram3DFactory {
    /**
     * Create a static LHS diagram
     * @param {THREE.Scene} scene
     * @param {Object} effectsManager
     * @returns {LHS3DDiagram}
     */
    static createLHSDiagram(scene, effectsManager = null) {
        return new LHS3DDiagram(scene, effectsManager);
    }

    /**
     * Create a static RHS diagram
     * @param {THREE.Scene} scene
     * @param {Object} effectsManager
     * @returns {RHS3DDiagram}
     */
    static createRHSDiagram(scene, effectsManager = null) {
        return new RHS3DDiagram(scene, effectsManager);
    }

    /**
     * Create an animated LHS diagram
     * @param {THREE.Scene} scene
     * @param {number} animationDuration
     * @returns {LHSAnimatedDiagram}
     */
    static createLHSAnimatedDiagram(scene, animationDuration = 1) {
        return new LHSAnimatedDiagram(scene, animationDuration);
    }

    /**
     * Create an animated RHS diagram
     * @param {THREE.Scene} scene
     * @param {number} animationDuration
     * @returns {RHSAnimatedDiagram}
     */
    static createRHSAnimatedDiagram(scene, animationDuration = 1) {
        return new RHSAnimatedDiagram(scene, animationDuration);
    }

    /**
     * Create a diagram by coordinate system
     * @param {THREE.Scene} scene
     * @param {string} coordinateSystem - 'lhs' or 'rhs'
     * @param {Object} effectsManager
     * @returns {BaseDiagram3D}
     */
    static createDiagram(scene, coordinateSystem = 'lhs', effectsManager = null) {
        if (coordinateSystem.toLowerCase() === 'rhs') {
            return Diagram3DFactory.createRHSDiagram(scene, effectsManager);
        }
        return Diagram3DFactory.createLHSDiagram(scene, effectsManager);
    }

    /**
     * Create an animated diagram by coordinate system
     * @param {THREE.Scene} scene
     * @param {string} coordinateSystem - 'lhs' or 'rhs'
     * @param {number} animationDuration
     * @returns {BaseDiagram3D}
     */
    static createAnimatedDiagram(scene, coordinateSystem = 'lhs', animationDuration = 1) {
        if (coordinateSystem.toLowerCase() === 'rhs') {
            return Diagram3DFactory.createRHSAnimatedDiagram(scene, animationDuration);
        }
        return Diagram3DFactory.createLHSAnimatedDiagram(scene, animationDuration);
    }
}
