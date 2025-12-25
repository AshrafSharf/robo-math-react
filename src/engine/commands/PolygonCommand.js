/**
 * PolygonCommand - Command for rendering a polygon as a collection of edge lines
 *
 * Creates individual LineCommand instances for each edge, enabling:
 * - item(polygon, index) to access individual edges
 * - hide/show/stroke on specific edges
 * - Full edge manipulation via ShapeCollection
 */
import { BaseCommand } from './BaseCommand.js';
import { LineCommand } from './LineCommand.js';
import { ShapeCollection } from '../../geom/ShapeCollection.js';
import { RoboEventManager } from '../../events/robo-event-manager.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class PolygonCommand extends BaseCommand {
    /**
     * Create a polygon command
     * @param {Object} graphExpression - The graph expression (resolved at init time to get grapher)
     * @param {Array<{x: number, y: number}>} vertices - Array of vertex positions
     * @param {Object} options - Additional options {strokeWidth, fill, fillOpacity}
     */
    constructor(graphExpression, vertices, options = {}) {
        super();
        this.graphExpression = graphExpression; // Resolved at init time
        this.graphContainer = null; // Set at init time
        this.vertices = vertices; // [{x, y}, ...]
        this.strokeWidth = options.strokeWidth ?? 2;
        this.fill = options.fill || null;
        this.fillOpacity = options.fillOpacity !== undefined ? options.fillOpacity : null;

        // Multi-shape support for edge access
        this.isMultiShape = true;
        this.shapeDataArray = [];
        this.childCommands = [];

        // Compute edge data from vertices
        this._computeEdges();
    }

    /**
     * Compute edge segments from vertices
     */
    _computeEdges() {
        this.shapeDataArray = [];
        // vertices includes closing point, so we have (n-1) edges
        for (let i = 0; i < this.vertices.length - 1; i++) {
            this.shapeDataArray.push({
                startPoint: this.vertices[i],
                endPoint: this.vertices[i + 1],
                edgeIndex: i,
                originalShapeType: 'line',
                originalShapeName: 'line'
            });
        }
    }

    /**
     * Validate graph expression and resolve grapher
     * @returns {Promise}
     */
    async doInit() {
        // Resolve grapher from expression at init time (after g2d command has run)
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('polygon'));
            err.expressionId = this.expressionId;
            throw err;
        }

        if (typeof this.graphExpression.getGrapher !== 'function') {
            const varName = this.graphExpression.variableName || 'first argument';
            const err = new Error(common_error_messages.INVALID_GRAPH_TYPE(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        this.graphContainer = this.graphExpression.getGrapher();
        if (!this.graphContainer) {
            const varName = this.graphExpression.variableName || 'graph';
            const err = new Error(common_error_messages.GRAPH_NOT_INITIALIZED(varName));
            err.expressionId = this.expressionId;
            throw err;
        }

        // Create child LineCommands for each edge
        this.childCommands = this.shapeDataArray.map(edgeData => {
            const options = {
                strokeWidth: this.strokeWidth
            };
            // Note: fill doesn't apply to lines, but stroke color does
            const cmd = new LineCommand(
                this.graphExpression,
                edgeData.startPoint,
                edgeData.endPoint,
                options
            );
            cmd.color = this.color;
            cmd.diagram2d = this.diagram2d;
            return cmd;
        });

        // Initialize all child commands
        await Promise.all(this.childCommands.map(cmd =>
            cmd.init(this.commandContext)
        ));

        // Collect results as ShapeCollection
        this.commandResult = new ShapeCollection(
            this.childCommands.map(cmd => cmd.commandResult)
        );
    }

    /**
     * Get label position at centroid of polygon
     * @returns {{x: number, y: number}}
     */
    getLabelPosition() {
        return this.getCentroid();
    }

    /**
     * Get vertices
     * @returns {Array<{x: number, y: number}>}
     */
    getVertices() {
        return this.vertices;
    }

    /**
     * Get centroid (center of mass) of the polygon
     * @returns {{x: number, y: number}}
     */
    getCentroid() {
        // Exclude the closing point for centroid calculation
        const n = this.vertices.length - 1;
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < n; i++) {
            sumX += this.vertices[i].x;
            sumY += this.vertices[i].y;
        }
        return {
            x: sumX / n,
            y: sumY / n
        };
    }

    /**
     * Get perimeter
     * @returns {number}
     */
    getPerimeter() {
        let perimeter = 0;
        for (let i = 0; i < this.vertices.length - 1; i++) {
            const dx = this.vertices[i + 1].x - this.vertices[i].x;
            const dy = this.vertices[i + 1].y - this.vertices[i].y;
            perimeter += Math.sqrt(dx * dx + dy * dy);
        }
        return perimeter;
    }

    /**
     * Replay animation on existing shapes (all edges in parallel)
     * @returns {Promise}
     */
    async playSingle() {
        if (!this.childCommands || this.childCommands.length === 0) return;

        // Disable pen during parallel animation
        const wasPenActive = RoboEventManager.isPenActive();
        RoboEventManager.setPenActive(false);

        try {
            await Promise.all(this.childCommands.map(cmd => cmd.playSingle()));
        } finally {
            RoboEventManager.setPenActive(wasPenActive);
        }
    }

    /**
     * Direct play for static diagrams (no animation)
     * @returns {Promise}
     */
    async directPlay() {
        // Child commands are already initialized and rendered in doInit
        // For static mode, we just need to ensure they're visible
        if (this.commandResult) {
            const shapes = this.commandResult.getAll();
            for (const shape of shapes) {
                if (shape && typeof shape.show === 'function') {
                    shape.show();
                }
            }
        }
    }

    // ===== Collection Accessor Methods =====

    /**
     * Get edge at index
     * @param {number} index
     * @returns {Object} The line shape at that index
     */
    getEdge(index) {
        if (this.commandResult && typeof this.commandResult.get === 'function') {
            return this.commandResult.get(index);
        }
        return null;
    }

    /**
     * Get number of edges
     * @returns {number}
     */
    getEdgeCount() {
        return this.shapeDataArray.length;
    }

    /**
     * Get collection size (for item() compatibility)
     * @returns {number}
     */
    getCollectionSize() {
        return this.shapeDataArray.length;
    }

    /**
     * Get shape data at index (for item() compatibility)
     * @param {number} index
     * @returns {Object}
     */
    getShapeDataAt(index) {
        return this.shapeDataArray[index];
    }

    /**
     * Check if this is a collection
     * @returns {boolean}
     */
    isCollection() {
        return true;
    }
}
