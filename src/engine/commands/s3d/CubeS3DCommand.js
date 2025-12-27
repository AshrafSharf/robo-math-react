/**
 * CubeS3DCommand - Creates a cube in s3d space (pure Three.js)
 */
import { BaseCommand } from '../BaseCommand.js';

export class CubeS3DCommand extends BaseCommand {
    /**
     * Create a cube command for s3d
     * @param {Object} parentExpression - Parent s3d or group expression
     * @param {Object} params - { center: {x,y,z}, size }
     * @param {Object} options - Style options
     * @param {Object} expression - Reference to expression for storing mesh
     */
    constructor(parentExpression, params, options = {}, expression = null) {
        super();
        this.parentExpression = parentExpression;
        this.center = params.center;
        this.size = params.size;
        this.options = options;
        this.expression = expression;
    }

    _getParentObject() {
        if (this.parentExpression.isSpace3D && this.parentExpression.isSpace3D()) {
            return this.parentExpression.getScene();
        } else if (this.parentExpression.isS3DGroup && this.parentExpression.isS3DGroup()) {
            return this.parentExpression.getGroup();
        }
        return null;
    }

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

    async doInit() {
        const diagram = this._getDiagram();
        if (!diagram) {
            throw new Error('CubeS3DCommand: Could not find Space3DDiagram');
        }

        const parent = this._getParentObject();
        if (!parent) {
            throw new Error('CubeS3DCommand: Could not find parent Three.js object');
        }

        const mesh = diagram.cube(
            parent,
            this.center.x,
            this.center.y,
            this.center.z,
            this.size,
            this.options.styleOptions || {}
        );

        if (this.expression) {
            this.expression.setS3DMesh(mesh);
        }

        this.commandResult = mesh;
    }

    doPlay() {}
    doDirectPlay() {}

    clear() {
        if (this.commandResult) {
            if (this.commandResult.parent) {
                this.commandResult.parent.remove(this.commandResult);
            }
            if (this.commandResult.geometry) {
                this.commandResult.geometry.dispose();
            }
            if (this.commandResult.material) {
                this.commandResult.material.dispose();
            }
            this.commandResult = null;
        }
        this.isInitialized = false;
    }
}
