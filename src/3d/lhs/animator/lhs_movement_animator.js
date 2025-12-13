import { TweenMax, TimelineMax } from 'gsap';
import { transformToThreeJS, transformFromThreeJS } from '../lhs_transform.js';
import { fadeInLabel } from './lhs_label_animator.js';

/**
 * Animates a vector moving from its original position to a target position
 * @param {Object} vectorGroup - The vector group to animate
 * @param {Object} originalStart - Original start position {x, y, z} in math coordinates
 * @param {Object} targetStart - Target start position {x, y, z} in math coordinates
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} The GSAP tween
 */
export function animateVectorMovement(vectorGroup, originalStart, targetStart, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        onComplete
    } = options;
    
    // Calculate total translation needed in mathematical coordinates
    const mathTranslation = {
        x: targetStart.x - originalStart.x,
        y: targetStart.y - originalStart.y,
        z: targetStart.z - originalStart.z
    };
    
    // Transform translation to Three.js coordinates
    const threeTranslation = transformToThreeJS(mathTranslation);
    
    // Track previous progress for incremental translation
    let previousProgress = 0;
    
    // Use GSAP with progress callback for interpolation
    const animationState = { progress: 0 };
    
    return TweenMax.to(animationState, {
        progress: 1,
        duration: duration,
        ease: ease,
        onUpdate: () => {
            const t = animationState.progress;
            const dt = t - previousProgress;
            
            // Calculate incremental translation based on progress delta
            const dx = threeTranslation.x * dt;
            const dy = threeTranslation.y * dt;
            const dz = threeTranslation.z * dt;
            
            // Apply incremental translation in Three.js coordinates
            vectorGroup.translateX(dx);
            vectorGroup.translateY(dy);
            vectorGroup.translateZ(dz);
            
            previousProgress = t;
        },
        onComplete: onComplete
    });
}

/**
 * Animates the creation of a reversed vector (flipped direction)
 * @param {Object} reversedVector - The reversed vector group
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} The GSAP tween
 */
export function animateReverseVectorCreation(reversedVector, options = {}) {
    const {
        duration = 1,
        ease = "power2.out",
        onComplete,
        position
    } = options;
    
    // If position is provided, set it using proper transformation
    if (position) {
        const startPosThree = transformToThreeJS(position);
        reversedVector.position.set(
            startPosThree.x,
            startPosThree.y,
            startPosThree.z
        );
    }
    
    // Start with scale at 0 and grow to show the flip animation
    reversedVector.scale.set(0, 0, 0);
    
    return TweenMax.to(reversedVector.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: duration,
        ease: ease,
        onComplete: () => {
            // Show label after animation
            if (reversedVector.label) {
                reversedVector.label.visible = true;
                fadeInLabel(reversedVector.label, { duration: duration * 0.3 });
            }
            
            if (onComplete) {
                onComplete(reversedVector);
            }
        }
    });
}

/**
 * Animates a vector sliding forward or backward along its direction
 * @param {Object} vectorGroup - The vector group to animate
 * @param {Object} vectorStart - Start point of vector in math coordinates
 * @param {Object} vectorEnd - End point of vector in math coordinates
 * @param {number} scalar - Amount to slide (positive = forward, negative = backward)
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} The GSAP timeline
 */
export function animateVectorSlide(vectorGroup, vectorStart, vectorEnd, scalar, options = {}) {
    const {
        duration = 1,
        ease = "power2.inOut",
        returnToOriginal = true,
        pauseDuration = 0.5,
        onComplete
    } = options;
    
    // Calculate direction in mathematical coordinates
    const mathDirection = {
        x: vectorEnd.x - vectorStart.x,
        y: vectorEnd.y - vectorStart.y,
        z: vectorEnd.z - vectorStart.z
    };
    
    // Calculate slide offset in mathematical coordinates
    const mathSlideOffset = {
        x: mathDirection.x * scalar,
        y: mathDirection.y * scalar,
        z: mathDirection.z * scalar
    };
    
    // Transform slide offset to Three.js coordinates
    const threeSlideOffset = transformToThreeJS(mathSlideOffset);
    
    // Store original position
    const originalPosition = {
        x: vectorGroup.position.x,
        y: vectorGroup.position.y,
        z: vectorGroup.position.z
    };
    
    // Create timeline
    const timeline = new TimelineMax({ onComplete });
    
    // Slide to target position
    timeline.to(vectorGroup.position, {
        x: originalPosition.x + threeSlideOffset.x,
        y: originalPosition.y + threeSlideOffset.y,
        z: originalPosition.z + threeSlideOffset.z,
        duration: duration,
        ease: ease
    });
    
    // Optionally return to original position
    if (returnToOriginal) {
        timeline.to(vectorGroup.position, {
            x: originalPosition.x,
            y: originalPosition.y,
            z: originalPosition.z,
            duration: duration,
            ease: ease,
            delay: pauseDuration
        });
    }
    
    return timeline;
}