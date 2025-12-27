/**
 * GroupCommand - Creates a THREE.Group and re-parents objects into it
 *
 * Group is NOT attached to any parent - use AttachCommand for that
 */
import * as THREE from 'three';
import { BaseCommand } from '../BaseCommand.js';
import { GroupExpression } from '../../expression-parser/expressions/s3d/GroupExpression.js';

export class GroupCommand extends BaseCommand {
    /**
     * Create a group command
     * @param {Array} childExpressions - Array of s3d object expressions to group
     * @param {Object} expression - Reference to GroupExpression for storing group
     */
    constructor(childExpressions, expression = null) {
        super();
        this.childExpressions = childExpressions;
        this.expression = expression;
    }

    /**
     * Create THREE.Group and re-parent objects
     * @returns {Promise}
     */
    async doInit() {
        // Create new THREE.Group
        const group = new THREE.Group();
        group._isS3DGroup = true;  // Marker for type checking

        // Re-parent each child object into the group
        for (const childExpr of this.childExpressions) {
            const obj = GroupExpression.getThreeObject(childExpr);
            if (obj) {
                // Remove from current parent
                if (obj.parent) {
                    obj.parent.remove(obj);
                }
                // Add to new group
                group.add(obj);
            }
        }

        // Store reference in expression for variable access
        if (this.expression) {
            this.expression.setGroup(group);
        }

        // Store as command result
        // Note: Group is NOT added to any scene/parent yet
        this.commandResult = group;
    }

    /**
     * No animation - group already created in doInit()
     */
    doPlay() {
        // No animation needed
    }

    /**
     * Group already created from doInit()
     */
    doDirectPlay() {
        // Nothing extra needed
    }

    /**
     * Get the created THREE.Group
     * @returns {THREE.Group}
     */
    getGroup() {
        return this.commandResult;
    }

    /**
     * Clear the group
     */
    clear() {
        if (this.commandResult) {
            // Remove group from parent if attached
            if (this.commandResult.parent) {
                this.commandResult.parent.remove(this.commandResult);
            }
            // Note: We don't dispose children as they may be used elsewhere
            this.commandResult = null;
        }
        this.isInitialized = false;
    }
}
