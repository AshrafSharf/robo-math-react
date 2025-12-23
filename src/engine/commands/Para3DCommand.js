/**
 * Para3DCommand - Command for rendering a 3D parametric surface (u, v) → (x, y, z)
 *
 * Uses lhs_surface.js or native/surface.js parametricSurface function.
 */
import { Base3DCommand } from './3d/Base3DCommand.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class Para3DCommand extends Base3DCommand {
    /**
     * Create a para3d command
     * @param {Object} graphExpression - The graph expression (g3d)
     * @param {Function} compiledXFunction - Pre-compiled x(u, v) function
     * @param {Function} compiledYFunction - Pre-compiled y(u, v) function
     * @param {Function} compiledZFunction - Pre-compiled z(u, v) function
     * @param {Object} uRange - { uMin, uMax }
     * @param {Object} vRange - { vMin, vMax }
     * @param {Object} equations - { xEquation, yEquation, zEquation } for debugging
     * @param {Object} options - { color, opacity, wireframe, steps, animate }
     */
    constructor(graphExpression, compiledXFunction, compiledYFunction, compiledZFunction, uRange, vRange, equations, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.compiledXFunction = compiledXFunction;
        this.compiledYFunction = compiledYFunction;
        this.compiledZFunction = compiledZFunction;
        this.uRange = uRange;
        this.vRange = vRange;
        this.equations = equations;
        this.options = options;
    }

    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('para3d'));
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

        // Import appropriate surface module
        const surfaceModule = coordSystem === 'rhs'
            ? await import('../../3d/native/surface.js')
            : await import('../../3d/lhs/lhs_surface.js');

        // Create parametric function wrapper
        const xFn = this.compiledXFunction;
        const yFn = this.compiledYFunction;
        const zFn = this.compiledZFunction;

        const parametricFunction = (u, v) => {
            try {
                const x = xFn(u, v);
                const y = yFn(u, v);
                const z = zFn(u, v);
                return {
                    x: isFinite(x) ? x : 0,
                    y: isFinite(y) ? y : 0,
                    z: isFinite(z) ? z : 0
                };
            } catch (e) {
                return { x: 0, y: 0, z: 0 };
            }
        };

        // Build options for surface renderer
        const renderOptions = {
            uSteps: this.options.steps || 50,
            vSteps: this.options.steps || 50,
            color: this.options.color || 0x4444ff,
            opacity: this.options.opacity !== undefined ? this.options.opacity : 0.9,
            wireframe: this.options.wireframe || false,
            doubleSided: true
        };

        // Create the parametric surface mesh
        const surfaceMesh = surfaceModule.parametricSurface(
            parametricFunction,
            [this.uRange.uMin, this.uRange.uMax],
            [this.vRange.vMin, this.vRange.vMax],
            renderOptions
        );

        // Add to scene
        const scene = this.graphContainer.getScene();
        scene.add(surfaceMesh);

        // Store result
        this.commandResult = surfaceMesh;
    }

    /**
     * Animated play - progressive surface rendering
     */
    async playSingle() {
        if (!this.commandResult) return;

        // For now, just show immediately
        if (this.options.animate) {
            // TODO: Implement progressive surface animation
        }
    }
}
