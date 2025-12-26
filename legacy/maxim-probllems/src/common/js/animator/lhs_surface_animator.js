/**
 * lhs_surface_animator.js
 * Animation functions for LHS surface objects
 */

import { gsap } from 'gsap';
import * as THREE from 'three';

/**
 * Animates a surface by progressively revealing it as a point cloud
 * The surface vertices appear progressively, creating a "forming" effect
 * @param {THREE.Mesh} mesh - The surface mesh to animate
 * @param {Object} options - Animation options
 * @param {number} options.duration - Total animation duration (default: 2)
 * @param {string} options.ease - GSAP easing function (default: 'power2.inOut')
 * @param {string} options.pattern - Pattern of reveal: 'random', 'wave', 'radial', 'diagonal' (default: 'wave')
 * @param {boolean} options.showPoints - Whether to show points before surface (default: true)
 * @param {number} options.pointSize - Size of points during animation (default: 0.05)
 * @param {Function} options.onComplete - Callback when animation completes
 * @returns {gsap.core.Timeline} The GSAP timeline
 */
export function animateSurfacePointCloud(mesh, options = {}) {
    const {
        duration = 2,
        ease = 'power2.inOut',
        pattern = 'wave',
        showPoints = true,
        pointSize = 0.05,
        onComplete
    } = options;
    
    const timeline = gsap.timeline({ onComplete });
    
    if (!mesh || !mesh.geometry) {
        console.warn('Invalid mesh for surface animation');
        return timeline;
    }
    
    // Store original geometry
    const originalGeometry = mesh.geometry;
    const vertices = originalGeometry.attributes.position.array;
    const vertexCount = vertices.length / 3;
    
    // Create point cloud geometry
    const pointGeometry = new THREE.BufferGeometry();
    const pointPositions = new Float32Array(vertices.length);
    const pointSizes = new Float32Array(vertexCount);
    const pointAlphas = new Float32Array(vertexCount);
    
    // Copy vertex positions
    for (let i = 0; i < vertices.length; i++) {
        pointPositions[i] = vertices[i];
    }
    
    // Initialize point properties
    for (let i = 0; i < vertexCount; i++) {
        pointSizes[i] = 0;
        pointAlphas[i] = 0;
    }
    
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
    pointGeometry.setAttribute('size', new THREE.BufferAttribute(pointSizes, 1));
    pointGeometry.setAttribute('alpha', new THREE.BufferAttribute(pointAlphas, 1));
    
    // Create point material with custom shader for per-point size and alpha
    const pointMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(mesh.material.color || 0x4444ff) },
            globalAlpha: { value: 1.0 }
        },
        vertexShader: `
            attribute float size;
            attribute float alpha;
            varying float vAlpha;
            
            void main() {
                vAlpha = alpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float globalAlpha;
            varying float vAlpha;
            
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                if (r > 0.5) discard;
                
                float smoothEdge = 1.0 - smoothstep(0.3, 0.5, r);
                gl_FragColor = vec4(color, vAlpha * globalAlpha * smoothEdge);
            }
        `,
        transparent: true,
        depthWrite: false
    });
    
    // Create points mesh
    const pointsMesh = new THREE.Points(pointGeometry, pointMaterial);
    pointsMesh.renderOrder = mesh.renderOrder;
    
    // Add points to parent
    if (mesh.parent) {
        mesh.parent.add(pointsMesh);
    }
    
    // Hide original mesh initially
    mesh.visible = false;
    
    // Calculate reveal order based on pattern
    const revealOrder = calculateRevealOrder(vertexCount, pattern, vertices);
    
    if (showPoints) {
        // Phase 1: Animate points appearing
        const pointPhase = duration * 0.6;
        
        timeline.to({}, {
            duration: pointPhase,
            ease: ease,
            onUpdate: function() {
                const progress = this.progress();
                const revealCount = Math.floor(progress * vertexCount);
                
                for (let i = 0; i < revealCount; i++) {
                    const idx = revealOrder[i];
                    pointSizes[idx] = pointSize;
                    pointAlphas[idx] = 1.0;
                }
                
                pointGeometry.attributes.size.needsUpdate = true;
                pointGeometry.attributes.alpha.needsUpdate = true;
            }
        });
        
        // Phase 2: Fade out points and fade in surface
        timeline.to(pointMaterial.uniforms.globalAlpha, {
            value: 0,
            duration: duration * 0.4,
            ease: 'power2.inOut',
            onStart: () => {
                mesh.visible = true;
                mesh.material.opacity = 0;
                mesh.material.transparent = true;
            },
            onUpdate: function() {
                mesh.material.opacity = 1 - this.targets()[0].globalAlpha;
            },
            onComplete: () => {
                // Clean up
                if (mesh.parent) {
                    mesh.parent.remove(pointsMesh);
                }
                pointGeometry.dispose();
                pointMaterial.dispose();
                
                // Restore original opacity
                if (options.finalOpacity !== undefined) {
                    mesh.material.opacity = options.finalOpacity;
                } else {
                    mesh.material.opacity = mesh.userData.originalOpacity || 1;
                }
            }
        });
    } else {
        // Direct surface reveal without points
        mesh.visible = true;
        mesh.material.opacity = 0;
        mesh.material.transparent = true;
        
        timeline.to(mesh.material, {
            opacity: options.finalOpacity || mesh.userData.originalOpacity || 1,
            duration: duration,
            ease: ease
        });
    }
    
    return timeline;
}

/**
 * Calculate the order in which vertices should be revealed based on pattern
 */
function calculateRevealOrder(vertexCount, pattern, vertices) {
    const indices = Array.from({ length: vertexCount }, (_, i) => i);
    
    switch (pattern) {
        case 'random':
            // Fisher-Yates shuffle
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            break;
            
        case 'wave':
            // Sort by x position (wave from left to right)
            indices.sort((a, b) => {
                const xA = vertices[a * 3];
                const xB = vertices[b * 3];
                return xA - xB;
            });
            break;
            
        case 'radial':
            // Sort by distance from center
            indices.sort((a, b) => {
                const xA = vertices[a * 3];
                const yA = vertices[a * 3 + 1];
                const zA = vertices[a * 3 + 2];
                const distA = Math.sqrt(xA * xA + yA * yA + zA * zA);
                
                const xB = vertices[b * 3];
                const yB = vertices[b * 3 + 1];
                const zB = vertices[b * 3 + 2];
                const distB = Math.sqrt(xB * xB + yB * yB + zB * zB);
                
                return distA - distB;
            });
            break;
            
        case 'diagonal':
            // Sort by x + y (diagonal wave)
            indices.sort((a, b) => {
                const sumA = vertices[a * 3] + vertices[a * 3 + 1];
                const sumB = vertices[b * 3] + vertices[b * 3 + 1];
                return sumA - sumB;
            });
            break;
            
        default:
            // Keep original order
            break;
    }
    
    return indices;
}

/**
 * Animates surface growth from center
 * @param {THREE.Mesh} mesh - The surface mesh to animate
 * @param {Object} options - Animation options
 */
export function animateSurfaceGrowth(mesh, options = {}) {
    const {
        duration = 1.5,
        ease = 'power2.out',
        fromScale = 0.01,
        toScale = 1,
        onComplete
    } = options;
    
    const timeline = gsap.timeline({ onComplete });
    
    // Store original scale
    mesh.userData.originalScale = mesh.scale.clone();
    
    // Set initial scale
    mesh.scale.set(fromScale, fromScale, fromScale);
    mesh.visible = true;
    
    // Animate to target scale
    timeline.to(mesh.scale, {
        x: toScale * mesh.userData.originalScale.x,
        y: toScale * mesh.userData.originalScale.y,
        z: toScale * mesh.userData.originalScale.z,
        duration: duration,
        ease: ease
    });
    
    return timeline;
}

/**
 * Fade in surface
 * @param {THREE.Mesh} mesh - The surface mesh to animate
 * @param {Object} options - Animation options
 */
export function fadeInSurface(mesh, options = {}) {
    const {
        duration = 1,
        ease = 'power2.inOut',
        fromOpacity = 0,
        toOpacity = null,
        onComplete
    } = options;
    
    const timeline = gsap.timeline({ onComplete });
    
    // Store original opacity if not already stored
    if (mesh.userData.originalOpacity === undefined) {
        mesh.userData.originalOpacity = mesh.material.opacity;
    }
    
    const targetOpacity = toOpacity !== null ? toOpacity : mesh.userData.originalOpacity;
    
    // Set initial state
    mesh.material.transparent = true;
    mesh.material.opacity = fromOpacity;
    mesh.visible = true;
    
    // Animate opacity
    timeline.to(mesh.material, {
        opacity: targetOpacity,
        duration: duration,
        ease: ease
    });
    
    return timeline;
}