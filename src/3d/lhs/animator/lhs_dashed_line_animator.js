/**
 * lhs_dashed_line_animator.js
 * GSAP animation methods for dashed line objects
 */

import { TweenMax, TimelineMax } from 'gsap';

/**
 * Animates dashed line with sequential dash appearance (ray effect)
 * @param {THREE.Group} dashedLineGroup - The dashed line group created by dashedThickLine
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animateDashedLineSequential(dashedLineGroup, options = {}) {
    const {
        duration = 1.5,
        ease = "power2.out",
        stagger = 0.05,  // Delay between each dash
        direction = 'forward',  // 'forward' or 'reverse'
        onComplete = null
    } = options;
    
    // Get all cylinder meshes (dashes) from the group
    const dashes = [];
    dashedLineGroup.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.type === 'CylinderGeometry') {
            dashes.push(child);
        }
    });
    
    if (dashes.length === 0) {
        console.warn('No dashes found in dashed line group');
        return null;
    }
    
    // Make the group itself visible
    dashedLineGroup.visible = true;
    
    // Sort dashes if we want directional animation
    if (direction === 'reverse') {
        dashes.reverse();
    }
    
    // Hide all dashes initially and store original scale
    dashes.forEach(dash => {
        dash.visible = false;
        // Store original scale if not stored
        if (!dash.userData.originalScale) {
            dash.userData.originalScale = {
                x: dash.scale.x,
                y: dash.scale.y,
                z: dash.scale.z
            };
        }
        dash.scale.set(0, 0, 0);
    });
    
    // Create timeline for sequential animation
    const timeline = new TimelineMax({ onComplete });
    
    // Animate each dash appearing with stagger
    dashes.forEach((dash, index) => {
        const origScale = dash.userData.originalScale || { x: 1, y: 1, z: 1 };
        
        // Add the animation at the right time
        timeline.add(
            TweenMax.to(dash.scale, 0.5, {  // GSAP 2 syntax: duration as second param
                ease: ease,
                x: origScale.x,
                y: origScale.y,
                z: origScale.z,
                onStart: () => {
                    dash.visible = true;
                }
            }),
            index * stagger  // This is the absolute time position
        );
    });
    
    return timeline;
}

/**
 * Animates dashed line with wave/pulse effect
 * @param {THREE.Group} dashedLineGroup - The dashed line group
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animateDashedLinePulse(dashedLineGroup, options = {}) {
    const {
        duration = 2,
        ease = "sine.inOut",
        pulseScale = 1.3,
        onComplete = null
    } = options;
    
    // Get all dashes
    const dashes = [];
    dashedLineGroup.traverse((child) => {
        if (child.isMesh && child.geometry && child.geometry.type === 'CylinderGeometry') {
            dashes.push(child);
        }
    });
    
    const timeline = new TimelineMax({ onComplete });
    
    // Create wave effect
    dashes.forEach((dash, index) => {
        const delay = (index / dashes.length) * 0.5;
        timeline.to(dash.scale, duration * 0.5, {
            x: pulseScale,
            y: 1,
            z: pulseScale,
            ease: ease,
            yoyo: true,
            repeat: 1
        }, delay);
    });
    
    return timeline;
}

/**
 * Simple fade in for dashed line
 * @param {THREE.Group} dashedLineGroup - The dashed line group
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween
 */
export function fadeInDashedLine(dashedLineGroup, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null
    } = options;
    
    // Get all dashes and set initial opacity
    const dashes = [];
    dashedLineGroup.traverse((child) => {
        if (child.isMesh && child.material) {
            dashes.push(child);
            child.material.transparent = true;
            child.material.opacity = fromOpacity;
        }
    });
    
    // Animate opacity for all dashes together
    return TweenMax.to(dashes.map(d => d.material), duration, {
        opacity: toOpacity,
        ease: ease,
        onUpdate: () => {
            dashes.forEach(dash => {
                dash.material.needsUpdate = true;
            });
        },
        onComplete: onComplete
    });
}