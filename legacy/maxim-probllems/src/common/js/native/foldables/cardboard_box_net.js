import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * CardboardBoxNet - A class for creating and animating a cardboard box with flaps
 * Uses a net structure with frontHalf/backHalf and width/length sides
 */
export class CardboardBoxNet {
    constructor(options = {}) {
        // Box parameters with defaults
        this.params = {
            width: options.width || 10,
            length: options.length || 12,
            depth: options.depth || 8,
            thickness: options.thickness || 0.2,
            flapGap: options.flapGap || 0.2,
            position: options.position || { x: 0, y: 1, z: 0 },
            color: options.color || 0x9C8D7B,
            animationDuration: options.animationDuration || 0.6,
            animationEase: options.animationEase || 'power2.inOut'
        };
        
        // Animation state
        this.timeline = null;
        this.isFolded = false;
        this.isAnimating = false;
        this.animationDuration = this.params.animationDuration;
        this.animationEase = this.params.animationEase;
        
        // Initialize the box structure
        this.initializeStructure();
        
        // Create the 3D elements
        this.createBoxElements();
        
        // Apply material
        this.applyMaterial();
        
        // Set initial positions
        this.updatePanelsTransform();
    }
    
    initializeStructure() {
        // Main group for the entire box
        this.group = new THREE.Group();
        this.group.position.set(
            this.params.position.x,
            this.params.position.y,
            this.params.position.z
        );
        
        // Box elements structure
        this.els = {
            backHalf: {
                width: {
                    top: new THREE.Mesh(),
                    side: new THREE.Mesh(),
                    bottom: new THREE.Mesh(),
                },
                length: {
                    top: new THREE.Mesh(),
                    side: new THREE.Mesh(),
                    bottom: new THREE.Mesh(),
                },
            },
            frontHalf: {
                width: {
                    top: new THREE.Mesh(),
                    side: new THREE.Mesh(),
                    bottom: new THREE.Mesh(),
                },
                length: {
                    top: new THREE.Mesh(),
                    side: new THREE.Mesh(),
                    bottom: new THREE.Mesh(),
                },
            }
        };
        
        // Animation state for flap angles
        this.animated = {
            flapAngles: {
                backHalf: {
                    width: { top: 0, bottom: 0 },
                    length: { top: 0, bottom: 0 },
                },
                frontHalf: {
                    width: { top: 0, bottom: 0 },
                    length: { top: 0, bottom: 0 },
                }
            }
        };
        
        // Set geometry hierarchy
        this.setGeometryHierarchy();
    }
    
    setGeometryHierarchy() {
        // Add main sides to group
        this.group.add(
            this.els.frontHalf.width.side,
            this.els.frontHalf.length.side,
            this.els.backHalf.width.side,
            this.els.backHalf.length.side
        );
        
        // Add flaps to their respective sides
        this.els.frontHalf.width.side.add(this.els.frontHalf.width.top, this.els.frontHalf.width.bottom);
        this.els.frontHalf.length.side.add(this.els.frontHalf.length.top, this.els.frontHalf.length.bottom);
        this.els.backHalf.width.side.add(this.els.backHalf.width.top, this.els.backHalf.width.bottom);
        this.els.backHalf.length.side.add(this.els.backHalf.length.top, this.els.backHalf.length.bottom);
    }
    
    createBoxElements() {
        // Create geometry for each side and flap
        for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
            for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
                
                const half = halfIdx ? 'frontHalf' : 'backHalf';
                const side = sideIdx ? 'width' : 'length';
                
                const sideWidth = side === 'width' ? this.params.width : this.params.length;
                const flapWidth = sideWidth - 0.2 * this.params.flapGap;
                const flapHeight = 0.5 * this.params.width;
                
                // Create geometries
                const sideGeometry = new THREE.BoxGeometry(
                    sideWidth,
                    this.params.depth,
                    this.params.thickness
                );
                
                const topFlapGeometry = new THREE.BoxGeometry(
                    flapWidth,
                    flapHeight,
                    this.params.thickness
                );
                
                const bottomFlapGeometry = new THREE.BoxGeometry(
                    flapWidth,
                    flapHeight,
                    this.params.thickness
                );
                
                // Translate flap geometries to pivot correctly
                topFlapGeometry.translate(0, 0.5 * flapHeight, 0);
                bottomFlapGeometry.translate(0, -0.5 * flapHeight, 0);
                
                // Assign geometries
                this.els[half][side].side.geometry = sideGeometry;
                this.els[half][side].top.geometry = topFlapGeometry;
                this.els[half][side].bottom.geometry = bottomFlapGeometry;
                
                // Position flaps relative to sides
                this.els[half][side].top.position.y = 0.5 * this.params.depth;
                this.els[half][side].bottom.position.y = -0.5 * this.params.depth;
            }
        }
    }
    
    applyMaterial() {
        const material = new THREE.MeshPhongMaterial({
            color: this.params.color,
            side: THREE.DoubleSide
        });
        
        this.group.traverse(child => {
            if (child.isMesh) {
                child.material = material;
            }
        });
    }
    
    updatePanelsTransform() {
        // Fixed positions for the box sides
        this.els.frontHalf.width.side.position.x = 0.5 * this.params.length;
        this.els.backHalf.width.side.position.x = -0.5 * this.params.length;
        
        // Width sides are perpendicular
        this.els.frontHalf.width.side.rotation.y = 0.5 * Math.PI;
        this.els.backHalf.width.side.rotation.y = 0.5 * Math.PI;
        
        // Length sides in fixed positions
        this.els.frontHalf.length.side.position.x = 0;
        this.els.backHalf.length.side.position.x = 0;
        this.els.frontHalf.length.side.position.z = 0.5 * this.params.width;
        this.els.backHalf.length.side.position.z = -0.5 * this.params.width;
        
        // Update flap rotations
        this.els.frontHalf.width.top.rotation.x = -this.animated.flapAngles.frontHalf.width.top;
        this.els.frontHalf.length.top.rotation.x = -this.animated.flapAngles.frontHalf.length.top;
        this.els.frontHalf.width.bottom.rotation.x = this.animated.flapAngles.frontHalf.width.bottom;
        this.els.frontHalf.length.bottom.rotation.x = this.animated.flapAngles.frontHalf.length.bottom;
        
        this.els.backHalf.width.top.rotation.x = this.animated.flapAngles.backHalf.width.top;
        this.els.backHalf.length.top.rotation.x = this.animated.flapAngles.backHalf.length.top;
        this.els.backHalf.width.bottom.rotation.x = -this.animated.flapAngles.backHalf.width.bottom;
        this.els.backHalf.length.bottom.rotation.x = -this.animated.flapAngles.backHalf.length.bottom;
    }
    
    // ========== INDIVIDUAL FLAP ANIMATIONS ==========
    
    // Bottom flaps - Width sides
    foldBottomBackWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.width, {
            bottom: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    foldBottomFrontWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.width, {
            bottom: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    // Bottom flaps - Length sides
    foldBottomBackLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.length, {
            bottom: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    foldBottomFrontLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.length, {
            bottom: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    // Top flaps - Width sides
    foldTopBackWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.width, {
            top: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    foldTopFrontWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.width, {
            top: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    // Top flaps - Length sides
    foldTopBackLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.length, {
            top: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    foldTopFrontLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.length, {
            top: 0.5 * Math.PI,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    // Unfold functions
    unfoldTopBackLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.length, {
            top: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    unfoldTopFrontLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.length, {
            top: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    unfoldTopBackWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.width, {
            top: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    unfoldTopFrontWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.width, {
            top: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    unfoldBottomBackLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.length, {
            bottom: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    unfoldBottomFrontLengthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.length, {
            bottom: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    unfoldBottomBackWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.backHalf.width, {
            bottom: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    unfoldBottomFrontWidthFlap(startTime = 0, duration = null) {
        return this.timeline.to(this.animated.flapAngles.frontHalf.width, {
            bottom: 0,
            duration: duration || this.animationDuration,
            ease: this.animationEase
        }, startTime);
    }
    
    // ========== GROUPED FLAP FUNCTIONS ==========
    
    foldBottomWidthFlaps(startTime = 0, duration = null) {
        this.foldBottomBackWidthFlap(startTime, duration);
        this.foldBottomFrontWidthFlap(startTime, duration);
    }
    
    foldBottomLengthFlaps(startTime = 0, duration = null) {
        this.foldBottomBackLengthFlap(startTime, duration);
        this.foldBottomFrontLengthFlap(startTime, duration);
    }
    
    foldTopWidthFlaps(startTime = 0, duration = null) {
        this.foldTopBackWidthFlap(startTime, duration);
        this.foldTopFrontWidthFlap(startTime, duration);
    }
    
    foldTopLengthFlaps(startTime = 0, duration = null) {
        this.foldTopBackLengthFlap(startTime, duration);
        this.foldTopFrontLengthFlap(startTime, duration);
    }
    
    unfoldTopLengthFlaps(startTime = 0, duration = null) {
        this.unfoldTopBackLengthFlap(startTime, duration);
        this.unfoldTopFrontLengthFlap(startTime, duration);
    }
    
    unfoldTopWidthFlaps(startTime = 0, duration = null) {
        this.unfoldTopBackWidthFlap(startTime, duration);
        this.unfoldTopFrontWidthFlap(startTime, duration);
    }
    
    unfoldBottomLengthFlaps(startTime = 0, duration = null) {
        this.unfoldBottomBackLengthFlap(startTime, duration);
        this.unfoldBottomFrontLengthFlap(startTime, duration);
    }
    
    unfoldBottomWidthFlaps(startTime = 0, duration = null) {
        this.unfoldBottomBackWidthFlap(startTime, duration);
        this.unfoldBottomFrontWidthFlap(startTime, duration);
    }
    
    // ========== MAIN ANIMATION METHODS ==========
    
    fold(onComplete = null) {
        if (this.isAnimating || this.isFolded) return;
        
        this.isAnimating = true;
        if (this.timeline) this.timeline.kill();
        
        this.timeline = gsap.timeline({
            onUpdate: () => this.updatePanelsTransform(),
            onComplete: () => {
                this.isAnimating = false;
                this.isFolded = true;
                if (onComplete) onComplete();
            }
        });
        
        // Execute folding sequence
        this.foldBottomWidthFlaps(0.0);
        this.foldBottomLengthFlaps(0.3);
        this.foldTopWidthFlaps(0.8);
        this.foldTopLengthFlaps(1.1);
        
        return this;
    }
    
    unfold(onComplete = null) {
        if (this.isAnimating || !this.isFolded) return;
        
        this.isAnimating = true;
        if (this.timeline) this.timeline.kill();
        
        this.timeline = gsap.timeline({
            onUpdate: () => this.updatePanelsTransform(),
            onComplete: () => {
                this.isAnimating = false;
                this.isFolded = false;
                if (onComplete) onComplete();
            }
        });
        
        // Execute unfolding sequence (reverse order)
        this.unfoldTopLengthFlaps(0.0);
        this.unfoldTopWidthFlaps(0.3);
        this.unfoldBottomLengthFlaps(0.8);
        this.unfoldBottomWidthFlaps(1.1);
        
        return this;
    }
    
    toggle(onComplete = null) {
        if (this.isFolded) {
            this.unfold(onComplete);
        } else {
            this.fold(onComplete);
        }
        return this;
    }
    
    // Custom animation with your own sequence
    customAnimation(sequenceFunction, onComplete = null) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        if (this.timeline) this.timeline.kill();
        
        this.timeline = gsap.timeline({
            onUpdate: () => this.updatePanelsTransform(),
            onComplete: () => {
                this.isAnimating = false;
                if (onComplete) onComplete();
            }
        });
        
        // Let the user define their custom sequence
        sequenceFunction.call(this);
        
        return this;
    }
    
    // Utility methods
    stop() {
        if (this.timeline) {
            this.timeline.kill();
            this.isAnimating = false;
        }
        return this;
    }
    
    reset() {
        this.stop();
        
        // Reset all flap angles
        Object.keys(this.animated.flapAngles).forEach(half => {
            Object.keys(this.animated.flapAngles[half]).forEach(side => {
                this.animated.flapAngles[half][side].top = 0;
                this.animated.flapAngles[half][side].bottom = 0;
            });
        });
        
        this.updatePanelsTransform();
        this.isFolded = false;
        
        return this;
    }
    
    dispose() {
        this.stop();
        
        // Dispose of geometries and materials
        this.group.traverse(child => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            }
        });
    }
    
    // Getters
    getGroup() {
        return this.group;
    }
    
    getState() {
        return {
            isFolded: this.isFolded,
            isAnimating: this.isAnimating,
            flapAngles: { ...this.animated.flapAngles }
        };
    }
}

// Export factory function for convenience
export function createCardboardBoxNet(options) {
    return new CardboardBoxNet(options);
}