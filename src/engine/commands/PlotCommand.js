/**
 * PlotCommand - Command for rendering a function plot
 *
 * Creates a plot shape via diagram.plot()
 */
import { BaseCommand } from './BaseCommand.js';

export class PlotCommand extends BaseCommand {
    /**
     * Create a plot command
     * @param {Object} graphContainer - The graph container (Grapher) to render on
     * @param {string} equation - The equation to plot (e.g., "x^2", "sin(x)")
     * @param {number} domainMin - Minimum x value (or null to use graph's xRange)
     * @param {number} domainMax - Maximum x value (or null to use graph's xRange)
     * @param {Object} options - Additional options {strokeWidth}
     */
    constructor(graphContainer, equation, domainMin = null, domainMax = null, options = {}) {
        super();
        this.graphContainer = graphContainer;
        this.equation = equation;
        this.domainMin = domainMin;
        this.domainMax = domainMax;
        this.strokeWidth = options.strokeWidth || null;
    }

    /**
     * Create plot shape via diagram
     */
    doInit() {
        const { diagram } = this.commandContext;

        // Use graph's xRange if domain not specified
        let minX = this.domainMin;
        let maxX = this.domainMax;

        if (minX === null || maxX === null) {
            // Try to get xRange from graphContainer
            if (this.graphContainer && this.graphContainer.options) {
                const xRange = this.graphContainer.options.xRange || [-10, 10];
                if (minX === null) minX = xRange[0];
                if (maxX === null) maxX = xRange[1];
            } else {
                // Default fallback
                if (minX === null) minX = -10;
                if (maxX === null) maxX = 10;
            }
        }

        const options = {
            label: this.labelName
        };

        if (this.strokeWidth) {
            options.strokeWidth = this.strokeWidth;
        }

        this.commandResult = diagram.plot(
            this.graphContainer,
            this.equation,
            minX,
            maxX,
            this.color,
            options
        );
    }

    /**
     * No animation - plot already created in doInit()
     */
    doPlay() {
        // Plot animation is handled by diagram
    }

    /**
     * Plot already visible from doInit()
     */
    doDirectPlay() {
        // Nothing extra needed
    }

    /**
     * Get the equation being plotted
     * @returns {string}
     */
    getEquation() {
        return this.equation;
    }

    /**
     * Get the domain
     * @returns {{min: number, max: number}}
     */
    getDomain() {
        return { min: this.domainMin, max: this.domainMax };
    }
}
