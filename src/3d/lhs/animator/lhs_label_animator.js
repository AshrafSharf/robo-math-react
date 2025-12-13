/**
 * lhs_label_animator.js
 * GSAP animation methods for label objects from lhs_label.js
 */

import { TweenMax, TimelineMax } from 'gsap';

/**
 * Animates label appearing with scale effect
 * @param {THREE.Sprite} labelSprite - The label sprite created by label()
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLabelScale(labelSprite, options = {}) {
    const {
        duration = 0.5,
        ease = "back.out(1.7)",
        fromScale = 0,
        toScale = 1,
        onComplete = null
    } = options;
    
    // Store original scale
    const originalScale = {
        x: labelSprite.scale.x,
        y: labelSprite.scale.y,
        z: labelSprite.scale.z
    };
    
    // Set initial scale
    labelSprite.scale.multiplyScalar(fromScale);
    
    return TweenMax.to(labelSprite.scale, {
        x: originalScale.x * toScale,
        y: originalScale.y * toScale,
        z: originalScale.z * toScale,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Animates label typewriter effect
 * Note: This requires recreating the canvas texture
 * @param {THREE.Sprite} labelSprite - The label sprite
 * @param {string} fullText - The full text to display
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLabelTypewriter(labelSprite, fullText, options = {}) {
    const {
        duration = 1,
        ease = "none",
        onComplete = null
    } = options;
    
    const progress = { value: 0 };
    
    return TweenMax.to(progress, {
        value: 1,
        duration: duration,
        ease: ease,
        onUpdate: function() {
            const currentLength = Math.floor(fullText.length * progress.value);
            const currentText = fullText.substring(0, currentLength);
            
            // Update sprite texture (requires custom implementation)
            // This is a placeholder - actual implementation would need to
            // recreate the canvas texture with partial text
            if (labelSprite.userData.updateText) {
                labelSprite.userData.updateText(currentText);
            }
        },
        onComplete: onComplete
    });
}

/**
 * Animates label floating effect
 * @param {THREE.Sprite} labelSprite - The label sprite
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLabelFloat(labelSprite, options = {}) {
    const {
        duration = 2,
        ease = "power1.inOut",
        floatHeight = 0.2,
        repeat = -1,
        yoyo = true,
        onComplete = null
    } = options;
    
    const originalY = labelSprite.position.y;
    
    return TweenMax.to(labelSprite.position, {
        y: originalY + floatHeight,
        duration: duration,
        ease: ease,
        repeat: repeat,
        yoyo: yoyo,
        onComplete: onComplete
    });
}

/**
 * Animates label slide in from direction
 * @param {THREE.Sprite} labelSprite - The label sprite
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function animateLabelSlide(labelSprite, options = {}) {
    const {
        duration = 0.8,
        ease = "power2.out",
        direction = 'left', // 'left', 'right', 'top', 'bottom'
        distance = 2,
        onComplete = null
    } = options;
    
    // Store target position
    const targetPosition = {
        x: labelSprite.position.x,
        y: labelSprite.position.y,
        z: labelSprite.position.z
    };
    
    // Set initial position based on direction
    switch (direction) {
        case 'left':
            labelSprite.position.x -= distance;
            break;
        case 'right':
            labelSprite.position.x += distance;
            break;
        case 'top':
            labelSprite.position.y += distance;
            break;
        case 'bottom':
            labelSprite.position.y -= distance;
            break;
    }
    
    return TweenMax.to(labelSprite.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: duration,
        ease: ease,
        onComplete: onComplete
    });
}

/**
 * Fade in animation for labels (fallback animation)
 * @param {THREE.Sprite} labelSprite - The label sprite
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween object
 */
export function fadeInLabel(labelSprite, options = {}) {
    const {
        duration = 0.5,
        ease = "power2.inOut",
        fromOpacity = 0,
        toOpacity = 1,
        onComplete = null
    } = options;
    
    // Make sure the sprite is visible
    labelSprite.visible = true;
    
    // Check if this is a CSS2DObject (KaTeX label)
    if (labelSprite.isCSS2DObject && labelSprite.element) {
        // For CSS2DObject, animate the element's opacity
        labelSprite.element.style.opacity = fromOpacity;
        
        return TweenMax.to(labelSprite.element.style, {
            opacity: toOpacity,
            duration: duration,
            ease: ease,
            onComplete: onComplete
        });
    }
    
    // For regular sprite labels with materials
    if (labelSprite.material) {
        // Store original opacity if not already stored
        if (labelSprite.userData.originalOpacity === undefined) {
            labelSprite.userData.originalOpacity = toOpacity;
        }
        
        // Ensure material is transparent and set initial opacity
        labelSprite.material.transparent = true;
        labelSprite.material.opacity = fromOpacity;
        labelSprite.material.needsUpdate = true;
        
        return TweenMax.to(labelSprite.material, {
            opacity: labelSprite.userData.originalOpacity,
            duration: duration,
            ease: ease,
            onComplete: onComplete
        });
    }
    
    // If neither CSS2DObject nor has material, just call onComplete
    if (onComplete) {
        onComplete();
    }
    return null;
}