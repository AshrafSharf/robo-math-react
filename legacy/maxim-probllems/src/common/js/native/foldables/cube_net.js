import * as THREE from 'three';
import { gsap } from 'gsap';

/**
 * CubeNet - A class for creating and animating cube nets that fold into 3D cubes
 * Uses same structure as CardboardBoxNet with GSAP animations
 */
export class CubeNet {
    constructor(options = {}) {
        // Cube parameters with defaults
        this.params = {
            size: options.size || 3,
            position: options.position || { x: 0, y: 0, z: 0 },
            faceColor: options.faceColor || 0x4488ff,
            edgeColor: options.edgeColor || 0x2266dd,
            thickness: options.thickness || 0.05,
            showFoldLines: options.showFoldLines !== false,
            faceLabels: options.faceLabels || false,
            animationDuration: options.animationDuration || 0.5,
            animationEase: options.animationEase || 'power2.inOut'
        };
        
        // Animation state
        this.timeline = null;
        this.isFolded = false;
        this.isAnimating = false;
        
        // Initialize the cube net structure
        this.initializeStructure();
        
        // Create the 3D elements based on pattern
        this.createNetElements();
        
        // Apply materials
        this.applyMaterials();
        
        // Set initial state
        this.updateTransforms();
    }
    
    initializeStructure() {
        // Main group for the entire net
        this.group = new THREE.Group();
        this.group.position.set(
            this.params.position.x,
            this.params.position.y,
            this.params.position.z
        );
        
        // Face structure - 6 faces for a cube
        this.faces = {
            top: { mesh: null, pivot: null, position: null, rotation: null },
            bottom: { mesh: null, pivot: null, position: null, rotation: null },
            front: { mesh: null, pivot: null, position: null, rotation: null },
            back: { mesh: null, pivot: null, position: null, rotation: null },
            left: { mesh: null, pivot: null, position: null, rotation: null },
            right: { mesh: null, pivot: null, position: null, rotation: null }
        };
        
        // Animation state for face rotations
        this.animated = {
            faceAngles: {
                top: 0,
                bottom: 0,
                front: 0,
                back: 0,
                left: 0,
                right: 0
            }
        };
        
        // Setup cube net structure
        this.setupFaceStructure();
    }
    
    setupFaceStructure() {
        const size = this.params.size;
        // Simple cross pattern with proper group hierarchy
        
        // Bottom - the base face, stays flat
        this.faces.bottom.position = { x: 0, y: 0, z: 0 };
        this.faces.bottom.needsPivot = false;
        
        // Front - positioned in front of bottom, folds up
        this.faces.front.needsPivot = true;
        this.faces.front.pivotPosition = { x: 0, y: 0, z: size/2 };
        this.faces.front.meshOffset = { x: 0, y: 0, z: size/2 };
        this.faces.front.pivotAxis = 'x';
        this.faces.front.foldAngle = -Math.PI/2;
        
        // Back - positioned behind bottom, folds up  
        this.faces.back.needsPivot = true;
        this.faces.back.pivotPosition = { x: 0, y: 0, z: -size/2 };
        this.faces.back.meshOffset = { x: 0, y: 0, z: -size/2 };
        this.faces.back.pivotAxis = 'x';
        this.faces.back.foldAngle = Math.PI/2;
        
        // Left - positioned left of bottom, folds up
        this.faces.left.needsPivot = true;
        this.faces.left.pivotPosition = { x: -size/2, y: 0, z: 0 };
        this.faces.left.meshOffset = { x: -size/2, y: 0, z: 0 };
        this.faces.left.pivotAxis = 'z';
        this.faces.left.foldAngle = -Math.PI/2;
        
        // Right - positioned right of bottom, folds up
        this.faces.right.needsPivot = true;
        this.faces.right.pivotPosition = { x: size/2, y: 0, z: 0 };
        this.faces.right.meshOffset = { x: size/2, y: 0, z: 0 };
        this.faces.right.pivotAxis = 'z';
        this.faces.right.foldAngle = Math.PI/2;
        
        // Top - positioned behind the back face, will be child of back
        this.faces.top.needsPivot = true;
        this.faces.top.parent = 'back';
        // When back is flat, top is at z = -size*2 from bottom center
        // The pivot for top should be at the edge where it connects to back
        this.faces.top.pivotPosition = { x: 0, y: 0, z: -size }; // Relative to back's pivot
        this.faces.top.meshOffset = { x: 0, y: 0, z: -size/2 }; // Center of top face relative to its pivot
        this.faces.top.pivotAxis = 'x';
        this.faces.top.foldAngle = Math.PI/2; // Folds to the left (positive rotation around x)
    }
    
    createNetElements() {
        const size = this.params.size;
        const thickness = this.params.thickness;
        
        // Create geometry for each face
        const faceGeometry = new THREE.BoxGeometry(size, thickness, size);
        
        // Create all meshes and setup groups with proper hierarchy
        Object.keys(this.faces).forEach(faceName => {
            const face = this.faces[faceName];
            
            // Create mesh for the face
            face.mesh = new THREE.Mesh(faceGeometry.clone());
            
            // Setup based on whether face needs a pivot
            if (face.needsPivot) {
                // Create pivot group for rotation
                face.pivot = new THREE.Group();
                
                // Position the pivot at the rotation axis
                if (face.pivotPosition) {
                    face.pivot.position.set(
                        face.pivotPosition.x,
                        face.pivotPosition.y,
                        face.pivotPosition.z
                    );
                }
                
                // Offset the mesh within the pivot to place it correctly
                if (face.meshOffset) {
                    face.mesh.position.set(
                        face.meshOffset.x,
                        face.meshOffset.y,
                        face.meshOffset.z
                    );
                }
                
                // Add mesh to pivot
                face.pivot.add(face.mesh);
            } else {
                // No pivot needed (base face)
                if (face.position) {
                    face.mesh.position.set(
                        face.position.x,
                        face.position.y,
                        face.position.z
                    );
                }
            }
        });
        
        // Build hierarchy - connect pivots to parents
        Object.keys(this.faces).forEach(faceName => {
            const face = this.faces[faceName];
            
            if (face.needsPivot && face.pivot) {
                // Check if this face has a parent
                if (face.parent && this.faces[face.parent]) {
                    const parentFace = this.faces[face.parent];
                    
                    // Add this face's pivot to parent's structure
                    if (parentFace.pivot) {
                        // Parent has a pivot, add to it
                        parentFace.pivot.add(face.pivot);
                    } else if (parentFace.mesh) {
                        // Parent doesn't have a pivot (base), add to mesh
                        parentFace.mesh.add(face.pivot);
                    }
                } else {
                    // No parent, add directly to main group
                    this.group.add(face.pivot);
                }
            } else if (!face.needsPivot && face.mesh) {
                // Base face without pivot
                this.group.add(face.mesh);
            }
            
            // Add fold lines if requested
            if (this.params.showFoldLines && face.pivot) {
                this.addFoldLine(face);
            }
            
            // Add face labels if requested
            if (this.params.faceLabels) {
                this.addFaceLabel(face, faceName);
            }
        });
    }
    
    addFoldLine(face) {
        const size = this.params.size;
        const geometry = new THREE.BufferGeometry();
        const points = [];
        
        // Create line along the fold axis
        if (face.pivotAxis === 'x') {
            points.push(new THREE.Vector3(-size/2, 0, 0));
            points.push(new THREE.Vector3(size/2, 0, 0));
        } else if (face.pivotAxis === 'z') {
            points.push(new THREE.Vector3(0, 0, -size/2));
            points.push(new THREE.Vector3(0, 0, size/2));
        }
        
        geometry.setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: this.params.edgeColor,
            linewidth: 2
        });
        const line = new THREE.Line(geometry, material);
        
        if (face.pivot) {
            face.pivot.add(line);
        }
    }
    
    addFaceLabel(face, faceName) {
        // This would add text labels to each face
        // Implementation depends on your label system
    }
    
    applyMaterials() {
        const material = new THREE.MeshPhongMaterial({
            color: this.params.faceColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        
        // Apply edges
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: this.params.edgeColor,
            linewidth: 2
        });
        
        Object.values(this.faces).forEach(face => {
            if (face.mesh) {
                face.mesh.material = material;
                
                // Add edges
                const edges = new THREE.EdgesGeometry(face.mesh.geometry);
                const edgeLines = new THREE.LineSegments(edges, edgeMaterial);
                face.mesh.add(edgeLines);
            }
        });
    }
    
    updateTransforms() {
        // Update face rotations based on animated angles
        Object.keys(this.faces).forEach(faceName => {
            const face = this.faces[faceName];
            if (face.pivot && face.pivotAxis) {
                const angle = this.animated.faceAngles[faceName];
                
                if (face.pivotAxis === 'x') {
                    face.pivot.rotation.x = angle;
                } else if (face.pivotAxis === 'z') {
                    face.pivot.rotation.z = angle;
                }
            }
        });
    }
    
    // ========== ANIMATION METHODS ==========
    
    fold(onComplete = null) {
        if (this.isAnimating || this.isFolded) return;
        
        this.isAnimating = true;
        if (this.timeline) this.timeline.kill();
        
        this.timeline = gsap.timeline({
            onUpdate: () => this.updateTransforms(),
            onComplete: () => {
                this.isAnimating = false;
                this.isFolded = true;
                if (onComplete) onComplete();
            }
        });
        
        // Fold sequence based on pattern
        this.createFoldSequence();
        
        return this;
    }
    
    unfold(onComplete = null) {
        if (this.isAnimating || !this.isFolded) return;
        
        this.isAnimating = true;
        if (this.timeline) this.timeline.kill();
        
        this.timeline = gsap.timeline({
            onUpdate: () => this.updateTransforms(),
            onComplete: () => {
                this.isAnimating = false;
                this.isFolded = false;
                if (onComplete) onComplete();
            }
        });
        
        // Unfold in reverse order
        this.createUnfoldSequence();
        
        return this;
    }
    
    createFoldSequence() {
        const duration = this.params.animationDuration;
        const ease = this.params.animationEase;
        
        // First fold faces without parents (main sides)
        ['front', 'back', 'left', 'right'].forEach((faceName, index) => {
            const face = this.faces[faceName];
            if (face.foldAngle && !face.parent) {
                this.timeline.to(this.animated.faceAngles, {
                    [faceName]: face.foldAngle,
                    duration: duration,
                    ease: ease
                }, index * 0.1); // Small stagger
            }
        });
        
        // Then fold child faces (like top attached to back)
        Object.keys(this.faces).forEach(faceName => {
            const face = this.faces[faceName];
            if (face.parent && face.foldAngle) {
                // Child faces fold after their parents
                this.timeline.to(this.animated.faceAngles, {
                    [faceName]: face.foldAngle,
                    duration: duration,
                    ease: ease
                }, `-=${duration * 0.5}`); // Overlap with parent animation
            }
        });
    }
    
    createUnfoldSequence() {
        const duration = this.params.animationDuration;
        const ease = this.params.animationEase;
        
        // Unfold child faces first
        ['top', 'left', 'right'].forEach((faceName) => {
            const face = this.faces[faceName];
            if (face.parent) {
                this.timeline.to(this.animated.faceAngles, {
                    [faceName]: 0,
                    duration: duration,
                    ease: ease
                }, 0);
            }
        });
        
        // Then unfold main faces
        ['front', 'back', 'left', 'right'].forEach((faceName, index) => {
            const face = this.faces[faceName];
            if (face.foldAngle && !face.parent) {
                this.timeline.to(this.animated.faceAngles, {
                    [faceName]: 0,
                    duration: duration,
                    ease: ease
                }, duration * 0.5 + index * 0.1);
            }
        });
    }
    
    toggle(onComplete = null) {
        if (this.isFolded) {
            this.unfold(onComplete);
        } else {
            this.fold(onComplete);
        }
        return this;
    }
    
    stop() {
        if (this.timeline) {
            this.timeline.kill();
            this.isAnimating = false;
        }
        return this;
    }
    
    reset() {
        this.stop();
        
        // Reset all face angles
        Object.keys(this.animated.faceAngles).forEach(face => {
            this.animated.faceAngles[face] = 0;
        });
        
        this.updateTransforms();
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
            size: this.params.size
        };
    }
}

// Export factory function for convenience
export function createCubeNet(options) {
    return new CubeNet(options);
}