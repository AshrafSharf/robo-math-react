/**
 * Curve3DCommand - Command for rendering a 3D parametric curve t → (x, y, z)
 *
 * Uses lhs_curve.js or native/curve.js parametricCurve/parametricTube functions.
 */
import { Base3DCommand } from './3d/Base3DCommand.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class Curve3DCommand extends Base3DCommand {
    /**
     * Create a curve3d command
     * @param {Object} graphExpression - The graph expression (g3d)
     * @param {Function} compiledXFunction - Pre-compiled x(t) function
     * @param {Function} compiledYFunction - Pre-compiled y(t) function
     * @param {Function} compiledZFunction - Pre-compiled z(t) function
     * @param {Object} tRange - { tMin, tMax }
     * @param {Object} equations - { xEquation, yEquation, zEquation } for debugging
     * @param {Object} options - { color, opacity, lineWidth, tube, radius, segments, animate }
     */
    constructor(graphExpression, compiledXFunction, compiledYFunction, compiledZFunction, tRange, equations, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.compiledXFunction = compiledXFunction;
        this.compiledYFunction = compiledYFunction;
        this.compiledZFunction = compiledZFunction;
        this.tRange = tRange;
        this.equations = equations;
        this.options = options;
    }

    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('curve3d'));
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

        // Determine coordinate system
        const coordSystem = this.graphExpression.coordinateSystem || 'lhs';

        // Import appropriate curve module
        const curveModule = coordSystem === 'rhs'
            ? await import('../../3d/native/curve.js')
            : await import('../../3d/lhs/lhs_curve.js');

        // Create curve function wrapper
        const xFn = this.compiledXFunction;
        const yFn = this.compiledYFunction;
        const zFn = this.compiledZFunction;

        const curveFunction = (t) => {
            try {
                const x = xFn(t);
                const y = yFn(t);
                const z = zFn(t);
                return {
                    x: isFinite(x) ? x : 0,
                    y: isFinite(y) ? y : 0,
                    z: isFinite(z) ? z : 0
                };
            } catch (e) {
                return { x: 0, y: 0, z: 0 };
            }
        };

        // Build options for curve renderer
        const renderOptions = {
            tMin: this.tRange.tMin,
            tMax: this.tRange.tMax,
            segments: this.options.segments || 200,
            color: this.options.color || 0x0000ff,
            opacity: this.options.opacity !== undefined ? this.options.opacity : 1.0
        };

        // Create the curve - use tube or line based on options
        let curveMesh;
        if (this.options.tube) {
            renderOptions.radius = this.options.radius || 0.05;
            renderOptions.radialSegments = this.options.radialSegments || 8;
            curveMesh = curveModule.parametricTube(curveFunction, renderOptions);
        } else {
            renderOptions.lineWidth = this.options.lineWidth || 2;
            curveMesh = curveModule.parametricCurve(curveFunction, renderOptions);
        }

        // Add to scene
        const scene = this.graphContainer.getScene();
        scene.add(curveMesh);

        // Store result
        this.commandResult = curveMesh;
    }

    /**
     * Animated play - progressive curve drawing
     */
    async playSingle() {
        if (!this.commandResult) return;

        // For now, just show immediately
        if (this.options.animate) {
            // TODO: Implement progressive curve animation
            // Could animate by revealing segments progressively
        }
    }
}
