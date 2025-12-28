/**
 * Pivot3DCommand - Sets pivot point for an s3d object
 *
 * Creates a pivot THREE.Group at the specified position,
 * then re-parents the object into that group with offset.
 * Future rotate3d() calls will rotate around the pivot.
 *
 * This is a structural command - no animation.
 */
import * as THREE from 'three';
import { BaseCommand } from '../BaseCommand.js';
import { GroupExpression } from '../../expression-parser/expressions/s3d/GroupExpression.js';

export class Pivot3DCommand extends BaseCommand {
    /**
     * @param {Object} targetExpression - The s3d object expression to pivot
     * @param {Object} pivotPosition - {x, y, z} pivot coordinates
     * @param {Object|null} edgeExpression - Optional edge expression (for axis info)
     * @param {Object} options - Additional options
     */
    constructor(targetExpression, pivotPosition, edgeExpression = null, options = {}) {
        super();
        this.targetExpression = targetExpression;
        this.pivotPosition = pivotPosition;
        this.edgeExpression = edgeExpression;
        this.options = options;
        this.pivotGroup = null;
    }

    /**
     * Get the Three.js object from the target expression
     */
    _getTargetObject() {
        return GroupExpression.getThreeObject(this.targetExpression);
    }

    /**
     * Create pivot group and re-parent the target object
     */
    async doInit() {
        const target = this._getTargetObject();
        if (!target) {
            throw new Error('Pivot3DCommand: Could not find target Three.js object');
        }

        // Get the current parent before removing
        const originalParent = target.parent;

        // Create pivot group at the pivot position
        this.pivotGroup = new THREE.Group();
        this.pivotGroup._isS3DPivot = true;  // Marker for type checking
        this.pivotGroup.position.set(
            this.pivotPosition.x,
            this.pivotPosition.y,
            this.pivotPosition.z
        );

        // Store edge info on pivot group for rotate3d to use
        if (this.edgeExpression) {
            this.pivotGroup._edgeAxis = this.edgeExpression.getAxis();
        }

        // Calculate offset: where the object should be relative to pivot
        // Object stays in same world position, just re-parented
        const worldPos = new THREE.Vector3();
        target.getWorldPosition(worldPos);

        // Remove from current parent
        if (target.parent) {
            target.parent.remove(target);
        }

        // Add to pivot group
        this.pivotGroup.add(target);

        // Set target's local position so it appears in same world position
        // localPos = worldPos - pivotPos (in parent's coordinate system)
        target.position.set(
            worldPos.x - this.pivotPosition.x,
            worldPos.y - this.pivotPosition.y,
            worldPos.z - this.pivotPosition.z
        );

        // Add pivot group to original parent (or scene)
        if (originalParent) {
            originalParent.add(this.pivotGroup);
        }

        // Store pivot group on the target expression so rotate3d can find it
        if (this.targetExpression.setPivotGroup) {
            this.targetExpression.setPivotGroup(this.pivotGroup);
        } else {
            // Fallback: store directly on expression
            this.targetExpression._pivotGroup = this.pivotGroup;
        }

        // Store edge expression reference on target for rotate3d axis extraction
        if (this.edgeExpression) {
            this.targetExpression._pivotEdge = this.edgeExpression;
        }

        this.commandResult = this.pivotGroup;
    }

    /**
     * No animation - structural operation only
     */
    doPlay() {
        return Promise.resolve();
    }

    /**
     * No animation needed
     */
    doDirectPlay() {
        // Already done in doInit
    }

    /**
     * Get the created pivot group
     */
    getPivotGroup() {
        return this.pivotGroup;
    }

    /**
     * Clear - remove pivot group and restore original parenting
     */
    clear() {
        if (this.pivotGroup) {
            // Get the child (original object)
            const children = [...this.pivotGroup.children];
            const parent = this.pivotGroup.parent;

            // Move children back to pivot's parent
            for (const child of children) {
                if (parent) {
                    // Restore world position
                    const worldPos = new THREE.Vector3();
                    child.getWorldPosition(worldPos);
                    parent.add(child);
                    child.position.copy(worldPos);
                }
            }

            // Remove pivot group
            if (parent) {
                parent.remove(this.pivotGroup);
            }

            this.pivotGroup = null;
        }

        // Clear pivot references on expression
        if (this.targetExpression) {
            this.targetExpression._pivotGroup = null;
            this.targetExpression._pivotEdge = null;
        }

        this.commandResult = null;
        this.isInitialized = false;
    }
}
