/**
 * CylinderS3DCommand - Creates a cylinder in s3d space (pure Three.js)
 */
import { BaseCommand } from '../BaseCommand.js';

export class CylinderS3DCommand extends BaseCommand {
    constructor(parentExpression, params, options = {}, expression = null) {
        super();
        this.parentExpression = parentExpression;
        this.center = params.center;
        this.radius = params.radius;
        this.height = params.height;
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
            throw new Error('CylinderS3DCommand: Could not find Space3DDiagram');
        }

        const parent = this._getParentObject();
        if (!parent) {
            throw new Error('CylinderS3DCommand: Could not find parent Three.js object');
        }

        const mesh = diagram.cylinder(
            parent,
            this.center.x,
            this.center.y,
            this.center.z,
            this.radius,
            this.height,
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
