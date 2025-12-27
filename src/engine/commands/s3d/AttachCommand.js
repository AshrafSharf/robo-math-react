/**
 * AttachCommand - Attaches a child object to a parent (scene or group)
 *
 * Removes child from current parent and adds to new parent
 */
import { BaseCommand } from '../BaseCommand.js';
import { GroupExpression } from '../../expression-parser/expressions/s3d/GroupExpression.js';

export class AttachCommand extends BaseCommand {
    /**
     * Create an attach command
     * @param {Object} parentExpression - Parent s3d or group expression
     * @param {Object} childExpression - Child s3d object expression
     */
    constructor(parentExpression, childExpression) {
        super();
        this.parentExpression = parentExpression;
        this.childExpression = childExpression;
    }

    /**
     * Get parent Three.js object (scene or group)
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
     * Attach child to parent
     * @returns {Promise}
     */
    async doInit() {
        const parent = this._getParentObject();
        if (!parent) {
            throw new Error('AttachCommand: Could not find parent Three.js object');
        }

        const child = GroupExpression.getThreeObject(this.childExpression);
        if (!child) {
            throw new Error('AttachCommand: Could not find child Three.js object');
        }

        // Remove from current parent
        if (child.parent) {
            child.parent.remove(child);
        }

        // Add to new parent
        parent.add(child);

        this.commandResult = { parent, child };
    }

    /**
     * No animation
     */
    doPlay() {
        // No animation needed
    }

    /**
     * Already attached in doInit
     */
    doDirectPlay() {
        // Nothing extra needed
    }

    /**
     * Clear - detach child from parent
     */
    clear() {
        if (this.commandResult && this.commandResult.child) {
            const child = this.commandResult.child;
            if (child.parent) {
                child.parent.remove(child);
            }
        }
        this.commandResult = null;
        this.isInitialized = false;
    }
}
