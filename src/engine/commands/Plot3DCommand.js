/**
 * Plot3DCommand - Command for rendering a 3D surface plot z = f(x, y)
 *
 * Uses lhs_surface.js or native/surface.js depending on coordinate system.
 */
import { Base3DCommand } from './3d/Base3DCommand.js';
import { common_error_messages } from '../expression-parser/core/ErrorMessages.js';

export class Plot3DCommand extends Base3DCommand {
    /**
     * Create a plot3d command
     * @param {Object} graphExpression - The graph expression (g3d)
     * @param {Function} compiledFunction - Pre-compiled function f(x, y) => z
     * @param {Object} xRange - { xMin, xMax }
     * @param {Object} yRange - { yMin, yMax }
     * @param {string} equation - Original equation string (for debugging)
     * @param {Object} options - { color, opacity, wireframe, steps, useColorMap, animate }
     */
    constructor(graphExpression, compiledFunction, xRange, yRange, equation, options = {}) {
        super();
        this.graphExpression = graphExpression;
        this.graphContainer = null;
        this.compiledFunction = compiledFunction;
        this.xRange = xRange;
        this.yRange = yRange;
        this.equation = equation;
        this.options = options;
    }

    async doInit() {
        if (!this.graphExpression) {
            const err = new Error(common_error_messages.GRAPH_REQUIRED('plot3d'));
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

        // Create surface function wrapper
        const fn = this.compiledFunction;
        const surfaceFunction = (x, y) => {
            try {
                const z = fn(x, y);
                return isFinite(z) ? z : 0;
            } catch (e) {
                return 0;
            }
        };

        // Build options for surface renderer
        const renderOptions = {
            xSteps: this.options.steps || 50,
            ySteps: this.options.steps || 50,
            color: this.options.color || 0x4444ff,
            opacity: this.options.opacity !== undefined ? this.options.opacity : 0.9,
            wireframe: this.options.wireframe || false,
            useColorMap: this.options.useColorMap !== undefined ? this.options.useColorMap : true,
            colorMap: this.options.colorMap || 'height',
            doubleSided: true
        };

        // Create the surface mesh
        const surfaceMesh = surfaceModule.surface(
            surfaceFunction,
            [this.xRange.xMin, this.xRange.xMax],
            [this.yRange.yMin, this.yRange.yMax],
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

        // For now, just show immediately (animation can be added later)
        // Animation could use opacity fade-in or progressive row rendering
        if (this.options.animate) {
            // TODO: Implement progressive surface animation
            // Could use lhs_surface_animator.js patterns
        }
    }
}
