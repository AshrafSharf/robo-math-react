import * as THREE from 'three';
import { TweenMax, TimelineMax } from 'gsap';
import { transformToThreeJS } from './lhs_transform.js';

export class TraceAnimator {
    constructor(scene) {
        this.scene = scene;
        this.tracePaths = [];
        this.traceBoxes = [];
        this.animationFrameId = null;
        this.isAnimating = false;
    }

    createTraceBox(color = 0x00ff00) {
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);  // Bigger cube
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            opacity: 1.0,  // Fully opaque
            transparent: false
        });
        const box = new THREE.Mesh(geometry, material);
        box.visible = false;
        this.scene.add(box);
        return box;
    }

    createTraceLine(start, end, color = 0x00ff00, opacity = 0.3) {
        // Transform LHS coordinates to Three.js coordinates
        const transformedStart = transformToThreeJS(start);
        const transformedEnd = transformToThreeJS(end);
        
        const points = [
            new THREE.Vector3(transformedStart.x, transformedStart.y, transformedStart.z),
            new THREE.Vector3(transformedEnd.x, transformedEnd.y, transformedEnd.z)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: color,
            opacity: opacity,
            transparent: true
        });
        const line = new THREE.Line(geometry, material);
        line.visible = false;
        this.scene.add(line);
        return line;
    }

    animateTraceVectorPath(directPath, vectorPairs, options = {}) {
        const {
            duration = 2, // seconds per segment (slower)
            traceColor = 0x00ff00,
            directColor = 0xff0000
        } = options;

        // Clean up any existing animation
        this.cleanup();

        // Create trace box for animation
        const traceBox = this.createTraceBox(traceColor);
        this.traceBoxes.push(traceBox);

        // Create timeline for sequential animations
        const timeline = new TimelineMax();

        // Animate along vector pairs first
        vectorPairs.forEach(pair => {
            const transformedStart = transformToThreeJS(pair.start);
            const transformedEnd = transformToThreeJS(pair.end);
            
            timeline.fromTo(traceBox.position,
                { 
                    x: transformedStart.x, 
                    y: transformedStart.y, 
                    z: transformedStart.z,
                    visible: true
                },
                {
                    x: transformedEnd.x,
                    y: transformedEnd.y,
                    z: transformedEnd.z,
                    duration: duration,
                    ease: "power2.inOut",
                    onStart: () => { traceBox.visible = true; }
                }
            );
        });

        // Hide trace box briefly and change color for direct path
        timeline.set(traceBox, { visible: false });
        timeline.set(traceBox.material.color, { r: (directColor >> 16 & 255) / 255, g: (directColor >> 8 & 255) / 255, b: (directColor & 255) / 255 }, "+=0.2");
        
        // Animate direct path
        const transformedDirectStart = transformToThreeJS(directPath.start);
        const transformedDirectEnd = transformToThreeJS(directPath.end);
        
        timeline.fromTo(traceBox.position,
            { 
                x: transformedDirectStart.x, 
                y: transformedDirectStart.y, 
                z: transformedDirectStart.z
            },
            {
                x: transformedDirectEnd.x,
                y: transformedDirectEnd.y,
                z: transformedDirectEnd.z,
                duration: duration,
                ease: "power2.inOut",
                onStart: () => { traceBox.visible = true; },
                onComplete: () => { 
                    // Hide and remove the cube after animation completes
                    traceBox.visible = false;
                    this.cleanup();
                }
            }
        );

        return timeline;
    }


    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Remove all trace boxes
        this.traceBoxes.forEach(box => {
            if (box.parent) {
                box.parent.remove(box);
            }
            if (box.geometry) box.geometry.dispose();
            if (box.material) box.material.dispose();
        });
        this.traceBoxes = [];

        // Remove all trace paths
        this.tracePaths.forEach(line => {
            if (line.parent) {
                line.parent.remove(line);
            }
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
        });
        this.tracePaths = [];

        this.isAnimating = false;
    }

    // Non-animated version for regular Diagram class
    showTraceVectorPath(directPath, vectorPairs, options = {}) {
        // No-op for non-animated traces - just return cleanup function
        return {
            cleanup: () => this.cleanup()
        };
    }
}