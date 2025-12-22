/**
 * disk_extraction_animator.js
 * Animates the extraction and annotation of a disk from the stack
 */

import { TweenMax, TimelineMax } from 'gsap';

/**
 * Animates a disk extraction sequence in 3 steps:
 * 1. Slide disk out to the right
 * 2. Show and annotate radius
 * 3. Show and annotate height/thickness
 * @param {THREE.Group} extractedGroup - Group from extractedDisk function
 * @param {Object} options - Animation options
 * @returns {gsap.core.Timeline} GSAP timeline
 */
export function animateDiskExtraction(extractedGroup, options = {}) {
    const {
        slideOutDuration = 1.5,
        radiusDuration = 1,
        heightDuration = 1,
        staggerDelay = 0.3,
        ease = 'power2.out'
    } = options;
    
    const timeline = new TimelineMax();
    
    // Get elements from userData
    const {
        extractedDisk,
        extractDistance,
        radiusLine,
        radiusLabel,
        heightLine,
        heightLabel
    } = extractedGroup.userData;
    
    // Step 1: Make disk visible and slide out to the right
    extractedDisk.visible = true;
    timeline.to(extractedDisk.position, slideOutDuration, {
        x: 0,  // Slide to final position (was at -extractDistance)
        ease: ease
    });
    
    // Step 2: Show radius line and label
    if (radiusLine && radiusLabel) {
        timeline.add(() => {
            radiusLine.visible = true;
            radiusLabel.visible = true;
        }, `+=${staggerDelay}`);
        
        // Animate radius line growing
        timeline.fromTo(radiusLine.scale,
            { x: 0.01, y: 1, z: 1 },
            radiusDuration,
            { x: 1, ease: ease }
        );
        
        // Fade in radius label
        timeline.fromTo(radiusLabel.material,
            { opacity: 0 },
            radiusDuration * 0.5,
            { opacity: 1, ease: 'power2.in' },
            `-=${radiusDuration * 0.5}`
        );
    }
    
    // Step 3: Show height/thickness line and label
    if (heightLine && heightLabel) {
        timeline.add(() => {
            heightLine.visible = true;
            heightLabel.visible = true;
        }, `+=${staggerDelay}`);
        
        // Animate height line growing
        timeline.fromTo(heightLine.scale,
            { x: 1, y: 0.01, z: 1 },
            heightDuration,
            { y: 1, ease: ease }
        );
        
        // Fade in height label
        timeline.fromTo(heightLabel.material,
            { opacity: 0 },
            heightDuration * 0.5,
            { opacity: 1, ease: 'power2.in' },
            `-=${heightDuration * 0.5}`
        );
    }
    
    return timeline;
}

/**
 * Moves a disk out for inspection
 * @param {THREE.Mesh} disk - Disk mesh to move
 * @param {Object} options - Animation options
 * @returns {gsap.core.Tween} GSAP tween
 */
export function moveDiskOut(disk, options = {}) {
    const {
        offsetX = 3,
        offsetY = 1,
        duration = 1.5,
        ease = 'power2.out'
    } = options;
    
    if (!disk) {
        console.warn('Invalid disk mesh');
        return null;
    }
    
    // Store original position if not already stored
    if (!disk.userData.originalPosition) {
        disk.userData.originalPosition = {
            x: disk.position.x,
            y: disk.position.y,
            z: disk.position.z
        };
    }
    
    // Always animate from original position to target position
    const targetX = disk.userData.originalPosition.x + offsetX;
    const targetY = disk.userData.originalPosition.y + offsetY;
    
    // Animate to absolute position (not relative)
    return TweenMax.to(disk.position, duration, {
        x: targetX,
        y: targetY,
        ease: ease
    });
}