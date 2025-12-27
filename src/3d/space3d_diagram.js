/**
 * Space3DDiagram - Direct Three.js shape creation without coordinate transforms
 *
 * All coordinates are in pure Three.js space (Y-up, right-handed).
 * Shapes can be added to the scene or to a THREE.Group.
 */

import * as THREE from 'three';

export class Space3DDiagram {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
    }

    /**
     * Create a THREE.Group at a position
     * @param {THREE.Object3D} parent - Parent (scene or another group)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @returns {THREE.Group}
     */
    group(parent, x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group._isS3DGroup = true;  // Marker for type checking
        parent.add(group);
        this.objects.push(group);
        return group;
    }

    /**
     * Create a face (polygon) mesh
     * @param {THREE.Object3D} parent - Parent (scene or group)
     * @param {Array} vertices - Array of vertices [[x,y,z], ...] in LOCAL coordinates
     * @param {Object} options - Options (color, opacity, doubleSided, showEdges, edgeColor)
     * @returns {THREE.Mesh|THREE.Group}
     */
    face(parent, vertices, options = {}) {
        const {
            color = 0x4488ff,
            opacity = 0.8,
            doubleSided = true,
            showEdges = true,
            edgeColor = 0x000000
        } = options;

        // Convert array vertices to Vector3
        const vec3Vertices = vertices.map(v =>
            Array.isArray(v) ? new THREE.Vector3(v[0], v[1], v[2]) : new THREE.Vector3(v.x, v.y, v.z)
        );

        if (vec3Vertices.length < 3) {
            console.warn('Face requires at least 3 vertices');
            return null;
        }

        // Create shape for triangulation
        const shape = new THREE.Shape();

        // Find plane basis for 2D projection
        const v1 = new THREE.Vector3().subVectors(vec3Vertices[1], vec3Vertices[0]);
        const v2 = new THREE.Vector3().subVectors(vec3Vertices[2], vec3Vertices[0]);
        const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

        // Create orthonormal basis
        let basisX = new THREE.Vector3(1, 0, 0);
        if (Math.abs(normal.dot(basisX)) > 0.9) {
            basisX = new THREE.Vector3(0, 1, 0);
        }
        const basisY = new THREE.Vector3().crossVectors(normal, basisX).normalize();
        basisX = new THREE.Vector3().crossVectors(basisY, normal).normalize();

        // Project vertices to 2D
        const points2D = vec3Vertices.map(vertex => {
            const relative = new THREE.Vector3().subVectors(vertex, vec3Vertices[0]);
            return new THREE.Vector2(
                relative.dot(basisX),
                relative.dot(basisY)
            );
        });

        // Create shape path
        shape.moveTo(points2D[0].x, points2D[0].y);
        for (let i = 1; i < points2D.length; i++) {
            shape.lineTo(points2D[i].x, points2D[i].y);
        }
        shape.closePath();

        // Create geometry
        const geometry = new THREE.ShapeGeometry(shape);

        // Transform geometry back to 3D
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const point2D = new THREE.Vector2(positions[i], positions[i + 1]);
            const point3D = new THREE.Vector3()
                .addScaledVector(basisX, point2D.x)
                .addScaledVector(basisY, point2D.y)
                .add(vec3Vertices[0]);

            positions[i] = point3D.x;
            positions[i + 1] = point3D.y;
            positions[i + 2] = point3D.z;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Create material
        const material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0,
            side: doubleSided ? THREE.DoubleSide : THREE.FrontSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh._isS3DFace = true;  // Marker for type checking

        // Add edges if requested
        if (showEdges) {
            const group = new THREE.Group();
            group.add(mesh);

            const edgeGeometry = new THREE.BufferGeometry();
            const edgePositions = [];

            for (let i = 0; i < vec3Vertices.length; i++) {
                const current = vec3Vertices[i];
                const next = vec3Vertices[(i + 1) % vec3Vertices.length];
                edgePositions.push(current.x, current.y, current.z);
                edgePositions.push(next.x, next.y, next.z);
            }

            edgeGeometry.setAttribute('position',
                new THREE.Float32BufferAttribute(edgePositions, 3));

            const edgeMaterial = new THREE.LineBasicMaterial({
                color: edgeColor,
                linewidth: 2
            });

            const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
            group.add(edges);

            group._isS3DFace = true;
            parent.add(group);
            this.objects.push(group);
            return group;
        }

        parent.add(mesh);
        this.objects.push(mesh);
        return mesh;
    }

    /**
     * Create a cube
     * @param {THREE.Object3D} parent - Parent (scene or group)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} size - Cube size
     * @param {Object} options - Options (color, opacity)
     * @returns {THREE.Mesh}
     */
    cube(parent, x, y, z, size, options = {}) {
        const { color = 0x4488ff, opacity = 0.8 } = options;

        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh._isS3DCube = true;

        parent.add(mesh);
        this.objects.push(mesh);
        return mesh;
    }

    /**
     * Create a sphere
     * @param {THREE.Object3D} parent - Parent (scene or group)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} radius - Sphere radius
     * @param {Object} options - Options (color, opacity, segments)
     * @returns {THREE.Mesh}
     */
    sphere(parent, x, y, z, radius, options = {}) {
        const { color = 0x4488ff, opacity = 0.8, segments = 32 } = options;

        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh._isS3DSphere = true;

        parent.add(mesh);
        this.objects.push(mesh);
        return mesh;
    }

    /**
     * Create a cone
     * @param {THREE.Object3D} parent - Parent (scene or group)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} radius - Base radius
     * @param {number} height - Cone height
     * @param {Object} options - Options (color, opacity, segments)
     * @returns {THREE.Mesh}
     */
    cone(parent, x, y, z, radius, height, options = {}) {
        const { color = 0x4488ff, opacity = 0.8, segments = 32 } = options;

        const geometry = new THREE.ConeGeometry(radius, height, segments);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh._isS3DCone = true;

        parent.add(mesh);
        this.objects.push(mesh);
        return mesh;
    }

    /**
     * Create a cylinder
     * @param {THREE.Object3D} parent - Parent (scene or group)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} radius - Cylinder radius
     * @param {number} height - Cylinder height
     * @param {Object} options - Options (color, opacity, segments)
     * @returns {THREE.Mesh}
     */
    cylinder(parent, x, y, z, radius, height, options = {}) {
        const { color = 0x4488ff, opacity = 0.8, segments = 32 } = options;

        const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            opacity: opacity,
            transparent: opacity < 1.0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh._isS3DCylinder = true;

        parent.add(mesh);
        this.objects.push(mesh);
        return mesh;
    }

    /**
     * Get all objects created by this diagram
     */
    getObjects() {
        return this.objects;
    }

    /**
     * Clear all objects from the scene
     */
    clearAll() {
        for (const obj of this.objects) {
            if (obj.parent) {
                obj.parent.remove(obj);
            }
            // Dispose geometry and materials
            if (obj.geometry) {
                obj.geometry.dispose();
            }
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            // Handle groups
            if (obj.isGroup) {
                obj.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            }
        }
        this.objects = [];
    }
}
