/**
 * Face3DExpression - creates a polygon face within an s3d space or group
 *
 * Syntax: face3d(parent, [x1,y1,z1], [x2,y2,z2], [x3,y3,z3], ...)
 *   - parent: s3d space or a group
 *   - vertices: 3+ vertices as arrays [x, y, z] in parent's local coordinate system
 *
 * Features:
 *   - Creates polygon mesh with edges
 *   - Vertices use LOCAL coordinates relative to parent
 *   - Supports options for color, opacity, edge visibility
 */
import { AbstractNonArithmeticExpression } from '../AbstractNonArithmeticExpression.js';
import { Face3DCommand } from '../../../commands/s3d/Face3DCommand.js';

export class Face3DExpression extends AbstractNonArithmeticExpression {
    static NAME = 'face3d';

    constructor(subExpressions) {
        super();
        this.subExpressions = subExpressions;
        // Parent reference (s3d or group)
        this.parentExpression = null;
        // Vertices as arrays [[x,y,z], ...]
        this.vertices = [];
        // Style options
        this.options = {};
        // Reference to created mesh (set by command after init)
        this.mesh = null;
    }

    resolve(context) {
        if (this.subExpressions.length < 4) {
            this.dispatchError('face3d() requires at least 4 arguments: parent and 3+ vertices');
        }

        // First arg is parent (s3d or group)
        this.subExpressions[0].resolve(context);
        const parentExpr = this._getResolvedExpression(context, this.subExpressions[0]);

        // Check if parent is an s3d space or a group
        if (parentExpr.isSpace3D && parentExpr.isSpace3D()) {
            this.parentExpression = parentExpr;
        } else if (parentExpr.isS3DGroup && parentExpr.isS3DGroup()) {
            this.parentExpression = parentExpr;
        } else {
            this.dispatchError('face3d() first argument must be an s3d space or a group');
        }

        // Parse remaining args as vertices or options
        this.vertices = [];
        for (let i = 1; i < this.subExpressions.length; i++) {
            const expr = this.subExpressions[i];
            expr.resolve(context);

            // Check if this is a style expression (c, f, s)
            const name = expr.getName();
            if (name === 'c') {
                this.options.color = expr.getColorValue();
            } else {
                // Get numeric values for vertex
                const values = expr.getVariableAtomicValues();
                if (values.length >= 3) {
                    // Take first 3 values as x, y, z
                    this.vertices.push([values[0], values[1], values[2]]);
                } else if (values.length > 0) {
                    this.dispatchError(`face3d() vertex at position ${i} needs 3 coordinates (x, y, z)`);
                }
            }
        }

        if (this.vertices.length < 3) {
            this.dispatchError('face3d() requires at least 3 vertices');
        }
    }

    getName() {
        return Face3DExpression.NAME;
    }

    /**
     * Check if this is an s3d face expression
     */
    isS3DFace() {
        return true;
    }

    /**
     * Get the mesh
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Set the mesh (called by command after init)
     */
    setMesh(mesh) {
        this.mesh = mesh;
    }

    /**
     * Get the parent Three.js object (scene or group)
     */
    getParentObject() {
        if (this.parentExpression.isSpace3D && this.parentExpression.isSpace3D()) {
            return this.parentExpression.getScene();
        } else if (this.parentExpression.isS3DGroup && this.parentExpression.isS3DGroup()) {
            return this.parentExpression.getGroup();
        }
        return null;
    }

    /**
     * Get the Space3DDiagram from the root s3d space
     */
    getDiagram() {
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

    getVariableAtomicValues() {
        // Face doesn't contribute coordinates directly
        return [];
    }

    toCommand(options = {}) {
        return new Face3DCommand(
            this.parentExpression,
            this.vertices,
            this.options,
            this  // Pass expression reference so command can set mesh
        );
    }

    canPlay() {
        return true;
    }
}
