/**
 * Face3DCommand - Creates a polygon face mesh within an s3d space or group
 *
 * Uses Space3DDiagram.face() to create the mesh in pure Three.js space
 */
import { BaseCommand } from '../BaseCommand.js';

export class Face3DCommand extends BaseCommand {
    /**
     * Create a face command
     * @param {Object} parentExpression - Parent s3d or group expression
     * @param {Array} vertices - Array of vertices [[x,y,z], ...]
     * @param {Object} options - Style options (color, opacity, etc.)
     * @param {Object} expression - Reference to Face3DExpression for storing mesh
     */
    constructor(parentExpression, vertices, options = {}, expression = null) {
        super();
        this.parentExpression = parentExpression;
        this.vertices = vertices;
        this.options = options;
        this.expression = expression;
    }

    /**
     * Create face mesh via diagram
     * @returns {Promise}
     */
    async doInit() {
        // Get diagram from parent (traverse up to s3d)
        const diagram = this._getDiagram();
        if (!diagram) {
            throw new Error('Face3DCommand: Could not find Space3DDiagram');
        }

        // Get parent Three.js object (scene or group)
        const parentObject = this._getParentObject();
        if (!parentObject) {
            throw new Error('Face3DCommand: Could not find parent Three.js object');
        }

        // Merge options
        const faceOptions = {
            ...this.options,
            showEdges: true
        };

        // Create face via diagram
        const mesh = diagram.face(parentObject, this.vertices, faceOptions);

        // Store reference in expression for variable access
        if (this.expression) {
            this.expression.setMesh(mesh);
        }

        // Store as command result
        this.commandResult = mesh;
    }

    /**
     * Get the Space3DDiagram from the parent chain
     */
    _getDiagram() {
        let current = this.parentExpression;
        while (current) {
            if (current.isSpace3D && current.isSpace3D()) {
                return current.getDiagram();
            } else if (current.isS3DGroup && current.isS3DGroup()) {
                current = current.parentExpression;
            } else {
                break;
            }
        }
        return null;
    }

    /**
     * Get the parent Three.js object (scene or group)
     */
    _getParentObject() {
        if (this.parentExpression.isSpace3D && this.parentExpression.isSpace3D()) {
            return this.parentExpression.getScene();
        } else if (this.parentExpression.isS3DGroup && this.parentExpression.isS3DGroup()) {
            return this.parentExpression.getGroup();
        }
        return null;
    }

    /**
     * No animation - face already created in doInit()
     */
    doPlay() {
        // No animation needed
    }

    /**
     * Face already visible from doInit()
     */
    doDirectPlay() {
        // Nothing extra needed
    }

    /**
     * Get the created mesh
     * @returns {THREE.Mesh|THREE.Group}
     */
    getMesh() {
        return this.commandResult;
    }

    /**
     * Clear the face
     */
    clear() {
        if (this.commandResult) {
            // Remove from parent
            if (this.commandResult.parent) {
                this.commandResult.parent.remove(this.commandResult);
            }
            // Dispose geometry and materials
            if (this.commandResult.isGroup) {
                this.commandResult.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            } else {
                if (this.commandResult.geometry) {
                    this.commandResult.geometry.dispose();
                }
                if (this.commandResult.material) {
                    if (Array.isArray(this.commandResult.material)) {
                        this.commandResult.material.forEach(m => m.dispose());
                    } else {
                        this.commandResult.material.dispose();
                    }
                }
            }
            this.commandResult = null;
        }
        this.isInitialized = false;
    }
}
